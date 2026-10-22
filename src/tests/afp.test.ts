// ARIA Feedback Protocol (AFP) Unit Tests
// Tests the mathematical model, confidence thresholds, decay, and governance rules.

import test from 'node:test';
import assert from 'node:assert';
import {
  calculateIncidentWeightUpdate,
  calculateDecayedWeight,
  calculateTestPriority,
  requiresHumanApproval,
} from '../core/afpEngine.ts';
import { aiHypothesisEngine } from '../services/aiHypothesisEngine.ts';
import type { TestCase } from '../types/index.ts';

test('AFP Gating: Rejects confidence below threshold (0.75)', () => {
  const resultLow = calculateIncidentWeightUpdate(0.3, 0.72);
  assert.strictEqual(resultLow.accepted, false);
  assert.strictEqual(resultLow.newWeight, 0.3);
  assert.match(resultLow.reason, /below threshold/i);

  const resultNegative = calculateIncidentWeightUpdate(0.3, -0.1);
  assert.strictEqual(resultNegative.accepted, false);
  assert.strictEqual(resultNegative.newWeight, 0.3);

  const resultTooHigh = calculateIncidentWeightUpdate(0.3, 1.2);
  assert.strictEqual(resultTooHigh.accepted, false);
});

test('AFP Weight Update: Reproduces research paper exact values (0.3 + 0.87 * 0.4 = 0.648)', () => {
  const currentWeight = 0.3;
  const confidence = 0.87;
  const result = calculateIncidentWeightUpdate(currentWeight, confidence);

  assert.strictEqual(result.accepted, true);
  assert.strictEqual(result.newWeight, 0.648);
});

test('AFP Bound: Caps weight at maximum 1.0', () => {
  const currentWeight = 0.9;
  const confidence = 0.95; // 0.9 + 0.95 * 0.4 = 1.28 -> should cap at 1.0
  const result = calculateIncidentWeightUpdate(currentWeight, confidence);

  assert.strictEqual(result.accepted, true);
  assert.strictEqual(result.newWeight, 1.0);
});

test('AFP Decay: Decays accumulated risk exponentially toward baseline 0.3', () => {
  const currentWeight = 0.648;
  const baseline = 0.3;
  const lambda = 0.1;

  // Day 0: No decay
  const day0 = calculateDecayedWeight(currentWeight, 0);
  assert.strictEqual(day0, 0.648);

  // Day 7: Excess should decay by exp(-0.7) approx 0.4965
  // excess = 0.348 * 0.49658 = 0.1728 -> new weight approx 0.4728
  const day7 = calculateDecayedWeight(currentWeight, 7);
  assert.ok(day7 < 0.648);
  assert.ok(day7 > baseline);
  const expectedDay7 = Number((baseline + (0.648 - baseline) * Math.exp(-lambda * 7)).toFixed(4));
  assert.strictEqual(day7, expectedDay7);

  // Day 60: Long term should asymptote to baseline 0.3
  const day60 = calculateDecayedWeight(currentWeight, 60);
  assert.ok(day60 <= 0.301);
  assert.ok(day60 >= baseline);
});

test('AFP Test Prioritization: Elevated module risk increases test selection and priority score', () => {
  const mockTest: TestCase = {
    id: 'test-cart-regression-01',
    name: 'test_checkout_cart_stale_cache_sync',
    moduleId: 'mod-checkout-cart',
    moduleName: 'checkout-cart',
    type: 'regression',
    executionCostMs: 4500,
    historicalFailureRate: 0.05,
    riskScore: 0.3,
    selected: false,
    selectionReason: '',
    priorityScore: 0,
  };

  // Baseline risk 0.3
  const baselineSelection = calculateTestPriority(mockTest, 0.3);

  // Elevated risk 0.648 after AFP feedback
  const elevatedSelection = calculateTestPriority(mockTest, 0.648);

  assert.ok(elevatedSelection.priorityScore > baselineSelection.priorityScore);
  assert.strictEqual(elevatedSelection.selected, true);
  assert.match(elevatedSelection.selectionReason, /High module risk/i);
});

test('Governance: Level 4 actions strictly require human authorization', () => {
  assert.strictEqual(requiresHumanApproval('ROLLBACK'), true);
  assert.strictEqual(requiresHumanApproval('BROAD_CACHE_INVALIDATION'), true);
  assert.strictEqual(requiresHumanApproval('RELEASE_HOLD'), true);
  assert.strictEqual(requiresHumanApproval('POLICY_CHANGE'), true);
});

test('AI Hypothesis Engine: Evaluates INC-7402 log traces with confidence >= 0.75', () => {
  const sampleLogs = [
    '[FATAL] [checkout-cart] DeserializationError: missing field couponMetadata in CartItemState',
    '[ERROR] [checkout-cart] CartPersistenceWorker: corrupted parcel schema detected'
  ];

  const analysis = aiHypothesisEngine.evaluateIncident('INC-7402', sampleLogs);
  assert.strictEqual(analysis.incidentId, 'INC-7402');
  assert.strictEqual(analysis.implicatedModule, 'checkout-cart');
  assert.strictEqual(analysis.gatingDecision, 'ELIGIBLE');
  assert.ok(analysis.primaryConfidence >= 0.75);
  assert.strictEqual(analysis.hypotheses.length, 2);
  assert.strictEqual(analysis.hypotheses[0].isPrimary, true);
  assert.ok(analysis.hypotheses[0].confidence >= 0.85);
});

