import React from 'react';
import {
  GitCommit,
  Hammer,
  FlaskConical,
  PackageCheck,
  Rocket,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useAria } from '../../context/AriaContext';

export const PipelineVisualizer: React.FC = () => {
  const { deployment, incidents, modules, subsequentCommitTestCount } = useAria();

  const cartModule = modules.find((m) => m.id === 'mod-checkout-cart');
  const isAfpActive = cartModule ? cartModule.currentRiskWeight > 0.3 : false;
  const hasCriticalIncident = incidents.some((i) => i.severity === 'critical' && !i.resolvedAt);

  const stages = [
    {
      id: 'commit',
      title: '1. Commit',
      subtitle: 'commit #7a9e4f2',
      icon: GitCommit,
      status: 'completed',
      agent: null,
      info: 'Touches checkout-cart, payment-gateway, analytics-sdk',
    },
    {
      id: 'build',
      title: '2. Build Intel',
      subtitle: 'Build #892 (Cached)',
      icon: Hammer,
      status: 'completed',
      agent: 'BIA',
      info: isAfpActive ? 'Strict Invalidation Enforced' : 'Cache Hit Reused (85.7%)',
    },
    {
      id: 'ci',
      title: '3. CI Selection',
      subtitle: `${subsequentCommitTestCount} / 12,340 tests`,
      icon: FlaskConical,
      status: 'completed',
      agent: 'COA',
      info: isAfpActive ? 'AFP Elevated Suite (+487 tests)' : 'Optimized Suite (93.1% cut)',
    },
    {
      id: 'release',
      title: '4. Release Gate',
      subtitle: 'v3.2.1-rc4',
      icon: PackageCheck,
      status: 'completed',
      agent: 'RCA',
      info: 'Simulated Artifact Signed',
    },
    {
      id: 'deploy',
      title: '5. Deployment',
      subtitle: `${deployment.currentStage}% Staged Rollout`,
      icon: Rocket,
      status: deployment.status === 'paused' || deployment.status === 'rolled_back' ? 'warning' : 'active',
      agent: 'DCA',
      info: deployment.status === 'paused' ? 'Paused (7.8% Error Rate)' : 'In Progress',
    },
    {
      id: 'incident',
      title: '6. Incident Intel',
      subtitle: hasCriticalIncident ? 'INC-7402 Active' : 'No Critical Incidents',
      icon: AlertTriangle,
      status: hasCriticalIncident ? 'critical' : 'idle',
      agent: 'IRA',
      info: hasCriticalIncident ? 'Root Cause: Stale Cache (c=0.87)' : 'All Nominal',
    },
    {
      id: 'afp',
      title: '7. AFP Feedback',
      subtitle: isAfpActive ? 'Weight: 0.648' : 'Baseline: 0.300',
      icon: RotateCcw,
      status: isAfpActive ? 'feedback_active' : 'ready',
      agent: 'AFP Engine',
      info: isAfpActive ? 'Delta +0.348 Propagated to CI & Cache' : 'Ready for Telemetry',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-sm transition-colors duration-150">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            End-to-End Autonomous DevOps Lifecycle
          </h2>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Closed Feedback Loop Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {stages.map((stage) => {
          const Icon = stage.icon;

          let badgeBorder = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60';
          let iconColor = 'text-slate-400';
          let statusText = 'text-slate-700 dark:text-slate-300';

          if (stage.status === 'completed') {
            badgeBorder = 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20';
            iconColor = 'text-emerald-600 dark:text-emerald-400';
            statusText = 'text-emerald-700 dark:text-emerald-400';
          } else if (stage.status === 'critical') {
            badgeBorder = 'border-rose-300 bg-rose-50/80 dark:border-rose-900/70 dark:bg-rose-950/40 ring-1 ring-rose-400/30';
            iconColor = 'text-rose-600 dark:text-rose-400';
            statusText = 'text-rose-700 dark:text-rose-300';
          } else if (stage.status === 'warning') {
            badgeBorder = 'border-amber-300 bg-amber-50/80 dark:border-amber-900/70 dark:bg-amber-950/30';
            iconColor = 'text-amber-600 dark:text-amber-400';
            statusText = 'text-amber-700 dark:text-amber-300';
          } else if (stage.status === 'feedback_active') {
            badgeBorder = 'border-blue-300 bg-blue-50/80 dark:border-blue-800/80 dark:bg-blue-950/40 ring-1 ring-blue-400/30';
            iconColor = 'text-blue-600 dark:text-blue-400';
            statusText = 'text-blue-700 dark:text-blue-300';
          }

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-lg border ${badgeBorder} relative transition-all hover:border-slate-400 dark:hover:border-slate-700`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">{stage.title}</span>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <div className={`text-xs font-mono font-medium truncate ${statusText}`}>
                {stage.subtitle}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {stage.info}
              </div>
              {stage.agent && (
                <div className="mt-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px]">
                  <span className="text-slate-400 dark:text-slate-500">Agent</span>
                  <span className="font-mono text-blue-700 dark:text-blue-400 font-semibold">{stage.agent}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
