import { useState } from 'react';
import { Plus, Play, Pause, Trash2, MapPin, Clock, User, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/Cards/StatCard';
import { operationStatusLabels, operationStatusColors } from '../../types';
import type { ShoreSegment } from '../../types';
import { getProgressColor } from '../../utils/helpers';

const pollutionLevelLabels = {
  heavy: '严重',
  medium: '中等',
  light: '轻微',
  clean: '清洁',
};

const pollutionLevelColors = {
  heavy: 'bg-alert-red text-white',
  medium: 'bg-alert-orange text-white',
  light: 'bg-alert-yellow text-yellow-800',
  clean: 'bg-alert-green text-white',
};

const ShorelineCleanup = () => {
  const currentEvent = useStore((state) => state.currentEvent);
  const shoreSegments = useStore((state) => state.shoreSegments);
  const getEventShoreSegments = useStore((state) => state.getEventShoreSegments);
  const updateShoreSegmentProgress = useStore((state) => state.updateShoreSegmentProgress);
  const updateShoreSegmentStatus = useStore((state) => state.updateShoreSegmentStatus);

  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [wasteValue, setWasteValue] = useState<number>(0);

  const segments: ShoreSegment[] = currentEvent
    ? getEventShoreSegments(currentEvent.id)
    : [];

  const totalLength = segments.reduce((sum, s) => sum + s.length, 0);
  const completedLength = segments.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.length, 0);
  const inProgressCount = segments.filter((s) => s.status === 'in_progress').length;
  const totalWaste = segments.reduce((sum, s) => sum + s.collectedWaste, 0);

  const handleStart = (segmentId: string) => {
    updateShoreSegmentStatus(segmentId, 'in_progress');
  };

  const handlePause = (segmentId: string) => {
    updateShoreSegmentStatus(segmentId, 'pending');
  };

  const handleComplete = (segmentId: string) => {
    updateShoreSegmentStatus(segmentId, 'completed');
  };

  const handleOpenProgressEdit = (segment: ShoreSegment) => {
    setEditingProgress(segment.id);
    setProgressValue(segment.progress);
    setWasteValue(segment.collectedWaste);
  };

  const handleSaveProgress = (segmentId: string) => {
    updateShoreSegmentProgress(segmentId, Math.min(100, Math.max(0, progressValue)), wasteValue);
    setEditingProgress(null);
  };

  const handleCancelProgressEdit = () => {
    setEditingProgress(null);
  };

  if (!currentEvent) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500">请先选择一个事件</p>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">岸线清理作业</h1>
            <p className="text-slate-500 mt-1">管理受污染岸线的清理作业</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增清理任务
          </button>
        </div>
        <div className="card text-center py-16">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">当前事件暂无岸线清理任务</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">岸线清理作业</h1>
          <p className="text-slate-500 mt-1">管理受污染岸线的清理作业</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增清理任务
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="岸线总长"
          value={totalLength.toFixed(1)}
          unit="km"
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title="已清理长度"
          value={completedLength.toFixed(1)}
          unit="km"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="进行中岸段"
          value={inProgressCount}
          unit="段"
          icon={Play}
          color="orange"
        />
        <StatCard
          title="已收集垃圾"
          value={totalWaste.toFixed(1)}
          unit="吨"
          icon={Trash2}
          color="purple"
        />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">岸段污染分布</h3>
        <div className="h-16 flex rounded-lg overflow-hidden">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className={`h-full flex items-center justify-center text-xs font-medium text-white cursor-pointer transition-all hover:opacity-80 ${
                segment.pollutionLevel === 'heavy'
                  ? 'bg-alert-red'
                  : segment.pollutionLevel === 'medium'
                  ? 'bg-alert-orange'
                  : segment.pollutionLevel === 'light'
                  ? 'bg-alert-yellow text-yellow-800'
                  : 'bg-alert-green'
              }`}
              style={{ width: `${(segment.length / totalLength) * 100}%` }}
              onClick={() => setSelectedSegment(segment.id)}
              title={`${segment.name} - ${pollutionLevelLabels[segment.pollutionLevel]}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          {segments.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <span
                className={`w-3 h-3 rounded-full ${
                  s.status === 'completed'
                    ? 'bg-alert-green'
                    : s.status === 'in_progress'
                    ? 'bg-alert-orange'
                    : 'bg-slate-300'
                }`}
              />
              <span className="mt-1">{s.length}km</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">岸段清理列表</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">岸段名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">长度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">污染程度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">作业队伍</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">已收集垃圾</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">进度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => (
                <tr
                  key={segment.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                    selectedSegment === segment.id ? 'bg-ocean-50' : ''
                  }`}
                  onClick={() => setSelectedSegment(segment.id)}
                >
                  <td className="py-3 px-4 text-sm font-medium">{segment.name}</td>
                  <td className="py-3 px-4 text-sm">{segment.length} km</td>
                  <td className="py-3 px-4">
                    <span className={`status-badge ${pollutionLevelColors[segment.pollutionLevel]}`}>
                      {pollutionLevelLabels[segment.pollutionLevel]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`status-badge ${operationStatusColors[segment.status]}`}>
                      {operationStatusLabels[segment.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{segment.assignedTeam}</td>
                  <td className="py-3 px-4 text-sm font-medium text-alert-orange">{segment.collectedWaste} 吨</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                        <div
                          className={`h-full rounded-full ${getProgressColor(segment.progress)}`}
                          style={{ width: `${segment.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{segment.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    {segment.status === 'pending' && (
                      <button
                        className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                        onClick={() => handleStart(segment.id)}
                      >
                        开始
                      </button>
                    )}
                    {segment.status === 'in_progress' && (
                      <button
                        className="text-sm text-alert-orange hover:text-orange-700 font-medium"
                        onClick={() => handleOpenProgressEdit(segment)}
                      >
                        更新
                      </button>
                    )}
                    {segment.status === 'completed' && (
                      <button
                        className="text-sm text-alert-green hover:text-emerald-700 font-medium"
                        onClick={() => setSelectedSegment(segment.id)}
                      >
                        查看
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProgress && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            更新进度 - {segments.find((s) => s.id === editingProgress)?.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">清理进度 (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">已收集垃圾 (吨)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={wasteValue}
                onChange={(e) => setWasteValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-primary"
              onClick={() => handleSaveProgress(editingProgress)}
            >
              保存
            </button>
            <button
              className="btn-secondary"
              onClick={handleCancelProgressEdit}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {selectedSegment && !editingProgress && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            岸段详情 - {segments.find((s) => s.id === selectedSegment)?.name}
          </h3>

          {(() => {
            const segment = segments.find((s) => s.id === selectedSegment);
            if (!segment) return null;

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">岸段长度</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{segment.length} km</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">已收集垃圾</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{segment.collectedWaste} 吨</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">作业队伍</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{segment.assignedTeam}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">污染程度</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      {pollutionLevelLabels[segment.pollutionLevel]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {segment.status === 'pending' && (
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={() => handleStart(segment.id)}
                    >
                      <Play className="w-4 h-4" />
                      开始清理
                    </button>
                  )}
                  {segment.status === 'in_progress' && (
                    <>
                      <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => handleOpenProgressEdit(segment)}
                      >
                        更新进度
                      </button>
                      <button
                        className="btn-secondary flex items-center gap-2"
                        onClick={() => handlePause(segment.id)}
                      >
                        <Pause className="w-4 h-4" />
                        暂停作业
                      </button>
                      <button
                        className="btn-secondary flex items-center gap-2 text-alert-green border-alert-green hover:bg-alert-green/5"
                        onClick={() => handleComplete(segment.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        标记完成
                      </button>
                    </>
                  )}
                  {segment.status === 'completed' && (
                    <div className="p-4 bg-alert-green/10 rounded-lg border border-alert-green/30">
                      <div className="text-alert-green font-medium flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        清理作业已完成
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ShorelineCleanup;
