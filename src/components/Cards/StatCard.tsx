import React, { ReactNode, ElementType } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode | ElementType;
  color: 'blue' | 'orange' | 'green' | 'red' | 'purple';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  description?: string;
}

const colorClasses = {
  blue: 'from-ocean-500 to-ocean-700',
  orange: 'from-alert-orange to-orange-600',
  green: 'from-alert-green to-emerald-600',
  red: 'from-alert-red to-red-600',
  purple: 'from-purple-500 to-purple-700',
};

const iconBgColors = {
  blue: 'bg-ocean-100 text-ocean-600',
  orange: 'bg-orange-100 text-alert-orange',
  green: 'bg-emerald-100 text-alert-green',
  red: 'bg-red-100 text-alert-red',
  purple: 'bg-purple-100 text-purple-600',
};

export const StatCard = ({
  title,
  value,
  unit,
  icon,
  color,
  trend,
  trendValue,
  description,
}: StatCardProps) => {
  return (
    <div className="data-card group hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">{value}</span>
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-alert-green" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-alert-red" />}
              {trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
              <span
                className={`text-xs font-medium ${
                  trend === 'up'
                    ? 'text-alert-green'
                    : trend === 'down'
                    ? 'text-alert-red'
                    : 'text-slate-400'
                }`}
              >
                {trendValue}%
              </span>
              {description && <span className="text-xs text-slate-400 ml-1">{description}</span>}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBgColors[color]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          {React.isValidElement(icon)
            ? icon
            : React.createElement(icon as ElementType, { className: 'w-6 h-6' })}
        </div>
      </div>
      <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${colorClasses[color]} opacity-60`} />
    </div>
  );
};

export default StatCard;
