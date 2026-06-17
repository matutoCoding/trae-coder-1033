import React, { useState } from 'react';
import { FileText, Download, Printer, Clock, MapPin, AlertTriangle, CheckCircle, TrendingUp, DollarSign, Users, Ship } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { useStore } from '../../store/useStore';
import { eventStatusLabels, oilTypeLabels } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const COLORS = ['#FF6B35', '#3E92CC', '#06D6A0', '#F4D35E', '#E63946'];

const EventSummary: React.FC = () => {
  const { currentEvent, ecologyAssessment } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'ecology' | 'lessons'>('overview');

  const costData = [
    { name: '围控费用', value: 85 },
    { name: '清污费用', value: 220 },
    { name: '设备租赁', value: 65 },
    { name: '人员费用', value: 95 },
    { name: '物资消耗', value: 120 },
  ];

  const timelineData = [
    { name: '06-15 08:00', 溢油量: 500, 已回收: 0 },
    { name: '06-15 12:00', 溢油量: 500, 已回收: 15 },
    { name: '06-15 16:00', 溢油量: 500, 已回收: 45 },
    { name: '06-15 20:00', 溢油量: 500, 已回收: 85 },
    { name: '06-16 00:00', 溢油量: 500, 已回收: 110 },
    { name: '06-16 04:00', 溢油量: 500, 已回收: 140 },
    { name: '06-16 08:00', 溢油量: 500, 已回收: 170 },
  ];

  const cleanupTypeData = [
    { name: '机械收油', value: 170.7 },
    { name: '消油剂处理', value: 95 },
    { name: '自然降解', value: 60 },
    { name: '岸线清理', value: 12.8 },
  ];

  const summaryStats = {
    totalSpill: 500,
    totalRecovered: 170.7,
    recoveryRate: 34.1,
    totalCost: 585,
    personnel: 86,
    vessels: 5,
    duration: '2天10小时',
    containmentLength: 4500,
  };

  const lessonsLearned = [
    {
      id: 1,
      category: '应急响应',
      title: '响应速度需要加快',
      description: '首次围控作业比预案时间晚了45分钟，主要原因是应急队伍集结时间过长。建议在重点区域提前部署应急待命点。',
      status: 'important',
    },
    {
      id: 2,
      category: '物资储备',
      title: '消油剂库存不足',
      description: '作业期间消油剂一度供应紧张，需要从200公里外的储备库调运。建议增加沿海重点区域的物资储备点。',
      status: 'important',
    },
    {
      id: 3,
      category: '通讯保障',
      title: '现场通讯存在盲区',
      description: '作业海域部分区域移动通信信号较弱，影响作业调度。建议配备卫星通讯设备作为备用。',
      status: 'normal',
    },
    {
      id: 4,
      category: '部门协作',
      title: '跨部门协调机制顺畅',
      description: '海事、环保、渔业等部门协作良好，信息共享及时，为处置决策提供了有力支持。',
      status: 'good',
    },
  ];

  if (!currentEvent) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">请先选择一个事件</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-ocean-700">事件总结</h2>
          <p className="text-gray-600 mt-1">溢油事件处置总结和经验归档</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Printer size={16} />
            打印
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download size={16} />
            导出报告
          </button>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-ocean-700 to-ocean-600 text-white">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-ocean-100 text-sm">事件名称</p>
            <h3 className="text-xl font-bold">{currentEvent.eventName}</h3>
            <div className="flex items-center gap-2 mt-2 text-ocean-100 text-sm">
              <MapPin size={14} />
              {currentEvent.location}
            </div>
          </div>
          <div>
            <p className="text-ocean-100 text-sm">溢油类型</p>
            <p className="text-2xl font-bold">{oilTypeLabels[currentEvent.oilType]}</p>
            <p className="text-ocean-100 text-sm mt-1">预估溢油量 {currentEvent.estimatedVolume} 吨</p>
          </div>
          <div>
            <p className="text-ocean-100 text-sm">处置状态</p>
            <p className="text-2xl font-bold">{eventStatusLabels[currentEvent.status]}</p>
            <div className="flex items-center gap-2 mt-1 text-ocean-100 text-sm">
              <Clock size={14} />
              持续 {summaryStats.duration}
            </div>
          </div>
          <div className="text-right">
            <p className="text-ocean-100 text-sm">回收率</p>
            <p className="text-3xl font-bold">{summaryStats.recoveryRate}%</p>
            <p className="text-ocean-100 text-sm mt-1">已回收 {summaryStats.totalRecovered} 吨</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总溢油量', value: summaryStats.totalSpill, unit: '吨', icon: <AlertTriangle size={24} />, color: 'bg-alert-red' },
          { label: '已回收', value: summaryStats.totalRecovered, unit: '吨', icon: <TrendingUp size={24} />, color: 'bg-alert-green' },
          { label: '预估费用', value: summaryStats.totalCost, unit: '万元', icon: <DollarSign size={24} />, color: 'bg-alert-yellow' },
          { label: '参与人员', value: summaryStats.personnel, unit: '人', icon: <Users size={24} />, color: 'bg-ocean-700' },
        ].map((stat, idx) => (
          <div key={idx} className="card">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-ocean-700">
                  {stat.value} <span className="text-sm font-normal text-gray-500">{stat.unit}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          {[
            { id: 'overview', label: '总体概览' },
            { id: 'resources', label: '资源投入' },
            { id: 'ecology', label: '生态影响' },
            { id: 'lessons', label: '经验总结' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-ocean-700 border-b-2 border-ocean-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-ocean-700 mb-4">收油进度趋势</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#374151', fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="溢油量" stackId="1" stroke="#E63946" fill="#E63946" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="已回收" stackId="2" stroke="#06D6A0" fill="#06D6A0" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-ocean-700 mb-4">油污处理方式分布</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cleanupTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {cleanupTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-ocean-700 mb-4">费用构成分析</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-ocean-700 mb-4">资源投入清单</h4>
              <div className="space-y-3">
                {[
                  { icon: <Ship size={20} />, name: '清污船舶', value: '5艘', color: 'bg-ocean-100 text-ocean-700' },
                  { icon: <Users size={20} />, name: '作业人员', value: '86人', color: 'bg-green-100 text-green-700' },
                  { icon: <AlertTriangle size={20} />, name: '围油栏', value: '4500米', color: 'bg-orange-100 text-orange-700' },
                  { icon: <TrendingUp size={20} />, name: '撇油器', value: '6台', color: 'bg-blue-100 text-blue-700' },
                  { icon: <DollarSign size={20} />, name: '消油剂', value: '20吨', color: 'bg-purple-100 text-purple-700' },
                  { icon: <CheckCircle size={20} />, name: '吸油毡', value: '5000片', color: 'bg-teal-100 text-teal-700' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-xl font-bold text-ocean-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ecology' && ecologyAssessment && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-ocean-700 mb-4">生态影响摘要</h4>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-alert-red" />
                    <span className="font-medium text-alert-red">损害等级：{ecologyAssessment.damageLevel}/10</span>
                  </div>
                  <p className="text-sm text-gray-600">影响面积约 {ecologyAssessment.affectedArea} 平方公里</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">敏感资源受影响</h5>
                  <div className="flex flex-wrap gap-2">
                    {ecologyAssessment.sensitiveResources.map((r, i) => (
                      <span key={i} className="px-3 py-1 bg-alert-red/10 text-alert-red rounded-full text-sm">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">受影响物种</h5>
                  <div className="flex flex-wrap gap-2">
                    {ecologyAssessment.affectedSpecies.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-alert-orange/10 text-alert-orange rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">预计恢复时间</h5>
                  <p className="text-xl font-bold text-ocean-700">{ecologyAssessment.estimatedRecoveryTime}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-ocean-700 mb-4">恢复计划</h4>
              <div className="p-4 bg-gray-50 rounded-lg h-72 overflow-y-auto">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {ecologyAssessment.recoveryPlan}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
                <span>评估机构：{ecologyAssessment.assessor}</span>
                <span>评估时间：{formatDateTime(ecologyAssessment.assessmentTime)}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {lessonsLearned.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-6 rounded-lg border ${
                  lesson.status === 'important' ? 'bg-red-50 border-red-200' :
                  lesson.status === 'good' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lesson.status === 'important' ? 'bg-alert-red text-white' :
                      lesson.status === 'good' ? 'bg-alert-green text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {lesson.category}
                    </span>
                    <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                  </div>
                  {lesson.status === 'good' && <CheckCircle size={20} className="text-alert-green" />}
                  {lesson.status === 'important' && <AlertTriangle size={20} className="text-alert-red" />}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{lesson.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-ocean-700 mb-4">事件时间线</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {[
              { time: currentEvent.occurrenceTime, title: '溢油发生', desc: currentEvent.description, status: 'critical' },
              { time: currentEvent.reportTime, title: '事件接报', desc: `${currentEvent.reporter} 接报事件`, status: 'normal' },
              { time: '2026-06-15 09:30:00', title: '启动应急预案', desc: '启动二级应急响应', status: 'normal' },
              { time: '2026-06-15 12:00:00', title: '开始围控作业', desc: '应急一队到达现场开始布放围油栏', status: 'normal' },
              { time: '2026-06-15 13:00:00', title: '开展清污作业', desc: '清污船开始机械收油作业', status: 'normal' },
              { time: '2026-06-16 10:00:00', title: '生态评估', desc: '完成首次生态损害评估', status: 'normal' },
            ].map((event, idx) => (
              <div key={idx} className="relative flex gap-6 pl-8">
                <div className={`absolute left-2 w-5 h-5 rounded-full border-4 ${
                  event.status === 'critical' ? 'bg-alert-red border-red-200' : 'bg-ocean-700 border-ocean-100'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm text-gray-500">{event.time}</span>
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSummary;
