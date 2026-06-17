import { useState } from 'react';
import { Plus, Play, Pause, Droplets, Wrench, Clock, User, MapPin, AlertTriangle, Save, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/Cards/StatCard';
import { operationStatusLabels, operationStatusColors, OperationStatus } from '../../types';
import { formatDateTime, getProgressColor } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DispersantSpray = () => {
  const { currentEvent, getEventCleanupOperations, addCleanupOperation, updateCleanupStatus } = useStore();
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    equipment: '标准喷洒装置',
    equipmentCount: 1,
    targetVolume: 5,
    location: '事发海域',
    operator: '海巡01号',
  });

  const cleanupOps = currentEvent
    ? getEventCleanupOperations(currentEvent.id, 'dispersant')
    : [];

  const totalSprayed = cleanupOps.reduce((sum, op) => sum + op.collectedVolume, 0);
  const totalTarget = cleanupOps.reduce((sum, op) => sum + op.targetVolume, 0);
  const inProgressCount = cleanupOps.filter((o) => o.status === 'in_progress').length;
  const equipmentCount = cleanupOps.reduce((sum, op) => sum + op.equipmentCount, 0);

  const usageData = [
    { name: '06-15', 用量: 5 },
    { name: '06-16', 用量: 8 },
    { name: '06-17', 用量: 12 },
    { name: '06-18', 用量: 15 },
    { name: '06-19', 用量: 10 },
    { name: '06-20', 用量: 7 },
  ];

  const handleSave = () => {
    if (
      !formData.equipment.trim() ||
      !formData.equipmentCount ||
      !formData.targetVolume ||
      !formData.location.trim() ||
      !formData.operator.trim()
    ) {
      alert('请填写所有必填字段');
      return;
    }

    if (!currentEvent) return;

    addCleanupOperation({
      eventId: currentEvent.id,
      operationType: 'dispersant',
      equipment: formData.equipment,
      equipmentCount: formData.equipmentCount,
      collectedVolume: 0,
      targetVolume: formData.targetVolume,
      location: formData.location,
      operator: formData.operator,
      status: 'idle' as OperationStatus,
      startTime: new Date().toLocaleString('zh-CN'),
      progress: 0,
    });

    setShowModal(false);
    setFormData({
      equipment: '标准喷洒装置',
      equipmentCount: 1,
      targetVolume: 5,
      location: '事发海域',
      operator: '海巡01号',
    });
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
          <h1 className="text-2xl font-bold text-slate-800">消油剂喷洒作业</h1>
          <p className="text-slate-500 mt-1">管理消油剂喷洒作业，监控使用情况</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增喷洒任务
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="喷洒面积"
          value="12.5"
          unit="km²"
          icon={Droplets}
          color="blue"
        />
        <StatCard
          title="已用消油剂"
          value={totalSprayed.toFixed(1)}
          unit="吨"
          icon={Wrench}
          color="purple"
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
          color="green"
        />
      </div>

      <div className="p-4 bg-alert-yellow/10 rounded-lg border border-alert-yellow/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-amber-700">安全提醒</div>
          <div className="text-sm text-amber-600 mt-1">
            消油剂使用需严格遵守《溢油分散剂使用准则》，在敏感区域附近使用时需特别谨慎。建议优先采用机械回收方式。
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">消油剂用量趋势</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="用量" fill="#9b59b6" radius={[4, 4, 0, 0]} name="用量(吨)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">喷洒区域</h3>
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
                    <span className="text-slate-400">喷洒船:</span>
                    <span className="ml-1 font-medium">{op.operator}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">设备数:</span>
                    <span className="ml-1 font-medium">{op.equipmentCount}台</span>
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
                      <span className="text-sm">喷洒设备</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{op.equipment}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">作业位置</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800">{op.location}</div>
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
                    <button
                      onClick={() => updateCleanupStatus(op.id, 'in_progress')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      开始喷洒
                    </button>
                  )}
                  {op.status === 'in_progress' && (
                    <button
                      onClick={() => updateCleanupStatus(op.id, 'paused')}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      暂停作业
                    </button>
                  )}
                  {op.status === 'paused' && (
                    <button
                      onClick={() => updateCleanupStatus(op.id, 'in_progress')}
                      className="btn-warning flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      恢复喷洒
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">消油剂库存</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="text-sm text-green-600 mb-1">可用库存</div>
            <div className="text-3xl font-bold text-slate-800">30 吨</div>
            <div className="text-sm text-slate-500 mt-1">储备充足</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
            <div className="text-sm text-amber-600 mb-1">已使用</div>
            <div className="text-3xl font-bold text-slate-800">{totalSprayed} 吨</div>
            <div className="text-sm text-slate-500 mt-1">本次事件</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-ocean-50 rounded-xl border border-blue-200">
            <div className="text-sm text-ocean-600 mb-1">预计还需</div>
            <div className="text-3xl font-bold text-slate-800">{totalTarget - totalSprayed > 0 ? (totalTarget - totalSprayed).toFixed(1) : 0} 吨</div>
            <div className="text-sm text-slate-500 mt-1">后续作业</div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="z-50 fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">新增喷洒任务</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  喷洒设备 <span className="text-alert-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="form-input w-full"
                  placeholder="请输入喷洒设备名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  设备数量 <span className="text-alert-red">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.equipmentCount}
                  onChange={(e) => setFormData({ ...formData, equipmentCount: parseInt(e.target.value) || 0 })}
                  className="form-input w-full"
                  placeholder="请输入设备数量"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  目标用量（吨） <span className="text-alert-red">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={formData.targetVolume}
                  onChange={(e) => setFormData({ ...formData, targetVolume: parseFloat(e.target.value) || 0 })}
                  className="form-input w-full"
                  placeholder="请输入目标用量"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  作业位置 <span className="text-alert-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-input w-full"
                  placeholder="请输入作业位置"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  作业船舶 <span className="text-alert-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  className="form-input w-full"
                  placeholder="请输入作业船舶名称"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispersantSpray;
