import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAssessments } from '../hooks/useRA';
import type { AssessmentStatus, HazardAssessmentListItem, RiskLevel } from '../types/ra.types';
import { ASSESSMENT_STATUS_LABELS } from '../types/ra.types';

const STATUS_COLORS: Record<AssessmentStatus, string> = {
  draft:        'bg-slate-100 text-slate-600',
  active:       'bg-emerald-100 text-emerald-700',
  under_review: 'bg-amber-100 text-amber-700',
  archived:     'bg-slate-100 text-slate-400',
};

const LEVEL_STYLE: Record<RiskLevel, { bg: string; color: string; border: string }> = {
  low:      { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  medium:   { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
  high:     { bg: '#fff7ed', color: '#9a3412', border: '#fdba74' },
  critical: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
};

function RiskBadge({ level, count }: { level: RiskLevel; count: number }) {
  if (count === 0) return null;
  const s = LEVEL_STYLE[level];
  return (
    <span
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="text-xs font-semibold px-2 py-0.5 rounded-full border"
    >
      {count} {level}
    </span>
  );
}

function AssessmentRow({ a }: { a: HazardAssessmentListItem }) {
  return (
    <Link
      to={`/risk-assessments/${a.id}`}
      className="grid grid-cols-[1fr_120px_120px_160px_auto] items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors border-b border-slate-50 last:border-0"
    >
      <div>
        <p className="font-medium text-slate-800 text-sm">{a.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {a.reference_number}
          {a.work_area && <> · {a.work_area}</>}
          {a.department_name && <> · {a.department_name}</>}
        </p>
      </div>
      <div>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[a.status])}>
          {ASSESSMENT_STATUS_LABELS[a.status]}
        </span>
      </div>
      <div className="text-xs text-slate-500">
        <p>{a.assessment_date}</p>
        {a.next_review_date && (
          <p className="text-slate-300 mt-0.5">Review: {a.next_review_date}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        <RiskBadge level="critical" count={a.critical_hazard_count} />
        <RiskBadge level="high" count={a.high_hazard_count} />
        {a.hazard_count > 0 && (
          <span className="text-xs text-slate-400">{a.hazard_count} hazard{a.hazard_count !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="text-xs text-slate-400 text-right">
        {a.assessed_by_detail?.full_name}
      </div>
    </Link>
  );
}

export default function RiskAssessmentListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const params: Record<string, string> = {};
  if (statusFilter) params.status = statusFilter;
  if (search) params.search = search;

  const { data: assessments = [], isLoading } = useAssessments(params);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Risk Assessments</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Hazard Identification & Risk Assessment (HIRA) — ISO 45001 Clause 6.1
          </p>
        </div>
        <Link
          to="/risk-assessments/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" />
          New assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="search"
          placeholder="Search assessments…"
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
          {Object.entries(ASSESSMENT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_120px_120px_160px_auto] gap-4 px-5 py-3 bg-slate-50/60 border-b border-slate-100">
          {['Assessment', 'Status', 'Date', 'Risk summary', 'Assessed by'].map((h) => (
            <p key={h} className="text-xs font-medium text-slate-500">{h}</p>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : assessments.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShieldExclamationIcon className="w-10 h-10 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400">No risk assessments yet.</p>
            <Link
              to="/risk-assessments/new"
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Create your first assessment
            </Link>
          </div>
        ) : (
          <div>
            {assessments.map((a) => <AssessmentRow key={a.id} a={a} />)}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
        <span>Risk levels: 1–4 = Low · 5–9 = Medium · 10–16 = High · 17–25 = Critical (Likelihood × Consequence)</span>
      </div>
    </div>
  );
}
