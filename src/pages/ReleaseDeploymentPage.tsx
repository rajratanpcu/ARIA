import React, { useState, useMemo } from 'react';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Info,
  ShieldAlert,
  Sliders,
  Activity,
} from 'lucide-react';
import { useAria } from '../../context/AriaContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { canaryRolloutEngine, CanaryCohortState, DEFAULT_CANARY_POLICY } from '../../services/canaryRolloutEngine';

export const ReleaseDeploymentPage: React.FC = () => {
  const {
    release,
    deployment,
    advanceRolloutStage,
    pauseRollout,
    triggerRollbackRequest,
  } = useAria();

  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [customHttpThreshold, setCustomHttpThreshold] = useState<number>(3.0);

  const stages: (2 | 10 | 50 | 100)[] = [2, 10, 50, 100];
  const currentHealth = deployment.stagedHealth[deployment.currentStage];

  const evaluatedCanaryState = useMemo(() => {
    return canaryRolloutEngine.evaluateCohort(
      deployment.currentStage,
      currentHealth.httpErrorRatePct,
      currentHealth.crashRatePct,
      currentHealth.p95LatencyMs,
      { ...DEFAULT_CANARY_POLICY, maxHttpErrorRatePct: customHttpThreshold }
    );
  }, [deployment.currentStage, currentHealth, customHttpThreshold]);

  const gateDecision = useMemo(() => {
    return canaryRolloutEngine.checkCanaryGate(evaluatedCanaryState);
  }, [evaluatedCanaryState]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          Release Gatekeeping & Staged Deployment
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
            RCA & DCA Control
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Governs release candidate gating criteria and monitors simulated staged rollouts across mobile user populations.
        </p>
      </div>

      {/* Honest Disclaimer */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs shadow-sm">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-slate-600 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">Simulated Artifact & Deployment:</strong> Artifact signing, binary distribution, and staged rollout percentages are simulated within the local runtime model for academic demonstration. No real Google Play or Apple App Store credentials are used.
        </div>
      </div>

      {/* Release Candidate Details & Checklist Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Release Candidate: {release.version}
              </h2>
              <StatusBadge status={release.status} />
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {release.channel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Build Ref: {release.buildId} &bull; Size: {release.artifactSizeMb} MB &bull; Signed: {release.signingStatus}
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-500 dark:text-slate-400 block">Authorized Release Gate</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{release.approvedBy}</span>
          </div>
        </div>

        {/* RCA Checklist */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3">
          RCA Release Checklist Verification (Autonomous Policy Check)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300">SAST Security Scan</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300">Regression Tests</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300">Compliance & Privacy</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
            <span className="text-slate-700 dark:text-slate-300">Crash-Free Threshold</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Met (99.9%)
            </span>
          </div>
        </div>
      </div>

      {/* Staged Rollout Visualizer: 2% -> 10% -> 50% -> 100% */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Staged Rollout Progression (2% &rarr; 10% &rarr; 50% &rarr; 100%)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              DCA monitors real-time anomaly telemetry before authorizing progressive user cohort expansion.
            </p>
          </div>

          {/* Rollout Action Controls */}
          <div className="flex items-center gap-2">
            {deployment.status !== 'paused' && deployment.status !== 'rolled_back' && (
              <button
                onClick={pauseRollout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Rollout</span>
              </button>
            )}

            {deployment.currentStage < 100 && deployment.status !== 'rolled_back' && (
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Advance Stage</span>
              </button>
            )}

            <button
              onClick={() => setIsRollbackModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Level 4 Rollback</span>
            </button>
          </div>
        </div>

        {/* Staged Rollout Visualizer: 2% -> 10% -> 50% -> 100% */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-500 dark:text-slate-400">DCA Gate Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                gateDecision.canAdvance
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {gateDecision.recommendation}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-sans truncate max-w-md">
              {gateDecision.reason}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Max 5xx Threshold:</span>
            <input
              type="number"
              step="0.5"
              min="1.0"
              max="10.0"
              value={customHttpThreshold}
              onChange={(e) => setCustomHttpThreshold(parseFloat(e.target.value) || 3.0)}
              className="w-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs font-mono"
            />
            <span className="text-slate-400 font-mono text-[11px]">%</span>
          </div>
        </div>

        {/* 4 Staged Rollout Cohort Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stages.map((stage) => {
            const health = deployment.stagedHealth[stage];
            const isCurrent = deployment.currentStage === stage;
            const isPassed = deployment.currentStage > stage;

            let borderStyle = 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-850/60 opacity-60';
            if (isCurrent) {
              borderStyle =
                health.status === 'critical'
                  ? 'border-rose-500 bg-rose-50/70 dark:border-rose-500 dark:bg-rose-950/40 ring-2 ring-rose-500/40'
                  : 'border-blue-500 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 ring-2 ring-blue-500/40';
            } else if (isPassed) {
              borderStyle = 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20';
            }

            return (
              <div
                key={stage}
                className={`p-4 rounded-xl border transition-all ${borderStyle} relative`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {stage}% Rollout
                  </span>
                  <StatusBadge status={health.status} size="sm" />
                </div>

                <div className="text-xs font-mono text-blue-700 dark:text-blue-400 mb-3">
                  {health.activeUsers > 0
                    ? `${(health.activeUsers / 1000).toLocaleString()}k active users`
                    : 'Pending stage'}
                </div>

                <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-800 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Crash Rate:</span>
                    <span
                      className={
                        health.crashRatePct > 0.3 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'
                      }
                    >
                      {health.crashRatePct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">HTTP 5xx Error:</span>
                    <span
                      className={
                        health.httpErrorRatePct > 3.0
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }
                    >
                      {health.httpErrorRatePct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">P95 Latency:</span>
                    <span className="text-slate-800 dark:text-slate-200">{health.p95LatencyMs} ms</span>
                  </div>
                </div>

                {isCurrent && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-center font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Current Active Stage
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Anomaly Alert at 50% Stage */}
        {currentHealth.status === 'critical' && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-800 dark:text-rose-300 text-sm mb-1">
                DCA Anomaly Detected: Checkout Failure Rate Spiked to 7.8%
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Rollout at 50% stage exceeded maximum allowed HTTP error threshold (3.0%). DCA circuit-breaker triggered. Recommended action: Pause rollout and trigger Level 4 Rollback authorization to prevent customer churn.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Advance Stage */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Advance Staged Rollout Cohort"
        subtitle="Confirm deployment progression"
      >
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to advance the rollout cohort to the next stage? DCA will begin routing production mobile traffic to the expanded cohort.
        </p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsAdvanceModalOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              advanceRolloutStage();
              setIsAdvanceModalOpen(false);
            }}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            Confirm & Advance
          </button>
        </div>
      </Modal>

      {/* Level 4 Rollback Authorization Modal */}
      <Modal
        isOpen={isRollbackModalOpen}
        onClose={() => setIsRollbackModalOpen(false)}
        title="Level 4 Governance: Emergency Rollback Request"
        subtitle="High-impact action requiring human authorization"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 text-rose-800 dark:text-rose-200">
            <strong>Warning:</strong> Initiating an emergency rollback will halt the 50% rollout of {deployment.version} and redirect user traffic back to the previous stable release v3.2.0.
          </div>

          <p>
            Under ARIA Autonomy Level 4 governance, AI agents (DCA/IRA) are strictly prohibited from executing rollbacks autonomously. An explicit human approval entry will be recorded in the immutable audit log.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsRollbackModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                triggerRollbackRequest();
                setIsRollbackModalOpen(false);
              }}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              Submit Level 4 Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
