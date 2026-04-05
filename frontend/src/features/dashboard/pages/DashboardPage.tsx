import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ArrowPathIcon,
  PlusIcon,
  ClockIcon,
  ShieldExclamationIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import type { OverdueAction, RecentOpenIncident } from '../types/dashboard.types';

// ── Greeting helpers ───────────────────────────────────────────────────────

function useGreeting() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const salutation = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || '';
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  return { salutation, firstName, dateStr };
}

// ── KPI accent system ──────────────────────────────────────────────────────

type KPIAccent = 'neutral' | 'amber' | 'red' | 'emerald' | 'blue' | 'violet' | 'orange';

const ACCENT_NUM: Record<KPIAccent, string> = {
  neutral: 'text-slate-900',
  amber:   'text-amber-600',
  red:     'text-red-600',
  emerald: 'text-emerald-600',
  blue:    'text-blue-600',
  violet:  'text-violet-600',
  orange:  'text-orange-600',
};

// ── Primary KPI card — large, hero number ──────────────────────────────────

interface PrimaryKPICardProps {
  label: string;
  value: number;
  sublabel?: string;
  sublabelAlert?: boolean;
  accent?: KPIAccent;
  href?: string;
}

function PrimaryKPICard({
  label,
  value,
  sublabel,
  sublabelAlert = false,
  accent = 'neutral',
  href,
}: PrimaryKPICardProps) {
  const inner = (
    <div className={cn(
      'bg-white rounded-2xl border border-stone-100 px-6 py-7 shadow-sm transition-all duration-150',
      href && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
    )}>
      <p className="text-xs font-medium text-slate-400 leading-none">{label}</p>
      <p className={cn('mt-4 text-4xl font-bold tracking-tight leading-none', ACCENT_NUM[accent])}>
        {value}
      </p>
      {sublabel && (
        <p className={cn('mt-2.5 text-xs leading-none', sublabelAlert ? 'text-red-400 font-medium' : 'text-slate-400')}>
          {sublabel}
        </p>
      )}
    </div>
  );
  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

// ── Secondary KPI card — compact ──────────────────────────────────────────

interface SecondaryKPICardProps {
  label: string;
  value: number;
  accent?: KPIAccent;
  href?: string;
}

function SecondaryKPICard({ label, value, accent = 'neutral', href }: SecondaryKPICardProps) {
  const inner = (
    <div className={cn(
      'bg-white rounded-xl border border-stone-100 px-5 py-5 shadow-sm transition-all duration-150',
      href && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
    )}>
      <p className="text-[11px] font-medium text-slate-400 leading-none">{label}</p>
      <p className={cn('mt-3 text-2xl font-semibold tracking-tight leading-none', ACCENT_NUM[accent])}>
        {value}
      </p>
    </div>
  );
  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

// ── Skeleton helpers ───────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-100', className)} />;
}

function KPISkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 px-6 py-7 shadow-sm">
            <SkeletonBlock className="h-3 w-28 mb-4" />
            <SkeletonBlock className="h-9 w-14" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 px-5 py-5 shadow-sm">
            <SkeletonBlock className="h-2.5 w-20 mb-3" />
            <SkeletonBlock className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-7 py-6 shadow-sm">
      <SkeletonBlock className="h-3.5 w-36 mb-1.5" />
      <SkeletonBlock className="h-3 w-24 mb-6" />
      <div className="animate-pulse rounded-xl bg-slate-100" style={{ height }} />
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="px-6 py-5 border-b border-stone-50">
        <SkeletonBlock className="h-3.5 w-40" />
      </div>
      <ul className="divide-y divide-stone-50">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="px-6 py-4 flex items-center gap-3">
            <SkeletonBlock className="h-3 w-20 shrink-0" />
            <SkeletonBlock className="h-3 flex-1" />
            <SkeletonBlock className="h-5 w-14 shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Chart tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl px-4 py-3.5 text-xs">
      <p className="font-medium text-slate-400 mb-2.5 leading-none">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name.replace('_', ' ')}</span>
          <span className="ml-auto font-semibold text-white pl-6">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Severity / Priority chips ──────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-50 text-red-600',
  high:     'bg-orange-50 text-orange-600',
  medium:   'bg-amber-50 text-amber-600',
  low:      'bg-slate-50 text-slate-500',
};

