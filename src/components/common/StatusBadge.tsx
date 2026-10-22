import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'critical' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  pulse = false,
}) => {
  // Auto-detect variant if not passed
  let resolvedVariant = variant;
  if (!resolvedVariant) {
    const s = status.toLowerCase();
    if (s.includes('success') || s.includes('healthy') || s.includes('passed') || s.includes('approved') || s.includes('released')) {
      resolvedVariant = 'success';
    } else if (s.includes('warn') || s.includes('stale') || s.includes('paused') || s.includes('pending') || s.includes('triaged')) {
      resolvedVariant = 'warning';
    } else if (s.includes('crit') || s.includes('fail') || s.includes('reject') || s.includes('rolled_back')) {
      resolvedVariant = 'critical';
    } else if (s.includes('analyz') || s.includes('progress') || s.includes('recommending')) {
      resolvedVariant = 'info';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  const colorStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-400 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-400 dark:border-amber-800/60',
    critical: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-400 dark:border-rose-800/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-400 dark:border-blue-800/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-400 dark:border-purple-800/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/60',
  }[resolvedVariant];

  const dotStyles = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-500',
  }[resolvedVariant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colorStyles} ${sizeStyles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotStyles} ${pulse ? 'animate-ping' : ''}`}
      />
      <span className="capitalize">{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
