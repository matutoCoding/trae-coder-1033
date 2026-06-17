import { Droplets, Ship, Shield, Trash2, Leaf, Clock, Users, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/Cards/StatCard';
import { EventCard } from '../../components/Cards/EventCard';
import { OilSpillMap } from '../../components/Map/OilSpillMap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { mockTrendData, mockResourceUsageData } from '../../data/mockData';
import { getTimeDiff } from '../../utils/helpers';

export const Dashboard = () => {
  const { events, currentEvent, getEventOilSpreadData, getEventContainmentOperations, getEventCleanupOperations, getEventResourceAssignments, disposalProgress } = useStore();
  
  const activeEvents = events.filter((e) => !['completed', 'archived'].includes(e.status));
  const totalEvents = events.length;
  const totalOilVolume = events.reduce((sum, e) => sum + e.estimatedVolume, 0);
  const inProgressOps = getEventCleanupOperations(currentEvent?.id || '').filter((o) => o.status === 'in_progress').length;
  const resourcesInUse = getEventResourceAssignments(currentEvent?.id || '').filter((r) => r.status === 'in_use').length;
  
  const avgProgress = disposalProgress.length > 0
    ? Math.round(disposalProgress.reduce((sum, p) => sum + p.completionRate, 0) / disposalProgress.length)
    : 0;

  const currentSpreadData = currentEvent ? getEventOilSpreadData(currentEvent.id) : [];
  const currentContainmentOps = currentEvent ? getEventContainmentOperations(currentEvent.id) : [];

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
          {currentEvent && (
            <OilSpillMap
              event={currentEvent}
              spreadData={currentSpreadData}
              containmentOps={currentContainmentOps}
              height="450px"
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">资源使用情况</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockResourceUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={48} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="已使用" fill="#FF6B35" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="可用" fill="#06D6A0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">处置进展</h3>
            <div className="space-y-3">
              {disposalProgress.slice(0, 4).map((stage) => (
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
              ))}
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTrendData}>
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
