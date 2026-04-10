import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FlagIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/permissions';
import { useObjectives, useObjectiveStats } from '../hooks/useObjectives';
import ObjectiveStatusBadge from '../components/ObjectiveStatusBadge';
import AchievementBar from '../components/AchievementBar';
import type { ObjectiveStatus, EffectivenessDecision } from '../types/objective.types';

const EFFECTIVENESS_LABELS: Record<EffectivenessDecision, string> = {
  pending: 'Pending',
  effective: 'Effective',
  partially_effective: 'Partial',
  not_effective: 'Not Effective',
};
const EFFECTIVENESS_CLS: Record<EffectivenessDecision, string> = {
  pending: 'bg-stone-100 text-slate-400',
  effective: 'bg-emerald-50 text-emerald-700',
  partially_effective: 'bg-amber-50 text-amber-700',
  not_effective: 'bg-red-50 text-red-700',
};

const LINKED_METRIC_LABELS: Record<string, string> = {
  manual: 'Manual Entry',
  near_miss_count: 'Near Miss Count',
  total_incident_count: 'Total Incident Count',
  injury_count: 'Injury Count',
  critical_incident_count: 'Critical Incident Count',
  open_incident_count: 'Open Incident Count',
  overdue_ca_count: 'Overdue CAs',
  ca_closure_rate: 'CA Closure Rate',
  open_investigation_count: 'Open Investigations',
};

const STATUS_OPTIONS: { value: ObjectiveStatus; label: string }[] = [
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk',  label: 'At Risk'  },
  { value: 'behind',   label: 'Behind'   },
  { value: 'achieved', label: 'Achieved' },
  { value: 'closed',   label: 'Closed'   },
];

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
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '14px',
      }}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function ObjectiveListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'organizational' | 'individual'>('organizational');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: stats } = useObjectiveStats();
  const { data: objectives = [], isLoading } = useObjectives({
    scope: activeTab,
    status: statusFilter || undefined,
  });

  const filtered = search
    ? objectives.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()))
    : objectives;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Objectives &amp; KPIs
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track safety objectives and key performance indicators across your organization.
            </p>
          </div>
          {can.manageObjectives(user?.role ?? '') && (
            <Link to="/objectives/new">
              <Button size="md" iconLeft={<PlusIcon className="w-4 h-4" />}>
                New Objective
              </Button>
            </Link>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total" value={stats?.total} description="objectives" accent="default" />
          <StatCard label="On Track" value={stats?.on_track} description="progressing well" accent="success" />
          <StatCard label="At Risk" value={stats?.at_risk} description="need attention" accent="warning" />
          <StatCard label="Behind" value={stats?.behind} description="off target" accent="danger" />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex items-center gap-1 px-5 pt-4 border-b border-stone-100">
            {(['organizational', 'individual'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setStatusFilter(''); }}
                className={[
                  'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize',
                  activeTab === tab
                    ? 'text-primary-700 border-b-2 border-primary-600 -mb-px bg-white'
                    : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search objectives…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-56 pl-8 pr-3 text-xs rounded-lg border border-stone-100 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="w-px h-4 bg-stone-200" />
            <FilterSelect
              label="All statuses"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
            />
            {activeTab === 'individual' && (
              <>
                <div className="ml-auto" />
                <Link to="/objectives/league-table">
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<TrophyIcon className="w-3.5 h-3.5" />}
                  >
                    League Table
                  </Button>
                </Link>
              </>
            )}
            <div className={activeTab === 'individual' ? '' : 'ml-auto'}>
              <span className="text-xs text-slate-400">
                {isLoading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={activeTab === 'organizational' ? 7 : 6} />
                ))}
              </tbody>
            </table>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FlagIcon className="w-6 h-6" />}
              title={`No ${activeTab} objectives yet`}
              description="Create your first objective to start tracking safety performance."
              action={
                can.manageObjectives(user?.role ?? '') ? (
                  <Link to="/objectives/new">
                    <Button size="sm" iconLeft={<PlusIcon className="w-3.5 h-3.5" />}>
                      New Objective
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : activeTab === 'organizational' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Title', 'Category', 'Linked Metric', 'Progress', 'Status', 'Effectiveness', 'Owner', 'Target Date'].map(
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
                {filtered.map((obj) => (
                  <tr
                    key={obj.id}
                    onClick={() => navigate(`/objectives/${obj.id}`)}
                    className="group cursor-pointer hover:bg-stone-50/70 transition-colors duration-100"
                  >
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <p className="font-medium text-slate-900 truncate text-sm group-hover:text-primary-700 transition-colors">
                        {obj.title}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500 capitalize">{obj.category}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500">
                        {LINKED_METRIC_LABELS[obj.linked_metric] ?? obj.linked_metric}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <AchievementBar value={obj.achievement_pct} direction={obj.direction} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <ObjectiveStatusBadge status={obj.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${EFFECTIVENESS_CLS[obj.effectiveness_decision]}`}>
                        {EFFECTIVENESS_LABELS[obj.effectiveness_decision]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{obj.owner_name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{formatDate(obj.target_date)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Title', 'Owner', 'Progress', 'Status', 'Frequency', 'Target Date'].map(
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
                {filtered.map((obj) => (
                  <tr
                    key={obj.id}
                    onClick={() => navigate(`/objectives/${obj.id}`)}
                    className="group cursor-pointer hover:bg-stone-50/70 transition-colors duration-100"
                  >
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <p className="font-medium text-slate-900 truncate text-sm group-hover:text-primary-700 transition-colors">
                        {obj.title}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{obj.owner_name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <AchievementBar value={obj.achievement_pct} direction={obj.direction} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <ObjectiveStatusBadge status={obj.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500 capitalize">
                        {obj.measurement_frequency.replace('_', '-')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500">{formatDate(obj.target_date)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
