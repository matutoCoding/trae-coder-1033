import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Clock, MapPin, AlertTriangle, CheckCircle, TrendingUp, DollarSign, Users, Ship, RefreshCw, Zap, Archive, Send, CheckSquare, Plus, History } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { eventStatusLabels, oilTypeLabels } from '../../types';
import type { EventSummaryReport, ReportStatus } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const statusLabels: Record<ReportStatus, string> = {
  draft: '草稿',
  submitted: '送审中',
  confirmed: '已确认',
  archived: '已归档',
};

const statusColors: Record<ReportStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  archived: 'bg-purple-100 text-purple-700',
};

const EventSummary: React.FC = () => {
  const { currentEvent, generateSummaryReport, getEventSummaryReports, getLatestReport, updateReportStatus, summaryReports } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'ecology' | 'lessons'>('overview');
  const [selectedReport, setSelectedReport] = useState<EventSummaryReport | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const reports = currentEvent ? getEventSummaryReports(currentEvent.id) : [];

  useEffect(() => {
    if (currentEvent) {
      const latest = getLatestReport(currentEvent.id);
      setSelectedReport(latest);
    } else {
      setSelectedReport(undefined);
    }
  }, [currentEvent?.id, summaryReports]);

  const handleGenerateReport = async () => {
    if (!currentEvent) return;
    setIsGenerating(true);
    try {
      const newReport = generateSummaryReport(currentEvent.id);
      setSelectedReport(newReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = (status: ReportStatus) => {
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, status);
  };

  const renderStatusButton = () => {
    if (!selectedReport) return null;

    switch (selectedReport.status) {
      case 'draft':
        return (
          <button
            onClick={() => handleStatusChange('submitted')}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={16} />
            提交审核
          </button>
        );
      case 'submitted':
        return (
          <button
            onClick={() => handleStatusChange('confirmed')}
            className="btn-primary flex items-center gap-2"
            style={{ backgroundColor: '#10b981' }}
          >
            <CheckSquare size={16} />
            确认通过
          </button>
        );
      case 'confirmed':
        return (
          <button
            onClick={() => handleStatusChange('archived')}
            className="btn-primary flex items-center gap-2"
            style={{ backgroundColor: '#8b5cf6' }}
          >
            <Archive size={16} />
            归档
          </button>
        );
      case 'archived':
        return (
          <button
            disabled
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm cursor-not-allowed flex items-center gap-2"
          >
            <Archive size={16} />
            已归档
          </button>
        );
      default:
        return null;
    }
  };

  if (!currentEvent) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">请先选择一个事件</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      <div className="w-1/4 flex flex-col">
        <div className="card flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ocean-700 flex items-center gap-2">
              <History size={18} />
              版本历史
            </h3>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="text-ocean-600 hover:text-ocean-800 text-sm flex items-center gap-1"
            >
              {isGenerating ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              新版本
            </button>
          </div>
        </div>

        <div className="card flex-1 overflow-y-auto mt-4">
          {reports.length > 0 ? (
            <div className="space-y-2">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedReport?.id === report.id
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-ocean-700">v{report.version}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{report.generatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">暂无版本记录</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-ocean-700">事件总结</h2>
              <p className="text-gray-600 mt-1">溢油事件处置总结和经验归档</p>
            </div>
            <div className="flex gap-2">
              {selectedReport && renderStatusButton()}
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="btn-secondary flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                {reports.length > 0 ? '生成新版本' : '生成第一版报告'}
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                <Printer size={16} />
                打印
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Download size={16} />
                导出报告
              </button>
            </div>
          </div>

          {selectedReport && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>版本 v{selectedReport.version} · 生成于 {selectedReport.generatedAt}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedReport.status]}`}>
                {statusLabels[selectedReport.status]}
              </span>
            </div>
          )}

          {selectedReport ? (
            <>
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
                      持续 {selectedReport.duration || '计算中...'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-ocean-100 text-sm">回收率</p>
                    <p className="text-3xl font-bold">{selectedReport.recoveryStats.recoveryRate ?? 0}%</p>
                    <p className="text-ocean-100 text-sm mt-1">已回收 {selectedReport.recoveryStats.totalCollected ?? 0} 吨</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: '总溢油量', value: currentEvent.estimatedVolume, unit: '吨', icon: <AlertTriangle size={24} />, color: 'bg-alert-red' },
                  { label: '已回收', value: selectedReport.recoveryStats.totalCollected, unit: '吨', icon: <TrendingUp size={24} />, color: 'bg-alert-green' },
                  { label: '总体进度', value: selectedReport.overallProgress, unit: '%', icon: <CheckCircle size={24} />, color: 'bg-alert-blue' },
                  { label: '参与人员', value: selectedReport.resourceInvestment.personnel, unit: '人', icon: <Users size={24} />, color: 'bg-ocean-700' },
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
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">基本信息</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">事件名称</p>
                          <p className="font-medium text-gray-800">{selectedReport.basicInfo.eventName}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">发生地点</p>
                          <p className="font-medium text-gray-800">{selectedReport.basicInfo.location}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">溢油类型</p>
                          <p className="font-medium text-gray-800">{selectedReport.basicInfo.oilType}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">预估溢油量</p>
                          <p className="font-medium text-gray-800">{selectedReport.basicInfo.estimatedVolume} 吨</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">发生时间</p>
                          <p className="font-medium text-gray-800">{selectedReport.basicInfo.occurrenceTime}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">接报人</p>
                          <p className="font-medium text-gray-800">{selectedReport.basicInfo.reporter}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">处置进度</h4>
                      <div className="p-4 bg-ocean-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-ocean-700">总体处置进度</span>
                          <span className="text-2xl font-bold text-ocean-700">{selectedReport.overallProgress}%</span>
                        </div>
                        <div className="w-full bg-ocean-200 rounded-full h-3">
                          <div
                            className="bg-ocean-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${selectedReport.overallProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">回收统计</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-sm text-green-600 mb-1">机械收油</p>
                          <p className="text-xl font-bold text-green-700">{selectedReport.recoveryStats.byType.skimmer.toFixed(1)} 吨</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-sm text-blue-600 mb-1">消油剂处理</p>
                          <p className="text-xl font-bold text-blue-700">{selectedReport.recoveryStats.byType.dispersant.toFixed(1)} 吨</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="text-sm text-purple-600 mb-1">岸线清理</p>
                          <p className="text-xl font-bold text-purple-700">{selectedReport.recoveryStats.byType.shoreline.toFixed(1)} 吨</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">处置过程</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedReport.disposalProcess}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">资源投入概览</h4>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="p-4 bg-ocean-50 rounded-lg text-center">
                          <Ship size={32} className="mx-auto text-ocean-600 mb-2" />
                          <p className="text-sm text-gray-500">清污船舶</p>
                          <p className="text-2xl font-bold text-ocean-700">{selectedReport.resourceInvestment.vessels} 艘</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <Zap size={32} className="mx-auto text-green-600 mb-2" />
                          <p className="text-sm text-gray-500">设备</p>
                          <p className="text-2xl font-bold text-green-700">{selectedReport.resourceInvestment.equipment} 台</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <Users size={32} className="mx-auto text-blue-600 mb-2" />
                          <p className="text-sm text-gray-500">人员</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedReport.resourceInvestment.personnel} 人</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg text-center">
                          <AlertTriangle size={32} className="mx-auto text-orange-600 mb-2" />
                          <p className="text-sm text-gray-500">物资</p>
                          <p className="text-2xl font-bold text-orange-700">{selectedReport.resourceInvestment.materials} 类</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <TrendingUp size={32} className="mx-auto text-purple-600 mb-2" />
                          <p className="text-sm text-gray-500">围油栏</p>
                          <p className="text-2xl font-bold text-purple-700">{selectedReport.resourceInvestment.containmentLength} 米</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">资源投入清单</h4>
                      <div className="space-y-3">
                        {[
                          { icon: <Ship size={20} />, name: '清污船舶', value: `${selectedReport.resourceInvestment.vessels}艘`, color: 'bg-ocean-100 text-ocean-700' },
                          { icon: <Zap size={20} />, name: '作业设备', value: `${selectedReport.resourceInvestment.equipment}台`, color: 'bg-green-100 text-green-700' },
                          { icon: <Users size={20} />, name: '作业人员', value: `${selectedReport.resourceInvestment.personnel}人`, color: 'bg-blue-100 text-blue-700' },
                          { icon: <DollarSign size={20} />, name: '物资种类', value: `${selectedReport.resourceInvestment.materials}类`, color: 'bg-purple-100 text-purple-700' },
                          { icon: <TrendingUp size={20} />, name: '围油栏总长度', value: `${selectedReport.resourceInvestment.containmentLength}米`, color: 'bg-orange-100 text-orange-700' },
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

                {activeTab === 'ecology' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">生态影响摘要</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={20} className="text-alert-red" />
                            <span className="font-medium text-alert-red">损害等级：{selectedReport.ecologyImpact.damageLevel}/10</span>
                          </div>
                          <p className="text-sm text-gray-600">影响面积约 {selectedReport.ecologyImpact.affectedArea} 平方公里</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">敏感资源受影响</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedReport.ecologyImpact.sensitiveResources.length > 0 ? (
                              selectedReport.ecologyImpact.sensitiveResources.map((r, i) => (
                                <span key={i} className="px-3 py-1 bg-alert-red/10 text-alert-red rounded-full text-sm">
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">暂无数据</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">受影响物种</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedReport.ecologyImpact.affectedSpecies.length > 0 ? (
                              selectedReport.ecologyImpact.affectedSpecies.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-alert-orange/10 text-alert-orange rounded-full text-sm">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">暂无数据</span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-2">预计恢复时间</h5>
                          <p className="text-xl font-bold text-ocean-700">{selectedReport.ecologyImpact.estimatedRecoveryTime}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ocean-700 mb-4">生态影响说明</h4>
                      <div className="p-4 bg-gray-50 rounded-lg h-72 overflow-y-auto">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedReport.ecologyImpact.damageLevel > 0
                            ? `本次溢油事件对周边海域生态造成了一定程度的影响，损害等级为 ${selectedReport.ecologyImpact.damageLevel}/10 级。影响面积约 ${selectedReport.ecologyImpact.affectedArea} 平方公里，涉及 ${selectedReport.ecologyImpact.sensitiveResources.length} 类敏感资源和 ${selectedReport.ecologyImpact.affectedSpecies.length} 种受保护物种。预计恢复时间为 ${selectedReport.ecologyImpact.estimatedRecoveryTime}。`
                            : '生态影响待评估，建议尽快开展生态损害评估工作。'}
                        </p>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <span>数据来源：生态评估报告</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'lessons' && (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-ocean-50 to-blue-50 rounded-lg border border-ocean-100">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-ocean-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-ocean-700 mb-2">经验总结</h4>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {selectedReport.lessons}
                          </div>
                        </div>
                      </div>
                    </div>
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
                      { time: selectedReport.generatedAt, title: `报告生成 v${selectedReport.version}`, desc: `${statusLabels[selectedReport.status]}状态`, status: 'success' },
                    ].map((event, idx) => (
                      <div key={idx} className="relative flex gap-6 pl-8">
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-4 ${
                          event.status === 'critical' ? 'bg-alert-red border-red-200' :
                          event.status === 'success' ? 'bg-alert-green border-green-200' :
                          'bg-ocean-700 border-ocean-100'
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
            </>
          ) : (
            <div className="card text-center py-16">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无报告</h3>
              <p className="text-gray-400 mb-6">点击「生成第一版报告」按钮，一键生成事件总结报告</p>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="btn-primary inline-flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                生成第一版报告
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventSummary;
