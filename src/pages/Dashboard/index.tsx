import { Droplets, Ship, Shield, Trash2, Leaf, Clock, Users, AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/Cards/StatCard';
import { EventCard } from '../../components/Cards/EventCard';
import { OilSpillMap } from '../../components/Map/OilSpillMap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { getTimeDiff } from '../../utils/helpers';

export const Dashboard = () => {
  const { events, currentEvent, getEventOilSpreadData, getEventContainmentOperations, getEventCleanupOperations, getEventResourceAssignments, computeDynamicProgress } = useStore();

  const activeEvents = events.filter((e) => !['completed', 'archived'].includes(e.status));
  const totalOilVolume = events.reduce((sum, e) => sum + e.estimatedVolume, 0);

  const inProgressOps = currentEvent
    ? getEventCleanupOperations(currentEvent.id).filter((o) => o.status === 'in_progress').length
    : 0;

  const dynamicProgress = currentEvent ? computeDynamicProgress(currentEvent.id) : [];
  const avgProgress = dynamicProgress.length > 0
    ? Math.round(dynamicProgress.reduce((sum, p) => sum + p.completionRate, 0) / dynamicProgress.length)
    : 0;

  const currentSpreadData = currentEvent ? getEventOilSpreadData(currentEvent.id) : [];
  const currentContainmentOps = currentEvent ? getEventContainmentOperations(currentEvent.id) : [];
  const currentResources = currentEvent ? getEventResourceAssignments(currentEvent.id) : [];
  const currentCleanupOps = currentEvent ? getEventCleanupOperations(currentEvent.id) : [];

  const resourceUsageData = currentEvent && currentResources.length > 0
    ? [
        {
          name: '船舶',
          已使用: currentResources.filter((r) => r.resourceType === 'vessel' && r.status === 'in_use').reduce((s, r) => s + r.quantity, 0),
          可用: currentResources.filter((r) => r.resourceType === 'vessel' && r.status !== 'in_use').reduce((s, r) => s + r.quantity, 0),
        },
        {
          name: '设备',
          已使用: currentResources.filter((r) => r.resourceType === 'equipment' && r.status === 'in_use').reduce((s, r) => s + r.quantity, 0),
          可用: currentResources.filter((r) => r.resourceType === 'equipment' && r.status !== 'in_use').reduce((s, r) => s + r.quantity, 0),
        },
        {
          name: '人员',
          已使用: currentResources.filter((r) => r.resourceType === 'personnel' && r.status === 'in_use').reduce((s, r) => s + r.quantity, 0),
          可用: currentResources.filter((r) => r.resourceType === 'personnel' && r.status !== 'in_use').reduce((s, r) => s + r.quantity, 0),
        },
        {
          name: '物资',
          已使用: currentResources.filter((r) => r.resourceType === 'material' && r.status === 'in_use').reduce((s, r) => s + r.quantity, 0),
          可用: currentResources.filter((r) => r.resourceType === 'material' && r.status !== 'in_use').reduce((s, r) => s + r.quantity, 0),
        },
      ]
    : [];

  const generateTrendData = () => {
    if (!currentEvent || currentCleanupOps.length === 0) return [];

    const totalVolume = currentEvent.estimatedVolume;
    const totalCollected = currentCleanupOps.reduce((s, o) => s + o.collectedVolume, 0);

    if (totalCollected === 0) return [];

    const data = [];
    const startTime = new Date(currentEvent.occurrenceTime).getTime();
    const now = Date.now();
    const hoursDiff = Math.max(1, Math.floor((now - startTime) / (1000 * 60 * 60)));
    const points = Math.min(8, Math.max(2, hoursDiff / 3));

    for (let i = 0; i <= points; i++) {
      const ratio = i / points;
      const time = new Date(startTime + ratio * (now - startTime));
      const timeStr = `${time.getMonth() + 1}-${time.getDate().toString().padStart(2, '0')} ${time.getHours().toString().padStart(2, '0')}:00`;
      const collected = Math.round(totalCollected * ratio * 10) / 10;
      data.push({
        name: timeStr,
        溢油量: totalVolume,
        已回收: collected,
      });
    }

    return data;
  };

  const trendData = generateTrendData();

  const EmptyState = ({ message, icon: Icon = AlertTriangle }: { message: string; icon?: any }) => (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <Icon className="w-12 h-12 mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">应急指挥总览</h1>
          <p className="text-slate-500 mt-1">实时监控溢油事件处置进度</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            <Clock className="w-4 h-4 inline mr-1" />
            系统时间: {new Date().toLocaleString('zh-CN')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="进行中事件"
          value={activeEvents.length}
          unit="个"
          icon={AlertTriangle}
          color="orange"
          trend="up"
          trendValue={12}
          description="较昨日"
        />
        <StatCard
          title="累计溢油量"
          value={totalOilVolume}
          unit="吨"
          icon={Droplets}
          color="red"
          trend="stable"
          trendValue={0}
          description="全部事件"
        />
        <StatCard
          title="进行中作业"
          value={inProgressOps}
          unit="项"
          icon={Trash2}
          color="blue"
          trend="up"
          trendValue={25}
          description="较昨日"
        />
        <StatCard
          title="整体处置进度"
          value={avgProgress}
          unit="%"
          icon={Shield}
          color="green"
          trend="up"
          trendValue={8}
          description="较昨日"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {currentEvent ? (
            <OilSpillMap
              event={currentEvent}
              spreadData={currentSpreadData}
              containmentOps={currentContainmentOps}
              height="450px"
            />
          ) : (
            <div className="card flex items-center justify-center" style={{ height: '450px' }}>
              <div className="text-center text-slate-400">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">请选择一个事件查看地图</p>
                <p className="text-sm mt-2">从下方事件列表中选择或创建新事件</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">资源使用情况</h3>
            <div className="h-64">
              {resourceUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceUsageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={48} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="已使用" fill="#FF6B35" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="可用" fill="#06D6A0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="暂无资源数据" icon={Users} />
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">处置进展</h3>
            <div className="space-y-3">
              {dynamicProgress.length > 0 ? (
                dynamicProgress.slice(0, 4).map((stage) => (
                  <div key={stage.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{stage.stage}</span>
                      <span className="font-medium text-ocean-600">{stage.completionRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stage.completionRate >= 80
                            ? 'bg-alert-green'
                            : stage.completionRate >= 50
                            ? 'bg-alert-blue'
                            : stage.completionRate >= 20
                            ? 'bg-alert-yellow'
                            : 'bg-alert-orange'
                        }`}
                        style={{ width: `${stage.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无进度数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">收油趋势</h3>
              <span className="text-sm text-slate-500">最近24小时</span>
            </div>
            <div className="h-72">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorSpill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E63946" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E63946" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRecover" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="溢油量"
                      stroke="#E63946"
                      fill="url(#colorSpill)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="已回收"
                      stroke="#06D6A0"
                      fill="url(#colorRecover)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="暂无趋势数据" icon={TrendingUp} />
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">最新事件</h3>
          </div>
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 text-sm">{event.eventName}</div>
                    <div className="text-xs text-slate-500 mt-1">{event.location}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {getTimeDiff(event.occurrenceTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">所有事件</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
