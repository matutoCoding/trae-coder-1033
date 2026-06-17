import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Maximize2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { OilSpillMap } from '../../components/Map/OilSpillMap';
import StatCard from '../../components/Cards/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatDateTime, formatNumber } from '../../utils/helpers';
import { Droplets, Waves, Navigation, Gauge } from 'lucide-react';

const OilSpreadMonitoring = () => {
  const { currentEvent, getEventOilSpreadData, getEventContainmentOperations } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const spreadData = currentEvent ? getEventOilSpreadData(currentEvent.id) : [];
  const containmentOps = currentEvent ? getEventContainmentOperations(currentEvent.id) : [];

  const displayData = spreadData.slice(0, currentTimeIndex + 1);
  const latestData = spreadData[spreadData.length - 1];

  const chartData = spreadData.map((d) => ({
    time: d.recordTime.split(' ')[1]?.substring(0, 5) || d.recordTime,
    area: d.spreadArea,
    speed: d.diffusionSpeed,
  }));

  useEffect(() => {
    if (isPlaying && spreadData.length > 0) {
      timerRef.current = window.setInterval(() => {
        setCurrentTimeIndex((prev) => {
          if (prev >= spreadData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, spreadData.length]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (currentTimeIndex >= spreadData.length - 1) {
      setCurrentTimeIndex(0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentTimeIndex(0);
    setIsPlaying(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTimeIndex(parseInt(e.target.value));
    setIsPlaying(false);
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
          <h1 className="text-2xl font-bold text-slate-800">油膜扩散监测</h1>
          <p className="text-slate-500 mt-1">实时监控油膜扩散情况和趋势分析</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="当前扩散面积"
          value={latestData?.spreadArea || 0}
          unit="km²"
          icon={Waves}
          color="orange"
          trend="up"
          trendValue={15}
          description="较4小时前"
        />
        <StatCard
          title="油膜厚度"
          value={latestData ? formatNumber(latestData.thickness * 1000, 2) : 0}
          unit="mm"
          icon={Gauge}
          color="red"
          trend="down"
          trendValue={8}
          description="较4小时前"
        />
        <StatCard
          title="扩散速度"
          value={latestData?.diffusionSpeed || 0}
          unit="节"
          icon={Navigation}
          color="blue"
          trend="stable"
          trendValue={0}
          description="较4小时前"
        />
        <StatCard
          title="扩散方向"
          value={latestData?.diffusionDirection || '-'}
          icon={Navigation}
          color="purple"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <OilSpillMap
          event={currentEvent}
          spreadData={displayData}
          containmentOps={containmentOps}
          height="550px"
        />
        
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <button
                  onClick={handlePause}
                  className="w-10 h-10 rounded-full bg-ocean-600 text-white flex items-center justify-center hover:bg-ocean-700 transition-colors"
                >
                  <Pause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  className="w-10 h-10 rounded-full bg-ocean-600 text-white flex items-center justify-center hover:bg-ocean-700 transition-colors"
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </button>
              )}
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={spreadData.length - 1}
                value={currentTimeIndex}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-ocean-600"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>
                {spreadData[currentTimeIndex]?.recordTime || '-'}
              </span>
            </div>

            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between mt-2 px-1">
            {spreadData.map((d, i) => (
              <div
                key={d.id}
                className={`text-xs ${
                  i === currentTimeIndex ? 'text-ocean-600 font-medium' : 'text-slate-400'
                }`}
              >
                {d.recordTime.split(' ')[1]?.substring(0, 5)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">扩散面积趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="area"
                  stroke="#FF6B35"
                  fill="url(#colorArea)"
                  strokeWidth={2}
                  name="扩散面积(km²)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">扩散速度趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#3E92CC"
                  strokeWidth={2}
                  dot={{ fill: '#3E92CC', r: 4 }}
                  name="扩散速度(节)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">监测历史记录</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">监测时间</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">扩散面积</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">油膜厚度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">扩散方向</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">扩散速度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">中心位置</th>
              </tr>
            </thead>
            <tbody>
              {[...spreadData].reverse().map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm">{formatDateTime(d.recordTime)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-alert-orange">{d.spreadArea} km²</td>
                  <td className="py-3 px-4 text-sm">{formatNumber(d.thickness * 1000, 2)} mm</td>
                  <td className="py-3 px-4 text-sm">{d.diffusionDirection}</td>
                  <td className="py-3 px-4 text-sm">{d.diffusionSpeed} 节</td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {d.centerLat.toFixed(4)}°N, {d.centerLng.toFixed(4)}°E
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OilSpreadMonitoring;
