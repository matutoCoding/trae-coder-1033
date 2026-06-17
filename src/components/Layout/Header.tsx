import { Bell, Search, User, Settings, Clock, MapPin } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { eventStatusLabels, eventStatusColors } from '../../types';
import { formatDateTime } from '../../utils/helpers';

export const Header = () => {
  const { currentEvent, events } = useStore();
  const activeEvents = events.filter((e) => !['completed', 'archived'].includes(e.status));

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {currentEvent && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-ocean-600" />
              <span className="font-medium text-slate-800">{currentEvent.eventName}</span>
              <span className={`status-badge ${eventStatusColors[currentEvent.status]}`}>
                {eventStatusLabels[currentEvent.status]}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>发生时间: {formatDateTime(currentEvent.occurrenceTime)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索事件、船舶、设备..."
            className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-alert-orange/10 text-alert-orange rounded-full">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">{activeEvents.length} 个进行中事件</span>
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full" />
        </button>

        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-300" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-ocean-100 flex items-center justify-center">
            <User className="w-5 h-5 text-ocean-600" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-slate-800">应急指挥员</div>
            <div className="text-xs text-slate-500">admin@marine.gov</div>
          </div>
        </div>
      </div>
    </header>
  );
};
