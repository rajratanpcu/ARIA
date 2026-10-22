import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useAria } from '../../context/AriaContext';
import { AutonomyBadge } from '../../components/common/AutonomyBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AUTONOMY_LEVELS, AutonomyLevel } from '../../types';

export const GovernancePage: React.FC = () => {
  const { approvals, resolveApproval } = useAria();
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const resolvedApprovals = approvals.filter((a) => a.status !== 'pending');

  const handleAction = (id: string, decision: 'approved' | 'rejected') => {
    resolveApproval(id, decision, notes || undefined);
    setNotes('');
    setSelectedApprovalId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          Governance & Autonomy Level Enforcement
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-mono font-medium">
            Level 4 Gatekeeping
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enforces human-in-the-loop authorization gates for high-impact DevOps actions according to ARIA's 4-tier autonomy framework.
        </p>
      </div>

      {/* 4 Autonomy Levels Reference */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {([1, 2, 3, 4] as AutonomyLevel[]).map((lvl) => {
          const info = AUTONOMY_LEVELS[lvl];
          return (
            <div
              key={lvl}
              className={`p-4 rounded-xl border shadow-sm ${
                lvl === 4
                  ? 'border-amber-300 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20'
                  : lvl === 3
                  ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/60 dark:bg-blue-950/20'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <AutonomyBadge level={lvl} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{info.description}</p>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] font-medium">
                {info.requiresHumanApproval ? (
                  <span className="text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                    Human Authorization Required
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">Autonomous Execution Permitted</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Level 4 Approval Queue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Pending Level 4 Approval Requests ({pendingApprovals.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Operator: <strong className="text-slate-800 dark:text-slate-200">Raj Ratan (DevOps Lead)</strong>
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            No pending Level 4 approval requests. All high-impact operations are satisfied or idle.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/15 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300">{appr.id}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-mono">
                      {appr.actionType}
                    </span>
                    <AutonomyBadge level={4} />
                  </div>
                  <div className="text-xs font-mono text-blue-700 dark:text-blue-400">
                    Requested by: <strong className="text-slate-900 dark:text-slate-100">{appr.requestedBy}</strong>{' '}
                    (Confidence: {(appr.confidence * 100).toFixed(0)}%)
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{appr.title}</h3>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                    Agent Rationale & Risk Assessment:
                  </span>
                  {appr.rationale}
                </div>

                {/* Review Notes & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Optional reviewer notes / authorization justification..."
                    value={selectedApprovalId === appr.id ? notes : ''}
                    onFocus={() => setSelectedApprovalId(appr.id)}
                    onChange={(e) => {
                      setSelectedApprovalId(appr.id);
                      setNotes(e.target.value);
                    }}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(appr.id, 'rejected')}
                      className="px-4 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-300 dark:border-rose-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleAction(appr.id, 'approved')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authorize Execution</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Approvals History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Resolved Approvals Audit History
        </h3>

        {resolvedApprovals.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center">
            No resolved approvals in current session.
          </div>
        ) : (
          <div className="space-y-3">
            {resolvedApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{appr.id}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">{appr.actionType}</span>
                    <StatusBadge status={appr.status} size="sm" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{appr.title}</p>
                  {appr.reviewerNotes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Notes: {appr.reviewerNotes}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0 font-mono text-[11px]">
                  <div className="text-blue-700 dark:text-blue-400 font-medium">{appr.resolvedBy}</div>
                  <div className="text-slate-400 dark:text-slate-500">{appr.resolvedAt}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
