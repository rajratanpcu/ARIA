// ARIA — Core TypeScript Type Definitions
// Based on: "ARIA: An Agentic Release Intelligence Architecture for Autonomous End-to-End Mobile DevOps"

export type AutonomyLevel = 1 | 2 | 3 | 4;

export interface AutonomyInfo {
  level: AutonomyLevel;
  name: string;
  description: string;
  requiresHumanApproval: boolean;
}

export const AUTONOMY_LEVELS: Record<AutonomyLevel, AutonomyInfo> = {
  1: { level: 1, name: 'Level 1 — Observe', description: 'Autonomous read-only telemetry and log inspection.', requiresHumanApproval: false },
  2: { level: 2, name: 'Level 2 — Recommend', description: 'Autonomous analysis presenting recommendations for operator review.', requiresHumanApproval: false },
  3: { level: 3, name: 'Level 3 — Act within Bounds', description: 'Autonomous execution of policy-limited AFP weight updates and notifications.', requiresHumanApproval: false },
  4: { level: 4, name: 'Level 4 — Require Approval', description: 'High-impact actions requiring explicit human authorization (rollbacks, broad cache invalidation, release holds).', requiresHumanApproval: true },
};

export interface Project {
  id: string;
  name: string;
  repo: string;
  branch: string;
  targetPlatform: 'iOS' | 'Android' | 'Cross-Platform';
  modulesCount: number;
  totalTests: number;
}

export interface Module {
  id: string;
  name: string;
  path: string;
  language: string;
  linesOfCode: number;
  dependencies: string[]; // dependent module IDs
  currentRiskWeight: number; // 0.0 - 1.0 (baseline 0.3)
  baselineRiskWeight: number; // 0.3
  lastUpdated: string;
  testCount: number;
  failureRate: number; // e.g. 0.03
  cacheStatus: 'hit' | 'stale' | 'invalidated' | 'miss';
  cachePolicy: 'standard' | 'strict_invalidation' | 'bypass';
}

export interface Commit {
  id: string;
  hash: string;
  author: string;
  message: string;
  timestamp: string;
  changedModules: string[]; // Module IDs
  diffStat: { additions: number; deletions: number; filesChanged: number };
}

export interface Build {
  id: string;
  commitId: string;
  buildNumber: number;
  status: 'success' | 'failed' | 'in_progress' | 'cancelled';
  riskScore: number; // 0.0 - 1.0
  cacheHits: number;
  cacheMisses: number;
  durationSeconds: number;
  timestamp: string;
  biaRecommendation: string;
  biaConfidence: number;
  affectedModules: string[];
}

export interface TestCase {
  id: string;
  name: string;
  moduleId: string;
  moduleName: string;
  type: 'unit' | 'integration' | 'ui-e2e' | 'regression';
  executionCostMs: number;
  historicalFailureRate: number; // 0.0 - 1.0
  riskScore: number; // 0.0 - 1.0
  selected: boolean;
  selectionReason: string;
  priorityScore: number; // Combined prioritization score
}

export interface TestRun {
  id: string;
  buildId: string;
  totalSuiteCount: number;
  selectedTestCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  estimatedDurationMs: number;
  actualDurationMs: number;
  riskCoveragePct: number;
  predictedDefectDetectionPct: number; // Model estimate
  timestamp: string;
}

export interface ReleaseCandidate {
  id: string;
  version: string;
  buildId: string;
  channel: 'internal' | 'beta' | 'production';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'released';
  artifactUrl: string;
  artifactSizeMb: number;
  signingStatus: 'simulated_ready' | 'pending' | 'unsigned'; // Honest disclaimer
  checklist: {
    securityScanPassed: boolean;
    regressionTestsPassed: boolean;
    complianceApproved: boolean;
    crashFreeThresholdMet: boolean;
  };
  createdAt: string;
  approvedBy?: string;
}

export type RolloutStage = 2 | 10 | 50 | 100;

