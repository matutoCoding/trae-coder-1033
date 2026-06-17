import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, MapPin, Droplets, Clock, User, FileText, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { oilTypeLabels, OilType, EventStatus } from '../../types';

const EventRegister = () => {
  const navigate = useNavigate();
  const { addEvent } = useStore();
  
  const [formData, setFormData] = useState({
    eventName: '',
    location: '',
    latitude: '',
    longitude: '',
    oilType: 'crude' as OilType,
    estimatedVolume: '',
    occurrenceTime: '',
    reportTime: new Date().toISOString().slice(0, 16),
    description: '',
    reporter: '',
    source: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.eventName.trim()) {
      newErrors.eventName = '请输入事件名称';
    }
    if (!formData.location.trim()) {
      newErrors.location = '请输入事件地点';
    }
    if (!formData.latitude || parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90) {
      newErrors.latitude = '请输入有效的纬度(-90到90)';
    }
    if (!formData.longitude || parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180) {
      newErrors.longitude = '请输入有效的经度(-180到180)';
    }
    if (!formData.estimatedVolume || parseFloat(formData.estimatedVolume) <= 0) {
      newErrors.estimatedVolume = '请输入有效的溢油量';
    }
    if (!formData.occurrenceTime) {
      newErrors.occurrenceTime = '请选择发生时间';
    }
    if (!formData.reporter.trim()) {
      newErrors.reporter = '请输入报告人';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    addEvent({
      eventName: formData.eventName,
      location: formData.location,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      oilType: formData.oilType,
      estimatedVolume: parseFloat(formData.estimatedVolume),
      occurrenceTime: new Date(formData.occurrenceTime).toLocaleString('zh-CN'),
      reportTime: new Date(formData.reportTime).toLocaleString('zh-CN'),
      status: 'pending' as EventStatus,
      description: formData.description,
      reporter: formData.reporter,
      source: formData.source,
    });

    navigate('/events');
  };

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">溢油事件登记</h1>
          <p className="text-slate-500 mt-1">记录新的溢油事件信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-alert-orange" />
            基本信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                事件名称 <span className="text-alert-red">*</span>
              </label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className={`input-field ${errors.eventName ? 'border-alert-red' : ''}`}
                placeholder="例如：东海海域大型溢油事件"
              />
              {errors.eventName && <p className="text-xs text-alert-red">{errors.eventName}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                事件地点 <span className="text-alert-red">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`input-field pl-10 ${errors.location ? 'border-alert-red' : ''}`}
                  placeholder="例如：东海舟山群岛以东30海里"
                />
              </div>
              {errors.location && <p className="text-xs text-alert-red">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                纬度 <span className="text-alert-red">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className={`input-field ${errors.latitude ? 'border-alert-red' : ''}`}
                placeholder="例如：30.1234"
              />
              {errors.latitude && <p className="text-xs text-alert-red">{errors.latitude}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                经度 <span className="text-alert-red">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className={`input-field ${errors.longitude ? 'border-alert-red' : ''}`}
                placeholder="例如：122.5678"
              />
              {errors.longitude && <p className="text-xs text-alert-red">{errors.longitude}</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-alert-red" />
            溢油信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                油种 <span className="text-alert-red">*</span>
              </label>
              <select
                value={formData.oilType}
                onChange={(e) => setFormData({ ...formData, oilType: e.target.value as OilType })}
                className="input-field"
              >
                {(Object.keys(oilTypeLabels) as OilType[]).map((type) => (
                  <option key={type} value={type}>
                    {oilTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                估算溢油量(吨) <span className="text-alert-red">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.estimatedVolume}
                onChange={(e) => setFormData({ ...formData, estimatedVolume: e.target.value })}
                className={`input-field ${errors.estimatedVolume ? 'border-alert-red' : ''}`}
                placeholder="例如：500"
              />
              {errors.estimatedVolume && <p className="text-xs text-alert-red">{errors.estimatedVolume}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                泄漏来源
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="input-field"
                placeholder="例如：船舶事故"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ocean-600" />
            时间信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                发生时间 <span className="text-alert-red">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.occurrenceTime}
                onChange={(e) => setFormData({ ...formData, occurrenceTime: e.target.value })}
                className={`input-field ${errors.occurrenceTime ? 'border-alert-red' : ''}`}
              />
              {errors.occurrenceTime && <p className="text-xs text-alert-red">{errors.occurrenceTime}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                报告时间 <span className="text-alert-red">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.reportTime}
                onChange={(e) => setFormData({ ...formData, reportTime: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            报告信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                报告人/单位 <span className="text-alert-red">*</span>
              </label>
              <input
                type="text"
                value={formData.reporter}
                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                className={`input-field ${errors.reporter ? 'border-alert-red' : ''}`}
                placeholder="例如：东海海事局"
              />
              {errors.reporter && <p className="text-xs text-alert-red">{errors.reporter}</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-alert-green" />
            事件描述
          </h2>
          
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="input-field resize-none"
            placeholder="请详细描述事件经过、影响范围等信息..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={handleCancel} className="btn-secondary flex items-center gap-2">
            <X className="w-4 h-4" />
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存事件
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventRegister;
