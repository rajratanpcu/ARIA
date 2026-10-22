import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAria } from '../../context/AriaContext';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({ isOpen, onClose }) => {
  const { demoStep, setDemoStep, runNextDemoStep, resetToDefault, modules } = useAria();

  const cartModule = modules.find((m) => m.id === 'mod-checkout-cart');
  const cartRisk = cartModule ? cartModule.currentRiskWeight : 0.3;

  const steps = [
    {
      num: 1,
      title: 'Commit Trigger & Multi-Module Impact',
      agent: 'Developer Commit #7a9e4f2',
      badge: 'Step 1/8',
      summary: 'Commit touched 3 modules: checkout-cart, payment-gateway, and analytics-sdk.',
      details:
        'Engineer Elena Vance pushed changes to cart coupon recalculation and payment state sync. ARIA parses the abstract syntax tree and determines affected dependency nodes.',
      metricLabel: 'Changed Modules',
      metricValue: '3 modules (14 files)',
    },
    {
      num: 2,
      title: 'Build Intelligence: Cache Reuse Decision',
      agent: 'BIA — Build Intelligence Agent',
      badge: 'Step 2/8',
      summary: 'BIA evaluates build cache and recommends reusing cached checkout-cart artifact.',
      details:
        'Because build-891 previously compiled successfully with identical direct inputs, BIA identified an 85.7% cache reuse opportunity, saving 6.4 minutes of mobile build compilation.',
      metricLabel: 'BIA Recommendation',
      metricValue: 'Cache Reused (85.7% hit)',
    },
    {
      num: 3,
      title: 'CI Orchestration: Targeted Test Prioritization',
      agent: 'COA — CI Orchestration Agent',
      badge: 'Step 3/8',
      summary: 'COA selects 847 tests from the 12,340 suite (93.1% CI duration reduction).',
      details:
        'Using baseline risk weight (0.30), failure history, and execution cost, COA pruned non-impacted tests (e.g. catalog deep linking) while selecting critical cart unit and payment tests.',
      metricLabel: 'Tests Selected',
      metricValue: '847 / 12,340 tests (93.1% cut)',
    },
    {
      num: 4,
      title: 'Staged Rollout Progression',
      agent: 'DCA — Deployment Coordination Agent',
      badge: 'Step 4/8',
      summary: 'Release candidate v3.2.1 advances through 2% and 10% rollout stages safely.',
      details:
        'Crash rates remain normal (0.04% at 2%, 0.07% at 10%). DCA authorizes progression to 50% rollout with 1.1 million active users.',
      metricLabel: 'Rollout Status',
      metricValue: '50% Active (1.1M users)',
    },
    {
      num: 5,
      title: 'Runtime Anomaly & Incident Detection',
      agent: 'IRA — Incident Resolution Agent',
      badge: 'Step 5/8',
      summary: 'Checkout HTTP failure rate spikes from 3.2% baseline to 7.8% at 50% rollout.',
      details:
        'High concurrency reveals a race condition: cached checkout-cart artifact expected v3 schema while server expected v4. INC-7402 is triaged as critical.',
      metricLabel: 'Checkout Error Rate',
      metricValue: '7.8% (Baseline: 3.2%)',
    },
    {
      num: 6,
      title: 'Root Cause Attribution & Gating Check',
      agent: 'IRA — Incident Resolution Agent',
      badge: 'Step 6/8',
      summary: 'IRA attributes root cause to checkout-cart with confidence 0.87 (>= 0.75 threshold).',
      details:
        'Stack traces and cache keys correlate to stale checkout-cart compilation. Confidence 0.87 satisfies the strict AFP confidence gating threshold (0.75).',
      metricLabel: 'Attribution Confidence',
      metricValue: '0.87 (Threshold: >= 0.75)',
    },
    {
      num: 7,
      title: 'ARIA Feedback Protocol (AFP) Weight Update',
      agent: 'AFP Protocol Engine',
      badge: 'Step 7/8',
      summary: 'AFP updates checkout-cart risk from 0.300 to 0.648 (+0.348 delta).',
      details:
        'Formula: newWeight = min(1.0, 0.3 + 0.87 * 0.4) = 0.648. BIA switches cache policy to strict_invalidation. AFP-INCIDENT and AFP-ACK messages recorded in audit log.',
      metricLabel: 'Updated Module Risk',
      metricValue: `checkout-cart: ${cartRisk.toFixed(3)}`,
    },
    {
      num: 8,
      title: 'Upstream Influence: CI Suite Automatically Expanded',
      agent: 'COA & Upstream Closed Loop',
      badge: 'Step 8/8',
      summary: 'Subsequent commit selects 1,334 tests (+487 regression tests included).',
      details:
        'Demonstrates closed feedback loop! The elevated risk (0.648) automatically forces COA to include previously pruned cache-sync regression tests on future builds, preventing repeated regressions.',
      metricLabel: 'Future CI Test Selection',
      metricValue: '1,334 tests (+57.5% coverage)',
    },
  ];

  const currentStep = steps[demoStep - 1] || steps[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ARIA Guided Demo Scenario"
      subtitle="Interactive 8-stage walkthrough based on the academic research paper"
      maxWidth="2xl"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>Simulation Progress</span>
          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">Step {demoStep} of 8</span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setDemoStep(s.num)}
              className={`h-2 rounded-full transition-all ${
                s.num === demoStep
                  ? 'bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-500/30'
                  : s.num < demoStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
              title={`Jump to Step ${s.num}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Step Card */}
      <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {currentStep.badge}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{currentStep.agent}</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{currentStep.title}</h3>
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-4">{currentStep.summary}</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          {currentStep.details}
        </p>

        {/* Highlight Metric */}
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">{currentStep.metricLabel}</span>
          <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentStep.metricValue}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Reset scenario to initial baseline?')) {
                resetToDefault();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {demoStep > 1 && (
            <button
              onClick={() => setDemoStep(demoStep - 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}

          <button
            onClick={runNextDemoStep}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95"
          >
            <span>{demoStep === 8 ? 'Complete & Close' : 'Execute Step & Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
