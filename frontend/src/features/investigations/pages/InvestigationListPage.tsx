import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/permissions';
import { useInvestigations, useInvestigationStats } from '../hooks/useInvestigations';
import InvestigationStatusBadge from '../components/InvestigationStatusBadge';
import type {
  InvestigationFilters,
  InvestigationStatus,
  RCAMethod,
} from '../types/investigation.types';
import { RCA_METHOD_LABELS } from '../types/investigation.types';

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: InvestigationStatus; label: string }[] = [
  { value: 'initiated',              label: 'Initiated' },
  { value: 'in_progress',            label: 'In Progress' },
  { value: 'findings_recorded',      label: 'Findings Recorded' },
  { value: 'recommendations_issued', label: 'Recommendations Issued' },
  { value: 'closed',                 label: 'Closed' },
];

const RCA_OPTIONS: { value: RCAMethod; label: string }[] = Object.entries(RCA_METHOD_LABELS).map(
  ([value, label]) => ({ value: value as RCAMethod, label }),
);

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

export default function InvestigationListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rcaFilter, setRcaFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters: InvestigationFilters = {
    page,
    search: search || undefined,
    status: statusFilter ? [statusFilter as InvestigationStatus] : undefined,
    rca_method: rcaFilter ? [rcaFilter as RCAMethod] : undefined,
  };

  const { data, isLoading } = useInvestigations(filters);
  const { data: stats } = useInvestigationStats();

  const investigations = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasFilters = !!(search || statusFilter || rcaFilter);

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
    setRcaFilter('');
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Investigations</h1>
            <p className="mt-1 text-sm text-slate-500">
              Root cause analysis and corrective findings for safety incidents.
            </p>
          </div>
          {can.manageInvestigations(user?.role ?? '') && (
            <Link to="/investigations/new">
              <Button size="md" iconLeft={<PlusIcon className="w-4 h-4" />}>
                New Investigation
              </Button>
            </Link>
          )}
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="This Month"
            value={stats?.this_month}
            description="investigations opened"
            accent="default"
          />
          <StatCard
            label="Open"
            value={stats?.open_count}
            description="actively managed"
            accent="warning"
          />
          <StatCard
            label="Overdue"
            value={stats?.overdue_count}
            description="past target date"
            accent="danger"
          />
          <StatCard
            label="Closed"
            value={stats?.closed_count}
            description="completed"
            accent="success"
          />
        </div>

        {/* ── Table card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search investigations…"
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
              label="All RCA methods"
              value={rcaFilter}
              onChange={(v) => { setRcaFilter(v); setPage(1); }}
              options={RCA_OPTIONS}
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
                  <SkeletonTableRow key={i} cols={6} />
                ))}
              </tbody>
            </table>
          ) : investigations.length === 0 ? (
            <EmptyState
              icon={<ExclamationTriangleIcon className="w-6 h-6" />}
              title={hasFilters ? 'No investigations match your filters' : 'No investigations yet'}
              description={
                hasFilters
                  ? 'Try adjusting or clearing your filters.'
                  : 'Open an investigation from an incident to get started.'
              }
              action={
                !hasFilters && can.manageInvestigations(user?.role ?? '') ? (
                  <Link to="/investigations/new">
                    <Button size="sm" iconLeft={<PlusIcon className="w-3.5 h-3.5" />}>
                      New Investigation
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
                  {['Reference', 'Investigation', 'Status', 'RCA Method', 'Lead Investigator', 'Target Date'].map(
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
                {investigations.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/investigations/${inv.id}`)}
                    className="group cursor-pointer hover:bg-stone-50/70 transition-colors duration-100"
                  >
                    {/* Reference */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-400 bg-stone-100 px-2 py-0.5 rounded-md">
                        {inv.reference_number}
                      </span>
                    </td>

                    {/* Title + incident link */}
                    <td className="px-4 py-4 max-w-[300px]">
                      <p className="font-medium text-slate-900 truncate text-sm group-hover:text-primary-700 transition-colors">
                        {inv.title}
                      </p>
                      {inv.incident_reference && (
                        <p className="mt-0.5 text-xs text-slate-400 truncate font-mono">
                          {inv.incident_reference}
                          {inv.incident_title && (
                            <span className="font-sans"> · {inv.incident_title}</span>
                          )}
                        </p>
                      )}
                      {inv.is_overdue && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-red-600">
                          <ClockIcon className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <InvestigationStatusBadge status={inv.status} size="sm" />
                    </td>

                    {/* RCA method */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600">
                        {inv.rca_method ? RCA_METHOD_LABELS[inv.rca_method] : (
                          <span className="text-slate-300">—</span>
                        )}
                      </span>
                    </td>

                    {/* Lead investigator */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600">
                        {inv.lead_investigator?.full_name ?? (
                          <span className="text-slate-300">Unassigned</span>
                        )}
                      </span>
                    </td>

                    {/* Target date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-xs ${inv.is_overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                        {inv.target_completion_date
                          ? formatDate(inv.target_completion_date)
                          : <span className="text-slate-300">—</span>
                        }
                      </span>
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
                <Button variant="secondary" size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
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
