import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  Waves,
  Shield,
  Trash2,
  Ship,
  Leaf,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const menuItems = [
  {
    group: '总览',
    items: [
      { path: '/dashboard', label: '总览仪表板', icon: LayoutDashboard },
    ],
  },
  {
    group: '溢油事件',
    items: [
      { path: '/events', label: '事件列表', icon: AlertTriangle },
      { path: '/events/register', label: '事件登记', icon: Droplets },
    ],
  },
  {
    group: '海况监测',
    items: [
      { path: '/monitoring/oil-spread', label: '油膜扩散监测', icon: Waves },
      { path: '/monitoring/ocean-condition', label: '海流风向研判', icon: Waves },
    ],
  },
  {
    group: '围控布防',
    items: [
      { path: '/containment/boom', label: '围油栏布放', icon: Shield },
    ],
  },
  {
    group: '清污作业',
    items: [
      { path: '/cleanup/skimmer', label: '撇油器收油', icon: Trash2 },
      { path: '/cleanup/dispersant', label: '消油剂喷洒', icon: Trash2 },
      { path: '/cleanup/shoreline', label: '岸线清理', icon: Trash2 },
    ],
  },
  {
    group: '资源调度',
    items: [
      { path: '/resources/vessels', label: '清污船调度', icon: Ship },
    ],
  },
  {
    group: '生态评估',
    items: [
      { path: '/ecology/sensitive-resources', label: '敏感资源保护', icon: Leaf },
      { path: '/ecology/assessment', label: '生态损害评估', icon: Leaf },
    ],
  },
  {
    group: '处置统计',
    items: [
      { path: '/statistics/progress', label: '处置进度', icon: BarChart3 },
      { path: '/statistics/summary', label: '事件总结', icon: BarChart3 },
    ],
  },
];

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar, currentEvent } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-ocean-800 text-white transition-all duration-300 z-40 flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-ocean-700">
        <div className={`flex items-center gap-3 overflow-hidden ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-alert-orange to-alert-red flex items-center justify-center flex-shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg">溢油应急</span>
              <span className="text-xs text-ocean-300">处置指挥系统</span>
            </div>
          )}
        </div>
      </div>

      {currentEvent && !sidebarCollapsed && (
        <div className="p-4 border-b border-ocean-700 bg-ocean-700/50">
          <div className="text-xs text-ocean-300 mb-1">当前事件</div>
          <div className="text-sm font-medium truncate">{currentEvent.eventName}</div>
          <div className="text-xs text-ocean-300 mt-1">{currentEvent.location}</div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {menuItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {!sidebarCollapsed && (
              <div className="px-4 mb-2 text-xs font-medium text-ocean-400 uppercase tracking-wider">
                {group.group}
              </div>
            )}
            <div className="space-y-1 px-2">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''} ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-ocean-700">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 text-ocean-300 hover:text-white hover:bg-ocean-700/50 rounded-lg transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">收起侧边栏</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
