import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useSafetyMetrics } from '../hooks/useReports';
import { INCIDENT_TYPE_LABELS } from '@/features/incidents/types/incident.types';
import type { IncidentType } from '@/features/incidents/types/incident.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function thisYearRange() {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: now.toISOString().slice(0, 10),
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

// ── Small components ──────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  color = 'text-slate-800',
}: {
  label: string;
  value: string | number | null;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>
        {value === null ? <span className="text-slate-300 text-lg">N/A</span> : value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const defaultRange = thisYearRange();
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [hoursInput, setHoursInput] = useState('');

  const filters = {
    from,
    to,
    ...(hoursInput ? { hours_worked: hoursInput } : {}),
  };

  const { data, isLoading, isFetching } = useSafetyMetrics(filters);

  function handleExportCSV() {
    if (!data) return;
    const rows: string[][] = [
      ['Period', data.period.from, 'to', data.period.to],
      [],
      ['KPI', 'Value'],
      ['Total Incidents', String(data.kpis.total_incidents)],
      ['LTI Count', String(data.kpis.lti_count)],
      ['Near Miss Count', String(data.kpis.near_miss_count)],
      ['Recordable Count', String(data.kpis.recordable_count)],
      ['Critical Incidents', String(data.kpis.critical_count)],
      ['LTIFR', data.kpis.ltifr !== null ? String(data.kpis.ltifr) : 'N/A'],
      ['TRIFR', data.kpis.trifr !== null ? String(data.kpis.trifr) : 'N/A'],
      [],
      ['Month', 'Total', 'LTI', 'Near Miss', 'Recordable'],
      ...data.monthly_trend.map((m) => [m.label, String(m.total), String(m.lti), String(m.near_miss), String(m.recordable)]),
      [],
      ['CA Metrics'],
      ['Total CAs', String(data.ca_metrics.total)],
      ['Closed CAs', String(data.ca_metrics.closed)],
      ['Overdue CAs', String(data.ca_metrics.overdue)],
      ['Closure Rate %', String(data.ca_metrics.closure_rate)],
    ];
    downloadCSV(rows, `safety-report-${from}-to-${to}.csv`);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Safety Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Aggregate safety performance metrics for your organisation.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Total person-hours worked{' '}
              <span className="text-slate-300 font-normal">(for LTIFR/TRIFR)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 200000"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {isFetching && (
            <p className="text-xs text-slate-400 self-end pb-2">Refreshing…</p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-slate-400 text-sm">Loading…</div>
      )}

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard label="Total Incidents" value={data.kpis.total_incidents} />
            <KPICard label="LTIs" value={data.kpis.lti_count} color={data.kpis.lti_count > 0 ? 'text-red-600' : 'text-slate-800'} />
            <KPICard label="Near Misses" value={data.kpis.near_miss_count} />
            <KPICard label="Recordable" value={data.kpis.recordable_count} />
            <KPICard
              label="LTIFR"
              value={data.kpis.ltifr !== null ? data.kpis.ltifr.toFixed(2) : null}
              sub="per 1M person-hours"
              color={data.kpis.ltifr && data.kpis.ltifr > 0 ? 'text-red-600' : 'text-slate-800'}
            />
            <KPICard
              label="TRIFR"
              value={data.kpis.trifr !== null ? data.kpis.trifr.toFixed(2) : null}
              sub="per 1M person-hours"
            />
          </div>

          {/* Monthly trend */}
          <SectionCard title="Monthly Incident Trend">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.monthly_trend} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ltiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="total" name="Total" stroke="#6366f1" fill="url(#totalGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="near_miss" name="Near Miss" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                <Area type="monotone" dataKey="lti" name="LTI" stroke="#ef4444" fill="url(#ltiGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By type */}
            <SectionCard title="Incidents by Type">
              {data.by_type.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    layout="vertical"
                    data={data.by_type.slice(0, 8).map((d) => ({
                      name: INCIDENT_TYPE_LABELS[d.incident_type as IncidentType] ?? d.incident_type,
                      count: d.count,
                    }))}
                    margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="count" name="Count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>

            {/* By severity */}
            <SectionCard title="Incidents by Severity">
              {data.by_severity.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No data</p>
              ) : (
                <div className="flex items-center gap-6 h-[260px]">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.by_severity.map((d) => ({
                          name: SEVERITY_LABELS[d.severity ?? ''] ?? d.severity,
                          value: d.count,
                          fill: SEVERITY_COLORS[d.severity ?? ''] ?? '#94a3b8',
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.by_severity.map((d) => (
                          <Cell key={d.severity} fill={SEVERITY_COLORS[d.severity ?? ''] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} incidents`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {data.by_severity.map((d) => (
                      <div key={d.severity} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: SEVERITY_COLORS[d.severity ?? ''] ?? '#94a3b8' }}
                        />
                        <span className="text-slate-600 capitalize">{SEVERITY_LABELS[d.severity ?? ''] ?? d.severity}</span>
                        <span className="font-semibold text-slate-800 ml-auto pl-4">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* CA & Investigation metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Corrective Actions">
              <div className="space-y-3">
                {[
                  { label: 'Total CAs raised', value: data.ca_metrics.total },
                  { label: 'Closed', value: data.ca_metrics.closed, color: 'text-emerald-600' },
                  { label: 'Overdue', value: data.ca_metrics.overdue, color: data.ca_metrics.overdue > 0 ? 'text-red-600' : 'text-slate-800' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className={`text-sm font-semibold ${color ?? 'text-slate-800'}`}>{value}</span>
                  </div>
                ))}
                {/* Closure rate bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Closure rate</span>
                    <span className="font-semibold text-slate-700">{data.ca_metrics.closure_rate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${data.ca_metrics.closure_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Investigations">
              <div className="space-y-3">
                {[
                  { label: 'Total investigations opened', value: data.investigation_metrics.total },
                  { label: 'Closed', value: data.investigation_metrics.closed, color: 'text-emerald-600' },
                  { label: 'Still open', value: data.investigation_metrics.total - data.investigation_metrics.closed },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className={`text-sm font-semibold ${color ?? 'text-slate-800'}`}>{value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Closure rate</span>
                    <span className="font-semibold text-slate-700">{data.investigation_metrics.closure_rate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${data.investigation_metrics.closure_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