function SeverityChip({ severity }: { severity: string }) {
  return (
    <span className={cn(
      'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
      SEVERITY_COLORS[severity] ?? 'bg-slate-50 text-slate-500',
    )}>
      {severity}
    </span>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-50 text-red-600',
  high:     'bg-orange-50 text-orange-600',
  medium:   'bg-amber-50 text-amber-600',
  low:      'bg-slate-50 text-slate-500',
};

function PriorityChip({ priority }: { priority: string }) {
  return (
    <span className={cn(
      'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
      PRIORITY_COLORS[priority] ?? 'bg-slate-50 text-slate-500',
    )}>
      {priority}
    </span>
  );
}

// ── Open Incident row ──────────────────────────────────────────────────────

function OpenIncidentRow({ inc }: { inc: RecentOpenIncident }) {
  return (
    <Link
      to={`/incidents/${inc.id}`}
      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group"
    >
      <span className="text-[11px] font-mono text-slate-300 shrink-0 w-24 truncate">
        {inc.reference_number}
      </span>
      <span className="flex-1 text-sm text-slate-600 truncate group-hover:text-slate-900 min-w-0 transition-colors">
        {inc.title}
      </span>
      <SeverityChip severity={inc.severity} />
      <span className={cn(
        'text-[11px] font-medium shrink-0 tabular-nums',
        inc.days_open > 30 ? 'text-red-500' : inc.days_open > 14 ? 'text-amber-500' : 'text-slate-400',
      )}>
        {inc.days_open}d
      </span>
    </Link>
  );
}

// ── Overdue Action row ─────────────────────────────────────────────────────

function OverdueActionRow({ ca }: { ca: OverdueAction }) {
  return (
    <Link
      to={`/corrective-actions/${ca.id}`}
      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group"
    >
      <span className="text-[11px] font-mono text-slate-300 shrink-0 w-24 truncate">
        {ca.reference_number}
      </span>
      <span className="flex-1 text-sm text-slate-600 truncate group-hover:text-slate-900 min-w-0 transition-colors">
        {ca.title}
      </span>
      <PriorityChip priority={ca.priority} />
      <span className="flex items-center gap-1 text-[11px] font-medium text-red-400 shrink-0 tabular-nums">
        <ClockIcon className="w-3 h-3" />
        {ca.days_overdue}d
      </span>
    </Link>
  );
}

// ── Quick Actions ──────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Report Incident',          href: '/incidents/new' },
  { label: 'Open Investigation',       href: '/investigations/new' },
  { label: 'Raise Corrective Action',  href: '/corrective-actions/new' },
  { label: 'View All Incidents',       href: '/incidents' },
];

