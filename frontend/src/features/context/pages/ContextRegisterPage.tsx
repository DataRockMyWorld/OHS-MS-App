import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/permissions';
import { useContextIssues, useIssueStats } from '../hooks/useContextIssues';
import { useInterestedParties } from '../hooks/useInterestedParties';
import { useRisksOpportunities, useRoStats } from '../hooks/useRisksOpportunities';
import { useScope, useUpdateScope } from '../hooks/useScope';
import type { IssueClassification, ROType, SeverityLevel } from '../types/context.types';

// ─── Scope Card ───────────────────────────────────────────────────────────────

function ScopeCard({ canManage }: { canManage: boolean }) {
  const { data: scope, isLoading } = useScope();
  const updateScope = useUpdateScope();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    scope_statement: '',
    boundaries_and_applicability: '',
    activities_products_services: '',
    exclusions: '',
  });

  function startEdit() {
    setForm({
      scope_statement: scope?.scope_statement ?? '',
      boundaries_and_applicability: scope?.boundaries_and_applicability ?? '',
      activities_products_services: scope?.activities_products_services ?? '',
      exclusions: scope?.exclusions ?? '',
    });
    setEditing(true);
  }

  async function save() {
    if (!form.scope_statement.trim()) return;
    await updateScope.mutateAsync(form);
    setEditing(false);
  }

  const TEXTAREA_CLS =
    'w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors resize-none';

  if (isLoading) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 mb-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Clause 4.3 — Scope of the OH&S Management System
          </p>
        </div>
        {!editing && canManage && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 hover:border-primary-300 transition-colors shrink-0"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            {scope ? 'Edit Scope' : 'Define Scope'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Scope Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className={TEXTAREA_CLS}
              placeholder="e.g. The OH&S management system applies to all operations at our main manufacturing site, including all permanent and contracted workers engaged in production, maintenance, and logistics activities."
              value={form.scope_statement}
              onChange={(e) => setForm((f) => ({ ...f, scope_statement: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Boundaries &amp; Applicability</label>
              <textarea
                rows={3}
                className={TEXTAREA_CLS}
                placeholder="Which sites, departments, and activities are within scope?"
                value={form.boundaries_and_applicability}
                onChange={(e) => setForm((f) => ({ ...f, boundaries_and_applicability: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Activities, Products &amp; Services</label>
              <textarea
                rows={3}
                className={TEXTAREA_CLS}
                placeholder="Main activities, products, and services covered by the system."
                value={form.activities_products_services}
                onChange={(e) => setForm((f) => ({ ...f, activities_products_services: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Exclusions</label>
            <textarea
              rows={2}
              className={TEXTAREA_CLS}
              placeholder="Anything explicitly excluded, with justification."
              value={form.exclusions}
              onChange={(e) => setForm((f) => ({ ...f, exclusions: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={save}
              disabled={!form.scope_statement.trim() || updateScope.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-700 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-50 transition-colors"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              {updateScope.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-slate-500 text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : scope ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">{scope.scope_statement}</p>
          {(scope.boundaries_and_applicability || scope.activities_products_services || scope.exclusions) && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-stone-100">
              {scope.boundaries_and_applicability && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Boundaries</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{scope.boundaries_and_applicability}</p>
                </div>
              )}
              {scope.activities_products_services && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Activities &amp; Services</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{scope.activities_products_services}</p>
                </div>
              )}
              {scope.exclusions && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Exclusions</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{scope.exclusions}</p>
                </div>
              )}
            </div>
          )}
          {scope.updated_by_name && (
            <p className="text-[10px] text-slate-300">
              Last updated by {scope.updated_by_name} · {formatDate(scope.updated_at)}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-slate-400">
            No scope defined yet. The HSSE Manager should define the boundaries and applicability of the management system.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function ClassificationBadge({ value }: { value: IssueClassification }) {
  return value === 'risk' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100">
      Risk
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      Opportunity
    </span>
  );
}

function ROTypeBadge({ value }: { value: ROType }) {
  return value === 'risk' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100">
      Risk
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      Opportunity
    </span>
  );
}

function SeverityBadge({ value }: { value: SeverityLevel }) {
  const styles: Record<SeverityLevel, string> = {
    high: 'bg-red-50 text-red-700 border-red-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${styles[value]}`}>
      {value}
    </span>
  );
}

function StatusChip({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-slate-600 capitalize">
      {value.replace('_', ' ')}
    </span>
  );
}

function AnalysisTagChip({ value }: { value: string }) {
  const isSwot = value.startsWith('swot_');
  const label = value.replace('swot_', '').replace('pestle_', '').replace('_', ' ');
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
        isSwot
          ? 'bg-blue-50 text-blue-700 border-blue-100'
          : 'bg-purple-50 text-purple-700 border-purple-100'
      }`}
    >
      {isSwot ? 'SWOT' : 'PESTLE'} · {label}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'issues' | 'parties' | 'ro';

export default function ContextRegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = can.manageContext(user?.role ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('issues');

  const { data: issues = [], isLoading: issuesLoading } = useContextIssues();
  const { data: parties = [], isLoading: partiesLoading } = useInterestedParties();
  const { data: ros = [], isLoading: rosLoading } = useRisksOpportunities();
  const { data: issueStats } = useIssueStats();
  const { data: roStats } = useRoStats();

  const addHref =
    activeTab === 'issues'
      ? '/context/issues/new'
      : activeTab === 'parties'
      ? '/context/interested-parties/new'
      : '/context/risks-and-opportunities/new';

  const addLabel =
    activeTab === 'issues'
      ? 'Add Issue'
      : activeTab === 'parties'
      ? 'Add Party'
      : 'Add R&O';

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1100px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Context Register</h1>
            <p className="mt-0.5 text-sm text-slate-500">ISO 45001 Clauses 4.1 · 4.2 · 4.3</p>
          </div>
          {canManage && (
            <Button
              size="md"
              iconLeft={<PlusIcon className="w-4 h-4" />}
              onClick={() => navigate(addHref)}
            >
              {addLabel}
            </Button>
          )}
        </div>

        {/* Scope (Clause 4.3) */}
        <ScopeCard canManage={canManage} />

        {/* Stats bar */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Issues</p>
            <p className="mt-0.5 text-xl font-bold text-slate-800">{issueStats?.total ?? '—'}</p>
          </div>
          <div className="w-px h-8 bg-stone-100" />
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Risks</p>
            <p className="mt-0.5 text-xl font-bold text-red-600">{(issueStats?.risks ?? 0) + (roStats?.risks_count ?? 0)}</p>
          </div>
          <div className="w-px h-8 bg-stone-100" />
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Opportunities</p>
            <p className="mt-0.5 text-xl font-bold text-emerald-600">{(issueStats?.opportunities ?? 0) + (roStats?.opportunities_count ?? 0)}</p>
          </div>
          <div className="w-px h-8 bg-stone-100" />
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">R&amp;O Register</p>
            <p className="mt-0.5 text-xl font-bold text-slate-800">{roStats?.total ?? '—'}</p>
          </div>
          <div className="w-px h-8 bg-stone-100" />
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Interested Parties</p>
            <p className="mt-0.5 text-xl font-bold text-slate-800">{parties.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-stone-100 rounded-xl p-1 w-fit shadow-sm">
          {([
            ['issues', 'Issues (4.1)'],
            ['parties', 'Interested Parties (4.2)'],
            ['ro', 'Risks & Opportunities'],
          ] as [Tab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Issues */}
        {activeTab === 'issues' && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Title', 'Type', 'Analysis Tag', 'Classification', 'Status', 'Identified'].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 whitespace-nowrap bg-stone-50/60">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issuesLoading ? (
                  <EmptyRow message="Loading…" />
                ) : issues.length === 0 ? (
                  <EmptyRow message="No issues recorded yet. Click 'Add Issue' to get started." />
                ) : (
                  issues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-stone-50 cursor-pointer"
                      onClick={() => navigate(`/context/issues/${issue.id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{issue.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 capitalize">{issue.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <AnalysisTagChip value={issue.analysis_tag} />
                      </td>
                      <td className="px-4 py-3">
                        <ClassificationBadge value={issue.classification} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip value={issue.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(issue.identified_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Interested Parties */}
        {activeTab === 'parties' && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Name', 'Category', 'Type', 'Compliance Obligation', 'Review Frequency', 'Last Reviewed', 'Status'].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 whitespace-nowrap bg-stone-50/60">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partiesLoading ? (
                  <EmptyRow message="Loading…" />
                ) : parties.length === 0 ? (
                  <EmptyRow message="No interested parties recorded yet. Click 'Add Party' to get started." />
                ) : (
                  parties.map((party) => (
                    <tr
                      key={party.id}
                      className="hover:bg-stone-50 cursor-pointer"
                      onClick={() => navigate(`/context/interested-parties/${party.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{party.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${party.category === 'internal' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-violet-50 text-violet-700 border-violet-100'}`}>
                          {party.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 capitalize">{party.party_type}</td>
                      <td className="px-4 py-3">
                        {party.is_compliance_obligation ? (
                          <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 capitalize">
                        {party.review_frequency.replace('_', '-')}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {party.last_reviewed_date ? formatDate(party.last_reviewed_date) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip value={party.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Risks & Opportunities */}
        {activeTab === 'ro' && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Title', 'Type', 'Severity', 'Owner', 'Status', 'Objectives'].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 whitespace-nowrap bg-stone-50/60">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rosLoading ? (
                  <EmptyRow message="Loading…" />
                ) : ros.length === 0 ? (
                  <EmptyRow message="No risks or opportunities recorded yet. Click 'Add R&O' to get started." />
                ) : (
                  ros.map((ro) => (
                    <tr
                      key={ro.id}
                      className="hover:bg-stone-50 cursor-pointer"
                      onClick={() => navigate(`/context/risks-and-opportunities/${ro.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{ro.title}</td>
                      <td className="px-4 py-3">
                        <ROTypeBadge value={ro.type} />
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge value={ro.severity_level} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{ro.owner_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <StatusChip value={ro.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                        {ro.linked_objectives_count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
