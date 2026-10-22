import React, { useState } from 'react';
import {
  Hammer,
  FlaskConical,
  PackageCheck,
  Rocket,
  AlertTriangle,
  History,
  Info,
} from 'lucide-react';
import { useAria } from '../context/AriaContext';
import { Agent, AgentRole } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { AutonomyBadge } from '../components/common/AutonomyBadge';

export const AgentsPage: React.FC = () => {
  const { agents, subsequentCommitTestCount } = useAria();
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>('BIA');

  const agentIcons: Record<AgentRole, React.ComponentType<{ className?: string }>> = {
    BIA: Hammer,
    COA: FlaskConical,
    RCA: PackageCheck,
    DCA: Rocket,
    IRA: AlertTriangle,
  };

  const activeAgentData = agents.find((a: Agent) => a.id === selectedAgent) || agents[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          5-Agent Autonomous Control Center
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
            Autonomous Collaboration Plane
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Specialized intelligent agents coordinating mobile build intelligence, test selection, release gatekeeping, rollout telemetry, and incident feedback.
        </p>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs shadow-sm">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-slate-600 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">Simulated Autonomy Notice:</strong> Agents operate via deterministic rule-based models and simulated telemetry in this prototype. Artifact signing, production rollouts, and build cache operations are simulated for academic evaluation and do not touch real production infrastructure.
        </div>
      </div>

      {/* 5 Distinct Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {agents.map((agent: Agent) => {
          const Icon = agentIcons[agent.id];
          const isSelected = agent.id === selectedAgent;

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 dark:border-blue-600 dark:bg-slate-850 ring-1 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <StatusBadge status={agent.status} size="sm" pulse={agent.status === 'analyzing'} />
                </div>

                <div className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                  {agent.id}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 truncate">
                  {agent.name}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">
                  {agent.responsibility}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Confidence</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {(agent.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  <span>Action: </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{agent.lastAction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Deep Dive */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
              {React.createElement(agentIcons[activeAgentData.id], { className: 'w-6 h-6' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeAgentData.fullName}</h2>
                <StatusBadge status={activeAgentData.status} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lifecycle Role: {activeAgentData.lifecycleStage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Agent Confidence</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {(activeAgentData.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Last Evaluation</span>
              <span className="text-xs text-slate-700 dark:text-slate-300">{activeAgentData.lastActionTimestamp}</span>
            </div>
          </div>
        </div>

        {/* Input/Output Contract Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">
              Ingestion Contract (Inputs)
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              {activeAgentData.id === 'BIA' && (
                <>
                  <li>Git diff abstract syntax trees & changed module hashes</li>
                  <li>Gradle/Bazel build cache remote index & fingerprint</li>
                  <li>Implicated module risk weights from AFP feedback</li>
                </>
              )}
              {activeAgentData.id === 'COA' && (
                <>
                  <li>Module dependency graph & changed file paths</li>
                  <li>Historical test failure rates & test execution costs (ms)</li>
                  <li>Dynamic AFP module risk weights (baseline: 0.300)</li>
                </>
              )}
              {activeAgentData.id === 'RCA' && (
                <>
                  <li>Static analysis security scan reports (SAST/DAST)</li>
                  <li>Automated regression test suite execution summaries</li>
                  <li>Simulated signing keystore & app bundle integrity signatures</li>
                </>
              )}
              {activeAgentData.id === 'DCA' && (
                <>
                  <li>Real-time client telemetry: crash-free sessions & latency</li>
                  <li>HTTP status codes (5xx error rates at 2%, 10%, 50%, 100%)</li>
                  <li>Staged rollout policies & automatic circuit-breaker triggers</li>
                </>
              )}
              {activeAgentData.id === 'IRA' && (
                <>
                  <li>Aggregated runtime logs, crash stack traces, exception frequency</li>
                  <li>Build cache metadata from BIA & deployment stage context from DCA</li>
                  <li>Attribution heuristics mapping exceptions to module namespaces</li>
                </>
              )}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
              Delivery Contract (Outputs & Actions)
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              {activeAgentData.id === 'BIA' && (
                <>
                  <li>Cache invalidation directive: standard vs strict_invalidation</li>
                  <li>Predicted build risk score & compilation optimization report</li>
                  <li>AFP-ACK acknowledgment response for cache policy reconfiguration</li>
                </>
              )}
              {activeAgentData.id === 'COA' && (
                <>
                  <li>Prioritized test suite execution payload ({subsequentCommitTestCount} tests selected)</li>
                  <li>Estimated CI duration & predicted defect detection rate</li>
                  <li>Test suite pruning audit record for unselected tests</li>
                </>
              )}
              {activeAgentData.id === 'RCA' && (
                <>
                  <li>Release gate decision: APPROVED, REJECTED, or HOLD</li>
                  <li>Simulated artifact certification manifest (honest disclaimer)</li>
                  <li>Governance audit entry with gating checklist verification</li>
                </>
              )}
              {activeAgentData.id === 'DCA' && (
                <>
                  <li>Stage advancement authorization (2% -&gt; 10% -&gt; 50% -&gt; 100%)</li>
                  <li>Circuit-breaker pause directive upon metric anomaly detection</li>
                  <li>Level 4 Rollback approval request submitted to human operator</li>
                </>
              )}
              {activeAgentData.id === 'IRA' && (
                <>
                  <li>Ranked root-cause hypotheses with confidence estimates & evidence</li>
                  <li>Attributable module identification (e.g. checkout-cart)</li>
                  <li>AFP-INCIDENT signal dispatched to BIA &amp; COA (when c &gt;= 0.75)</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Activity & Decision History */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Decision Audit Timeline for {activeAgentData.id}
          </h3>

          <div className="space-y-2.5">
            {activeAgentData.activityHistory.map((item, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.action}</span>
                    <AutonomyBadge level={item.level} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{item.details}</p>
                </div>

                <div className="flex items-center gap-4 text-right flex-shrink-0">
                  <span className="font-mono text-blue-700 dark:text-blue-400 font-medium">
                    Confidence: {(item.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
