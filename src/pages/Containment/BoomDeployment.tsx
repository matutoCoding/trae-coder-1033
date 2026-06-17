import { useState } from 'react';
import { Plus, MapPin, Ruler, Clock, User, Play, Pause, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { OilSpillMap } from '../../components/Map/OilSpillMap';
import StatCard from '../../components/Cards/StatCard';
import { operationStatusLabels, operationStatusColors } from '../../types';
import { formatDateTime, getProgressColor } from '../../utils/helpers';
import { Shield, Wrench, Layers } from 'lucide-react';

const BoomDeployment = () => {
  const {
    currentEvent,
    getEventOilSpreadData,
    getEventContainmentOperations,
    updateContainmentStatus,
  } = useStore();

  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  const spreadData = currentEvent ? getEventOilSpreadData(currentEvent.id) : [];
  const containmentOps = currentEvent ? getEventContainmentOperations(currentEvent.id) : [];

  const totalDeployed = containmentOps.reduce((sum, op) => sum + op.deployedLength, 0);
  const totalPlanned = containmentOps.reduce((sum, op) => sum + op.totalLength, 0);
  const inProgressCount = containmentOps.filter((op) => op.status === 'deploying').length;
  const completedCount = containmentOps.filter((op) => op.status === 'deployed').length;

  const handleStatusChange = (opId: string, newStatus: string, newLength: number) => {
    updateContainmentStatus(opId, newStatus, newLength);
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
          <h1 className="text-2xl font-bold text-slate-800">围油栏布放</h1>
          <p className="text-slate-500 mt-1">管理围油栏布放作业，监控围控进度</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增布放任务
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="已布放长度"
          value={totalDeployed}
          unit="米"
          icon={Ruler}
          color="green"
        />
        <StatCard
          title="计划总长度"
          value={totalPlanned}
          unit="米"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="布放中任务"
          value={inProgressCount}
          unit="项"
          icon={Play}
          color="orange"
        />
        <StatCard
          title="已完成任务"
          value={completedCount}
          unit="项"
          icon={Check}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OilSpillMap
            event={currentEvent}
            spreadData={spreadData}
            containmentOps={containmentOps}
            height="500px"
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">布放进度总览</h3>
          <div className="space-y-4">
            {containmentOps.map((op) => {
              const progress = Math.round((op.deployedLength / op.totalLength) * 100);
              return (
                <div
                  key={op.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedOperation === op.id
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedOperation(op.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800">{op.boomType}</span>
                    <span className={`status-badge ${operationStatusColors[op.status]}`}>
                      {operationStatusLabels[op.status]}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {op.deploymentLocation}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">布放进度</span>
                      <span className="font-medium text-ocean-600">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{op.deployedLength} / {op.totalLength} 米</span>
                      <span>{op.operator}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedOperation && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            作业详情 - {containmentOps.find((o) => o.id === selectedOperation)?.boomType}
          </h3>
          
          {(() => {
            const op = containmentOps.find((o) => o.id === selectedOperation);
            if (!op) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Wrench className="w-4 h-4" />
                    <span className="text-sm">围油栏类型</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">{op.boomType}</div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Ruler className="w-4 h-4" />
                    <span className="text-sm">已布放 / 总长</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {op.deployedLength} / {op.totalLength} 米
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
                    <span className="text-sm">作业队伍</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">{op.operator}</div>
                </div>
              </div>
            );
          })()}

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500 mb-2">备注信息</div>
            <div className="text-slate-700">
              {containmentOps.find((o) => o.id === selectedOperation)?.remarks}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            {(() => {
              const op = containmentOps.find((o) => o.id === selectedOperation);
              if (!op) return null;

              if (op.status === 'planning') {
                return (
                  <button
                    onClick={() => handleStatusChange(op.id, 'deploying', op.totalLength * 0.1)}
                    className="btn-warning flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    开始布放
                  </button>
                );
              }

              if (op.status === 'deploying') {
                return (
                  <>
                    <button
                      onClick={() => handleStatusChange(op.id, 'deployed', op.totalLength)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      完成布放
                    </button>
                    <button
                      onClick={() => handleStatusChange(op.id, 'planning', op.deployedLength)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      暂停作业
                    </button>
                  </>
                );
              }

              if (op.status === 'deployed') {
                return (
                  <button
                    onClick={() => handleStatusChange(op.id, 'recovering', op.totalLength * 0.8)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    开始回收
                  </button>
                );
              }

              return null;
            })()}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">围控效果评估</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">西北方向</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">拦截有效</div>
            <div className="text-sm text-slate-500 mt-1">围油栏拦截效果良好，未发现油膜溢出</div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">东南方向</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">拦截有效</div>
            <div className="text-sm text-slate-500 mt-1">成功保护了敏感岸线资源</div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">东侧方向</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">布放中</div>
            <div className="text-sm text-slate-500 mt-1">需加快布放进度，防止油膜扩散</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoomDeployment;
