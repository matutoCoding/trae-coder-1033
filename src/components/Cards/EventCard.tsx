import { MapPin, Clock, Droplets, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { OilSpillEvent } from '../../types';
import { eventStatusLabels, eventStatusColors, oilTypeLabels } from '../../types';
import { formatDateTime, getTimeDiff } from '../../utils/helpers';
import { useStore } from '../../store/useStore';

interface EventCardProps {
  event: OilSpillEvent;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  const { setCurrentEvent } = useStore();

  const handleClick = () => {
    setCurrentEvent(event);
    navigate(`/events/${event.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="card cursor-pointer group hover:border-ocean-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-slate-800 group-hover:text-ocean-700 transition-colors">
              {event.eventName}
            </span>
            <span className={`status-badge ${eventStatusColors[event.status]}`}>
              {eventStatusLabels[event.status]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDateTime(event.occurrenceTime)}</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-ocean-600 group-hover:translate-x-1 transition-all" />
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-ocean-600 mb-1">
            <Droplets className="w-4 h-4" />
            <span className="font-semibold">{event.estimatedVolume}</span>
          </div>
          <div className="text-xs text-slate-500">溢油量(吨)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-alert-orange mb-1">
            {oilTypeLabels[event.oilType]}
          </div>
          <div className="text-xs text-slate-500">油种</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600 mb-1">
            {getTimeDiff(event.occurrenceTime)}
          </div>
          <div className="text-xs text-slate-500">已持续</div>
        </div>
      </div>
    </div>
  );
};
