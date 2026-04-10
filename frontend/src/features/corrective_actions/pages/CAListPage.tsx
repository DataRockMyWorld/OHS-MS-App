import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
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
import { useCorrectiveActions, useCAStats } from '../hooks/useCorrectiveActions';
import CAStatusBadge from '../components/CAStatusBadge';
import CAPriorityBadge from '../components/CAPriorityBadge';
import type { CAFilters, CAStatus, CAPriority, CAType } from '../types/ca.types';
import { CA_TYPE_LABELS } from '../types/ca.types';

const STATUS_OPTIONS: { value: CAStatus; label: string }[] = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'implemented', label: 'Awaiting Review' },
  { value: 'closed',      label: 'Closed' },
  { value: 'reopened',    label: 'Reopened' },
];

const PRIORITY_OPTIONS: { value: CAPriority; label: string }[] = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const TYPE_OPTIONS: { value: CAType; label: string }[] = Object.entries(CA_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as CAType, label }),
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

export default function CAListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters: CAFilters = {
    page,
    search: search || undefined,
    status: statusFilter ? [statusFilter as CAStatus] : undefined,
    priority: priorityFilter ? [priorityFilter as CAPriority] : undefined,
    action_type: typeFilter ? [typeFilter as CAType] : undefined,
  };

  const { data, isLoading } = useCorrectiveActions(filters);
  const { data: stats } = useCAStats();

  const actions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters = !!(search || statusFilter || priorityFilter || typeFilter);

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Corrective Actions</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track, implement, and verify the effectiveness of corrective actions.
            </p>
          </div>
          {can.manageCAs(user?.role ?? '') && (
            <Link to="/corrective-actions/new">
              <Button size="md" iconLeft={<PlusIcon className="w-4 h-4" />}>
                Raise Action
              </Button>
            </Link>
          )}
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Open"
            value={stats?.open_count}
            description="active actions"
            accent="default"
          />
          <StatCard
            label="Awaiting Review"
            value={stats?.pending_review_count}
            description="effectiveness not yet verified"
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
            description="verified effective"
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
                placeholder="Search actions…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-8 w-56 pl-8 pr-3 text-xs rounded-lg border border-stone-100 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="w-px h-4 bg-stone-200" />

            <FilterSelect label="All statuses"    value={statusFilter}   onChange={(v) => { setStatusFilter(v);   setPage(1); }} options={STATUS_OPTIONS}   />
            <FilterSelect label="All priorities"  value={priorityFilter} onChange={(v) => { setPriorityFilter(v); setPage(1); }} options={PRIORITY_OPTIONS} />
            <FilterSelect label="All types"       value={typeFilter}     onChange={(v) => { setTypeFilter(v);     setPage(1); }} options={TYPE_OPTIONS}     />

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <div className="ml-auto">
              <span className="text-xs text-slate-400">
                {isLoading ? 'Loading…' : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <table className="w-full">
              <tbody>{Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)}</tbody>
            </table>
          ) : actions.length === 0 ? (
            <EmptyState
              icon={<CheckCircleIcon className="w-6 h-6" />}
              title={hasFilters ? 'No actions match your filters' : 'No corrective actions yet'}
              description={
                hasFilters
                  ? 'Try adjusting or clearing your filters.'
                  : 'Raise a corrective action from an investigation or directly here.'
              }
              action={
                !hasFilters && can.manageCAs(user?.role ?? '') ? (
                  <Link to="/corrective-actions/new">
                    <Button size="sm" iconLeft={<PlusIcon className="w-3.5 h-3.5" />}>
                      Raise first action
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button>
                )
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Reference', 'Title', 'Type', 'Priority', 'Status', 'Assigned To', 'Target Date'].map(col => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 whitespace-nowrap bg-stone-50/60"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actions.map((ca) => (
                  <tr
                    key={ca.id}
                    onClick={() => navigate(`/corrective-actions/${ca.id}`)}
                    className="group cursor-pointer hover:bg-stone-50/70 transition-colors duration-100"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-400 bg-stone-100 px-2 py-0.5 rounded-md">
                        {ca.reference_number}
                      </span>
                    </td>

                    <td className="px-4 py-4 max-w-[280px]">
                      <p className="font-medium text-slate-900 truncate text-sm group-hover:text-primary-700 transition-colors">
                        {ca.title}
                      </p>
                      {(ca.source_investigation_reference || ca.source_incident_reference) && (
                        <p className="mt-0.5 text-xs text-slate-400 font-mono truncate">
                          {ca.source_investigation_reference ?? ca.source_incident_reference}
                        </p>
                      )}
                      {ca.is_overdue && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-red-600">
                          <ClockIcon className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600">{ca.action_type_display}</span>
                    </td>

                    <td className="px-4 py-4">
                      <CAPriorityBadge priority={ca.priority} size="sm" />
                    </td>

                    <td className="px-4 py-4">
                      <CAStatusBadge status={ca.status} size="sm" />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600">
                        {ca.assigned_to?.full_name ?? <span className="text-slate-300">Unassigned</span>}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-xs ${ca.is_overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                        {ca.target_date ? formatDate(ca.target_date) : <span className="text-slate-300">—</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-stone-100 bg-stone-50/50">
              <p className="text-xs text-slate-500">
                Page <span className="font-medium text-slate-700">{page}</span> of{' '}
                <span className="font-medium text-slate-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="secondary" size="xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
