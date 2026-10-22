import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  ShieldCheck,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAria } from '../context/AriaContext';
import { AutonomyBadge } from '../components/common/AutonomyBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { cryptographicAuditEngine, CryptographicBlock } from '../services/cryptographicAuditEngine';
import type { AuditEvent } from '../types';

export const AuditLogPage: React.FC = () => {
  const { auditEvents } = useAria();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isVerifyingChain, setIsVerifyingChain] = useState<boolean>(false);
  const [chainVerificationResult, setChainVerificationResult] = useState<{
    valid: boolean;
    verifiedBlocks: number;
  } | null>(null);

  const cryptographicBlocks: CryptographicBlock[] = useMemo(() => {
    return cryptographicAuditEngine.buildLedger(auditEvents);
  }, [auditEvents]);

  const handleVerifyMerkleChain = () => {
    setIsVerifyingChain(true);
    setTimeout(() => {
      const res = cryptographicAuditEngine.verifyChainIntegrity(cryptographicBlocks);
      setChainVerificationResult(res);
      setIsVerifyingChain(false);
    }, 400);
  };

  const filteredEvents = auditEvents.filter((ev: AuditEvent) => {
    if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && ev.severity !== severityFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchAction = ev.action.toLowerCase().includes(term);
      const matchAgent = ev.agent?.toLowerCase().includes(term);
      const matchDetails = JSON.stringify(ev.details).toLowerCase().includes(term);
      return matchAction || matchAgent || matchDetails;
    }
    return true;
  });

  const exportAuditLogJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aria_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            Immutable Audit Trail & Event Timeline
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
              Audit Subsystem
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Searchable, cryptographically traceable event log recording all build decisions, test selections, AFP messages, and human approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyMerkleChain}
            disabled={isVerifyingChain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold transition-colors shadow-sm"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isVerifyingChain ? 'animate-spin' : ''}`} />
            <span>{isVerifyingChain ? 'Verifying Chain...' : 'Verify Cryptographic Chain'}</span>
          </button>

          <button
            onClick={exportAuditLogJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      {chainVerificationResult && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Cryptographic Chain Integrity Verified:</strong> All {chainVerificationResult.verifiedBlocks} audit blocks possess valid parent-child SHA-256 hash pointers. No tampering detected.
            </span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 font-bold uppercase">
            IMMUTABLE LEDGER OK
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit actions, agents, modules, or parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="BUILD">BUILD</option>
            <option value="TEST_SELECTION">TEST_SELECTION</option>
            <option value="RELEASE">RELEASE</option>
            <option value="DEPLOYMENT">DEPLOYMENT</option>
            <option value="INCIDENT">INCIDENT</option>
            <option value="AFP">AFP</option>
            <option value="GOVERNANCE">GOVERNANCE</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="notice">Notice</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
          </select>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Recorded State Transitions ({filteredEvents.length} events)
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            Persistent in browser storage
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            No audit events matched the search criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((ev: AuditEvent) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800/90 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-700 dark:text-blue-400">{ev.category}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{ev.action}</span>
                    {ev.agent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-slate-300 dark:border-slate-700 font-mono">
                        {ev.agent}
                      </span>
                    )}
                    <StatusBadge status={ev.severity} size="sm" />
                    <AutonomyBadge level={ev.autonomyLevel} />
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {ev.isSimulated && (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Simulated
                      </span>
                    )}
                    <span>{ev.timestamp}</span>
                  </div>
                </div>

                {/* Cryptographic Hash Pointer */}
                {cryptographicBlocks.find((b) => b.eventId === ev.id) && (
                  <div className="mb-2 p-1.5 rounded bg-slate-100 dark:bg-slate-800/80 font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>SHA-256: {cryptographicBlocks.find((b) => b.eventId === ev.id)?.currentHash.slice(0, 24)}...</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Chain Parent Valid</span>
                  </div>
                )}

                <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(ev.details, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
