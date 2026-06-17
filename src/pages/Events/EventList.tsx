import { useState } from 'react';
import { Plus, Filter, Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { EventCard } from '../../components/Cards/EventCard';
import { eventStatusLabels, EventStatus } from '../../types';

const EventList = () => {
  const navigate = useNavigate();
  const { events, setCurrentEvent } = useStore();
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRegister = () => {
    navigate('/events/register');
  };

  const handleEventClick = (event: typeof events[0]) => {
    setCurrentEvent(event);
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">溢油事件管理</h1>
          <p className="text-slate-500 mt-1">查看和管理所有溢油事件</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出数据
          </button>
          <button onClick={handleRegister} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            登记新事件
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索事件名称或地点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field w-auto"
            >
              <option value="all">全部状态</option>
              {(Object.keys(eventStatusLabels) as EventStatus[]).map((status) => (
                <option key={status} value={status}>
                  {eventStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <span>共找到</span>
          <span className="font-semibold text-ocean-600">{filteredEvents.length}</span>
          <span>个事件</span>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-slate-400 mb-4">
            <Search className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <p className="text-slate-500">没有找到匹配的事件</p>
          <p className="text-sm text-slate-400 mt-2">请尝试调整搜索条件或筛选器</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
