// Frontend API Client for ARIA Spring Boot Backend
// Connects to /api/v1 endpoints with transparent fallback to in-memory/localStorage state

import { Module, Incident, AFPMessage, Approval, AuditEvent } from '../types';

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8080/api/v1';

export class AriaApiClient {
  private isBackendAvailable: boolean | null = null;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for fast fallback

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.isBackendAvailable = true;
      return (await response.json()) as T;
    } catch {
      this.isBackendAvailable = false;
      return null;
    }
  }

  public getBackendStatus(): boolean | null {
    return this.isBackendAvailable;
  }

  // Check backend health
  async checkHealth(): Promise<boolean> {
    const res = await this.request<{ status: string }>('/status');
    return res !== null && res.status === 'healthy';
  }

  // Modules
  async fetchModules(): Promise<Module[] | null> {
    const data = await this.request<any[]>('/modules');
    if (!data) return null;
    return data.map((m) => ({
      id: m.id,
      name: m.name,
      path: m.path || `src/${m.name}`,
      language: m.language || 'TypeScript',
      linesOfCode: Number(m.linesOfCode || m.loc || 1200),
      dependencies: Array.isArray(m.dependencies) ? m.dependencies.map((d: any) => d.id || d) : [],
      currentRiskWeight: Number(m.currentRiskWeight || 0.3),
      baselineRiskWeight: Number(m.baselineRiskWeight || 0.3),
      lastUpdated: m.lastUpdated || new Date().toISOString(),
      testCount: Number(m.testCount || 40),
      failureRate: Number(m.failureRate || 0.02),
      cacheStatus: (m.cacheStatus || 'hit') as Module['cacheStatus'],
      cachePolicy: (m.cachePolicy || 'standard') as Module['cachePolicy'],
    }));
  }

  // Incidents
  async fetchIncidents(): Promise<Incident[] | null> {
    const data = await this.request<any[]>('/incidents');
    if (!data) return null;
    return data.map((i) => ({
      id: i.id,
      title: i.title,
      severity: (i.severity || 'high') as Incident['severity'],
      status: (i.status || 'triaged') as Incident['status'],
      detectedAt: i.detectedAt ? i.detectedAt.replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
      resolvedAt: i.resolvedAt,
      affectedRelease: i.affectedRelease || i.affectedReleaseId || 'v3.2.1-rc4',
      affectedDeploymentId: i.affectedDeploymentId || 'dep-v3.2.1-prod',
      implicatedModules: Array.isArray(i.implicatedModules)
        ? i.implicatedModules
        : i.implicatedModule
        ? [i.implicatedModule.id || i.implicatedModule]
        : [],
      iraConfidence: Number(i.iraConfidence || 0.87),
      rootCauseHypotheses: Array.isArray(i.rootCauseHypotheses) ? i.rootCauseHypotheses : [],
      relevantLogs: Array.isArray(i.relevantLogs) ? i.relevantLogs : [],
      suggestedRemediation: Array.isArray(i.suggestedRemediation) ? i.suggestedRemediation : [],
      afpSignalSent: Boolean(i.afpSignalSent),
      scenarioType: (i.scenarioType || 'stale-cache') as Incident['scenarioType'],
    }));
  }

  // AFP Dispatch
  async dispatchAfpSignal(incidentId: string): Promise<AFPMessage | null> {
    const res = await this.request<any>(`/afp/dispatch/${incidentId}`, { method: 'POST' });
    if (!res) return null;
    const prevWeight = Number(res.previousWeight || 0.3);
    const nWeight = Number(res.newWeight || 0.648);
    return {
      id: res.id,
      type: (res.type || 'AFP-INCIDENT') as AFPMessage['type'],
      timestamp: res.timestamp ? res.timestamp.replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
      sender: res.senderAgent || res.sender || 'IRA',
      recipients: ['BIA', 'COA'],
      incidentId: res.incidentId || incidentId,
      implicatedModuleId: res.implicatedModuleId || res.moduleId || 'mod-checkout-cart',
      moduleName: res.moduleName || res.moduleId || 'checkout-cart',
      confidence: Number(res.confidence || 0.87),
      previousWeight: prevWeight,
      newWeight: nWeight,
      deltaWeight: Number((nWeight - prevWeight).toFixed(3)),
      formulaApplied: res.formulaApplied || 'w_new = min(1.0, 0.300 + 0.870 * 0.400) = 0.648',
      status: (res.status || 'acknowledged') as AFPMessage['status'],
      auditRecorded: true,
    };
  }

  // AFP Decay Simulation
  async applyDecay(days: number): Promise<boolean> {
    const res = await this.request<any>(`/afp/decay?days=${days}`, { method: 'POST' });
    return res !== null;
  }

  // Approvals
  async fetchApprovals(): Promise<Approval[] | null> {
    const data = await this.request<any[]>('/governance/approvals');
    if (!data) return null;
    return data.map((a) => ({
      id: a.id,
      actionType: a.actionType,
      title: a.title,
      requestedBy: a.requestedBy,
      requestedAt: a.requestedAt ? a.requestedAt.replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
      rationale: a.rationale,
      confidence: Number(a.confidence || 0.9),
      autonomyLevel: 4 as const,
      status: a.status,
      reviewerNotes: a.reviewerNotes,
      resolvedBy: a.resolvedBy,
      resolvedAt: a.resolvedAt ? a.resolvedAt.replace('T', ' ').substring(0, 19) : undefined,
    }));
  }

  // Resolve Approval
  async resolveApproval(id: string, decision: 'approved' | 'rejected', notes?: string, operator?: string): Promise<boolean> {
    const res = await this.request<any>(`/governance/approvals/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes, operator }),
    });
    return res !== null;
  }

  // Audit Events
  async fetchAuditEvents(): Promise<AuditEvent[] | null> {
    const data = await this.request<any[]>('/audit');
    if (!data) return null;
    return data.map((e) => ({
      id: e.id,
      timestamp: e.timestamp ? e.timestamp.replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
      category: e.category,
      action: e.action,
      agent: e.agent,
      severity: e.severity,
      autonomyLevel: Number(e.autonomyLevel || 1) as AuditEvent['autonomyLevel'],
      details: typeof e.details === 'object' && e.details !== null ? e.details : { raw: e.details },
      isSimulated: Boolean(e.isSimulated),
    }));
  }
}

export const ariaApi = new AriaApiClient();