export interface Deployment {
  id: string;
  releaseId: string;
  version: string;
  status: 'idle' | 'in_progress' | 'paused' | 'completed' | 'rolled_back';
  currentStage: RolloutStage;
  targetStage: RolloutStage;
  stagedHealth: Record<RolloutStage, {
    activeUsers: number;
    crashRatePct: number;
    httpErrorRatePct: number;
    p95LatencyMs: number;
    status: 'healthy' | 'warning' | 'critical';
  }>;
  startTime: string;
  lastStageAdvancedAt: string;
  dcaRecommendation: 'advance' | 'hold' | 'pause' | 'rollback';
}

export interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detecting' | 'triaged' | 'mitigating' | 'resolved' | 'closed';
  detectedAt: string;
  resolvedAt?: string;
  affectedRelease: string;
  affectedDeploymentId: string;
  implicatedModules: string[];
  iraConfidence: number; // e.g. 0.87
  rootCauseHypotheses: Array<{
    id: string;
    description: string;
    confidence: number;
    evidence: string[];
    isPrimary: boolean;
  }>;
  relevantLogs: string[];
  suggestedRemediation: string[];
  afpSignalSent: boolean;
  scenarioType: 'stale-cache' | 'missing-regression' | 'external-service';
}

export type AgentRole = 'BIA' | 'COA' | 'RCA' | 'DCA' | 'IRA';

export interface Agent {
  id: AgentRole;
  name: string;
  fullName: string;
  lifecycleStage: string;
  status: 'idle' | 'analyzing' | 'recommending' | 'executing' | 'error';
  responsibility: string;
  lastAction: string;
  lastActionTimestamp: string;
  confidence: number;
  activityHistory: Array<{
    timestamp: string;
    action: string;
    details: string;
    confidence: number;
    level: AutonomyLevel;
  }>;
}

export type AFPMessageType = 'AFP-INCIDENT' | 'AFP-ACK' | 'AFP-DECAY' | 'AFP-AUDIT';

export interface AFPMessage {
  id: string;
  type: AFPMessageType;
  timestamp: string;
  sender: AgentRole | 'AFP-ORCHESTRATOR' | 'HUMAN-OPERATOR';
  recipients: (AgentRole | 'AFP-ORCHESTRATOR')[];
  incidentId?: string;
  implicatedModuleId: string;
  moduleName: string;
  confidence: number;
  previousWeight: number;
  newWeight: number;
  deltaWeight: number;
  formulaApplied: string;
  status: 'dispatched' | 'acknowledged' | 'deferred' | 'rejected';
  rejectionReason?: string;
  auditRecorded: boolean;
}

export interface ModuleRisk {
  moduleId: string;
  moduleName: string;
  currentWeight: number;
  baselineWeight: number;
  peakWeight: number;
  lastIncidentDate?: string;
  incidentCount: number;
  history: Array<{
    timestamp: string;
    weight: number;
    reason: string;
  }>;
}

export interface Approval {
  id: string;
  title: string;
  actionType: 'RELEASE_HOLD' | 'BROAD_CACHE_INVALIDATION' | 'ROLLBACK' | 'POLICY_CHANGE';
  requestedBy: AgentRole;
  requestedAt: string;
  rationale: string;
  confidence: number;
  autonomyLevel: 4; // Always Level 4
  status: 'pending' | 'approved' | 'rejected';
  resolvedAt?: string;
  resolvedBy?: string;
  reviewerNotes?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: 'BUILD' | 'TEST_SELECTION' | 'RELEASE' | 'DEPLOYMENT' | 'INCIDENT' | 'AFP' | 'GOVERNANCE';
  action: string;
  agent?: AgentRole;
  user?: string;
  severity: 'info' | 'notice' | 'warning' | 'alert';
  autonomyLevel: AutonomyLevel;
  details: Record<string, any>;
  isSimulated: boolean;
}

export interface DemoStep {
  step: number;
  title: string;
  agent: AgentRole | 'SYSTEM';
  description: string;
  metricHighlight: string;
  explanation: string;
  status: 'upcoming' | 'current' | 'completed';
}
