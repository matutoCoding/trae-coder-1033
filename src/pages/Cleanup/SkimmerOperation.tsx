import { useState } from 'react';
import { Plus, Play, Pause, Droplets, Wrench, Clock, User, MapPin, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/Cards/StatCard';
import { operationStatusLabels, operationStatusColors } from '../../types';
import { formatDateTime, getProgressColor } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SkimmerOperation = () => {
  const { currentEvent, getEventCleanupOperations, updateCleanupProgress } = useStore();
  const [selectedOp, setSelectedOp] = useState<string | null>(null);

  const cleanupOps = currentEvent
    ? getEventCleanupOperations(currentEvent.id).filter((o) => o.operationType === 'skimmer')
    : [];

  const totalCollected = cleanupOps.reduce((sum, op) => sum + op.collectedVolume, 0);
  const inProgressCount = cleanupOps.filter((o) => o.status === 'in_progress').length;
  const equipmentCount = cleanupOps.reduce((sum, op) => sum + op.equipmentCount, 0);

  const trendData = [
    { time: '08:00', collected: 20 },
    { time: '10:00', collected: 45 },
    { time: '12:00', collected: 75 },
    { time: '14:00', collected: 95 },
    { time: '16:00', collected: 125 },
    { time: '18:00', collected: totalCollected },
  ];

  const handleUpdateProgress = (opId: string) => {
    const op = cleanupOps.find((o) => o.id === opId);
    if (!op) return;

    const newProgress = Math.min(op.progress + 10, 100);
    const newVolume = op.collectedVolume + 10;
    updateCleanupProgress(opId, newProgress, newVolume);
  };

  const handleToggleStatus = (opId: string) => {
    const op = cleanupOps.find((o) => o.id === opId);
    if (!op) return;

    if (op.status === 'in_progress') {
      updateCleanupProgress(opId, op.progress, op.collectedVolume);
    }
  };

  if (!currentEvent) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500">请先选择一个事件</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">撇油器收油作业</h1>
          <p className="text-slate-500 mt-1">管理机械收油作业，监控收油进度</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增收油任务
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="已回收油量"
          value={totalCollected.toFixed(1)}
          unit="吨"
          icon={Droplets}
          color="green"
          trend="up"
          trendValue={12}
          description="较昨日"
        />
        <StatCard
          title="进行中作业"
          value={inProgressCount}
          unit="项"
          icon={Play}
          color="orange"
        />
        <StatCard
          title="投入设备"
          value={equipmentCount}
          unit="台"
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="作业效率"
          value="15.6"
          unit="吨/小时"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">收油趋势</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    stroke="#06D6A0"
                    strokeWidth={3}
                    dot={{ fill: '#06D6A0', r: 5 }}
                    name="回收量(吨)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">作业列表</h3>
          <div className="space-y-4">
            {cleanupOps.map((op) => (
              <div
                key={op.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedOp === op.id
                    ? 'border-ocean-500 bg-ocean-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedOp(op.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{op.equipment}</span>
                  <span className={`status-badge ${operationStatusColors[op.status]}`}>
                    {operationStatusLabels[op.status]}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {op.location}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">设备数量:</span>
                    <span className="ml-1 font-medium">{op.equipmentCount}台</span>
                  </div>
                  <div>
                    <span className="text-slate-400">已回收:</span>
                    <span className="ml-1 font-medium text-alert-green">{op.collectedVolume}吨</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">作业进度</span>
                    <span className="font-medium text-ocean-600">{op.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(op.progress)}`}
                      style={{ width: `${op.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedOp && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            作业详情 - {cleanupOps.find((o) => o.id === selectedOp)?.equipment}
          </h3>

          {(() => {
            const op = cleanupOps.find((o) => o.id === selectedOp);
            if (!op) return null;

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Wrench className="w-4 h-4" />
                      <span className="text-sm">设备类型</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{op.equipment}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Droplets className="w-4 h-4" />
                      <span className="text-sm">已回收 / 目标</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      {op.collectedVolume} / {op.targetVolume} 吨
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">开始时间</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">
                      {formatDateTime(op.startTime)}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">作业船舶</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{op.operator}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {op.status === 'idle' && (
                    <button className="btn-primary flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      开始作业
                    </button>
                  )}
                  {op.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleUpdateProgress(op.id)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        更新进度
                      </button>
                      <button className="btn-secondary flex items-center gap-2">
                        <Pause className="w-4 h-4" />
                        暂停作业
                      </button>
                    </>
                  )}
                  {op.status === 'paused' && (
                    <button className="btn-warning flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      恢复作业
                    </button>
                  )}
                  {op.progress >= 100 && (
                    <div className="p-4 bg-alert-green/10 rounded-lg border border-alert-green/30">
                      <div className="text-alert-green font-medium">作业已完成</div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">作业记录</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">设备</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">作业位置</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">已回收</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">进度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">作业船舶</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">开始时间</th>
              </tr>
            </thead>
            <tbody>
              {cleanupOps.map((op) => (
                <tr key={op.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium">{op.equipment}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{op.location}</td>
                  <td className="py-3 px-4">
                    <span className={`status-badge ${operationStatusColors[op.status]}`}>
                      {operationStatusLabels[op.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-alert-green">{op.collectedVolume} 吨</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                        <div
                          className={`h-full rounded-full ${getProgressColor(op.progress)}`}
                          style={{ width: `${op.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{op.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{op.operator}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{formatDateTime(op.startTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkimmerOperation;
