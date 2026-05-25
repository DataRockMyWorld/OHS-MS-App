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
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ArrowPathIcon,
  PlusIcon,
  ClockIcon,
  ShieldExclamationIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import type {
  OverdueAction,
  RecentOpenIncident,
  OpenInvestigation,
  FunnelStage,
  PipelineStage,
} from '../types/dashboard.types';

// ─── Greeting ─────────────────────────────────────────────────────────────────

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

// ─── Skeletons ────────────────────────────────────────────────────────────────

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-100', className)} />;
}

function DashboardSkeleton() {
  return (
    <div className="px-8 py-8 max-w-screen-xl mx-auto space-y-8">
      <div>
        <Bone className="h-7 w-52 mb-2" />
        <Bone className="h-3 w-40" />
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <Bone className="h-2.5 w-20 mb-4" />
            <Bone className="h-8 w-12 mb-2" />
            <Bone className="h-2 w-16" />
          </div>
        ))}
      </div>
      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <Bone className="h-3.5 w-32 mb-1" /><Bone className="h-2.5 w-24 mb-6" />
          <Bone className="h-56 rounded-xl" />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <Bone className="h-3.5 w-32 mb-1" /><Bone className="h-2.5 w-24 mb-6" />
          <Bone className="h-56 rounded-xl" />
        </div>
      </div>
      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <Bone className="h-3.5 w-32 mb-1" /><Bone className="h-2.5 w-24 mb-6" />
          <Bone className="h-48 rounded-xl" />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <Bone className="h-3.5 w-32 mb-1" /><Bone className="h-2.5 w-24 mb-6" />
          <Bone className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 rounded-xl shadow-xl px-4 py-3 text-xs">
      {label && <p className="font-medium text-slate-400 mb-2 leading-none">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name.replace(/_/g, ' ')}</span>
          <span className="ml-auto font-semibold text-white pl-5">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: number;
  sub?: string;
  alert?: boolean;
  color?: 'default' | 'red' | 'amber' | 'emerald' | 'blue' | 'violet' | 'orange';
  href?: string;
  icon: React.ElementType;
}

const KPI_VALUE_COLORS: Record<NonNullable<KPICardProps['color']>, string> = {
  default:  'text-slate-900',
  red:      'text-red-700',
  amber:    'text-amber-700',
  emerald:  'text-emerald-700',
  blue:     'text-blue-700',
  violet:   'text-violet-700',
  orange:   'text-orange-600',
};
const KPI_BG_COLORS: Record<NonNullable<KPICardProps['color']>, string> = {
  default:  'bg-white border-stone-100',
  red:      'bg-red-50 border-red-100',
  amber:    'bg-amber-50 border-amber-100',
  emerald:  'bg-emerald-50 border-emerald-100',
  blue:     'bg-blue-50 border-blue-100',
  violet:   'bg-violet-50 border-violet-100',
  orange:   'bg-orange-50 border-orange-100',
};
const KPI_ICON_CONTAINER: Record<NonNullable<KPICardProps['color']>, string> = {
  default:  'bg-slate-100 text-slate-500',
  red:      'bg-red-100 text-red-500',
  amber:    'bg-amber-100 text-amber-600',
  emerald:  'bg-emerald-100 text-emerald-600',
  blue:     'bg-blue-100 text-blue-500',
  violet:   'bg-violet-100 text-violet-600',
  orange:   'bg-orange-100 text-orange-500',
};

