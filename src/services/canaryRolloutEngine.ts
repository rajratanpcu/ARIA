// DCA (Deployment Coordination Agent) Canary Rollout Engine
// Simulates progressive cohort traffic routing (2% -> 10% -> 50% -> 100%), automated hold logic, and circuit breaker policies

export interface CanaryCohortState {
  stagePct: 2 | 10 | 50 | 100;
  targetActiveUsers: number;
  httpErrorRatePct: number;
  crashRatePct: number;
  p95LatencyMs: number;
  status: 'healthy' | 'warning' | 'critical' | 'pending';
  canaryGatePassed: boolean;
  gateViolations: string[];
}

export interface CanaryProgressionPolicy {
  maxHttpErrorRatePct: number; // default: 3.0%
  maxCrashRatePct: number;     // default: 0.3%
  maxP95LatencyMs: number;     // default: 350ms
  minCohortEvaluationSeconds: number;
}

export const DEFAULT_CANARY_POLICY: CanaryProgressionPolicy = {
  maxHttpErrorRatePct: 3.0,
  maxCrashRatePct: 0.3,
  maxP95LatencyMs: 350,
  minCohortEvaluationSeconds: 60,
};

export class CanaryRolloutEngine {
  /**
   * Evaluates cohort telemetry against DCA progression policy rules
   */
  public evaluateCohort(
    stagePct: 2 | 10 | 50 | 100,
    httpErrorRate: number,
    crashRate: number,
    p95Latency: number,
    policy: CanaryProgressionPolicy = DEFAULT_CANARY_POLICY
  ): CanaryCohortState {
    const violations: string[] = [];

    if (httpErrorRate > policy.maxHttpErrorRatePct) {
      violations.push(`HTTP 5xx rate (${httpErrorRate}%) exceeded policy ceiling (${policy.maxHttpErrorRatePct}%).`);
    }

    if (crashRate > policy.maxCrashRatePct) {
      violations.push(`Client crash rate (${crashRate}%) exceeded SLA threshold (${policy.maxCrashRatePct}%).`);
    }

    if (p95Latency > policy.maxP95LatencyMs) {
      violations.push(`p95 latency (${p95Latency}ms) breached target boundary (${policy.maxP95LatencyMs}ms).`);
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (violations.length > 0) {
      status = httpErrorRate >= 5.0 || crashRate >= 0.5 ? 'critical' : 'warning';
    }

    const targetUsersMap = { 2: 45000, 10: 220000, 50: 1100000, 100: 2500000 };

    return {
      stagePct,
      targetActiveUsers: targetUsersMap[stagePct],
      httpErrorRatePct: httpErrorRate,
      crashRatePct: crashRate,
      p95LatencyMs: p95Latency,
      status,
      canaryGatePassed: violations.length === 0,
      gateViolations: violations,
    };
  }

  /**
   * Evaluates whether DCA can autonomously advance or must hold/trigger Level 4
   */
  public checkCanaryGate(currentCohort: CanaryCohortState): {
    canAdvance: boolean;
    recommendation: 'CONTINUE' | 'HOLD_EVALUATING' | 'CIRCUIT_BREAKER_HALT' | 'REQUIRE_LEVEL4_ROLLBACK';
    reason: string;
  } {
    if (currentCohort.canaryGatePassed) {
      return {
        canAdvance: true,
        recommendation: 'CONTINUE',
        reason: 'All DCA canary telemetry metrics within bounds. Autonomous stage progression permitted.',
      };
    }

    if (currentCohort.status === 'critical') {
      return {
        canAdvance: false,
        recommendation: 'REQUIRE_LEVEL4_ROLLBACK',
        reason: `Critical SLA breach detected at ${currentCohort.stagePct}% stage. Automatic hold enforced. Human Level 4 rollback required.`,
      };
    }

    return {
      canAdvance: false,
      recommendation: 'HOLD_EVALUATING',
      reason: 'Warning threshold breached. Rollout paused pending metric stabilization.',
    };
  }
}

export const canaryRolloutEngine = new CanaryRolloutEngine();
