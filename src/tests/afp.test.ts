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
import { afpSimulationEngine } from '../services/afpSimulationEngine.ts';
import { ciTestRunnerSimulator } from '../services/ciTestRunnerSimulator.ts';
import { cryptographicAuditEngine } from '../services/cryptographicAuditEngine.ts';
import { canaryRolloutEngine } from '../services/canaryRolloutEngine.ts';
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

test('AFP Simulation Engine: Generates accurate decay curve and Monte Carlo bounds', () => {
  const points = afpSimulationEngine.generateDecayForecast({
    initialWeight: 0.648,
    baselineWeight: 0.3,
    decayLambda: 0.1,
    alpha: 0.4,
    confidenceThreshold: 0.75,
    numIterations: 200,
    forecastHorizonDays: 14,
  });

  assert.strictEqual(points.length, 15); // Days 0..14
  assert.strictEqual(points[0].day, 0);
  assert.strictEqual(points[0].expectedRisk, 0.648);
  assert.strictEqual(points[0].testSuiteSize, 1334); // Expanded suite at Day 0

  // Day 14 should have decayed toward baseline
  const day14 = points[14];
  assert.ok(day14.expectedRisk < 0.648);
  assert.ok(day14.expectedRisk > 0.3);
  assert.ok(day14.testSuiteSize < 1334);
  assert.ok(day14.testSuiteSize >= 847);
  assert.ok(day14.lowerConfidence95 <= day14.expectedRisk);
  assert.ok(day14.upperConfidence95 >= day14.expectedRisk);
});

test('CI Test Runner Simulator: Simulates test execution and detects elevated regression failures', () => {
  const sampleTests = [
    {
      id: 'test-1',
      name: 'test_checkout_cart_stale_cache_sync',
      moduleName: 'checkout-cart',
      selected: true,
      executionCostMs: 2200,
      historicalFailureRate: 0.08,
    },
    {
      id: 'test-2',
      name: 'test_user_auth_token_refresh',
      moduleName: 'user-auth',
      selected: true,
      executionCostMs: 1400,
      historicalFailureRate: 0.01,
    },
    {
      id: 'test-3',
      name: 'test_analytics_buffer_pruned',
      moduleName: 'analytics-sdk',
      selected: false,
      executionCostMs: 3100,
      historicalFailureRate: 0.02,
    },
  ];

  // Baseline mode (isAfpElevated = false): All selected tests pass
  const baselineRun = ciTestRunnerSimulator.executeSelectedTests(sampleTests, false);
  assert.strictEqual(baselineRun.totalExecuted, 2);
  assert.strictEqual(baselineRun.passedCount, 2);
  assert.strictEqual(baselineRun.failedCount, 0);

  // Elevated mode (isAfpElevated = true): Catches stale cache defect
  const elevatedRun = ciTestRunnerSimulator.executeSelectedTests(sampleTests, true);
  assert.strictEqual(elevatedRun.totalExecuted, 2);
  assert.strictEqual(elevatedRun.failedCount, 1);
  const failedTest = elevatedRun.results.find((r) => r.status === 'failed');
  assert.ok(failedTest);
  assert.match(failedTest.failureMessage!, /CartItemState schema v14/i);
});

test('Cryptographic Audit Engine: Validates SHA-256 hash chaining and detects tampering', () => {
  const events = [
    { id: 'ev-1', timestamp: '2026-10-22T10:00:00Z', action: 'BUILD_TRIGGER', details: { commit: '7a9e4f2' } },
    { id: 'ev-2', timestamp: '2026-10-22T10:05:00Z', action: 'TEST_SELECT', details: { testsCount: 847 } },
    { id: 'ev-3', timestamp: '2026-10-22T10:10:00Z', action: 'AFP_UPDATE', details: { newWeight: 0.648 } },
  ];

  const ledger = cryptographicAuditEngine.buildLedger(events);
  assert.strictEqual(ledger.length, 3);
  assert.strictEqual(ledger[0].previousHash, '0000000000000000000000000000000000000000000000000000000000000000');
  assert.strictEqual(ledger[1].previousHash, ledger[0].currentHash);
  assert.strictEqual(ledger[2].previousHash, ledger[1].currentHash);

  // Verification succeeds on untampered chain
  const ver = cryptographicAuditEngine.verifyChainIntegrity(ledger);
  assert.strictEqual(ver.valid, true);
  assert.strictEqual(ver.verifiedBlocks, 3);

  // Tampering detection: modify middle block's previousHash
  const tamperedLedger = [...ledger];
  tamperedLedger[1] = { ...tamperedLedger[1], previousHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' };
  const tamperedVer = cryptographicAuditEngine.verifyChainIntegrity(tamperedLedger);
  assert.strictEqual(tamperedVer.valid, false);
  assert.strictEqual(tamperedVer.tamperedIndex, 1);
});

test('Cryptographic Audit Engine: Level 4 dual-key cryptographic authorization signature', () => {
  const auth = cryptographicAuditEngine.generateDualKeyAuthorization(
    'appr-01',
    'ROLLBACK',
    'Authorized rollback after 7.8% 5xx spike'
  );

  assert.strictEqual(auth.approvalId, 'appr-01');
  assert.strictEqual(auth.policyCompliant, true);
  assert.strictEqual(auth.primarySigner.identity, 'raj.ratan@aria.corp');
  assert.strictEqual(auth.secondarySigner.role, 'Autonomous Governance Agent');
  assert.ok(auth.signatureChainHash.length > 20);
});

test('Canary Rollout Engine: Evaluates healthy and anomalous cohort thresholds', () => {
  // Stage 10%: Healthy telemetry (HTTP error 1.1%, crash 0.05%) -> Gate Passes
  const healthyCohort = canaryRolloutEngine.evaluateCohort(10, 1.1, 0.05, 142);
  assert.strictEqual(healthyCohort.status, 'healthy');
  assert.strictEqual(healthyCohort.canaryGatePassed, true);
  assert.strictEqual(healthyCohort.gateViolations.length, 0);

  const healthyGate = canaryRolloutEngine.checkCanaryGate(healthyCohort);
  assert.strictEqual(healthyGate.canAdvance, true);
  assert.strictEqual(healthyGate.recommendation, 'CONTINUE');

  // Stage 50%: Spiked telemetry (HTTP error 7.8%) -> Critical breach, Hold enforced
  const anomalousCohort = canaryRolloutEngine.evaluateCohort(50, 7.8, 0.42, 510);
  assert.strictEqual(anomalousCohort.status, 'critical');
  assert.strictEqual(anomalousCohort.canaryGatePassed, false);
  assert.ok(anomalousCohort.gateViolations.length >= 2);

  const anomalyGate = canaryRolloutEngine.checkCanaryGate(anomalousCohort);
  assert.strictEqual(anomalyGate.canAdvance, false);
  assert.strictEqual(anomalyGate.recommendation, 'REQUIRE_LEVEL4_ROLLBACK');
});





