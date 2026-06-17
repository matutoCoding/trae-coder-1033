import React from 'react';
import { Clock, CheckCircle, AlertCircle, FileText, User, Calendar, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateTime, getTimeDiff } from '../../utils/helpers';

const DisposalProgress: React.FC = () => {
  const {
    currentEvent,
    computeDynamicProgress,
    containmentOperations,
    cleanupOperations,
    resourceAssignments,
    oilSpreadData,
    ecologyAssessment,
  } = useStore();

  const progressData = React.useMemo(() => {
    if (!currentEvent) return [];
    return computeDynamicProgress(currentEvent.id);
  }, [
    currentEvent?.id,
    computeDynamicProgress,
    containmentOperations,
    cleanupOperations,
    resourceAssignments,
    oilSpreadData,
    ecologyAssessment,
  ]);

  const getStageColor = (completionRate: number) => {
    if (completionRate === 100) return 'bg-alert-green';
    if (completionRate >= 60) return 'bg-ocean-700';
    if (completionRate > 0) return 'bg-alert-orange';
    return 'bg-gray-300';
  };

  const getStageStatus = (completionRate: number, stageOrder: number) => {
    if (completionRate === 100) return { text: '已完成', icon: <CheckCircle size={20} className="text-alert-green" /> };
    if (completionRate > 0) return { text: '进行中', icon: <Clock size={20} className="text-alert-orange animate-pulse" /> };
    if (stageOrder > 1 && progressData[stageOrder - 2]?.completionRate === 100) return { text: '待启动', icon: <AlertCircle size={20} className="text-gray-400" /> };
    return { text: '未开始', icon: <AlertCircle size={20} className="text-gray-300" /> };
  };

  const overallProgress = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + p.completionRate, 0) / progressData.length)
    : 0;

  if (!currentEvent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无当前事件</h3>
        <p className="text-gray-400">请先选择一个事件以查看处置进度</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ocean-700">处置进度</h2>
          <p className="text-gray-600 mt-1">跟踪和管理溢油事件处置全流程</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FileText size={18} />
          导出进度报告
        </button>
      </div>

      <div className="card bg-gradient-to-r from-ocean-700 to-ocean-600 text-white">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-ocean-100 text-sm">当前事件</p>
            <h3 className="text-xl font-bold">{currentEvent.eventName}</h3>
            <p className="text-ocean-100 mt-1">{currentEvent.location}</p>
          </div>
          <div>
            <p className="text-ocean-100 text-sm">总体进度</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold">{overallProgress}%</p>
              <div className="flex-1 pb-2">
                <div className="h-3 bg-ocean-500/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-ocean-100 text-sm mb-1">
              <Calendar size={16} />
              开始时间
            </div>
            <p className="text-lg font-bold">{formatDateTime(currentEvent.occurrenceTime)}</p>
            <div className="flex items-center justify-end gap-2 text-ocean-100 text-sm mt-2">
              <User size={16} />
              <span>{currentEvent.reporter}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ocean-700 mb-6">处置阶段进度</h3>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-8">
            {progressData.map((stage, index) => {
              const status = getStageStatus(stage.completionRate, stage.stageOrder);
              const isLast = index === progressData.length - 1;
              
              return (
                <div key={stage.id} className="relative flex gap-6">
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      stage.completionRate === 100 ? 'bg-alert-green text-white' :
                      stage.completionRate > 0 ? 'bg-ocean-700 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      <span className="text-xl font-bold">{stage.stageOrder}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-gray-800">{stage.stage}</h4>
                        <div className="flex items-center gap-1">
                          {status.icon}
                          <span className={`text-sm font-medium ${
                            stage.completionRate === 100 ? 'text-alert-green' :
                            stage.completionRate > 0 ? 'text-alert-orange' :
                            'text-gray-400'
                          }`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-ocean-700">{stage.completionRate}%</span>
                    </div>
                    
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getStageColor(stage.completionRate)}`}
                        style={{ width: `${stage.completionRate}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={14} />
                        <span>更新时间：{formatDateTime(stage.updateTime)}</span>
                      </div>
                      <span className="text-gray-500">
                        {stage.milestones.filter(m => m.completed).length}/{stage.milestones.length} 个里程碑
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">{stage.remarks}</p>
                    
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">里程碑节点</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {stage.milestones.map((milestone, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              milestone.completed ? 'bg-alert-green text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {milestone.completed ? (
                                <CheckCircle size={14} />
                              ) : (
                                <span className="text-xs">{idx + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className={`text-sm ${
                                milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                              }`}>
                                {milestone.name}
                              </span>
                              {milestone.time && (
                                <p className="text-xs text-gray-400">{milestone.time}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">阶段耗时统计</h3>
          <div className="space-y-3">
            {progressData.map((stage) => (
              <div key={stage.id} className="flex items-center gap-4">
                <div className="w-28 text-sm text-gray-600">{stage.stage}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-3 ${getStageColor(stage.completionRate)}`}
                    style={{ width: `${stage.completionRate}%` }}
                  >
                    <span className="text-xs font-medium text-white">{stage.completionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">关键指标</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-ocean-50 rounded-lg">
              <p className="text-sm text-gray-500">已完成阶段</p>
              <p className="text-3xl font-bold text-ocean-700 mt-1">
                {progressData.filter(s => s.completionRate === 100).length}
              </p>
              <p className="text-xs text-gray-400">共 {progressData.length} 个阶段</p>
            </div>
            <div className="p-4 bg-alert-orange/10 rounded-lg">
              <p className="text-sm text-gray-500">进行中阶段</p>
              <p className="text-3xl font-bold text-alert-orange mt-1">
                {progressData.filter(s => s.completionRate > 0 && s.completionRate < 100).length}
              </p>
              <p className="text-xs text-gray-400">需持续推进</p>
            </div>
            <div className="p-4 bg-alert-green/10 rounded-lg">
              <p className="text-sm text-gray-500">已完成里程碑</p>
              <p className="text-3xl font-bold text-alert-green mt-1">
                {progressData.reduce((sum, s) => sum + s.milestones.filter(m => m.completed).length, 0)}
              </p>
              <p className="text-xs text-gray-400">
                共 {progressData.reduce((sum, s) => sum + s.milestones.length, 0)} 个
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">处置持续时间</p>
              <p className="text-3xl font-bold text-gray-700 mt-1">
                {getTimeDiff(currentEvent.occurrenceTime)}
              </p>
              <p className="text-xs text-gray-400">自事件发生以来</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposalProgress;
