import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { PaperClipIcon } from '@heroicons/react/20/solid';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { useIncidents, useIncidentStats } from '../hooks/useIncidents';
import IncidentStatusBadge from '../components/IncidentStatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import type {
  IncidentFilters,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
} from '../types/incident.types';
import { INCIDENT_TYPE_LABELS } from '../types/incident.types';

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: 'draft',                 label: 'Draft' },
  { value: 'reported',              label: 'Reported' },
  { value: 'under_review',          label: 'Under Review' },
  { value: 'investigation_ongoing', label: 'Investigation Ongoing' },
  { value: 'actions_implemented',   label: 'Actions Implemented' },
  { value: 'closed',                label: 'Closed' },
  { value: 'reopened',              label: 'Reopened' },
];

const TYPE_OPTIONS: { value: IncidentType; label: string }[] = Object.entries(
  INCIDENT_TYPE_LABELS,
).map(([value, label]) => ({ value: value as IncidentType, label }));

const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string }[] = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
];

// ─── Table filter chip ────────────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 pl-3 pr-8 text-xs rounded-lg border border-stone-100 bg-white text-slate-700 font-medium appearance-none hover:border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors cursor-pointer"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IncidentListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters: IncidentFilters = {
    page,
    search: search || undefined,
    status: statusFilter ? [statusFilter as IncidentStatus] : undefined,
    incident_type: typeFilter ? [typeFilter as IncidentType] : undefined,
    severity: severityFilter ? [severityFilter as IncidentSeverity] : undefined,
  };

  const { data, isLoading } = useIncidents(filters);
  const { data: stats } = useIncidentStats();

  const incidents = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasFilters = !!(search || statusFilter || typeFilter || severityFilter);

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setSeverityFilter('');
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Incidents</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                {totalCount} total
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {stats?.this_month ?? '—'} this month
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(stats?.open_count ?? 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                {stats?.open_count ?? '—'} open
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(stats?.critical_count ?? 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'}`}>
                {stats?.critical_count ?? '—'} critical
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {stats?.closed_count ?? '—'} closed
              </span>
            </div>
          </div>
          <Link to="/incidents/new">
            <Button size="md" iconLeft={<PlusIcon className="w-4 h-4" />}>
              Report Incident
            </Button>
          </Link>
        </div>

        {/* ── Table card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search incidents…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-8 w-56 pl-8 pr-3 text-xs rounded-lg border border-stone-100 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="w-px h-4 bg-stone-200" />

            <FilterSelect
              label="All statuses"
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label="All types"
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v); setPage(1); }}
              options={TYPE_OPTIONS}
            />
            <FilterSelect
              label="All severities"
              value={severityFilter}
              onChange={(v) => { setSeverityFilter(v); setPage(1); }}
              options={SEVERITY_OPTIONS}
            />

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {isLoading ? 'Loading…' : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={7} />
                ))}
              </tbody>
            </table>
          ) : incidents.length === 0 ? (
            <EmptyState
              icon={<ExclamationTriangleIcon className="w-6 h-6" />}
              title={hasFilters ? 'No incidents match your filters' : 'No incidents yet'}
              description={
                hasFilters
                  ? 'Try adjusting or clearing your filters to see more results.'
                  : 'Incidents reported in your organization will appear here.'
              }
              action={
                !hasFilters ? (
                  <Link to="/incidents/new">
                    <Button size="sm" iconLeft={<PlusIcon className="w-3.5 h-3.5" />}>
                      Report first incident
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Reference', 'Incident', 'Type', 'Severity', 'Status', 'Date', 'Reported By'].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 whitespace-nowrap bg-stone-50/60"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    className="group cursor-pointer hover:bg-stone-50/70 transition-colors duration-100"
                  >
                    {/* Reference */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-400 bg-stone-100 px-2 py-0.5 rounded-md">
                        {incident.reference_number}
                      </span>
                    </td>

                    {/* Title + location */}
                    <td className="px-4 py-4 max-w-[280px]">
                      <p className="font-medium text-slate-900 truncate text-sm group-hover:text-primary-700 transition-colors">
                        {incident.title}
                      </p>
                      {(incident.site_name || incident.department_name) && (
                        <p className="mt-0.5 text-xs text-slate-400 truncate">
                          {[incident.site_name, incident.department_name].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {incident.attachment_count > 0 && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                          <PaperClipIcon className="w-3 h-3" />
                          {incident.attachment_count}
                        </span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600">
                        {INCIDENT_TYPE_LABELS[incident.incident_type] ?? incident.incident_type_display}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-4">
                      <SeverityBadge severity={incident.severity} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <IncidentStatusBadge status={incident.status} size="sm" />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{formatDate(incident.date_of_incident)}</span>
                    </td>

                    {/* Reporter */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600">{incident.reported_by.full_name}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-stone-100 bg-stone-50/50">
              <p className="text-xs text-slate-500">
                Page <span className="font-medium text-slate-700">{page}</span> of{' '}
                <span className="font-medium text-slate-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
