import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ScaleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useLegalRequirements } from '../hooks/useLegal';
import type { LegalRequirementListItem, ComplianceStatus } from '../types/legal.types';
import {
  COMPLIANCE_STATUS_LABELS,
  REQUIREMENT_TYPE_LABELS,
  JURISDICTION_LABELS,
} from '../types/legal.types';

// ── Colour maps ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ComplianceStatus, { bg: string; color: string; border: string }> = {
  compliant:           { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  partially_compliant: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
  non_compliant:       { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  not_assessed:        { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  not_applicable:      { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
};

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="text-xs font-medium px-2 py-0.5 rounded-full border"
    >
      {COMPLIANCE_STATUS_LABELS[status]}
    </span>
  );
}

function RequirementRow({ r }: { r: LegalRequirementListItem }) {
  return (
    <Link
      to={`/legal/${r.id}`}
      className="grid grid-cols-[1fr_140px_120px_120px_120px_auto] items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors border-b border-slate-50 last:border-0"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-800 text-sm">{r.title}</p>
          {r.is_overdue_review && (
            <ExclamationCircleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Review overdue" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {r.reference_number}
          {r.department_name && <> · {r.department_name}</>}
        </p>
      </div>
      <div className="text-xs text-slate-500">
        {REQUIREMENT_TYPE_LABELS[r.requirement_type]}
      </div>
      <div className="text-xs text-slate-500">
        {JURISDICTION_LABELS[r.jurisdiction]}
      </div>
      <div>
        <StatusBadge status={r.compliance_status} />
      </div>
      <div className="text-xs text-slate-500">
        {r.review_date ? (
          <span className={r.is_overdue_review ? 'text-amber-600 font-medium' : ''}>
            {r.review_date}
          </span>
        ) : '—'}
      </div>
      <div className="text-xs text-slate-400 text-right">
        {r.responsible_person_name ?? '—'}
      </div>
    </Link>
  );
}

// ── Summary strip ─────────────────────────────────────────────────────────────

function SummaryStrip({ items }: { items: LegalRequirementListItem[] }) {
  const counts: Record<ComplianceStatus, number> = {
    compliant: 0, partially_compliant: 0, non_compliant: 0,
    not_assessed: 0, not_applicable: 0,
  };
  items.forEach((r) => { counts[r.compliance_status] = (counts[r.compliance_status] ?? 0) + 1; });
  const overdue = items.filter((r) => r.is_overdue_review).length;

  const chips: { label: string; value: number; style: { bg: string; color: string; border: string } }[] = [
    { label: 'Compliant', value: counts.compliant, style: STATUS_STYLE.compliant },
    { label: 'Partial', value: counts.partially_compliant, style: STATUS_STYLE.partially_compliant },
    { label: 'Non-Compliant', value: counts.non_compliant, style: STATUS_STYLE.non_compliant },
    { label: 'Not Assessed', value: counts.not_assessed, style: STATUS_STYLE.not_assessed },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {chips.map(({ label, value, style }) => (
        <div
          key={label}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ background: style.bg, borderColor: style.border }}
        >
          <span className="text-lg font-bold" style={{ color: style.color }}>
            {value}
          </span>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      ))}
      {overdue > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-amber-50 border-amber-200">
          <ExclamationCircleIcon className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{overdue}</span>
          <span className="text-xs text-amber-600">review{overdue !== 1 ? 's' : ''} overdue</span>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LegalRegisterPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const params: Record<string, string> = {};
  if (statusFilter) params.compliance_status = statusFilter;
  if (typeFilter) params.requirement_type = typeFilter;
  if (search) params.search = search;

  const { data: requirements = [], isLoading } = useLegalRequirements(params);
  const allItems = useLegalRequirements().data ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Legal & Compliance Register</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Legal requirements & other obligations — ISO 45001 Clause 6.1.3
          </p>
        </div>
        <Link
          to="/legal/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" />
          Add requirement
        </Link>
      </div>

      {/* Summary */}
      {allItems.length > 0 && <SummaryStrip items={allItems} />}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Search requirements…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All statuses</option>
          {Object.entries(COMPLIANCE_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All types</option>
          {Object.entries(REQUIREMENT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_120px_120px_120px_auto] gap-4 px-5 py-3 bg-slate-50/60 border-b border-slate-100">
          {['Requirement', 'Type', 'Jurisdiction', 'Compliance', 'Review date', 'Owner'].map((h) => (
            <p key={h} className="text-xs font-medium text-slate-500">{h}</p>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : requirements.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ScaleIcon className="w-10 h-10 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400">No legal requirements recorded yet.</p>
            <Link
              to="/legal/new"
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add your first requirement
            </Link>
          </div>
        ) : (
          <div>
            {requirements.map((r) => <RequirementRow key={r.id} r={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
