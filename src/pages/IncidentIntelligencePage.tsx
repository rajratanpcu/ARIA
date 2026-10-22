import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  FileText,
  Sparkles,
  Zap,
  Activity,
  Play,
  Square,
} from 'lucide-react';
import { useAria } from '../../context/AriaContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { telemetryStreamer, TelemetryDataPoint } from '../../services/telemetryStreamer';

export const IncidentIntelligencePage: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    setSelectedIncidentId,
    sendAfpIncidentSignal,
  } = useAria();

  const [feedbackFeedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [liveStreamEnabled, setLiveStreamEnabled] = useState<boolean>(true);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<TelemetryDataPoint | null>(null);

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  useEffect(() => {
    if (liveStreamEnabled) {
      telemetryStreamer.start(2500);
      const unsubscribe = telemetryStreamer.subscribe((point) => {
        setCurrentMetrics(point);
        if (point.logLine) {
          setLiveLogs((prev) => [point.logLine!, ...prev.slice(0, 19)]);
        }
      });
      return () => {
        unsubscribe();
        telemetryStreamer.stop();
      };
    } else {
      telemetryStreamer.stop();
    }
  }, [liveStreamEnabled]);

  const handleSendAfp = () => {
    const res = sendAfpIncidentSignal(selectedIncident.id);
    setFeedbackNotice(res.message);
    setTimeout(() => setFeedbackNotice(null), 8000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          Incident Intelligence & Root Cause Attribution
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
            IRA Subsystem
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Correlates runtime exception logs with mobile module codebases, evaluates root-cause hypotheses, and triggers AFP feedback.
        </p>
      </div>

      {/* Notice Message if AFP triggered */}
      {feedbackFeedbackNotice && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800 dark:bg-blue-950/80 dark:border-blue-800 dark:text-blue-200 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100">ARIA Feedback Protocol (AFP) Update</div>
            <p className="text-slate-700 dark:text-slate-300">{feedbackFeedbackNotice}</p>
          </div>
        </div>
      )}

      {/* 3 Incident Scenarios Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Select Incident Scenario to Investigate
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {incidents.map((inc) => {
            const isSelected = inc.id === selectedIncidentId;
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 dark:border-blue-600 dark:bg-slate-850 ring-1 ring-blue-500/30'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">{inc.id}</span>
                  <StatusBadge status={inc.severity} size="sm" />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-2">
                  {inc.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>c = {inc.iraConfidence.toFixed(2)}</span>
                  <span className="capitalize">{inc.scenarioType}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Investigation Workspace (2-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Incident Details, Hypotheses, Remediation (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                    {selectedIncident.id}
                  </span>
                  <StatusBadge status={selectedIncident.status} />
                  <StatusBadge status={selectedIncident.severity} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedIncident.title}
                </h2>
              </div>

              {/* AFP Dispatch Button */}
              <div>
                {selectedIncident.afpSignalSent ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    AFP Signal Dispatched
                  </span>
                ) : (
                  <button
                    onClick={handleSendAfp}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send AFP-INCIDENT Signal</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-sans">Affected Release</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedIncident.affectedRelease}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-sans">Implicated Modules</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  {selectedIncident.implicatedModules.map((m) => m.replace('mod-', '')).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-sans">IRA Confidence</span>
                <span
                  className={`font-bold ${
                    selectedIncident.iraConfidence >= 0.75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {(selectedIncident.iraConfidence * 100).toFixed(1)}% (Threshold: 75%)
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-sans">Detected Timestamp</span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px]">{selectedIncident.detectedAt}</span>
              </div>
            </div>

            {/* Root Cause Hypotheses */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              IRA Root-Cause Hypotheses & Evidence Chain
            </h3>

            <div className="space-y-3 mb-6">
              {selectedIncident.rootCauseHypotheses.map((hyp) => (
                <div
                  key={hyp.id}
                  className={`p-4 rounded-xl border ${
                    hyp.isPrimary
                      ? 'border-blue-500 bg-blue-50/50 dark:border-blue-600/70 dark:bg-slate-850 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {hyp.isPrimary && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-[10px] uppercase font-mono font-medium">
                          Primary Hypothesis
                        </span>
                      )}
                      {hyp.description}
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                      {(hyp.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono mb-1">
                      Supporting Correlated Evidence:
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400 text-[11px]">
                      {hyp.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Remediation Steps */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              Recommended Remediation & Policy Actions
            </h3>
            <div className="space-y-2 text-xs">
              {selectedIncident.suggestedRemediation.map((rem, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{rem}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Runtime Log Excerpts & Gating Rules (1 col) */}
        <div className="space-y-6">
          {/* AFP Gating Threshold Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              AFP Confidence Policy Gating
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Feedback updates are strictly rejected if IRA attribution confidence falls below 0.75:
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Confidence:</span>
                <span
                  className={
                    selectedIncident.iraConfidence >= 0.75
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-rose-600 dark:text-rose-400 font-bold'
                  }
                >
                  {selectedIncident.iraConfidence.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Gating Threshold:</span>
                <span className="text-slate-800 dark:text-slate-200">0.750</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Gating Decision:</span>
                <span
                  className={
                    selectedIncident.iraConfidence >= 0.75
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-amber-600 dark:text-amber-400 font-bold'
                  }
                >
                  {selectedIncident.iraConfidence >= 0.75 ? 'ELIGIBLE' : 'DEFERRED / REJECTED'}
                </span>
              </div>
            </div>
          </div>

          {/* Relevant Runtime Logs & Live Stream */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Runtime Telemetry Stream
              </h3>
              <button
                onClick={() => setLiveStreamEnabled((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors ${
                  liveStreamEnabled
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                {liveStreamEnabled ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{liveStreamEnabled ? 'Pause Live Stream' : 'Resume Live Stream'}</span>
              </button>
            </div>

            {currentMetrics && (
              <div className="grid grid-cols-3 gap-2 mb-3 p-2 rounded bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 font-mono text-[10px]">
                <div>
                  <span className="text-slate-400 block">HTTP 5xx Rate</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{currentMetrics.httpErrorRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">p95 Latency</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{currentMetrics.p95LatencyMs}ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Memory Load</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{currentMetrics.memoryPressurePercent}%</span>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Ingested from mobile clients and edge proxies:
            </p>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-2 overflow-x-auto max-h-96">
              {(liveLogs.length > 0 ? liveLogs : selectedIncident.relevantLogs).map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed p-1 rounded ${
                    log.includes('FATAL') || log.includes('CRITICAL')
                      ? 'text-rose-400 bg-rose-950/40'
                      : log.includes('WARN')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
