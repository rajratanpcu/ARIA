import React from 'react';

interface RiskMeterProps {
  value: number; // 0.0 to 1.0
  baseline?: number; // default 0.3
  threshold?: number; // default 0.75
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  value,
  baseline = 0.3,
  threshold = 0.75,
  showLabel = true,
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, value * 100));

  let colorClass = 'bg-emerald-500';
  let textClass = 'text-emerald-600 dark:text-emerald-400';
  if (value >= threshold) {
    colorClass = 'bg-rose-500';
    textClass = 'text-rose-600 dark:text-rose-400';
  } else if (value > baseline) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-600 dark:text-amber-400';
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Risk Weight</span>
          <span className={`font-mono font-bold ${textClass}`}>
            {value.toFixed(3)}{' '}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
              (baseline {baseline.toFixed(1)})
            </span>
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative ${heights} border border-slate-300 dark:border-slate-700/60`}>
        {/* Baseline indicator mark */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
          style={{ left: `${baseline * 100}%` }}
          title={`Baseline: ${baseline}`}
        />
        {/* Confidence threshold mark */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10"
          style={{ left: `${threshold * 100}%` }}
          title={`Confidence Threshold: ${threshold}`}
        />
        {/* Active fill */}
        <div
          className={`${heights} rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
