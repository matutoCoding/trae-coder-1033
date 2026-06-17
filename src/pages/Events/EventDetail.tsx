import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, FileText, AlertTriangle, Activity, Ship, Droplets, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { eventStatusLabels, eventStatusColors, oilTypeLabels } from '../../types';
import type { TimelineCategory } from '../../types';
import { formatDateTime, getTimeDiff } from '../../utils/helpers';
import StatCard from '../../components/Cards/StatCard';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEventById, getEventOilSpreadData, getEventContainmentOperations, getEventCleanupOperations, getEventResourceAssignments, getEventDisposalProgress, getEventEcologyAssessment, ecologyAssessments, setCurrentEvent, generateTimeline } = useStore();

  const event = id ? getEventById(id) : undefined;

  if (!event) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">事件不存在或已被删除</p>
        <button onClick={() => navigate('/events')} className="btn-primary">
          返回事件列表
        </button>
      </div>
    );
  }

  const oilSpreadData = getEventOilSpreadData(event.id);
  const containmentOps = getEventContainmentOperations(event.id);
  const cleanupOps = getEventCleanupOperations(event.id);
  const resources = getEventResourceAssignments(event.id);
  const disposalProgress = getEventDisposalProgress(event.id);
  const ecologyAssessment = getEventEcologyAssessment(event.id);
  const timeline = generateTimeline(event.id);

  const latestSpread = oilSpreadData[oilSpreadData.length - 1];
  const totalCollected = cleanupOps.reduce((sum, op) => sum + op.collectedVolume, 0);
  const recoveryRate = event.estimatedVolume > 0 ? ((totalCollected / event.estimatedVolume) * 100).toFixed(1) : '0';

  const handleSetCurrent = () => {
    setCurrentEvent(event);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/events')}
          className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-ocean-700">{event.eventName}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${eventStatusColors[event.status]}`}>
              {eventStatusLabels[event.status]}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{event.location}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            编辑事件
          </button>
          <button onClick={handleSetCurrent} className="btn-primary">
            设为当前事件
          </button>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-ocean-700 to-ocean-600 text-white">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 text-ocean-100 text-sm mb-1">
              <MapPin size={16} />
              事件位置
            </div>
            <p className="font-medium">{event.location}</p>
            <p className="text-ocean-100 text-sm mt-1">
              {event.latitude.toFixed(4)}°N, {event.longitude.toFixed(4)}°E
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-ocean-100 text-sm mb-1">
              <Droplets size={16} />
              溢油信息
            </div>
            <p className="font-medium">{oilTypeLabels[event.oilType]}</p>
            <p className="text-ocean-100 text-sm mt-1">预估 {event.estimatedVolume} 吨</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-ocean-100 text-sm mb-1">
              <Clock size={16} />
              发生时间
            </div>
            <p className="font-medium">{formatDateTime(event.occurrenceTime)}</p>
            <p className="text-ocean-100 text-sm mt-1">
              {getTimeDiff(event.occurrenceTime)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-ocean-100 text-sm mb-1">
              <User size={16} />
              接报信息
            </div>
            <p className="font-medium">{event.reporter}</p>
            <p className="text-ocean-100 text-sm mt-1">
              {formatDateTime(event.reportTime)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="溢油扩散面积"
          value={latestSpread?.spreadArea || 0}
          unit="km²"
          icon={<Activity size={24} />}
          color="red"
        />
        <StatCard
          title="围控布放长度"
          value={containmentOps.reduce((sum, op) => sum + op.deployedLength, 0)}
          unit="米"
          icon={<Ship size={24} />}
          color="blue"
        />
        <StatCard
          title="已回收油量"
          value={totalCollected}
          unit="吨"
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <StatCard
          title="回收率"
          value={parseFloat(recoveryRate)}
          unit="%"
          icon={<Activity size={24} />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4 flex items-center gap-2">
            <FileText size={20} />
            事件描述
          </h3>
          <p className="text-gray-600 leading-relaxed">{event.description}</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">事件来源：</span>
                <span className="text-gray-800">{event.source}</span>
              </div>
              <div>
                <span className="text-gray-500">事件编号：</span>
                <span className="text-gray-800 font-mono">{event.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4 flex items-center gap-2">
            <Activity size={20} />
            处置进度概览
          </h3>
          <div className="space-y-4">
            {disposalProgress.slice(0, 4).map((stage) => (
              <div key={stage.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{stage.stage}</span>
                  <span className="font-medium text-ocean-700">{stage.completionRate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stage.completionRate === 100 ? 'bg-alert-green' :
                      stage.completionRate > 0 ? 'bg-ocean-700' : 'bg-gray-300'
                    }`}
                    style={{ width: `${stage.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {disposalProgress.length > 4 && (
            <button className="mt-4 text-sm text-ocean-700 hover:text-ocean-800 font-medium">
              查看全部 {disposalProgress.length} 个阶段 →
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">围控作业</h3>
          <div className="space-y-3">
            {containmentOps.map((op) => (
              <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{op.boomType}</p>
                  <p className="text-sm text-gray-500">{op.deploymentLocation}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ocean-700">{op.deployedLength}/{op.totalLength}m</p>
                  <p className="text-sm text-gray-500">{op.operator}</p>
                </div>
              </div>
            ))}
            {containmentOps.length === 0 && (
              <p className="text-center text-gray-500 py-4">暂无围控作业数据</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">清污作业</h3>
          <div className="space-y-3">
            {cleanupOps.map((op) => (
              <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{op.equipment}</p>
                  <p className="text-sm text-gray-500">{op.location} · {op.operator}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ocean-700">{op.collectedVolume} 吨</p>
                  <p className="text-sm text-gray-500">进度 {op.progress}%</p>
                </div>
              </div>
            ))}
            {cleanupOps.length === 0 && (
              <p className="text-center text-gray-500 py-4">暂无清污作业数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ocean-700 mb-4">生态评估摘要</h3>
        {ecologyAssessment ? (
          <div className="grid grid-cols-4 gap-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm text-gray-500 mb-1">损害等级</p>
              <p className="text-2xl font-bold text-alert-red">{ecologyAssessment.damageLevel}/10</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm text-gray-500 mb-1">影响面积</p>
              <p className="text-2xl font-bold text-alert-orange">{ecologyAssessment.affectedArea} km²</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-gray-500 mb-1">敏感资源</p>
              <p className="text-2xl font-bold text-yellow-700">{ecologyAssessment.sensitiveResources.length} 处</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-gray-500 mb-1">预计恢复</p>
              <p className="text-lg font-bold text-alert-green">{ecologyAssessment.estimatedRecoveryTime}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">暂无生态评估数据</p>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ocean-700 mb-4">资源调配</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { type: 'vessel', label: '船舶', icon: <Ship size={20} /> },
            { type: 'equipment', label: '设备', icon: <Activity size={20} /> },
            { type: 'personnel', label: '人员', icon: <User size={20} /> },
            { type: 'material', label: '物资', icon: <Droplets size={20} /> },
          ].map((item) => {
            const typeResources = resources.filter(r => r.resourceType === item.type);
            const totalQty = typeResources.reduce((sum, r) => sum + r.quantity, 0);
            return (
              <div key={item.type} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center text-ocean-700">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.label}</p>
                    <p className="text-sm text-gray-500">{typeResources.length} 项</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-ocean-700">
                  {totalQty} <span className="text-sm font-normal text-gray-500">
                    {item.type === 'vessel' ? '艘' : item.type === 'personnel' ? '人' : '件'}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ocean-700">处置时间线</h3>
          <span className="text-sm text-gray-500">共 {timeline.length} 条记录</span>
        </div>
        {timeline.length === 0 ? (
          <p className="text-center text-gray-500 py-8">暂无处置记录</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {timeline.map((item) => {
                const categoryColors: Record<TimelineCategory, string> = {
                  event: 'bg-alert-red',
                  monitoring: 'bg-alert-blue',
                  containment: 'bg-alert-orange',
                  cleanup: 'bg-alert-green',
                  resource: 'bg-purple-500',
                  ecology: 'bg-yellow-500',
                  summary: 'bg-ocean-600',
                };
                const dotColor = categoryColors[item.category] || 'bg-gray-400';
                const isClickable = !!item.linkPath;

                return (
                  <div
                    key={item.id}
                    className={`relative pl-10 pr-4 py-3 rounded-lg transition-colors ${
                      isClickable ? 'hover:bg-gray-50 cursor-pointer' : ''
                    }`}
                    onClick={() => isClickable && item.linkPath && navigate(item.linkPath)}
                  >
                    <div className={`absolute left-0 top-4 w-6 h-6 rounded-full ${dotColor} border-4 border-white shadow`} />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 mb-1">{item.time}</span>
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