function KPICard({ label, value, sub, alert, color = 'default', href, icon: Icon }: KPICardProps) {
  const inner = (
    <div className={cn(
      'rounded-2xl border px-5 py-5 shadow-sm transition-all duration-150 group',
      KPI_BG_COLORS[color],
      href && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
    )}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-medium text-slate-500 leading-tight pr-2">{label}</p>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', KPI_ICON_CONTAINER[color])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className={cn('text-3xl font-bold tracking-tight leading-none tabular-nums', KPI_VALUE_COLORS[color])}>
        {value}
      </p>
      {sub && (
        <p className={cn('mt-2 text-[11px] leading-none', alert ? 'text-red-500 font-medium' : 'text-slate-400')}>
          {sub}
        </p>
      )}
    </div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

// ─── Chips ────────────────────────────────────────────────────────────────────

const SEVERITY_CLS: Record<string, string> = {
  critical: 'bg-red-50 text-red-600',
  high:     'bg-orange-50 text-orange-600',
  medium:   'bg-amber-50 text-amber-600',
  low:      'bg-slate-50 text-slate-500',
};

function SeverityChip({ s }: { s: string }) {
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0', SEVERITY_CLS[s] ?? 'bg-slate-50 text-slate-500')}>
      {s}
    </span>
  );
}

const INV_STATUS_CLS: Record<string, string> = {
  initiated:              'bg-blue-50 text-blue-600',
  in_progress:            'bg-orange-50 text-orange-600',
  findings_recorded:      'bg-yellow-50 text-yellow-700',
  recommendations_issued: 'bg-teal-50 text-teal-700',
  closed:                 'bg-slate-50 text-slate-500',
};

function InvStatusChip({ status, label }: { status: string; label: string }) {
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', INV_STATUS_CLS[status] ?? 'bg-slate-50 text-slate-500')}>
      {label}
    </span>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function ChartCard({ title, sub, children, className }: {
  title: string; sub?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5', className)}>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5 mb-5">{sub}</p>}
      {!sub && <div className="mb-5" />}
      {children}
    </div>
  );
}

// ─── Incident trend ───────────────────────────────────────────────────────────

function IncidentTrendChart({ data }: { data: { label: string; total: number; near_miss: number; injury: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="gTotal"    x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gNear"     x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gInjury"   x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="total"     name="total"     stroke="#6366f1" strokeWidth={1.5} fill="url(#gTotal)"  dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
        <Area type="monotone" dataKey="near_miss" name="near miss"  stroke="#f59e0b" strokeWidth={1.5} fill="url(#gNear)"   dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
        <Area type="monotone" dataKey="injury"    name="injury"     stroke="#ef4444" strokeWidth={1.5} fill="url(#gInjury)" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Investigation funnel ─────────────────────────────────────────────────────

const FUNNEL_COLORS: Record<string, string> = {
  initiated:              '#3b82f6',
  in_progress:            '#f97316',
  findings_recorded:      '#eab308',
  recommendations_issued: '#0d9488',
  closed:                 '#94a3b8',
};

function InvestigationFunnel({ stages }: { stages: FunnelStage[] }) {
  const total = stages.reduce((s, st) => s + st.count, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-slate-400">
        No investigations yet
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {stages.map((stage) => {
        const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
        const color = FUNNEL_COLORS[stage.status] ?? '#94a3b8';
        return (
          <div key={stage.status}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-600">{stage.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 tabular-nums">{stage.count}</span>
                <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">{pct}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CA pipeline ──────────────────────────────────────────────────────────────

const PIPELINE_COLORS: Record<string, string> = {
  open:        '#3b82f6',
  in_progress: '#f97316',
  implemented: '#0d9488',
  closed:      '#94a3b8',
};

function CAPipelineChart({ stages }: { stages: PipelineStage[] }) {
  const total = stages.reduce((s, st) => s + st.count, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-slate-400">
        No corrective actions yet
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Stacked bar */}
      <div className="flex h-6 rounded-xl overflow-hidden gap-0.5">
        {stages.filter(s => s.count > 0).map((stage) => {
          const pct = (stage.count / total) * 100;
          return (
            <div
              key={stage.status}
              className="transition-all duration-700 first:rounded-l-xl last:rounded-r-xl"
              style={{ width: `${pct}%`, backgroundColor: PIPELINE_COLORS[stage.status] ?? '#94a3b8' }}
              title={`${stage.label}: ${stage.count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-3">
        {stages.map((stage) => {
          const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
          const color = PIPELINE_COLORS[stage.status] ?? '#94a3b8';
          return (
            <div key={stage.status} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <div className="min-w-0">
                <p className="text-xs text-slate-600 truncate">{stage.label}</p>
                <p className="text-[11px] text-slate-400 tabular-nums">{stage.count} · {pct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Incidents by type ────────────────────────────────────────────────────────

const TYPE_COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'];

function IncidentsByTypeChart({ data }: { data: { label: string; count: number }[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-slate-400">
        No data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" width={112} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-slate-900 rounded-xl shadow-xl px-4 py-3 text-xs">
                <p className="font-medium text-slate-300">{payload[0].payload.label}</p>
                <p className="text-slate-400 mt-1">{payload[0].value} incidents</p>
              </div>
            );
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={14}>
          {data.map((_, i) => (
            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── List rows ────────────────────────────────────────────────────────────────

function ListCard({ title, viewAllHref, children, empty }: {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <Link to={viewAllHref} className="text-xs text-slate-400 hover:text-primary-600 transition-colors">
          View all
        </Link>
      </div>
      {empty ? (
        <div className="flex items-center justify-center py-10 text-xs text-slate-400">
          Nothing here
        </div>
      ) : children}
    </div>
  );
}

function OpenIncidentRow({ inc }: { inc: RecentOpenIncident }) {
  return (
    <Link
      to={`/incidents/${inc.id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
    >
      <span className="text-[10px] font-mono text-slate-300 shrink-0 w-22 truncate">{inc.reference_number}</span>
      <span className="flex-1 text-sm text-slate-600 truncate group-hover:text-slate-900 transition-colors min-w-0">
        {inc.title}
      </span>
      <SeverityChip s={inc.severity} />
      <span className={cn(
        'text-[11px] font-medium tabular-nums shrink-0 w-8 text-right',
        inc.days_open > 30 ? 'text-red-500' : inc.days_open > 14 ? 'text-amber-500' : 'text-slate-400',
      )}>
        {inc.days_open}d
      </span>
    </Link>
  );
}

function OverdueCARow({ ca }: { ca: OverdueAction }) {
  return (
    <Link
      to={`/corrective-actions/${ca.id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
    >
      <span className="text-[10px] font-mono text-slate-300 shrink-0 w-22 truncate">{ca.reference_number}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-600 truncate group-hover:text-slate-900 transition-colors">{ca.title}</p>
        {ca.assigned_to && (
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{ca.assigned_to}</p>
        )}
      </div>
      <span className="flex items-center gap-1 text-[11px] font-medium text-red-400 shrink-0 tabular-nums">
        <ClockIcon className="w-3 h-3" />
        {ca.days_overdue}d
      </span>
    </Link>
  );
}

function OpenInvestigationRow({ inv }: { inv: OpenInvestigation }) {
  return (
    <Link
      to={`/investigations/${inv.id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
    >
      <span className="text-[10px] font-mono text-slate-300 shrink-0 w-22 truncate">{inv.reference_number}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-600 truncate group-hover:text-slate-900 transition-colors">{inv.title}</p>
        {inv.lead_investigator && (
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{inv.lead_investigator}</p>
        )}
      </div>
      <InvStatusChip status={inv.status} label={inv.status_display} />
      <span className={cn(
        'text-[11px] font-medium tabular-nums shrink-0 w-8 text-right',
        inv.is_overdue ? 'text-red-500' : inv.days_open > 30 ? 'text-amber-500' : 'text-slate-400',
      )}>
        {inv.days_open}d
      </span>
    </Link>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Report Incident',         href: '/incidents/new' },
  { label: 'Open Investigation',      href: '/investigations/new' },
  { label: 'Raise Corrective Action', href: '/corrective-actions/new' },
  { label: 'Add Context Issue',       href: '/context/issues/new' },
];

function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-50">
        <p className="text-sm font-semibold text-slate-800">Quick Actions</p>
      </div>
      <ul>
        {QUICK_ACTIONS.map((a, i) => (
          <li key={a.href}>
            <Link
              to={a.href}
              className={cn(
                'flex items-center justify-between px-5 py-3 text-sm text-slate-600 hover:bg-slate-50/60 hover:text-slate-900 transition-colors',
                i < QUICK_ACTIONS.length - 1 && 'border-b border-stone-50',
              )}
            >
              {a.label}
              <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Empty + Error states ─────────────────────────────────────────────────────

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <ShieldExclamationIcon className="w-7 h-7 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">No safety data yet</p>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const { salutation, firstName, dateStr } = useGreeting();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="px-8 py-8 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-red-700">Failed to load dashboard.</p>
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

  const {
    kpis,
    incident_trend,
    incidents_by_type,
    recent_open_incidents,
    overdue_actions,
    investigation_funnel,
    ca_pipeline,
    open_investigations_list,
  } = data;

  const hasData =
    kpis.incidents_this_month > 0 ||
    kpis.open_incidents > 0 ||
    incident_trend.some((t) => t.total > 0);

  return (
    <div className="px-8 py-8 max-w-screen-xl mx-auto space-y-7">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {salutation}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{dateStr} · ISO 45001:2018</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowPathIcon className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI row — 6 equal cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KPICard
          label="Incidents This Month"
          value={kpis.incidents_this_month}
          sub={kpis.near_miss_this_month > 0 ? `${kpis.near_miss_this_month} near miss` : undefined}
          color={kpis.incidents_this_month > 0 ? 'orange' : 'default'}
          href="/incidents"
          icon={ExclamationTriangleIcon}
        />
        <KPICard
          label="Open Incidents"
          value={kpis.open_incidents}
          sub={kpis.critical_open > 0 ? `${kpis.critical_open} critical` : 'none critical'}
          alert={kpis.critical_open > 0}
          color={kpis.critical_open > 0 ? 'red' : kpis.open_incidents > 0 ? 'amber' : 'default'}
          href="/incidents"
          icon={ShieldExclamationIcon}
        />
        <KPICard
          label="Overdue Actions"
          value={kpis.overdue_actions}
          sub={kpis.overdue_actions > 0 ? 'action required' : 'all on track'}
          alert={kpis.overdue_actions > 0}
          color={kpis.overdue_actions > 0 ? 'red' : 'emerald'}
          href="/corrective-actions"
          icon={ClockIcon}
        />
        <KPICard
          label="Open Investigations"
          value={kpis.open_investigations}
          sub={kpis.open_investigations > 0 ? 'in pipeline' : 'none open'}
          color={kpis.open_investigations > 0 ? 'blue' : 'default'}
          href="/investigations"
          icon={MagnifyingGlassIcon}
        />
        <KPICard
          label="Pending CA Reviews"
          value={kpis.pending_reviews}
          sub={kpis.pending_reviews > 0 ? 'awaiting review' : 'none pending'}
          color={kpis.pending_reviews > 0 ? 'violet' : 'default'}
          href="/corrective-actions"
          icon={CheckCircleIcon}
        />
        <KPICard
          label="Lost Time Injuries"
          value={kpis.lti_count}
          sub="all time"
          color={kpis.lti_count > 0 ? 'red' : 'emerald'}
          href="/incidents"
          icon={DocumentTextIcon}
        />
      </div>

      {/* ── Charts row 1: Incident trend + CA pipeline ───────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        <ChartCard
          className="lg:col-span-3"
          title="Incident Trend"
          sub="Rolling 6-month view · total, near-miss, injury"
        >
          {hasData ? (
            <IncidentTrendChart data={incident_trend} />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-xs text-slate-400">
              No incident data yet
            </div>
          )}
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Corrective Action Pipeline"
          sub={`${ca_pipeline.reduce((s, p) => s + p.count, 0)} total actions`}
        >
          <CAPipelineChart stages={ca_pipeline} />
        </ChartCard>
      </div>

      {/* ── Charts row 2: Investigation funnel + Incidents by type ───────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        <ChartCard
          className="lg:col-span-2"
          title="Investigation Pipeline"
          sub={`${investigation_funnel.reduce((s, f) => s + f.count, 0)} total investigations`}
        >
          <InvestigationFunnel stages={investigation_funnel} />
        </ChartCard>

        <ChartCard
          className="lg:col-span-3"
          title="Incidents by Type"
          sub={`All time${incidents_by_type.length > 0 ? ` · top ${Math.min(incidents_by_type.length, 6)}` : ''}`}
        >
          <IncidentsByTypeChart data={incidents_by_type.slice(0, 6)} />
        </ChartCard>
      </div>

      {/* ── Lists row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Recent open incidents — 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          <ListCard
            title="Recent Open Incidents"
            viewAllHref="/incidents"
            empty={recent_open_incidents.length === 0}
          >
            <ul className="divide-y divide-stone-50">
              {recent_open_incidents.map((inc) => (
                <li key={inc.id}><OpenIncidentRow inc={inc} /></li>
              ))}
            </ul>
          </ListCard>

          <ListCard
            title="Open Investigations"
            viewAllHref="/investigations"
            empty={open_investigations_list.length === 0}
          >
            <ul className="divide-y divide-stone-50">
              {open_investigations_list.map((inv) => (
                <li key={inv.id}><OpenInvestigationRow inv={inv} /></li>
              ))}
            </ul>
          </ListCard>
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-5">
          <ListCard
            title="Overdue Corrective Actions"
            viewAllHref="/corrective-actions"
            empty={overdue_actions.length === 0}
          >
            <ul className="divide-y divide-stone-50">
              {overdue_actions.map((ca) => (
                <li key={ca.id}><OverdueCARow ca={ca} /></li>
              ))}
            </ul>
          </ListCard>

          <QuickActions />
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!hasData && <EmptyDashboard />}

    </div>
  );
}
