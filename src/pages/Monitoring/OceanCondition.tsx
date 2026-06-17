import { Wind, Waves, Thermometer, Eye, Droplets, ArrowUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/Cards/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDateTime, getWindDirectionAngle } from '../../utils/helpers';

const OceanCondition = () => {
  const { currentEvent, getEventOceanConditions } = useStore();

  const oceanData = currentEvent ? getEventOceanConditions(currentEvent.id) : [];
  const latestData = oceanData[oceanData.length - 1];

  const windAngle = latestData ? getWindDirectionAngle(latestData.windDirection) : 0;
  const currentAngle = latestData ? getWindDirectionAngle(latestData.currentDirection) : 0;

  const chartData = oceanData.map((d) => ({
    time: d.recordTime.split(' ')[1]?.substring(0, 5) || d.recordTime,
    windSpeed: d.windSpeed,
    currentSpeed: d.currentSpeed,
    waveHeight: d.waveHeight,
  }));

  const CompassIndicator = ({ angle, label, value, unit, color }: {
    angle: number;
    label: string;
    value: number;
    unit: string;
    color: string;
  }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
          
          <text x="50" y="15" textAnchor="middle" className="text-xs fill-slate-400" fontSize="10">北</text>
          <text x="88" y="53" textAnchor="middle" className="text-xs fill-slate-400" fontSize="10">东</text>
          <text x="50" y="92" textAnchor="middle" className="text-xs fill-slate-400" fontSize="10">南</text>
          <text x="12" y="53" textAnchor="middle" className="text-xs fill-slate-400" fontSize="10">西</text>
          
          <g transform={`rotate(${angle}, 50, 50)`}>
            <path
              d="M 50 15 L 45 45 L 50 40 L 55 45 Z"
              fill={color}
              className="drop-shadow-lg"
            />
            <rect x="47" y="45" width="6" height="25" rx="3" fill={color} opacity="0.8" />
          </g>
          
          <circle cx="50" cy="50" r="6" fill="white" stroke={color} strokeWidth="2" />
        </svg>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-xl font-bold text-slate-800">
          {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-slate-800">海流风向研判</h1>
          <p className="text-slate-500 mt-1">实时监测海洋环境参数，分析扩散趋势</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>数据更新时间:</span>
          <span className="font-medium text-ocean-600">
            {latestData ? formatDateTime(latestData.recordTime) : '-'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="风速"
          value={latestData?.windSpeed || 0}
          unit="m/s"
          icon={Wind}
          color="blue"
        />
        <StatCard
          title="风向"
          value={latestData?.windDirection || '-'}
          icon={ArrowUp}
          color="purple"
        />
        <StatCard
          title="流速"
          value={latestData?.currentSpeed || 0}
          unit="节"
          icon={Waves}
          color="green"
        />
        <StatCard
          title="流向"
          value={latestData?.currentDirection || '-'}
          icon={ArrowUp}
          color="orange"
        />
        <StatCard
          title="浪高"
          value={latestData?.waveHeight || 0}
          unit="m"
          icon={Waves}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center justify-center py-8">
          <CompassIndicator
            angle={windAngle}
            label="风向"
            value={latestData?.windSpeed || 0}
            unit="m/s"
            color="#3E92CC"
          />
          <div className="mt-4 text-sm text-slate-600">
            {latestData?.windDirection}风
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center py-8">
          <CompassIndicator
            angle={currentAngle}
            label="流向"
            value={latestData?.currentSpeed || 0}
            unit="节"
            color="#FF6B35"
          />
          <div className="mt-4 text-sm text-slate-600">
            {latestData?.currentDirection}流
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">环境参数</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-alert-red" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">水温</div>
                  <div className="text-lg font-bold text-slate-800">{latestData?.waterTemperature || 0}°C</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-ocean-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">能见度</div>
                  <div className="text-lg font-bold text-slate-800">{latestData?.visibility || 0} 海里</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">潮位</div>
                  <div className="text-lg font-bold text-slate-800">{latestData?.tideLevel || 0} m</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">气象海况趋势</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#3E92CC"
                strokeWidth={2}
                dot={{ fill: '#3E92CC', r: 4 }}
                name="风速(m/s)"
              />
              <Line
                type="monotone"
                dataKey="currentSpeed"
                stroke="#FF6B35"
                strokeWidth={2}
                dot={{ fill: '#FF6B35', r: 4 }}
                name="流速(节)"
              />
              <Line
                type="monotone"
                dataKey="waveHeight"
                stroke="#06D6A0"
                strokeWidth={2}
                dot={{ fill: '#06D6A0', r: 4 }}
                name="浪高(m)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">扩散趋势分析</h3>
        <div className="p-4 bg-ocean-50 rounded-lg border border-ocean-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
              <Wind className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <div className="font-medium text-slate-800">当前扩散预测</div>
              <div className="text-sm text-slate-600 mt-1">
                根据当前海流{latestData?.currentDirection}方向（流速{latestData?.currentSpeed}节）和风向{latestData?.windDirection}（风速{latestData?.windSpeed}m/s）综合分析，
                预计油膜将继续向<strong className="text-alert-orange">东南偏东</strong>方向扩散，扩散速度约{latestData?.currentSpeed}节。
                建议加强<strong>东南方向</strong>的围控措施，优先保护该方向的敏感资源。
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-alert-orange/10 rounded-lg border border-alert-orange/30">
            <div className="text-sm font-medium text-alert-orange mb-1">高风险区域</div>
            <div className="text-sm text-slate-600">溢油点东南方向20海里范围内</div>
          </div>
          <div className="p-4 bg-alert-yellow/10 rounded-lg border border-alert-yellow/30">
            <div className="text-sm font-medium text-amber-600 mb-1">重点关注</div>
            <div className="text-sm text-slate-600">未来6小时内扩散面积可能增加15%</div>
          </div>
          <div className="p-4 bg-alert-green/10 rounded-lg border border-alert-green/30">
            <div className="text-sm font-medium text-emerald-600 mb-1">建议措施</div>
            <div className="text-sm text-slate-600">加速东侧围油栏布放，增加收油作业力度</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OceanCondition;
