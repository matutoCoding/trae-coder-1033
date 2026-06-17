import React, { useState } from 'react';
import { Ship, MapPin, Phone, Clock, Search, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { resourceStatusLabels, resourceStatusColors } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const VesselScheduling: React.FC = () => {
  const { currentEvent, getEventResourceAssignments, updateResourceStatus, updateResourcePosition } = useStore();
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resources = currentEvent ? getEventResourceAssignments(currentEvent.id) : [];
  const vessels = resources.filter(r => r.resourceType === 'vessel');

  const filteredVessels = vessels.filter(vessel => {
    const matchesStatus = statusFilter === 'all' || vessel.status === statusFilter;
    const matchesSearch = vessel.resourceName.includes(searchTerm) || 
                          vessel.currentLocation.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: vessels.length,
    in_use: vessels.filter(v => v.status === 'in_use').length,
    available: vessels.filter(v => v.status === 'available').length,
    assigned: vessels.filter(v => v.status === 'assigned').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ocean-700">清污船调度</h2>
          <p className="text-gray-600 mt-1">管理和调度清污船舶资源</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Ship size={18} />
          新增调度
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总船舶数', value: statusCounts.all, color: 'bg-ocean-700' },
          { label: '作业中', value: statusCounts.in_use, color: 'bg-alert-orange' },
          { label: '可用', value: statusCounts.available, color: 'bg-alert-green' },
          { label: '已分配', value: statusCounts.assigned, color: 'bg-alert-yellow' },
        ].map((stat, idx) => (
          <div key={idx} className="card">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Ship size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-ocean-700">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-ocean-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全部' : resourceStatusLabels[status as keyof typeof resourceStatusLabels]} ({count})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索船舶名称或位置..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-700 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">船舶名称</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">状态</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">当前位置</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">分配时间</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">联系方式</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredVessels.map((vessel) => (
                <React.Fragment key={vessel.id}>
                  <tr 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedVessel(selectedVessel === vessel.id ? null : vessel.id)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                          <Ship size={20} className="text-ocean-700" />
                        </div>
                        <span className="font-medium text-gray-800">{vessel.resourceName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${resourceStatusColors[vessel.status]}`}>
                        {resourceStatusLabels[vessel.status]}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        {vessel.currentLocation}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        {formatDateTime(vessel.assignedTime)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} />
                        {vessel.contact}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-ocean-700 hover:text-ocean-800">
                        {selectedVessel === vessel.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </td>
                  </tr>
                  {selectedVessel === vessel.id && (
                    <tr className="bg-ocean-50">
                      <td colSpan={6} className="py-4 px-8">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-ocean-700 mb-3">船舶任务详情</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">资源类型</span>
                                <span className="text-gray-800">清污船舶</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">数量</span>
                                <span className="text-gray-800">{vessel.quantity} {vessel.unit}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">分配时间</span>
                                <span className="text-gray-800">{formatDateTime(vessel.assignedTime)}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-ocean-700 mb-3">调度操作</h4>
                            <div className="flex gap-2">
                              {vessel.status === 'available' && (
                                <button
                                  onClick={() => updateResourceStatus(vessel.id, 'assigned', '待分配任务')}
                                  className="px-4 py-2 bg-ocean-700 text-white rounded-lg text-sm hover:bg-ocean-800 transition-colors"
                                >
                                  分配任务
                                </button>
                              )}
                              {vessel.status === 'in_use' && (
                                <>
                                  <button
                                    onClick={() => updateResourceStatus(vessel.id, 'assigned', vessel.currentTask)}
                                    className="px-4 py-2 bg-alert-yellow text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                                  >
                                    暂停作业
                                  </button>
                                  <button
                                    onClick={() => updateResourceStatus(vessel.id, 'available', '')}
                                    className="px-4 py-2 bg-alert-green text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
                                  >
                                    完成作业
                                  </button>
                                </>
                              )}
                              {vessel.status === 'assigned' && (
                                <button
                                  onClick={() => updateResourceStatus(vessel.id, 'in_use', vessel.currentTask || '清污作业')}
                                  className="px-4 py-2 bg-alert-orange text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                                >
                                  开始作业
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const newLocation = prompt('请输入新位置');
                                  if (newLocation !== null) {
                                    updateResourcePosition(vessel.id, newLocation);
                                  }
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                调整位置
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVessels.length === 0 && (
          <div className="text-center py-12">
            <Ship size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无符合条件的船舶数据</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={24} className="text-alert-orange" />
          <h3 className="text-lg font-semibold text-ocean-700">调度注意事项</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-alert-green rounded-full mt-2"></div>
            <span>优先调度距离事发地点最近的可用船舶</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-alert-green rounded-full mt-2"></div>
            <span>根据海况条件合理安排作业时间窗口</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-alert-yellow rounded-full mt-2"></div>
            <span>确保船舶携带足够的消油剂和收油设备</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-alert-yellow rounded-full mt-2"></div>
            <span>保持与作业船舶的实时通讯联系</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-alert-orange rounded-full mt-2"></div>
            <span>恶劣天气条件下应及时召回作业船舶</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-alert-orange rounded-full mt-2"></div>
            <span>做好船舶作业记录和油污交接登记</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselScheduling;
