import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ShieldAlert,
  Zap,
  Gauge,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAria } from '../context/AriaContext';
import { StatCard } from '../components/common/StatCard';
import { PipelineVisualizer } from '../components/layout/PipelineVisualizer';
import { RiskMeter } from '../components/common/RiskMeter';
import { StatusBadge } from '../components/common/StatusBadge';
import type { Incident, Approval, Module } from '../types';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    release,
    deployment,
    modules,
    incidents,
    approvals,
    subsequentCommitTestCount,
  } = useAria();

  const openIncidents = incidents.filter((i: Incident) => !i.resolvedAt);
  const pendingApprovals = approvals.filter((a: Approval) => a.status === 'pending');
  const avgRisk =
    modules.reduce((sum: number, m: Module) => sum + m.currentRiskWeight, 0) / modules.length;

  const cartModule = modules.find((m: Module) => m.id === 'mod-checkout-cart');
  const isAfpActive = cartModule ? cartModule.currentRiskWeight > 0.3 : false;

  return (
    <div className="space-y-6">
      {/* Page Title & Mission Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            Overview Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
              Release {release.version}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Agentic Release Intelligence & Autonomous Mobile DevOps Control Plane
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/incidents')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Investigate Incidents</span>
          </button>
          <button
            onClick={() => navigate('/afp')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>AFP Protocol</span>
          </button>
        </div>
      </div>

      {/* Prominent End-to-End Pipeline Visualizer */}
      <PipelineVisualizer />

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Release"
          value={release.version}
          subtitle={`Stage: ${deployment.currentStage}% rollout (${deployment.status})`}
          icon={<Layers className="w-4 h-4" />}
          trend={{ value: 'Staged Rollout', isPositive: deployment.status === 'in_progress' }}
          onClick={() => navigate('/releases')}
        />

        <StatCard
          title="Build Success Rate"
          value="96.4%"
          subtitle="Cache hit rate 85.7% (BIA optimized)"
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend={{ value: '+4.2% vs baseline', isPositive: true }}
          onClick={() => navigate('/builds')}
        />

        <StatCard
          title="CI Test Selection"
          value={`${subsequentCommitTestCount} / 12,340`}
          subtitle={
            isAfpActive
              ? 'AFP elevated (+487 regression tests)'
              : '93.1% CI duration reduction (COA pruned)'
          }
          icon={<Zap className="w-4 h-4" />}
          trend={{
            value: isAfpActive ? 'AFP Active' : '93.1% cut',
            isPositive: !isAfpActive,
            isNeutral: isAfpActive,
          }}
          highlight={isAfpActive}
          onClick={() => navigate('/ci-tests')}
        />

        <StatCard
          title="Open Incidents"
          value={openIncidents.length}
          subtitle="INC-7402: Stale cache failure (c=0.87)"
          icon={<AlertOctagon className="w-4 h-4" />}
          trend={{ value: 'Critical Triaged', isPositive: false }}
          highlight={openIncidents.length > 0}
          onClick={() => navigate('/incidents')}
        />

        <StatCard
          title="Mean Time To Resolve"
          value="14.2 min"
          subtitle="Autonomous root-cause synthesis"
          icon={<Clock className="w-4 h-4" />}
          trend={{ value: '-68% MTTR vs manual', isPositive: true }}
          onClick={() => navigate('/incidents')}
        />

        <StatCard
          title="Average Module Risk"
          value={avgRisk.toFixed(3)}
          subtitle={
            cartModule && cartModule.currentRiskWeight > 0.3
              ? `checkout-cart elevated to ${cartModule.currentRiskWeight.toFixed(3)}`
              : 'All modules at 0.300 baseline'
          }
          icon={<Gauge className="w-4 h-4" />}
          trend={{
            value: isAfpActive ? 'AFP Feedback' : 'Baseline 0.30',
            isPositive: !isAfpActive,
          }}
          highlight={isAfpActive}
          onClick={() => navigate('/afp')}
        />

        <StatCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          subtitle="Level 4 human authorization required"
          icon={<ShieldAlert className="w-4 h-4" />}
          trend={{
            value: pendingApprovals.length > 0 ? 'Action Required' : 'Nominal',
            isPositive: pendingApprovals.length === 0,
          }}
          highlight={pendingApprovals.length > 0}
          onClick={() => navigate('/governance')}
        />

        <StatCard
          title="Predicted Defect Detection"
          value={isAfpActive ? '98.8%' : '94.2%'}
          subtitle="Model estimate across regression space"
          icon={<Activity className="w-4 h-4" />}
          trend={{ value: isAfpActive ? '+4.6% after AFP' : 'High Coverage', isPositive: true }}
          onClick={() => navigate('/ci-tests')}
        />
      </div>

      {/* Two-Column Analytics & Module Risk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Risk Weights Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Module Risk Weights & Cache Policies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regulated by ARIA Feedback Protocol (AFP). Elevated modules receive stricter cache invalidation and higher test priority.
              </p>
            </div>
            <button
              onClick={() => navigate('/afp')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>AFP Math</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {modules.map((mod: Module) => (
              <div
                key={mod.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  mod.currentRiskWeight > 0.5
                    ? 'border-rose-200 bg-rose-50/70 dark:border-rose-900/80 dark:bg-rose-950/20'
                    : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {mod.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">({mod.language})</span>
                    {mod.currentRiskWeight > 0.5 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-700 font-semibold">
                        AFP Implicated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={mod.cachePolicy} size="sm" />
                    <StatusBadge status={mod.cacheStatus} size="sm" />
                  </div>
                </div>

                <RiskMeter
                  value={mod.currentRiskWeight}
                  baseline={mod.baselineRiskWeight}
                  threshold={0.75}
                  size="sm"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  <span>LOC: {mod.linesOfCode.toLocaleString()}</span>
                  <span>Test Suite: {mod.testCount.toLocaleString()} tests</span>
                  <span>
                    Dependencies:{' '}
                    {mod.dependencies.length > 0
                      ? mod.dependencies.map((d) => d.replace('mod-', '')).join(', ')
                      : 'None'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Decision & Governance Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Pending Level 4 Approvals Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Level 4 Approvals Queue
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-mono font-medium">
                {pendingApprovals.length} Pending
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Autonomous execution is prohibited for high-impact actions. Operators must explicitly review rationale before execution.
            </p>

            <div className="space-y-3">
              {pendingApprovals.map((appr: Approval) => (
                <div
                  key={appr.id}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-200">
                    <span className="truncate">{appr.actionType}</span>
                    <span className="text-blue-700 dark:text-blue-400 font-mono text-[10px]">
                      Req: {appr.requestedBy}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-[11px]">{appr.rationale}</p>
                  <button
                    onClick={() => navigate('/governance')}
                    className="w-full mt-2 py-1 px-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] text-center transition-colors shadow-sm"
                  >
                    Review & Authorize
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Research Paper Experiment Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              AFP Performance Benchmark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Evaluated on RetailGo Mobile SuperApp under identical incident stimulus:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">CI Build Duration</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">142s (-78% vs full)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Repeated Regression Rate</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">0.4% (-84% vs static)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Audit Completeness</span>
                <span className="font-mono text-blue-700 dark:text-blue-400 font-bold">100% Traceable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
