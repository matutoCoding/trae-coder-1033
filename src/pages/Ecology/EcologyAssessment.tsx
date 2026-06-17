import React from 'react';
import { Activity, AlertTriangle, Clock, User, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useStore } from '../../store/useStore';
import { formatDateTime } from '../../utils/helpers';

const EcologyAssessmentPage: React.FC = () => {
  const { getEventEcologyAssessment, ecologyAssessments, currentEvent } = useStore();

  const ecologyAssessment = currentEvent ? getEventEcologyAssessment(currentEvent.id) : undefined;

  const radarData = [
    { subject: '海洋生物', A: 8, fullMark: 10 },
    { subject: '岸线环境', A: 7, fullMark: 10 },
    { subject: '水质', A: 6, fullMark: 10 },
    { subject: '渔业资源', A: 9, fullMark: 10 },
    { subject: '生态系统', A: 7, fullMark: 10 },
    { subject: '自然景观', A: 5, fullMark: 10 },
  ];

  const trendData = [
    { name: '06-15', 水质: 8, 生态: 7, 渔业: 9 },
    { name: '06-16', 水质: 7, 生态: 7, 渔业: 9 },
    { name: '06-17', 水质: 6, 生态: 7, 渔业: 8 },
    { name: '06-18', 水质: 5, 生态: 6, 渔业: 7 },
    { name: '06-19', 水质: 5, 生态: 6, 渔业: 7 },
  ];

  const recoverySteps = [
    { step: 1, name: '立即停止污染源', status: 'completed', duration: '0小时' },
    { step: 2, name: '开展围控清污', status: 'in_progress', duration: '持续进行' },
    { step: 3, name: '实施敏感资源保护', status: 'in_progress', duration: '持续进行' },
    { step: 4, name: '开展生态修复', status: 'pending', duration: '预计1年' },
    { step: 5, name: '长期监测评估', status: 'pending', duration: '预计3-5年' },
  ];

  const getDamageColor = (level: number) => {
    if (level >= 8) return 'text-alert-red';
    if (level >= 6) return 'text-alert-orange';
    if (level >= 4) return 'text-alert-yellow';
    return 'text-alert-green';
  };

  const getDamageLabel = (level: number) => {
    if (level >= 8) return '极严重';
    if (level >= 6) return '严重';
    if (level >= 4) return '中度';
    return '轻度';
  };

  const handleGenerateReport = () => {
    alert('生成评估报告功能开发中...');
  };

  if (!currentEvent) {
    return (
      <div className="card text-center py-12">
        <Activity size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">请先选择一个事件</p>
      </div>
    );
  }

  if (!ecologyAssessment) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-ocean-700">生态损害评估</h2>
            <p className="text-gray-600 mt-1">评估溢油事件对海洋生态环境的影响</p>
          </div>
        </div>
        <div className="card text-center py-16">
          <Activity size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">当前事件暂无生态评估数据</h3>
          <p className="text-gray-500 mb-6">点击下方按钮生成生态评估报告</p>
          <button
            onClick={handleGenerateReport}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <FileText size={18} />
            生成评估报告
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ocean-700">生态损害评估</h2>
          <p className="text-gray-600 mt-1">评估溢油事件对海洋生态环境的影响</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FileText size={18} />
          导出评估报告
        </button>
      </div>

      <div className="card bg-gradient-to-r from-ocean-700 to-ocean-600 text-white">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-ocean-100 text-sm">事件名称</p>
            <h3 className="text-xl font-bold">{currentEvent.eventName}</h3>
          </div>
          <div>
            <p className="text-ocean-100 text-sm">影响面积</p>
            <p className="text-3xl font-bold">{ecologyAssessment.affectedArea} <span className="text-lg">km²</span></p>
          </div>
          <div>
            <p className="text-ocean-100 text-sm">损害等级</p>
            <p className={`text-3xl font-bold ${getDamageColor(ecologyAssessment.damageLevel)}`}>
              {ecologyAssessment.damageLevel}/10
            </p>
            <p className="text-ocean-100 text-sm">{getDamageLabel(ecologyAssessment.damageLevel)}</p>
          </div>
          <div>
            <p className="text-ocean-100 text-sm">预计恢复时间</p>
            <p className="text-2xl font-bold">{ecologyAssessment.estimatedRecoveryTime}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">生态损害雷达图</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar
                  name="损害程度"
                  dataKey="A"
                  stroke="#FF6B35"
                  fill="#FF6B35"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">环境质量趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#374151', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="水质" fill="#3E92CC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="生态" fill="#06D6A0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="渔业" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">恢复计划步骤</h3>
          <div className="space-y-4">
            {recoverySteps.map((step) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === 'completed' ? 'bg-alert-green text-white' :
                  step.status === 'in_progress' ? 'bg-alert-orange text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <Activity size={20} />
                  ) : (
                    <span className="font-bold">{step.step}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      step.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}>
                      {step.name}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      step.status === 'completed' ? 'bg-alert-green/10 text-alert-green' :
                      step.status === 'in_progress' ? 'bg-alert-orange/10 text-alert-orange' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {step.status === 'completed' ? '已完成' :
                       step.status === 'in_progress' ? '进行中' : '待启动'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">预计耗时：{step.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-ocean-700 mb-4">评估详情</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-alert-orange" />
                <h4 className="font-medium text-gray-800">敏感资源受影响情况</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {ecologyAssessment.sensitiveResources.map((resource, idx) => (
                  <span key={idx} className="px-3 py-1 bg-alert-red/10 text-alert-red rounded-full text-sm">
                    {resource}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={20} className="text-alert-red" />
                <h4 className="font-medium text-gray-800">受影响物种</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {ecologyAssessment.affectedSpecies.map((species, idx) => (
                  <span key={idx} className="px-3 py-1 bg-alert-orange/10 text-alert-orange rounded-full text-sm">
                    {species}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={20} className="text-ocean-700" />
                <h4 className="font-medium text-gray-800">恢复计划摘要</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {ecologyAssessment.recoveryPlan}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock size={16} />
                  评估时间
                </div>
                <p className="font-medium text-gray-800">{formatDateTime(ecologyAssessment.assessmentTime)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User size={16} />
                  评估机构
                </div>
                <p className="font-medium text-gray-800">{ecologyAssessment.assessor}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={24} className="text-alert-orange" />
          <h3 className="text-lg font-semibold text-ocean-700">长期影响预测</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={20} className="text-alert-red" />
              <h4 className="font-semibold text-alert-red">短期影响（0-6个月）</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 浮游生物大量死亡，破坏食物链基础</li>
              <li>• 鱼类种群数量显著下降</li>
              <li>• 海鸟羽毛沾油，失去保暖和飞行能力</li>
              <li>• 近岸养殖业遭受严重损失</li>
            </ul>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-alert-orange" />
              <h4 className="font-semibold text-alert-orange">中期影响（6个月-2年）</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 底栖生物群落结构改变</li>
              <li>• 部分敏感物种可能消失</li>
              <li>• 渔业产量持续偏低</li>
              <li>• 滨海湿地生态功能受损</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-alert-yellow" />
              <h4 className="font-semibold text-yellow-700">长期恢复（2-5年）</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 生态系统逐步恢复</li>
              <li>• 部分物种可能需要更长时间</li>
              <li>• 需持续监测和人工干预</li>
              <li>• 建立长效保护机制</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcologyAssessmentPage;
