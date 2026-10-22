import React from 'react';
import {
  GitCommit,
  Network,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAria } from '../context/AriaContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskMeter } from '../components/common/RiskMeter';
import type { Commit, Build, Module } from '../types';

export const BuildIntelligencePage: React.FC = () => {
  const {
    commits,
    builds,
    modules,
    selectedCommitId,
    setSelectedCommitId,
  } = useAria();

  const selectedCommit =
    commits.find((c: Commit) => c.id === selectedCommitId) || commits[0];

  const associatedBuild =
    builds.find((b: Build) => b.commitId === selectedCommit.id) || builds[0];

  const changedModulesList = modules.filter((m: Module) =>
    selectedCommit.changedModules.includes(m.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          Build Intelligence & Cache Governance
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
            BIA Subsystem
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Analyzes changed modules, cross-module dependency risks, and build cache integrity before artifact compilation.
        </p>
      </div>

      {/* Commit Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Select Commit to Evaluate Build Intelligence
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {commits.length} commits in history
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {commits.map((c: Commit) => (
            <div
              key={c.id}
              onClick={() => setSelectedCommitId(c.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                c.id === selectedCommitId
                  ? 'border-blue-500 bg-blue-50/70 dark:border-blue-600 dark:bg-slate-850 ring-1 ring-blue-500/30'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">{c.hash}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.timestamp.split(' ')[0]}</span>
              </div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1 mb-2">
                {c.message}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[140px]">{c.author.split(' <')[0]}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">+{c.diffStat.additions} / -{c.diffStat.deletions}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Deep Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Commit & Build Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Commit Evaluation Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-xs text-blue-700 dark:text-blue-400 font-bold">
                  {selectedCommit.hash}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedCommit.message}
                </h3>
              </div>
              <StatusBadge status={associatedBuild.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 mb-5 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Author</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedCommit.author.split(' <')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Build Duration</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{associatedBuild.durationSeconds}s</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Cache Efficiency</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {associatedBuild.cacheHits} Hits / {associatedBuild.cacheMisses} Misses
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">BIA Risk Assessment</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {(associatedBuild.riskScore * 100).toFixed(0)}% Risk
                </span>
              </div>
            </div>

            {/* BIA Recommendation Box */}
            <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/60 mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  BIA Recommendation
                </span>
                <span className="text-xs font-mono text-blue-700 dark:text-blue-400 font-medium">
                  Confidence: {(associatedBuild.biaConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {associatedBuild.biaRecommendation}
              </p>
            </div>

            {/* Impacted Modules in this Commit */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3">
              Touched Modules & Cache Status
            </h4>
            <div className="space-y-3">
              {changedModulesList.map((mod: Module) => (
                <div
                  key={mod.id}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{mod.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{mod.path}</span>
                    </div>
                    <div className="max-w-md">
                      <RiskMeter value={mod.currentRiskWeight} size="sm" showLabel={false} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Cache Status</span>
                      <StatusBadge status={mod.cacheStatus} size="sm" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Policy</span>
                      <StatusBadge status={mod.cachePolicy} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Module Dependency Graph & Build History (1 col) */}
        <div className="space-y-6">
          {/* Dependency Graph Visualization */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Module Dependency Graph
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Cross-module dependency topology for mobile app compilation:
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="text-blue-700 dark:text-blue-400 font-bold mb-1">checkout-cart</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 border-l-2 border-slate-300 dark:border-slate-700 space-y-1">
                  <div>↳ payment-gateway (direct)</div>
                  <div>↳ analytics-sdk (direct)</div>
                  <div>&nbsp;&nbsp;↳ security-vault (transitive via payment)</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="text-blue-700 dark:text-blue-400 font-bold mb-1">catalog-browse</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 border-l-2 border-slate-300 dark:border-slate-700">
                  <div>↳ analytics-sdk</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="text-blue-700 dark:text-blue-400 font-bold mb-1">user-auth</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 border-l-2 border-slate-300 dark:border-slate-700">
                  <div>↳ security-vault</div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Build Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Recent Build Outcomes
            </h3>

            <div className="space-y-2.5">
              {builds.map((b: Build) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-200">Build #{b.buildNumber}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{b.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={b.status} size="sm" />
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{b.durationSeconds}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
