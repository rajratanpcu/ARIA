// Frontend API Client for ARIA Spring Boot Backend
// Connects to /api/v1 endpoints with transparent fallback to in-memory/localStorage state

import { Module, Incident, AFPMessage, Approval, AuditEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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
      path: m.path,
      language: m.language,
      loc: m.loc,
      dependencies: m.dependencies ? m.dependencies.map((d: any) => d.id || d) : [],
      currentRiskWeight: Number(m.currentRiskWeight),
      baselineRiskWeight: Number(m.baselineRiskWeight),
      cachePolicy: m.cachePolicy,
      cacheStatus: m.cacheStatus,
      testCount: m.testCount,
    }));
  }

  // Incidents
  async fetchIncidents(): Promise<Incident[] | null> {
    const data = await this.request<any[]>('/incidents');
    if (!data) return null;
    return data.map((i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity,
      affectedRelease: i.affectedReleaseId || 'v3.2.1-rc4',
      implicatedModules: i.implicatedModule ? [i.implicatedModule.id] : [],
      status: i.status,
      scenarioType: i.scenarioType,
      iraConfidence: Number(i.iraConfidence),
      afpSignalSent: i.afpSignalSent,
      rootCauseHypotheses: [],
      relevantLogs: [],
      suggestedRemediation: [],
      detectedAt: i.detectedAt ? i.detectedAt.replace('T', ' ').substring(0, 19) : '',
    }));
  }

  // AFP Dispatch
  async dispatchAfpSignal(incidentId: string): Promise<AFPMessage | null> {
    const res = await this.request<any>(`/afp/dispatch/${incidentId}`, { method: 'POST' });
    if (!res) return null;
    return {
      id: res.id,
      type: res.type,
      sender: res.senderAgent,
      recipients: ['BIA', 'COA'],
      moduleId: res.moduleId,
      moduleName: res.moduleId,
      incidentId: res.incidentId,
      confidence: Number(res.confidence),
      previousWeight: Number(res.previousWeight),
      newWeight: Number(res.newWeight),
      formulaApplied: res.formulaApplied,
      status: res.status,
      timestamp: res.timestamp ? res.timestamp.replace('T', ' ').substring(0, 19) : '',
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
      rationale: a.rationale,
      confidence: Number(a.confidence),
      autonomyLevel: a.autonomyLevel,
      status: a.status,
      reviewerNotes: a.reviewerNotes,
      resolvedBy: a.resolvedBy,
      requestedAt: a.requestedAt ? a.requestedAt.replace('T', ' ').substring(0, 19) : '',
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
      category: e.category,
      action: e.action,
      agent: e.agent,
      severity: e.severity,
      autonomyLevel: e.autonomyLevel,
      details: typeof e.details === 'string' ? e.details : JSON.stringify(e.details),
      timestamp: e.timestamp ? e.timestamp.replace('T', ' ').substring(0, 19) : '',
      isSimulated: e.isSimulated,
    }));
  }
}

export const ariaApi = new AriaApiClient();