function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-50">
        <p className="text-sm font-medium text-slate-700">Quick Actions</p>
      </div>
      <ul>
        {QUICK_ACTIONS.map((a, i) => (
          <li key={a.href}>
            <Link
              to={a.href}
              className={cn(
                'flex items-center justify-between px-6 py-3.5 text-sm text-slate-600 hover:bg-slate-50/70 hover:text-slate-900 transition-colors',
                i < QUICK_ACTIONS.length - 1 && 'border-b border-stone-50',
              )}
            >
              {a.label}
              <ChevronRightIcon className="w-4 h-4 text-slate-300 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <ShieldExclamationIcon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">No safety data yet</p>
      <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">
        Start by reporting your first incident to populate the dashboard.
      </p>
      <Link
        to="/incidents/new"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Report First Incident
      </Link>
    </div>
  );
}

// ── Bar chart color palette ────────────────────────────────────────────────

const TYPE_BAR_COLORS = [
  '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6',
  '#f59e0b', '#f97316', '#ef4444', '#8b5cf6',
];

// ── Dashboard page ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const { salutation, firstName, dateStr } = useGreeting();

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-8 py-8 space-y-10 max-w-screen-xl mx-auto">
        <div>
          <div className="animate-pulse h-7 w-56 bg-stone-200 rounded-lg" />
          <div className="animate-pulse h-3 w-40 bg-stone-200 rounded mt-2.5" />
        </div>
        <KPISkeleton />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3"><ChartSkeleton height={280} /></div>
          <div className="lg:col-span-2"><ChartSkeleton height={280} /></div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><ListSkeleton rows={5} /></div>
          <div className="space-y-4">
            <ListSkeleton rows={4} />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="px-8 py-8 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-red-700">Failed to load dashboard data.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  const { kpis, incident_trend, incidents_by_type, recent_open_incidents, overdue_actions } = data;
  const hasData = kpis.incidents_this_month > 0 || kpis.open_incidents > 0 || incident_trend.some(t => t.total > 0);

  // ── Empty state ────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="px-8 py-8 max-w-screen-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
            {salutation}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="text-sm text-slate-400 mt-1">{dateStr} · ISO 45001:2018</p>
        </div>
        <EmptyDashboard />
      </div>
    );
  }

  const topTypes = incidents_by_type.slice(0, 6);

  return (
    <div className="px-8 py-8 space-y-10 max-w-screen-xl mx-auto">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
            {salutation}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="text-sm text-slate-400 mt-1">{dateStr} · ISO 45001:2018</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-400 hover:text-slate-600 transition-colors"
        >
          <ArrowPathIcon className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI section ─────────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Primary KPIs */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <PrimaryKPICard
            label="Incidents This Month"
            value={kpis.incidents_this_month}
            accent={kpis.incidents_this_month > 0 ? 'orange' : 'neutral'}
            href="/incidents"
          />
          <PrimaryKPICard
            label="Open Incidents"
            value={kpis.open_incidents}
            sublabel={kpis.critical_open > 0 ? `${kpis.critical_open} critical` : undefined}
            sublabelAlert={kpis.critical_open > 0}
            accent={kpis.critical_open > 0 ? 'red' : kpis.open_incidents > 0 ? 'amber' : 'neutral'}
            href="/incidents"
          />
          <PrimaryKPICard
            label="Overdue Actions"
            value={kpis.overdue_actions}
            sublabel={kpis.overdue_actions > 0 ? 'action required' : 'all on track'}
            sublabelAlert={kpis.overdue_actions > 0}
            accent={kpis.overdue_actions > 0 ? 'red' : 'emerald'}
            href="/corrective-actions"
          />
          <PrimaryKPICard
            label="Lost Time Injuries"
            value={kpis.lti_count}
            sublabel="all time"
            accent={kpis.lti_count > 0 ? 'red' : 'emerald'}
            href="/incidents"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SecondaryKPICard
            label="Near Misses This Month"
            value={kpis.near_miss_this_month}
            accent={kpis.near_miss_this_month > 0 ? 'violet' : 'neutral'}
            href="/incidents"
          />
          <SecondaryKPICard
            label="Open Investigations"
            value={kpis.open_investigations}
            accent={kpis.open_investigations > 0 ? 'blue' : 'neutral'}
            href="/investigations"
          />
          <SecondaryKPICard
            label="Pending CA Reviews"
            value={kpis.pending_reviews}
            accent={kpis.pending_reviews > 0 ? 'amber' : 'neutral'}
            href="/corrective-actions"
          />
          <SecondaryKPICard
            label="Critical Open"
            value={kpis.critical_open}
            accent={kpis.critical_open > 0 ? 'red' : 'neutral'}
            href="/incidents"
          />
        </div>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Incident trend — AreaChart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 shadow-sm px-7 py-6">
          <p className="text-sm font-medium text-slate-700">Incident Trend</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-6">Rolling 6-month view</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={incident_trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNearMiss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradInjury" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#cbd5e1' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#cbd5e1' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '16px' }}
              />
              <Area type="monotone" dataKey="total"     name="total"     stroke="#6366f1" strokeWidth={1.5} fill="url(#gradTotal)"     dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="near_miss" name="near miss"  stroke="#f59e0b" strokeWidth={1.5} fill="url(#gradNearMiss)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="injury"    name="injury"     stroke="#ef4444" strokeWidth={1.5} fill="url(#gradInjury)"    dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by type — horizontal BarChart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm px-7 py-6">
          <p className="text-sm font-medium text-slate-700">Incidents by Type</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-6">
            All time{topTypes.length > 0 ? `, top ${topTypes.length}` : ''}
          </p>
          {topTypes.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-xs text-slate-400">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topTypes}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#cbd5e1' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={108}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0];
                    return (
                      <div className="bg-slate-900 rounded-2xl shadow-xl px-4 py-3 text-xs">
                        <p className="font-medium text-slate-300">{p.payload.label}</p>
                        <p className="text-slate-400 mt-1">{p.value} incidents</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {topTypes.map((_, index) => (
                    <Cell key={index} fill={TYPE_BAR_COLORS[index % TYPE_BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Lists ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent open incidents */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-50">
            <p className="text-sm font-medium text-slate-700">Recent Open Incidents</p>
            <Link to="/incidents" className="text-xs text-slate-400 hover:text-primary-600 transition-colors">
              View all
            </Link>
          </div>
          {recent_open_incidents.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-xs text-slate-400">
              No open incidents
            </div>
          ) : (
            <ul className="divide-y divide-stone-50">
              {recent_open_incidents.map((inc) => (
                <li key={inc.id}>
                  <OpenIncidentRow inc={inc} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Overdue corrective actions */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-50">
              <p className="text-sm font-medium text-slate-700">Overdue Actions</p>
              <Link to="/corrective-actions" className="text-xs text-slate-400 hover:text-primary-600 transition-colors">
                View all
              </Link>
            </div>
            {overdue_actions.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-xs text-slate-400">
                No overdue actions
              </div>
            ) : (
              <ul className="divide-y divide-stone-50">
                {overdue_actions.map((ca) => (
                  <li key={ca.id}>
                    <OverdueActionRow ca={ca} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <QuickActions />
        </div>
      </div>
    </div>
  );
}
