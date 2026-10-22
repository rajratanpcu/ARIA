import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAria } from '../../context/AriaContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CiOrchestrationPage: React.FC = () => {
  const { tests, modules, subsequentCommitTestCount } = useAria();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');

  const cartModule = modules.find((m) => m.id === 'mod-checkout-cart');
  const isAfpElevated = cartModule ? cartModule.currentRiskWeight > 0.3 : false;

  const filteredTests = tests.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterModule !== 'all' && t.moduleId !== filterModule) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          CI Orchestration & Test Selection
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
            COA Subsystem
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Intelligently prunes and prioritizes mobile test suites using changed modules, failure history, and AFP risk weights.
        </p>
      </div>

      {/* Model Estimate Disclaimer */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs shadow-sm">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-slate-600 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">Academic Transparency:</strong> Predicted defect detection and risk coverage metrics are statistical model estimates computed from historical mutation analysis and failure distributions, not measured production outcomes.
        </div>
      </div>

      {/* Recommended vs Full Suite Comparison Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              COA Suite Selection Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAfpElevated
                ? 'AFP Elevated Mode: Test suite expanded from 847 to 1,334 tests to cover implicated checkout-cart regression paths.'
                : 'Baseline Mode: Selected 847 of 12,340 tests, achieving a 93.1% reduction in CI execution duration.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${
                isAfpElevated
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
              }`}
            >
              {isAfpElevated ? 'AFP Elevated: 1,334 Tests' : 'Baseline: 847 Tests'}
            </span>
          </div>
        </div>

        {/* 4 Comparison Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Selected Tests / Full Suite</span>
            <div className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1">
              {subsequentCommitTestCount}{' '}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ 12,340</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {isAfpElevated ? '89.2% suite pruned' : '93.1% suite pruned'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Estimated CI Duration</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
              {isAfpElevated ? '6.8 min' : '4.2 min'}{' '}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ 48.5 min full</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {isAfpElevated ? '-86.0% time saved' : '-91.3% time saved'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Risk Coverage</span>
            <div className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1">
              {isAfpElevated ? '99.4%' : '94.2%'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Statistical model estimate</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Predicted Defect Detection</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {isAfpElevated ? '98.8%' : '92.6%'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Model estimate</span>
          </div>
        </div>
      </div>

      {/* Tests Table with Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Targeted Test Inventory ({filteredTests.length} Sampled)
          </h3>

          <div className="flex items-center gap-3">
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Test Types</option>
              <option value="unit">Unit</option>
              <option value="integration">Integration</option>
              <option value="ui-e2e">UI / E2E</option>
              <option value="regression">Regression</option>
            </select>

            {/* Module filter */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Modules</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Test Identifier & Name</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Exec Cost</th>
                <th className="py-2.5 px-3">Hist. Fail Rate</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Selection Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${
                    test.selected ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-950/40 opacity-70'
                  }`}
                >
                  <td className="py-3 px-3">
                    {test.selected ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Pruned
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono font-medium text-slate-900 dark:text-slate-200">{test.name}</div>
                    <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{test.id}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-blue-700 dark:text-blue-400">{test.moduleName}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={test.type} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {test.executionCostMs.toLocaleString()} ms
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={
                        test.historicalFailureRate > 0.05 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {(test.historicalFailureRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {test.priorityScore.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                    {test.selectionReason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
