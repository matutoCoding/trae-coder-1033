import React, { useState } from 'react';
import { Shield, MapPin, AlertTriangle, Fish, Bird, Trees, Droplets, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

const resourceIcons: Record<string, React.ReactNode> = {
  '渔业养殖区': <Fish size={24} className="text-blue-500" />,
  '自然保护区': <Trees size={24} className="text-green-600" />,
  '滨海湿地': <Droplets size={24} className="text-teal-500" />,
  '候鸟栖息地': <Bird size={24} className="text-amber-600" />,
};

const SensitiveResources: React.FC = () => {
  const { ecologyAssessment, currentEvent } = useStore();
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const protectionMeasures = [
    {
      id: 1,
      resource: '渔业养殖区',
      status: 'in_progress',
      priority: 'high',
      distance: '5.2海里',
      measures: [
        { name: '设置围油栏拦截', completed: true, time: '2026-06-15 18:00' },
        { name: '出动监测船巡查', completed: true, time: '2026-06-15 20:00' },
        { name: '指导养殖户转移', completed: false },
        { name: '水质实时监测', completed: false },
      ],
      description: '附近有大型水产养殖基地，主要养殖大黄鱼、对虾等经济品种，年产值约2亿元。',
    },
    {
      id: 2,
      resource: '自然保护区',
      status: 'in_progress',
      priority: 'high',
      distance: '8.5海里',
      measures: [
        { name: '划定警戒区域', completed: true, time: '2026-06-15 16:00' },
        { name: '加强巡逻值守', completed: true, time: '2026-06-15 17:00' },
        { name: '准备应急物资', completed: true, time: '2026-06-15 19:00' },
        { name: '生态影响评估', completed: false },
      ],
      description: '国家级海洋自然保护区，有多种珍稀保护物种，生态敏感度极高。',
    },
    {
      id: 3,
      resource: '滨海湿地',
      status: 'monitoring',
      priority: 'medium',
      distance: '12.3海里',
      measures: [
        { name: '扩散趋势预测', completed: true, time: '2026-06-15 14:00' },
        { name: '湿地现状调查', completed: true, time: '2026-06-15 16:00' },
        { name: '预备围控措施', completed: false },
      ],
      description: '重要滨海湿地生态系统，是众多水鸟的迁徙停歇地和觅食场所。',
    },
    {
      id: 4,
      resource: '候鸟栖息地',
      status: 'monitoring',
      priority: 'medium',
      distance: '15.0海里',
      measures: [
        { name: '鸟类分布调查', completed: true, time: '2026-06-15 15:00' },
        { name: '栖息地巡视监测', completed: false },
        { name: '油污清理预案', completed: false },
      ],
      description: '重要候鸟栖息地，每年有大量候鸟在此越冬或停歇，属于重点保护区域。',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-alert-green" />;
      case 'in_progress':
        return <Clock size={20} className="text-alert-orange" />;
      case 'monitoring':
        return <AlertTriangle size={20} className="text-alert-yellow" />;
      default:
        return <XCircle size={20} className="text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: '保护完成', class: 'bg-alert-green text-green-800' };
      case 'in_progress':
        return { text: '保护中', class: 'bg-alert-orange text-white' };
      case 'monitoring':
        return { text: '监测中', class: 'bg-alert-yellow text-yellow-800' };
      default:
        return { text: '未开始', class: 'bg-gray-200 text-gray-700' };
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return { text: '高优先级', class: 'bg-alert-red text-white' };
      case 'medium':
        return { text: '中优先级', class: 'bg-alert-orange text-white' };
      default:
        return { text: '低优先级', class: 'bg-gray-400 text-white' };
    }
  };

  if (!ecologyAssessment) {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">暂无生态评估数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ocean-700">敏感资源保护</h2>
          <p className="text-gray-600 mt-1">保护受溢油影响的敏感生态资源</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Shield size={18} />
          新增保护措施
        </button>
      </div>

      {currentEvent && (
        <div className="card bg-gradient-to-r from-ocean-700 to-ocean-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ocean-100 text-sm">当前事件</p>
              <h3 className="text-xl font-bold">{currentEvent.eventName}</h3>
              <p className="text-ocean-100 mt-1">{currentEvent.location}</p>
            </div>
            <div className="text-right">
              <p className="text-ocean-100 text-sm">影响面积</p>
              <p className="text-3xl font-bold">{ecologyAssessment.affectedArea} km²</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {ecologyAssessment.sensitiveResources.map((resource, idx) => (
          <div key={idx} className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ocean-100 rounded-lg flex items-center justify-center">
                {resourceIcons[resource] || <Shield size={24} className="text-ocean-700" />}
              </div>
              <div>
                <p className="text-sm text-gray-500">敏感资源</p>
                <p className="font-bold text-ocean-700">{resource}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ocean-700 mb-6">保护措施进展</h3>
        <div className="space-y-4">
          {protectionMeasures.map((item) => (
            <React.Fragment key={item.id}>
              <div
                className="border border-gray-200 rounded-lg p-4 hover:border-ocean-300 transition-colors cursor-pointer"
                onClick={() => setSelectedResource(selectedResource === item.resource ? null : item.resource)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                      {resourceIcons[item.resource] || <Shield size={24} className="text-ocean-700" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-800">{item.resource}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityLabel(item.priority).class}`}>
                          {getPriorityLabel(item.priority).text}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusLabel(item.status).class}`}>
                          {getStatusLabel(item.status).text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          距离 {item.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.measures.filter(m => m.completed).length}/{item.measures.length} 项措施已完成
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={24}
                    className={`text-gray-400 transition-transform ${selectedResource === item.resource ? 'rotate-90' : ''}`}
                  />
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">保护进度</span>
                    <span className="font-medium text-ocean-700">
                      {Math.round((item.measures.filter(m => m.completed).length / item.measures.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ocean-700 rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.measures.filter(m => m.completed).length / item.measures.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {selectedResource === item.resource && (
                <div className="bg-ocean-50 rounded-lg p-6 border border-ocean-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-3">资源说明</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-3">保护措施清单</h4>
                      <div className="space-y-2">
                        {item.measures.map((measure, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded">
                            {measure.completed ? (
                              <CheckCircle size={18} className="text-alert-green flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <span className={measure.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                                {measure.name}
                              </span>
                            </div>
                            {measure.time && (
                              <span className="text-xs text-gray-400">{measure.time}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ocean-700 mb-4">受影响物种</h3>
        <div className="grid grid-cols-2 gap-4">
          {ecologyAssessment.affectedSpecies.map((species, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-alert-red/10 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-alert-red" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{species}</p>
                <p className="text-xs text-gray-500">受影响程度：严重</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SensitiveResources;
