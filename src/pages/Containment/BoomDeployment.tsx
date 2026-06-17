import { useState } from 'react';
import { Plus, MapPin, Ruler, Clock, User, Play, Pause, Check, AlertCircle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { OilSpillMap } from '../../components/Map/OilSpillMap';
import StatCard from '../../components/Cards/StatCard';
import { operationStatusLabels, operationStatusColors, OperationStatus } from '../../types';
import { formatDateTime, getProgressColor } from '../../utils/helpers';
import { Shield, Wrench, Layers } from 'lucide-react';

const boomTypeOptions = [
  '固体浮子式围油栏',
  '充气式围油栏',
  '防火围油栏',
  '快速布放围油栏',
];

const BoomDeployment = () => {
  const {
    currentEvent,
    containmentOperations,
    oilSpreadData,
    getEventOilSpreadData,
    getEventContainmentOperations,
    updateContainmentStatus,
    addContainmentOperation,
  } = useStore();

  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    boomType: '',
    totalLength: '',
    deploymentLocation: '',
    operator: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const spreadData = currentEvent ? getEventOilSpreadData(currentEvent.id) : [];
  const containmentOps = currentEvent ? getEventContainmentOperations(currentEvent.id) : [];

  const totalDeployed = containmentOps.reduce((sum, op) => sum + op.deployedLength, 0);
  const totalPlanned = containmentOps.reduce((sum, op) => sum + op.totalLength, 0);
  const inProgressCount = containmentOps.filter((op) => op.status === 'deploying').length;
  const completedCount = containmentOps.filter((op) => op.status === 'deployed').length;

  const handleStatusChange = (opId: string, newStatus: OperationStatus, newLength: number) => {
    updateContainmentStatus(opId, newStatus, newLength);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.boomType) newErrors.boomType = '请选择围油栏类型';
    if (!formData.totalLength || Number(formData.totalLength) <= 0) newErrors.totalLength = '请输入有效总长度';
    if (!formData.deploymentLocation.trim()) newErrors.deploymentLocation = '请输入布放位置';
    if (!formData.operator.trim()) newErrors.operator = '请输入作业队伍';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentEvent) return;

    addContainmentOperation({
      eventId: currentEvent.id,
      boomType: formData.boomType,
      totalLength: Number(formData.totalLength),
      deployedLength: 0,
      deploymentLocation: formData.deploymentLocation,
      status: 'planning',
      startTime: new Date().toISOString(),
      operator: formData.operator,
      remarks: formData.remarks,
      coordinates: [],
    });

    setShowModal(false);
    setFormData({
      boomType: '',
      totalLength: '',
      deploymentLocation: '',
      operator: '',
      remarks: '',
    });
    setErrors({});
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
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">新增布放任务</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrors({});
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  围油栏类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.boomType}
                  onChange={(e) => setFormData({ ...formData, boomType: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all ${
                    errors.boomType ? 'border-red-400' : 'border-slate-300'
                  }`}
                >
                  <option value="">请选择围油栏类型</option>
                  {boomTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.boomType && <p className="mt-1 text-sm text-red-500">{errors.boomType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  总长度（米） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.totalLength}
                  onChange={(e) => setFormData({ ...formData, totalLength: e.target.value })}
                  placeholder="请输入总长度"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all ${
                    errors.totalLength ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {errors.totalLength && <p className="mt-1 text-sm text-red-500">{errors.totalLength}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  布放位置 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.deploymentLocation}
                  onChange={(e) => setFormData({ ...formData, deploymentLocation: e.target.value })}
                  placeholder="请输入布放位置"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all ${
                    errors.deploymentLocation ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {errors.deploymentLocation && <p className="mt-1 text-sm text-red-500">{errors.deploymentLocation}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  作业队伍 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  placeholder="请输入作业队伍"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all ${
                    errors.operator ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {errors.operator && <p className="mt-1 text-sm text-red-500">{errors.operator}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="请输入备注信息（选填）"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 btn-primary"
                >
                  确认提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoomDeployment;
