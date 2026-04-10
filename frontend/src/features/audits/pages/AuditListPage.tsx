import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAudits } from '../hooks/useAudits';
import type { AuditListItem, AuditStatus } from '../types/audit.types';
import { AUDIT_STATUS_LABELS, AUDIT_TYPE_LABELS } from '../types/audit.types';

const STATUS_COLORS: Record<AuditStatus, string> = {
  planned:     'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-slate-100 text-slate-400',
};

function AuditRow({ a }: { a: AuditListItem }) {
  return (
    <Link
      to={`/audits/${a.id}`}
      className="grid grid-cols-[1fr_140px_120px_120px_80px_auto] items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors border-b border-slate-50 last:border-0"
    >
      <div>
        <p className="font-medium text-slate-800 text-sm">{a.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {a.reference_number}
          {a.department_name && <> · {a.department_name}</>}
          {a.location && <> · {a.location}</>}
        </p>
      </div>
      <div>
        <span className="text-xs text-slate-500">{a.audit_type_display}</span>
      </div>
      <div>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[a.status])}>
          {AUDIT_STATUS_LABELS[a.status]}
        </span>
      </div>
      <div className="text-xs text-slate-500">
        <p>{a.planned_date}</p>
        {a.actual_date && <p className="text-slate-300 mt-0.5">Done: {a.actual_date}</p>}
      </div>
      <div className="text-xs text-center">
        {a.open_finding_count > 0 ? (
          <span className="inline-block px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-semibold">
            {a.open_finding_count} open
          </span>
        ) : (
          <span className="text-slate-300">{a.finding_count} findings</span>
        )}
      </div>
      <div className="text-xs text-slate-400 text-right">
        {a.lead_auditor_name}
      </div>
    </Link>
  );
}

export default function AuditListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const params: Record<string, string> = {};
  if (statusFilter) params.status = statusFilter;
  if (typeFilter) params.audit_type = typeFilter;
  if (search) params.search = search;

  const { data: audits = [], isLoading } = useAudits(params);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Audits & Inspections</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Internal & external audits — ISO 45001 Clause 9.2
          </p>
        </div>
        <Link
          to="/audits/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" />
          New audit
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Search audits…"
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
          {Object.entries(AUDIT_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All types</option>
          {Object.entries(AUDIT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_120px_120px_80px_auto] gap-4 px-5 py-3 bg-slate-50/60 border-b border-slate-100">
          {['Audit', 'Type', 'Status', 'Date', 'Findings', 'Lead Auditor'].map((h) => (
            <p key={h} className="text-xs font-medium text-slate-500">{h}</p>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : audits.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ClipboardDocumentCheckIcon className="w-10 h-10 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400">No audits yet.</p>
            <Link
              to="/audits/new"
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Schedule your first audit
            </Link>
          </div>
        ) : (
          <div>
            {audits.map((a) => <AuditRow key={a.id} a={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
