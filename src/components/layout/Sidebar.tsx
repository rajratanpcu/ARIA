import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Hammer,
  FlaskConical,
  Rocket,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { useAria } from '../../context/AriaContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { approvals, incidents } = useAria();

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/agents', label: '5-Agent Control Center', icon: Cpu },
    { to: '/builds', label: 'Build Intelligence', icon: Hammer },
    { to: '/ci-tests', label: 'CI & Test Selection', icon: FlaskConical },
    { to: '/releases', label: 'Release & Rollout', icon: Rocket },
    {
      to: '/incidents',
      label: 'Incident Intelligence',
      icon: AlertTriangle,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
      badgeColor: 'bg-rose-600',
    },
    { to: '/afp', label: 'AFP Protocol Explorer', icon: RotateCcw },
    {
      to: '/governance',
      label: 'Governance & Approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-600',
    },
    { to: '/audit', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              A
            </div>
            <div>
              <div className="font-bold tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                ARIA
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 rounded font-mono font-medium">
                  v1.0
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                Mobile DevOps Platform
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            A
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-md transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/80 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-colors" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {item.badge !== undefined && (
                <span
                  className={`${
                    item.badgeColor || 'bg-blue-600'
                  } text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    collapsed ? 'absolute top-1.5 right-1.5' : ''
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Branch & Target info footer */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">release/v3.2.1</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">Target: Android + iOS Cross-Platform</div>
        </div>
      )}
    </aside>
  );
};
