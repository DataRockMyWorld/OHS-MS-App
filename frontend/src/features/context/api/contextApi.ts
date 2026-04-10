import api from '@/lib/axios';
import type {
  ManagementSystemScope,
  UpdateScopePayload,
  ContextIssue,
  InterestedParty,
  RiskOrOpportunity,
  IssueStats,
  ROStats,
  CreateIssuePayload,
  CreateInterestedPartyPayload,
  CreateROPayload,
} from '../types/context.types';

// ─── Scope (Clause 4.3) ───────────────────────────────────────────────────────

export function getScope() {
  return api.get<ManagementSystemScope | null>('/context/scope/').then((r) => r.data);
}

export function updateScope(payload: UpdateScopePayload) {
  return api.put<ManagementSystemScope>('/context/scope/', payload).then((r) => r.data);
}

// ─── Issues ───────────────────────────────────────────────────────────────────

export function getIssues(params?: Record<string, string>) {
  return api.get<ContextIssue[]>('/context/issues/', { params }).then((r) => r.data);
}

export function getIssue(id: string) {
  return api.get<ContextIssue>(`/context/issues/${id}/`).then((r) => r.data);
}

export function createIssue(payload: CreateIssuePayload) {
  return api.post<ContextIssue>('/context/issues/', payload).then((r) => r.data);
}

export function updateIssue(id: string, payload: Partial<CreateIssuePayload>) {
  return api.patch<ContextIssue>(`/context/issues/${id}/`, payload).then((r) => r.data);
}

export function getIssueStats() {
  return api.get<IssueStats>('/context/issues/stats/').then((r) => r.data);
}

// ─── Interested Parties ───────────────────────────────────────────────────────

export function getInterestedParties() {
  return api.get<InterestedParty[]>('/context/interested-parties/').then((r) => r.data);
}

export function getInterestedParty(id: string) {
  return api.get<InterestedParty>(`/context/interested-parties/${id}/`).then((r) => r.data);
}

export function createInterestedParty(payload: CreateInterestedPartyPayload) {
  return api.post<InterestedParty>('/context/interested-parties/', payload).then((r) => r.data);
}

export function updateInterestedParty(id: string, payload: Partial<CreateInterestedPartyPayload>) {
  return api.patch<InterestedParty>(`/context/interested-parties/${id}/`, payload).then((r) => r.data);
}

// ─── Risks & Opportunities ────────────────────────────────────────────────────

export function getRisksOpportunities(params?: Record<string, string>) {
  return api.get<RiskOrOpportunity[]>('/context/risks-and-opportunities/', { params }).then((r) => r.data);
}

export function getRiskOpportunity(id: string) {
  return api.get<RiskOrOpportunity>(`/context/risks-and-opportunities/${id}/`).then((r) => r.data);
}

export function createRiskOpportunity(payload: CreateROPayload) {
  return api.post<RiskOrOpportunity>('/context/risks-and-opportunities/', payload).then((r) => r.data);
}

export function updateRiskOpportunity(id: string, payload: Partial<CreateROPayload>) {
  return api.patch<RiskOrOpportunity>(`/context/risks-and-opportunities/${id}/`, payload).then((r) => r.data);
}

export function getRoStats() {
  return api.get<ROStats>('/context/risks-and-opportunities/stats/').then((r) => r.data);
}
