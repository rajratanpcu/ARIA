// ARIA Feedback Protocol (AFP) Core Engine
// Implements mathematical model, confidence gating, decay, and policy governance
// From research paper: "ARIA: An Agentic Release Intelligence Architecture for Autonomous End-to-End Mobile DevOps"

import type { AFPMessage, Module, TestCase, Approval } from '../types/index.ts';

export interface AFPParameters {
  baselineRiskWeight: number; // 0.3 default
  confidenceThreshold: number; // 0.75 default
  alpha: number; // 0.4 default
  maxWeight: number; // 1.0 default
  lambda: number; // 0.1 per day default
}

export const DEFAULT_AFP_PARAMS: AFPParameters = {
  baselineRiskWeight: 0.3,
  confidenceThreshold: 0.75,
  alpha: 0.4,
  maxWeight: 1.0,
  lambda: 0.1, // per day
};

export interface ProcessIncidentResult {
  accepted: boolean;
  reason: string;
  implicatedModuleId?: string;
  previousWeight?: number;
  newWeight?: number;
  deltaWeight?: number;
  formula?: string;
  message?: AFPMessage;
  recommendedCachePolicy?: 'standard' | 'strict_invalidation' | 'bypass';
}

/**
 * Validates confidence against threshold and computes updated risk weight.
 * Formula: newWeight = min(maxWeight, currentWeight + confidence * alpha)
 */
export function calculateIncidentWeightUpdate(
  currentWeight: number,
  confidence: number,
  params: AFPParameters = DEFAULT_AFP_PARAMS
): { newWeight: number; accepted: boolean; reason: string } {
  // Confidence boundary check
  if (confidence < 0 || confidence > 1) {
    return {
      newWeight: currentWeight,
      accepted: false,
      reason: `Invalid confidence value ${confidence}. Must be between 0.0 and 1.0.`,
    };
  }

  // Confidence gating threshold
  if (confidence < params.confidenceThreshold) {
    return {
      newWeight: currentWeight,
      accepted: false,
      reason: `Confidence ${confidence.toFixed(3)} is below threshold ${params.confidenceThreshold}. AFP signal deferred or rejected.`,
    };
  }

  const rawDelta = confidence * params.alpha;
  const target = currentWeight + rawDelta;
  const newWeight = Number(Math.min(params.maxWeight, target).toFixed(4));

  return {
    newWeight,
    accepted: true,
    reason: `Confidence ${confidence.toFixed(3)} >= ${params.confidenceThreshold}. Updated using min(${params.maxWeight}, ${currentWeight} + ${confidence} * ${params.alpha})`,
  };
}

/**
 * Calculates exponential decay of accumulated excess risk back toward baseline.
 * Formula: newWeight = baseline + (currentWeight - baseline) * exp(-lambda * elapsedDays)
 */
export function calculateDecayedWeight(
  currentWeight: number,
  elapsedDays: number,
  params: AFPParameters = DEFAULT_AFP_PARAMS
): number {
  if (elapsedDays <= 0) return currentWeight;
  if (currentWeight <= params.baselineRiskWeight) return params.baselineRiskWeight;

  const excess = currentWeight - params.baselineRiskWeight;
  const decayedExcess = excess * Math.exp(-params.lambda * elapsedDays);
  const newWeight = params.baselineRiskWeight + decayedExcess;

  return Number(Math.max(params.baselineRiskWeight, Math.min(params.maxWeight, newWeight)).toFixed(4));
}

/**
 * Prioritizes tests based on module risk weight, failure rate, and execution cost.
 * When module risk increases, test priority scores increase, selecting more regression tests.
 */
export function calculateTestPriority(
  test: TestCase,
  moduleRiskWeight: number
): { priorityScore: number; selected: boolean; selectionReason: string } {
  // Normalization: cost penalty (normalized over 10,000ms max)
  const normalizedCost = Math.min(1.0, test.executionCostMs / 10000);
  const costBonus = 1.0 - normalizedCost; // Cheaper tests get higher bonus

  // Weight combination: Risk (50%) + Failure Rate (30%) + Cost Efficiency (20%)
  const priorityScore = Number(
    (
      moduleRiskWeight * 0.50 +
      test.historicalFailureRate * 0.30 +
      costBonus * 0.20
    ).toFixed(4)
  );

  // Dynamic selection criteria
  // If module risk is elevated (> 0.5), threshold drops to 0.35 (selects regression suites)
  const dynamicThreshold = moduleRiskWeight >= 0.5 ? 0.35 : 0.45;
  const selected = priorityScore >= dynamicThreshold || test.type === 'regression' && moduleRiskWeight > 0.6;

  let selectionReason = 'Standard test selection';
  if (selected) {
    if (moduleRiskWeight > 0.5) {
      selectionReason = `High module risk (${moduleRiskWeight.toFixed(3)}) elevated test priority for ${test.moduleName}`;
    } else if (test.historicalFailureRate > 0.1) {
      selectionReason = `Selected due to historical failure rate (${(test.historicalFailureRate * 100).toFixed(1)}%)`;
    } else {
      selectionReason = `Baseline regression coverage`;
    }
  } else {
    selectionReason = `Pruned to optimize CI duration; low module risk (${moduleRiskWeight.toFixed(2)})`;
  }

  return { priorityScore, selected, selectionReason };
}

/**
 * Checks whether an action requires Level 4 Human Approval.
 * Level 4 actions must never execute autonomously.
 */
export function requiresHumanApproval(actionType: Approval['actionType']): boolean {
  const level4Actions = [
    'RELEASE_HOLD',
    'BROAD_CACHE_INVALIDATION',
    'ROLLBACK',
    'POLICY_CHANGE',
  ];
  return level4Actions.includes(actionType);
}

/**
 * Simulates the CI selection comparison between baseline suite and AFP-elevated suite.
 */
export function compareTestSuites(
  allTests: TestCase[],
  modules: Module[]
) {
  const moduleMap = new Map(modules.map(m => [m.id, m]));

  let selectedCount = 0;
  let totalCostMs = 0;
  let totalSelectedCostMs = 0;
  let riskAccumulator = 0;

  for (const test of allTests) {
    const mod = moduleMap.get(test.moduleId);
    const risk = mod ? mod.currentRiskWeight : 0.3;
    const { priorityScore, selected } = calculateTestPriority(test, risk);
    totalCostMs += test.executionCostMs;
    if (selected) {
      selectedCount++;
      totalSelectedCostMs += test.executionCostMs;
      riskAccumulator += priorityScore;
    }
  }

  const selectionRatio = selectedCount / allTests.length;
  const estimatedDurationMinutes = Number((totalSelectedCostMs / 60000).toFixed(1));
  const fullSuiteDurationMinutes = Number((totalCostMs / 60000).toFixed(1));

  // Model estimates
  const riskCoveragePct = Number((Math.min(99.4, 65 + selectionRatio * 40)).toFixed(1));
  const predictedDefectDetectionPct = Number((Math.min(98.8, 70 + selectionRatio * 32)).toFixed(1));

  return {
    totalTests: allTests.length,
    selectedTests: selectedCount,
    reductionPct: Number(((1 - selectedCount / allTests.length) * 100).toFixed(1)),
    estimatedDurationMinutes,
    fullSuiteDurationMinutes,
    riskCoveragePct,
    predictedDefectDetectionPct,
  };
}
