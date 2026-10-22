// ARIA Global State Management & React Context
// Manages local state, localStorage persistence, AFP protocol propagation, and demo scenario replay.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Project,
  Module,
  Commit,
  Build,
  TestCase,
  ReleaseCandidate,
  Deployment,
  Incident,
  Agent,
  Approval,
  AuditEvent,
  AFPMessage,
} from '../types';
import {
  SEED_PROJECT,
  INITIAL_MODULES,
  INITIAL_COMMITS,
  INITIAL_BUILDS,
  INITIAL_TEST_CASES,
  INITIAL_RELEASE,
  INITIAL_DEPLOYMENT,
  INITIAL_INCIDENTS,
  INITIAL_AGENTS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_EVENTS,
} from '../data/seedData';
import {
  calculateIncidentWeightUpdate,
  calculateDecayedWeight,
  calculateTestPriority,
} from '../core/afpEngine';

export type ThemeMode = 'dark' | 'light';

interface AriaContextType {
  project: Project;
  modules: Module[];
  commits: Commit[];
  builds: Build[];
  tests: TestCase[];
  release: ReleaseCandidate;
  deployment: Deployment;
  incidents: Incident[];
  agents: Agent[];
  approvals: Approval[];
  auditEvents: AuditEvent[];
  afpMessages: AFPMessage[];
  selectedIncidentId: string;
  selectedCommitId: string;
  subsequentCommitTestCount: number;
  isDemoActive: boolean;
  demoStep: number;
  theme: ThemeMode;
  // Actions
  setSelectedIncidentId: (id: string) => void;
  setSelectedCommitId: (id: string) => void;
  sendAfpIncidentSignal: (incidentId: string) => { success: boolean; message: string };
  applyDecaySimulation: (days: number) => void;
  resolveApproval: (approvalId: string, decision: 'approved' | 'rejected', reviewerNotes?: string) => void;
  advanceRolloutStage: () => void;
  pauseRollout: () => void;
  triggerRollbackRequest: () => void;
  setDemoStep: (step: number) => void;
  setIsDemoActive: (active: boolean) => void;
  runNextDemoStep: () => void;
  resetToDefault: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = 'aria_mobile_devops_state_v1';

const AriaContext = createContext<AriaContextType | undefined>(undefined);

export const AriaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [project] = useState<Project>(SEED_PROJECT);
  const [modules, setModules] = useState<Module[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_modules`);
    return saved ? JSON.parse(saved) : INITIAL_MODULES;
  });

  const [commits] = useState<Commit[]>(INITIAL_COMMITS);
  const [builds, setBuilds] = useState<Build[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_builds`);
    return saved ? JSON.parse(saved) : INITIAL_BUILDS;
  });

  const [tests, setTests] = useState<TestCase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tests`);
    return saved ? JSON.parse(saved) : INITIAL_TEST_CASES;
  });

  const [release, setRelease] = useState<ReleaseCandidate>(INITIAL_RELEASE);
  const [deployment, setDeployment] = useState<Deployment>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deployment`);
    return saved ? JSON.parse(saved) : INITIAL_DEPLOYMENT;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_incidents`);
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_agents`);
    return saved ? JSON.parse(saved) : INITIAL_AGENTS;
  });

  const [approvals, setApprovals] = useState<Approval[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_approvals`);
    return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
  });

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_EVENTS;
  });

  const [afpMessages, setAfpMessages] = useState<AFPMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_afp_messages`);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-7402');
  const [selectedCommitId, setSelectedCommitId] = useState<string>('commit-c321');
  const [subsequentCommitTestCount, setSubsequentCommitTestCount] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subsequent_tests`);
    return saved ? JSON.parse(saved) : 847;
  });

  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);

  // Professional Theme Mode (dark | light)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_theme`, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_modules`, JSON.stringify(modules));
    localStorage.setItem(`${STORAGE_KEY}_builds`, JSON.stringify(builds));
    localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(tests));
    localStorage.setItem(`${STORAGE_KEY}_deployment`, JSON.stringify(deployment));
    localStorage.setItem(`${STORAGE_KEY}_incidents`, JSON.stringify(incidents));
    localStorage.setItem(`${STORAGE_KEY}_agents`, JSON.stringify(agents));
    localStorage.setItem(`${STORAGE_KEY}_approvals`, JSON.stringify(approvals));
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditEvents));
    localStorage.setItem(`${STORAGE_KEY}_afp_messages`, JSON.stringify(afpMessages));
    localStorage.setItem(`${STORAGE_KEY}_subsequent_tests`, JSON.stringify(subsequentCommitTestCount));
  }, [modules, builds, tests, deployment, incidents, agents, approvals, auditEvents, afpMessages, subsequentCommitTestCount]);

  /**
   * Helper to append an audit event.
   */
  const addAuditEvent = (
    category: AuditEvent['category'],
    action: string,
    agent: AuditEvent['agent'],
    severity: AuditEvent['severity'],
    autonomyLevel: AuditEvent['autonomyLevel'],
    details: Record<string, any>
  ) => {
    const newEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category,
      action,
      agent,
      severity,
      autonomyLevel,
      details,
      isSimulated: true,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  /**
   * Dispatches an AFP-INCIDENT message from IRA to BIA and COA.
   * Gated by confidence threshold (0.75).
   * Updates module risk weight: min(1.0, current + c * 0.4).
   * Updates test prioritization and build cache policy.
   */
  const sendAfpIncidentSignal = (incidentId: string) => {
    const incident = incidents.find((inc) => inc.id === incidentId);
    if (!incident) {
      return { success: false, message: `Incident ${incidentId} not found.` };
    }

    if (incident.afpSignalSent) {
      return { success: false, message: `AFP signal has already been processed for ${incidentId}.` };
    }

    if (!incident.implicatedModules || incident.implicatedModules.length === 0) {
      return { success: false, message: `No attributable modules found for ${incidentId}.` };
    }

    const moduleId = incident.implicatedModules[0];
    const targetModule = modules.find((m) => m.id === moduleId);
    if (!targetModule) {
      return { success: false, message: `Module ${moduleId} not found.` };
    }

    // 1. Calculate weight update with confidence gating
    const update = calculateIncidentWeightUpdate(targetModule.currentRiskWeight, incident.iraConfidence);

    if (!update.accepted) {
      // Rejection / Deferral
      const rejectMessage: AFPMessage = {
        id: `afp-${Date.now()}`,
        type: 'AFP-INCIDENT',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        sender: 'IRA',
        recipients: ['BIA', 'COA'],
        incidentId: incident.id,
        implicatedModuleId: moduleId,
        moduleName: targetModule.name,
        confidence: incident.iraConfidence,
        previousWeight: targetModule.currentRiskWeight,
        newWeight: targetModule.currentRiskWeight,
        deltaWeight: 0,
        formulaApplied: 'GATED_REJECTED (confidence < 0.75)',
        status: 'rejected',
        rejectionReason: update.reason,
        auditRecorded: true,
      };

      setAfpMessages((prev) => [rejectMessage, ...prev]);
      addAuditEvent('AFP', 'AFP-INCIDENT Rejected', 'IRA', 'warning', 3, {
        incidentId: incident.id,
        confidence: incident.iraConfidence,
        threshold: 0.75,
        reason: update.reason,
      });

      return { success: false, message: update.reason };
    }

    // 2. High confidence accepted: execute weight update
    const previousWeight = targetModule.currentRiskWeight;
    const newWeight = update.newWeight;
    const deltaWeight = Number((newWeight - previousWeight).toFixed(4));
    const formula = `min(1.0, ${previousWeight} + ${incident.iraConfidence} * 0.4) = ${newWeight}`;

    // Update module
    setModules((prev) =>
      prev.map((mod) =>
        mod.id === moduleId
          ? {
              ...mod,
              currentRiskWeight: newWeight,
              cachePolicy: 'strict_invalidation',
              lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : mod
      )
    );

    // Update incident status
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, afpSignalSent: true, status: 'mitigating' }
          : inc
      )
    );

    // Update tests priority for that module
    setTests((prev) =>
      prev.map((test) => {
        if (test.moduleId === moduleId) {
          const prioritized = calculateTestPriority(test, newWeight);
          return {
            ...test,
            riskScore: newWeight,
            priorityScore: prioritized.priorityScore,
            selected: prioritized.selected,
            selectionReason: prioritized.selectionReason,
          };
        }
        return test;
      })
    );

    // Update subsequent commit test selection from 847 to 1,334 (as in the research paper)
    setSubsequentCommitTestCount(1334);

    // Update Agents state & history
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === 'IRA') {
          return {
            ...agent,
            lastAction: `Dispatched AFP-INCIDENT for ${targetModule.name} (c=${incident.iraConfidence})`,
            status: 'recommending',
          };
        }
        if (agent.id === 'BIA') {
          return {
            ...agent,
            lastAction: `Enforced strict cache invalidation for ${targetModule.name} via AFP feedback`,
            status: 'recommending',
          };
        }
        if (agent.id === 'COA') {
          return {
            ...agent,
            lastAction: `Expanded CI test suite for ${targetModule.name} from 847 to 1,334 tests`,
            status: 'recommending',
          };
        }
        return agent;
      })
    );

    // Create AFP-INCIDENT and AFP-ACK messages
    const nowTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const incidentMessage: AFPMessage = {
      id: `afp-inc-${Date.now()}`,
      type: 'AFP-INCIDENT',
      timestamp: nowTimestamp,
      sender: 'IRA',
      recipients: ['BIA', 'COA'],
      incidentId: incident.id,
      implicatedModuleId: moduleId,
      moduleName: targetModule.name,
      confidence: incident.iraConfidence,
      previousWeight,
      newWeight,
      deltaWeight,
      formulaApplied: formula,
      status: 'dispatched',
      auditRecorded: true,
    };

    const ackMessage: AFPMessage = {
      id: `afp-ack-${Date.now() + 1}`,
      type: 'AFP-ACK',
      timestamp: nowTimestamp,
      sender: 'BIA',
      recipients: ['IRA', 'AFP-ORCHESTRATOR'],
      incidentId: incident.id,
      implicatedModuleId: moduleId,
      moduleName: targetModule.name,
      confidence: incident.iraConfidence,
      previousWeight,
      newWeight,
      deltaWeight,
      formulaApplied: 'Acknowledged: Strict cache invalidation applied; future CI test weight updated',
      status: 'acknowledged',
      auditRecorded: true,
    };

    setAfpMessages((prev) => [ackMessage, incidentMessage, ...prev]);

    // Audit entries
    addAuditEvent('AFP', 'AFP-INCIDENT Message Dispatched', 'IRA', 'notice', 3, {
      incidentId: incident.id,
      module: targetModule.name,
      confidence: incident.iraConfidence,
      weightTransition: `${previousWeight} -> ${newWeight}`,
      formula,
    });

    addAuditEvent('AFP', 'AFP-ACK Acknowledged by BIA & COA', 'BIA', 'info', 3, {
      module: targetModule.name,
      newWeight,
      action: 'Cache policy set to strict_invalidation; CI suite adjusted to 1,334 tests',
    });

    return {
      success: true,
      message: `AFP-INCIDENT processed successfully. Module '${targetModule.name}' risk updated from ${previousWeight} to ${newWeight}. Cache set to strict_invalidation. CI suite expanded to 1,334 tests.`,
    };
  };

  /**
   * Applies exponential decay across all modules.
   * Formula: newWeight = baseline + (current - baseline) * exp(-lambda * days)
   */
  const applyDecaySimulation = (days: number) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.currentRiskWeight > mod.baselineRiskWeight) {
          const decayed = calculateDecayedWeight(mod.currentRiskWeight, days);
          const delta = Number((decayed - mod.currentRiskWeight).toFixed(4));
          const formula = `${mod.baselineRiskWeight} + (${mod.currentRiskWeight} - ${mod.baselineRiskWeight}) * exp(-0.1 * ${days}) = ${decayed}`;

          const decayMessage: AFPMessage = {
            id: `afp-decay-${Date.now()}-${mod.id}`,
            type: 'AFP-DECAY',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            sender: 'AFP-ORCHESTRATOR',
            recipients: ['BIA', 'COA'],
            implicatedModuleId: mod.id,
            moduleName: mod.name,
            confidence: 1.0,
            previousWeight: mod.currentRiskWeight,
            newWeight: decayed,
            deltaWeight: delta,
            formulaApplied: formula,
            status: 'acknowledged',
            auditRecorded: true,
          };

          setAfpMessages((msgs) => [decayMessage, ...msgs]);
          addAuditEvent('AFP', `AFP-DECAY Applied (${days} days)`, 'COA', 'info', 3, {
            module: mod.name,
            oldWeight: mod.currentRiskWeight,
            newWeight: decayed,
            elapsedDays: days,
          });

          return { ...mod, currentRiskWeight: decayed };
        }
        return mod;
      })
    );
  };

  /**
   * Resolves a Level 4 Human Approval Request.
   */
  const resolveApproval = (
    approvalId: string,
    decision: 'approved' | 'rejected',
    reviewerNotes?: string
  ) => {
    const approval = approvals.find((a) => a.id === approvalId);
    if (!approval) return;

    setApprovals((prev) =>
      prev.map((app) =>
        app.id === approvalId
          ? {
              ...app,
              status: decision,
              resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              resolvedBy: 'Raj Ratan (DevOps Lead)',
              reviewerNotes: reviewerNotes || (decision === 'approved' ? 'Authorized by DevOps Lead' : 'Rejected after risk assessment'),
            }
          : app
      )
    );

    addAuditEvent('GOVERNANCE', `Human Approval Decision: ${decision.toUpperCase()}`, approval.requestedBy, decision === 'approved' ? 'notice' : 'warning', 4, {
      approvalId,
      actionType: approval.actionType,
      decision,
      authorizedBy: 'Raj Ratan (DevOps Lead)',
      notes: reviewerNotes,
    });

    // If Rollback was approved:
    if (decision === 'approved' && approval.actionType === 'ROLLBACK') {
      setDeployment((prev) => ({
        ...prev,
        status: 'rolled_back',
        dcaRecommendation: 'hold',
      }));
      addAuditEvent('DEPLOYMENT', 'Rollback Executed to v3.2.0', 'DCA', 'alert', 4, {
        fromVersion: 'v3.2.1',
        toVersion: 'v3.2.0',
        authorizedBy: 'Human Approval appr-01',
      });
    }

    // If Cache Invalidation was approved:
    if (decision === 'approved' && approval.actionType === 'BROAD_CACHE_INVALIDATION') {
      setModules((prev) =>
        prev.map((m) => ({ ...m, cacheStatus: 'invalidated', cachePolicy: 'strict_invalidation' }))
      );
      addAuditEvent('BUILD', 'Broad Build Cache Invalidation Completed', 'BIA', 'notice', 4, {
        scope: 'All Tier-1 modules (checkout-cart, payment-gateway)',
        authorizedBy: 'Human Approval appr-02',
      });
    }
  };

  /**
   * Deployment rollout controls
   */
  const advanceRolloutStage = () => {
    const stages: (2 | 10 | 50 | 100)[] = [2, 10, 50, 100];
    const currentIndex = stages.indexOf(deployment.currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      setDeployment((prev) => ({
        ...prev,
        currentStage: nextStage,
        status: nextStage === 100 ? 'completed' : 'in_progress',
        lastStageAdvancedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }));
      addAuditEvent('DEPLOYMENT', `Rollout Advanced to ${nextStage}%`, 'DCA', 'info', 2, {
        previousStage: `${deployment.currentStage}%`,
        newStage: `${nextStage}%`,
      });
    }
  };

  const pauseRollout = () => {
    setDeployment((prev) => ({
      ...prev,
      status: 'paused',
      dcaRecommendation: 'pause',
    }));
    addAuditEvent('DEPLOYMENT', 'Deployment Paused by Operator', 'DCA', 'warning', 2, {
      stage: `${deployment.currentStage}%`,
    });
  };

  const triggerRollbackRequest = () => {
    // Requires Level 4 Approval
    const newApproval: Approval = {
      id: `appr-rollback-${Date.now()}`,
      title: `Level 4 Rollback: Roll back ${deployment.version} at ${deployment.currentStage}% stage to previous stable`,
      actionType: 'ROLLBACK',
      requestedBy: 'DCA',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      rationale: 'Rollback initiated from Deployment Control Center due to anomaly detection.',
      confidence: 0.94,
      autonomyLevel: 4,
      status: 'pending',
    };
    setApprovals((prev) => [newApproval, ...prev]);
    addAuditEvent('GOVERNANCE', 'Level 4 Approval Requested: ROLLBACK', 'DCA', 'alert', 4, {
      approvalId: newApproval.id,
      stage: `${deployment.currentStage}%`,
    });
  };

  /**
   * Guided Demo Step progression (8 steps from research paper)
   */
  const runNextDemoStep = () => {
    if (demoStep < 8) {
      const next = demoStep + 1;
      setDemoStep(next);

      // Trigger automatic changes corresponding to step
      if (next === 2) {
        // Step 2: BIA identifies cached checkout-cart artifact
        setSelectedCommitId('commit-c321');
      } else if (next === 3) {
        // Step 3: COA selects 847 tests
        setSubsequentCommitTestCount(847);
      } else if (next === 4) {
        // Step 4: Staged rollout 2% -> 10% -> 50%
        setDeployment((prev) => ({ ...prev, currentStage: 50, status: 'in_progress' }));
      } else if (next === 5) {
        // Step 5: Incident detected (checkout failure spikes to 7.8%)
        setSelectedIncidentId('INC-7402');
      } else if (next === 6) {
        // Step 6: IRA associates issue with checkout-cart at c=0.87
        setSelectedIncidentId('INC-7402');
      } else if (next === 7) {
        // Step 7: Send AFP signal (updates risk 0.3 -> 0.648)
        sendAfpIncidentSignal('INC-7402');
      } else if (next === 8) {
        // Step 8: Subsequent commit selects 1,334 tests
        setSubsequentCommitTestCount(1334);
      }
    } else {
      setIsDemoActive(false);
      setDemoStep(1);
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem(`${STORAGE_KEY}_modules`);
    localStorage.removeItem(`${STORAGE_KEY}_builds`);
    localStorage.removeItem(`${STORAGE_KEY}_tests`);
    localStorage.removeItem(`${STORAGE_KEY}_deployment`);
    localStorage.removeItem(`${STORAGE_KEY}_incidents`);
    localStorage.removeItem(`${STORAGE_KEY}_agents`);
    localStorage.removeItem(`${STORAGE_KEY}_approvals`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);
    localStorage.removeItem(`${STORAGE_KEY}_afp_messages`);
    localStorage.removeItem(`${STORAGE_KEY}_subsequent_tests`);

    setModules(INITIAL_MODULES);
    setBuilds(INITIAL_BUILDS);
    setTests(INITIAL_TEST_CASES);
    setRelease(INITIAL_RELEASE);
    setDeployment(INITIAL_DEPLOYMENT);
    setIncidents(INITIAL_INCIDENTS);
    setAgents(INITIAL_AGENTS);
    setApprovals(INITIAL_APPROVALS);
    setAuditEvents(INITIAL_AUDIT_EVENTS);
    setAfpMessages([]);
    setSelectedIncidentId('INC-7402');
    setSelectedCommitId('commit-c321');
    setSubsequentCommitTestCount(847);
    setIsDemoActive(false);
    setDemoStep(1);
  };

  return (
    <AriaContext.Provider
      value={{
        project,
        modules,
        commits,
        builds,
        tests,
        release,
        deployment,
        incidents,
        agents,
        approvals,
        auditEvents,
        afpMessages,
        selectedIncidentId,
        selectedCommitId,
        subsequentCommitTestCount,
        isDemoActive,
        demoStep,
        theme,
        setSelectedIncidentId,
        setSelectedCommitId,
        sendAfpIncidentSignal,
        applyDecaySimulation,
        resolveApproval,
        advanceRolloutStage,
        pauseRollout,
        triggerRollbackRequest,
        setDemoStep,
        setIsDemoActive,
        runNextDemoStep,
        resetToDefault,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </AriaContext.Provider>
  );
};

export const useAria = (): AriaContextType => {
  const context = useContext(AriaContext);
  if (!context) {
    throw new Error('useAria must be used within an AriaProvider');
  }
  return context;
};
