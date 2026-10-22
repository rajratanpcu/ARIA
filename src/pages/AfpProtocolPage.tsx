import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Zap,
  Calculator,
  Layers,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { useAria } from '../context/AriaContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  calculateIncidentWeightUpdate,
  calculateDecayedWeight,
  DEFAULT_AFP_PARAMS,
} from '../core/afpEngine';
import { afpSimulationEngine, HazardPoint } from '../services/afpSimulationEngine';
import type { Module, AFPMessage } from '../types';

export const AfpProtocolPage: React.FC = () => {
  const {
    modules,
    afpMessages,
    applyDecaySimulation,
    sendAfpIncidentSignal,
    subsequentCommitTestCount,
  } = useAria();

  // Interactive Calculator State
  const [calcCurrentWeight, setCalcCurrentWeight] = useState<number>(0.3);
  const [calcConfidence, setCalcConfidence] = useState<number>(0.87);
  const [calcAlpha, setCalcAlpha] = useState<number>(0.4);
  const [calcDecayDays, setCalcDecayDays] = useState<number>(7);
  const [simLambda, setSimLambda] = useState<number>(0.1);
  const simHorizon = 30;

  const calcResult = calculateIncidentWeightUpdate(calcCurrentWeight, calcConfidence, {
    ...DEFAULT_AFP_PARAMS,
    alpha: calcAlpha,
  });

  const calcDecayed = calculateDecayedWeight(calcResult.newWeight, calcDecayDays);

  const forecastPoints: HazardPoint[] = useMemo(() => {
    return afpSimulationEngine.generateDecayForecast({
      initialWeight: calcResult.newWeight,
      baselineWeight: 0.3,
      decayLambda: simLambda,
      alpha: calcAlpha,
      confidenceThreshold: 0.75,
      numIterations: 300,
      forecastHorizonDays: simHorizon,
    });
  }, [calcResult.newWeight, simLambda, calcAlpha, simHorizon]);

  const cartModule = modules.find((m: Module) => m.id === 'mod-checkout-cart');
  const isAfpActive = cartModule ? cartModule.currentRiskWeight > 0.3 : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          ARIA Feedback Protocol (AFP) Engine
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-mono font-medium">
            Core Protocol Subsystem
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Autonomous closed-loop feedback protocol that propagates runtime incident attribution back into build cache policies and test prioritization.
        </p>
      </div>

      {/* Protocol Architecture: 4 Message Types Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">AFP-INCIDENT</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-medium">
              IRA &rarr; BIA/COA
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Dispatches high-confidence attributable incident signal to update upstream module risk weights.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">AFP-ACK</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-medium">
              BIA/COA &rarr; IRA
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Acknowledges policy update, enforces strict cache invalidation, and adjusts CI test priority scores.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">AFP-DECAY</span>
            <span className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-medium">
              Orchestrator
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Exponentially decays accumulated risk back toward baseline (0.3) over incident-free elapsed days.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">AFP-AUDIT</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-medium">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Records all state transitions, formula parameters, confidence thresholds, and timestamps.
          </p>
        </div>
      </div>

      {/* Interactive AFP Mathematical Playground */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Interactive AFP Mathematical Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Experiment with confidence thresholds, update coefficients, and exponential decay rates.
            </p>
          </div>

          <button
            onClick={() => {
              setCalcCurrentWeight(0.3);
              setCalcConfidence(0.87);
              setCalcAlpha(0.4);
              setCalcDecayDays(7);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono font-medium"
          >
            Load Paper Defaults (c=0.87)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Current Weight */}
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
              Current Weight (w₀)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.3"
              max="1.0"
              value={calcCurrentWeight}
              onChange={(e) => setCalcCurrentWeight(parseFloat(e.target.value) || 0.3)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Attribution Confidence */}
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
              Confidence (c &ge; 0.75)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.0"
              max="1.0"
              value={calcConfidence}
              onChange={(e) => setCalcConfidence(parseFloat(e.target.value) || 0.0)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Update Coefficient Alpha */}
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
              Update Coefficient (&alpha;)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="1.0"
              value={calcAlpha}
              onChange={(e) => setCalcAlpha(parseFloat(e.target.value) || 0.4)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Elapsed Days for Decay */}
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
              Elapsed Days (t)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="60"
              value={calcDecayDays}
              onChange={(e) => setCalcDecayDays(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Calculated Results Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          {/* Incident Update Formula */}
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
              Formula: min(1.0, w₀ + c &bull; &alpha;)
            </span>
            <div className="text-lg font-mono font-bold mt-1">
              {calcResult.accepted ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {calcCurrentWeight} + ({calcConfidence} &times; {calcAlpha}) ={' '}
                  <span className="underline decoration-blue-500">{calcResult.newWeight}</span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400">Gated / Rejected: c &lt; 0.75</span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{calcResult.reason}</p>
          </div>

          {/* Exponential Decay Formula */}
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
              Decay Formula: w_baseline + (w - w_baseline) &bull; e^(-0.1 &bull; t)
            </span>
            <div className="text-lg font-mono font-bold mt-1 text-blue-700 dark:text-blue-300">
              After {calcDecayDays} days: {calcDecayed}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Excess risk decays back toward 0.300 baseline at &lambda; = 0.1/day.
            </p>
          </div>
        </div>

        {/* Simulation Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => sendAfpIncidentSignal('INC-7402')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Apply INC-7402 Update (0.3 &rarr; 0.648)</span>
          </button>

          <button
            onClick={() => applyDecaySimulation(7)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Simulate 7 Days of Decay</span>
          </button>

          <button
            onClick={() => applyDecaySimulation(30)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Simulate 30 Days of Decay</span>
          </button>
        </div>
      </div>

      {/* Real-Time Mathematical Decay & Hazard Forecast Curve */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Monte Carlo Decay Horizon & Escape Hazard Forecast
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Projects risk decay trajectories, CI test suite footprint, and regression escape probability over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">&lambda;:</span>
              <input
                type="range"
                min="0.02"
                max="0.25"
                step="0.01"
                value={simLambda}
                onChange={(e) => setSimLambda(parseFloat(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">{simLambda.toFixed(2)}/d</span>
            </div>
          </div>
        </div>

        {/* Visual Forecast Table / Stepped Curve */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2 px-3">Horizon</th>
                <th className="py-2 px-3">Expected Risk w(t)</th>
                <th className="py-2 px-3">95% Monte Carlo Band</th>
                <th className="py-2 px-3">Active CI Tests</th>
                <th className="py-2 px-3">Escape Hazard</th>
                <th className="py-2 px-3">Cache Invalidation Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {forecastPoints
                .filter((p) => [0, 1, 3, 7, 14, 21, 30].includes(p.day))
                .map((p) => {
                  const isElevated = p.expectedRisk > 0.4;
                  return (
                    <tr key={p.day} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {p.day === 0 ? 'Day 0 (Immediate)' : `Day ${p.day}`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold ${
                            isElevated
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {p.expectedRisk.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                        [{p.lowerConfidence95.toFixed(3)} - {p.upperConfidence95.toFixed(3)}]
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {p.testSuiteSize} tests
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            p.hazardRate < 0.25
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {p.hazardRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge
                          status={p.expectedRisk > 0.35 ? 'strict_invalidation' : 'standard'}
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upstream Closed Loop Demonstration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Upstream Closed-Loop Impact (Upstream CI & Build Cache)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Observe how downstream incident feedback automatically alters upstream developer commit actions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline State */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Baseline Commit (Pre-Feedback)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-mono">
                checkout-cart: 0.300
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Build Cache Policy:</span>
                <StatusBadge status="standard" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">CI Selected Tests:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">847 / 12,340 tests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cart Regression Suite:</span>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Pruned (Skipped)</span>
              </div>
            </div>
          </div>

          {/* Elevated State */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isAfpActive
                ? 'bg-blue-50/70 border-blue-500 dark:bg-slate-850 dark:border-blue-600 ring-1 ring-blue-500/30'
                : 'bg-slate-50/50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-blue-800 dark:text-blue-300">
                Subsequent Commit (Post-AFP Feedback)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 font-mono font-bold">
                checkout-cart: {cartModule ? cartModule.currentRiskWeight.toFixed(3) : '0.648'}
              </span>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Build Cache Policy:</span>
                <StatusBadge status="strict_invalidation" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">CI Selected Tests:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {subsequentCommitTestCount} / 12,340 tests (+487 tests)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cart Regression Suite:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Mandatory Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AFP Message Dispatch Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
          AFP Protocol Message History ({afpMessages.length} Messages)
        </h3>

        {afpMessages.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">
            No AFP messages dispatched yet. Trigger an AFP signal above or via Incident Intelligence.
          </div>
        ) : (
          <div className="space-y-2.5">
            {afpMessages.map((msg: AFPMessage) => (
              <div
                key={msg.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{msg.type}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {msg.sender} &rarr; {msg.recipients.join(', ')}
                    </span>
                    <StatusBadge status={msg.status} size="sm" />
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    Module <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{msg.moduleName}</span>{' '}
                    (c={msg.confidence}): {msg.formulaApplied}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  {msg.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
