import React from 'react';
import { AutonomyLevel, AUTONOMY_LEVELS } from '../../types';

interface AutonomyBadgeProps {
  level: AutonomyLevel;
  showDescription?: boolean;
}

export const AutonomyBadge: React.FC<AutonomyBadgeProps> = ({
  level,
  showDescription = false,
}) => {
  const info = AUTONOMY_LEVELS[level];

  const styles = {
    1: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700/80',
    2: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-800/80',
    3: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700/80',
    4: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-600/90',
  }[level];

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {info.name}
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{info.description}</span>
      )}
    </div>
  );
};
