import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/Cards/StatCard';
import { formatDateTime, getProgressColor } from '../../utils/helpers';
import { TaskCategory } from '../../types';
import {
  ClipboardList,
  Play,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Building2,
  Clock,
  Filter,
  Plus,
  ChevronDown,
} from 'lucide-react';

const categoryLabels: Record<TaskCategory | 'all', string> = {
  all: '全部',
  containment: '围控',
  vessel: '清污船',
  skimmer: '撇油器',
  dispersant: '消油剂',
  shoreline: '岸线清理',
};

const categoryColors: Record<TaskCategory, { bg: string; text: string }> = {
  containment: { bg: 'bg-alert-orange/20', text: 'text-alert-orange' },
  vessel: { bg: 'bg-ocean-100', text: 'text-ocean-700' },
  skimmer: { bg: 'bg-alert-green/20', text: 'text-alert-green' },
  dispersant: { bg: 'bg-purple-100', text: 'text-purple-700' },
  shoreline: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

const TaskBoard = () => {
  const navigate = useNavigate();
  const {
    currentEvent,
    generateTaskBoard,
    containmentOperations,
    cleanupOperations,
    resourceAssignments,
    shoreSegments,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [showDropdown, setShowDropdown] = useState(false);

  const tasks = useMemo(() => {
    if (!currentEvent) return [];
    return generateTaskBoard(currentEvent.id);
  }, [
    currentEvent,
    generateTaskBoard,
    containmentOperations,
    cleanupOperations,
    resourceAssignments,
    shoreSegments,
  ]);

  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'all') return tasks;
    return tasks.filter((task) => task.category === selectedCategory);
  }, [tasks, selectedCategory]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter(
      (t) => t.status === '进行中' || t.status === '布放中' || t.status === '使用中'
    ).length;
    const completed = tasks.filter((t) => t.status === '已完成' || t.status === '已布放').length;
    const overdue = tasks.filter((t) => t.isOverdue).length;
    return { total, inProgress, completed, overdue };
  }, [tasks]);

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
          <h1 className="text-2xl font-bold text-slate-800">现场任务看板</h1>
          <p className="text-slate-500 mt-1">统一查看和管理所有现场处置任务</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              筛选
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                {(Object.keys(categoryLabels) as Array<TaskCategory | 'all'>).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-ocean-50 text-ocean-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新增任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="总任务数"
          value={stats.total}
          unit="项"
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="进行中"
          value={stats.inProgress}
          unit="项"
          icon={Play}
          color="orange"
        />
        <StatCard
          title="已完成"
          value={stats.completed}
          unit="项"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="逾期数"
          value={stats.overdue}
          unit="项"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(Object.keys(categoryLabels) as Array<TaskCategory | 'all'>).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-ocean-700 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">当前事件暂无任务</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const colors = categoryColors[task.category];
            return (
              <div
                key={task.id}
                onClick={() => navigate(task.linkPath)}
                className="card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {categoryLabels[task.category]}
                  </span>
                  {task.isOverdue && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse">
                      逾期
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-1">
                  {task.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{task.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{task.responsibleUnit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{task.targetLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDateTime(task.startTime)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">状态</span>
                  <span className="text-sm font-medium text-slate-700">{task.status}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">进度</span>
                    <span className="font-medium text-ocean-600">{task.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(task.progress)}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
