import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  SparklesIcon,
  CheckBadgeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/permissions';
import { useObjective, useUpdateObjective } from '../hooks/useObjective';
import { useComputeMetric, useCreateMeasurement } from '../hooks/useObjective';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import ObjectiveStatusBadge from '../components/ObjectiveStatusBadge';
import AchievementBar from '../components/AchievementBar';
import type { ComputeMetricResult, EffectivenessDecision } from '../types/objective.types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  value: z.coerce.number({ invalid_type_error: 'Value is required' }),
  measured_at: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
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
          <span className="text-slate-400 capitalize">{p.name}</span>
          <span className="ml-auto font-semibold text-white pl-6">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Effectiveness badge ──────────────────────────────────────────────────────

const EFFECTIVENESS_CONFIG: Record<EffectivenessDecision, { label: string; cls: string }> = {
  pending:              { label: 'Pending Review',       cls: 'bg-stone-100 text-slate-500 border-stone-200' },
  effective:            { label: 'Effective',            cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  partially_effective:  { label: 'Partially Effective',  cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  not_effective:        { label: 'Not Effective',        cls: 'bg-red-50 text-red-700 border-red-100' },
};

function EffectivenessBadge({ value }: { value: EffectivenessDecision }) {
  const cfg = EFFECTIVENESS_CONFIG[value];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Status border accent ─────────────────────────────────────────────────────

const STATUS_BORDER: Record<string, string> = {
  on_track: 'border-l-emerald-400',
  at_risk:  'border-l-amber-400',
  behind:   'border-l-red-400',
  achieved: 'border-l-primary-500',
  closed:   'border-l-slate-300',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ObjectiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: objective, isLoading } = useObjective(id!);
  const computeMetric = useComputeMetric();
  const createMeasurement = useCreateMeasurement();
  const updateObjective = useUpdateObjective();
  const { data: users = [] } = useOrgUsers();

  const [computeResult, setComputeResult] = useState<ComputeMetricResult | null>(null);
  const [editingReview, setEditingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    effectiveness_decision: 'pending' as EffectivenessDecision,
    effectiveness_notes: '',
    evidence_of_review: '',
    final_result: '',
    review_date: '',
    reviewed_by: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { measured_at: today },
  });

  async function handleCompute() {
    if (!id) return;
    const result = await computeMetric.mutateAsync(id);
    setComputeResult(result);
    setValue('value', parseFloat(result.suggested_value));
    setValue('is_auto_computed' as never, true as never);
  }

  async function onSubmit(data: FormValues) {
    if (!id) return;
    await createMeasurement.mutateAsync({
      objectiveId: id,
      payload: {
        value: data.value,
        measured_at: data.measured_at,
        notes: data.notes || '',
        is_auto_computed: computeResult !== null,
      },
    });
    reset({ measured_at: today, value: undefined as unknown as number, notes: '' });
    setComputeResult(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Objective not found.</p>
      </div>
    );
  }

  const borderClass = STATUS_BORDER[objective.status] ?? 'border-l-slate-300';

  const chartData = objective.measurements.map((m) => ({
    date: m.measured_at,
    value: parseFloat(m.value),
  }));

  const target = parseFloat(objective.target_value);
  const baseline = parseFloat(objective.baseline_value);

  const DirectionIcon =
    objective.direction === 'increase'
      ? ArrowTrendingUpIcon
      : objective.direction === 'decrease'
      ? ArrowTrendingDownIcon
      : MinusIcon;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[900px] mx-auto px-8 py-8">

        {/* Back */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/objectives"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white hover:border hover:border-slate-200 transition-all"
          >
            <ArrowLeftIcon className="w-[18px] h-[18px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{objective.title}</h1>
            <p className="mt-0.5 text-sm text-slate-500">Objective detail</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Hero card */}
          <div
            className={[
              'bg-white rounded-2xl border border-stone-100 shadow-sm border-l-4 px-6 py-6',
              borderClass,
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <ObjectiveStatusBadge status={objective.status} />
                  <EffectivenessBadge value={objective.effectiveness_decision} />
                  <span className="text-xs font-medium bg-stone-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                    {objective.scope}
                  </span>
                  <span className="text-xs font-medium bg-stone-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                    {objective.category}
                  </span>
                </div>
                {objective.description && (
                  <p className="text-sm text-slate-500 leading-relaxed mt-1">{objective.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                {objective.owner_name && (
                  <p className="text-xs text-slate-500">
                    Owner: <span className="font-medium text-slate-700">{objective.owner_name}</span>
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {formatDate(objective.start_date)} — {formatDate(objective.target_date)}
                </p>
              </div>
            </div>

            {/* Key metrics */}
            <div className="mt-5 flex items-center gap-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-center">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Baseline</p>
                <p className="mt-1 text-xl font-bold text-slate-700 tabular-nums">
                  {objective.baseline_value}
                  <span className="text-xs font-normal text-slate-400 ml-1">{objective.unit}</span>
                </p>
              </div>
              <DirectionIcon className="w-5 h-5 text-slate-300 shrink-0" />
              <div className="text-center">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Current</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                  {objective.current_value ?? '—'}
                  {objective.current_value && (
                    <span className="text-xs font-normal text-slate-400 ml-1">{objective.unit}</span>
                  )}
                </p>
              </div>
              <DirectionIcon className="w-5 h-5 text-slate-300 shrink-0" />
              <div className="text-center">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Target</p>
                <p className="mt-1 text-xl font-bold text-primary-700 tabular-nums">
                  {objective.target_value}
                  <span className="text-xs font-normal text-slate-400 ml-1">{objective.unit}</span>
                </p>
              </div>
            </div>

            {/* Achievement bar */}
            <div className="mt-4">
              <AchievementBar
                value={objective.achievement_pct}
                direction={objective.direction}
                size="md"
              />
            </div>
          </div>

          {/* Source (R&O link) */}
          {objective.risk_or_opportunity_id && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Source</p>
              <div className="flex items-start gap-3">
                {objective.risk_or_opportunity_type === 'risk' ? (
                  <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Risk</span>
                ) : (
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Opportunity</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{objective.risk_or_opportunity_title}</p>
                  <a
                    href={`/context/risks-and-opportunities/${objective.risk_or_opportunity_id}`}
                    className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block"
                  >
                    View in Context Register →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Planning card */}
          {(objective.present_status || objective.planned_actions || objective.responsible_persons || objective.expected_result || objective.kpi_description) && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Planning</h2>
              <dl className="space-y-4">
                {objective.kpi_description && (
                  <div>
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">KPI</dt>
                    <dd className="mt-1 text-sm text-slate-700">{objective.kpi_description}</dd>
                  </div>
                )}
                {objective.present_status && (
                  <div>
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Present Status</dt>
                    <dd className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{objective.present_status}</dd>
                  </div>
                )}
                {objective.planned_actions && (
                  <div>
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Actions</dt>
                    <dd className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{objective.planned_actions}</dd>
                  </div>
                )}
                {objective.responsible_persons && (
                  <div>
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Responsibility</dt>
                    <dd className="mt-1 text-sm text-slate-700 leading-relaxed">{objective.responsible_persons}</dd>
                  </div>
                )}
                {objective.expected_result && (
                  <div>
                    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Expected Result</dt>
                    <dd className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{objective.expected_result}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Effectiveness Review card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Effectiveness Review</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Was this objective effective? Document the review outcome and evidence.
                </p>
              </div>
              {!editingReview && can.manageObjectives(user?.role ?? '') && (
                <button
                  onClick={() => {
                    setReviewForm({
                      effectiveness_decision: objective.effectiveness_decision,
                      effectiveness_notes: objective.effectiveness_notes,
                      evidence_of_review: objective.evidence_of_review,
                      final_result: objective.final_result,
                      review_date: objective.review_date ?? '',
                      reviewed_by: objective.reviewed_by_id ?? '',
                    });
                    setEditingReview(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors shrink-0"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  {objective.effectiveness_decision === 'pending' ? 'Record Review' : 'Edit Review'}
                </button>
              )}
            </div>

            {editingReview ? (
              <div className="space-y-4">
                {/* Decision radio */}
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-2">Decision on Effectiveness</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(EFFECTIVENESS_CONFIG) as [EffectivenessDecision, typeof EFFECTIVENESS_CONFIG[EffectivenessDecision]][]).map(([val, cfg]) => (
                      <label key={val} className={[
                        'flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs font-medium transition-all',
                        reviewForm.effectiveness_decision === val
                          ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-300'
                          : 'border-stone-200 bg-white text-slate-600 hover:border-stone-300',
                      ].join(' ')}>
                        <input type="radio" className="sr-only" checked={reviewForm.effectiveness_decision === val} onChange={() => setReviewForm(f => ({ ...f, effectiveness_decision: val }))} />
                        {cfg.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Review Date</label>
                    <input type="date" value={reviewForm.review_date} onChange={(e) => setReviewForm(f => ({ ...f, review_date: e.target.value }))}
                      className="w-full h-9 px-3 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Reviewed By</label>
                    <select value={reviewForm.reviewed_by} onChange={(e) => setReviewForm(f => ({ ...f, reviewed_by: e.target.value }))}
                      className="w-full h-9 pl-3 pr-9 text-sm rounded-lg border border-stone-200 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px' }}>
                      <option value="">Select reviewer…</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Effectiveness Notes</label>
                  <textarea rows={3} placeholder="Narrative supporting the effectiveness decision…"
                    value={reviewForm.effectiveness_notes} onChange={(e) => setReviewForm(f => ({ ...f, effectiveness_notes: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Documented Evidence of Review</label>
                  <textarea rows={2} placeholder="References to meeting minutes, audit reports, or documents that evidence the review…"
                    value={reviewForm.evidence_of_review} onChange={(e) => setReviewForm(f => ({ ...f, evidence_of_review: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Final Result</label>
                  <textarea rows={3} placeholder="Documented final outcome — what was actually achieved?"
                    value={reviewForm.final_result} onChange={(e) => setReviewForm(f => ({ ...f, final_result: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors resize-none" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={async () => {
                      await updateObjective.mutateAsync({
                        id: id!,
                        payload: {
                          effectiveness_decision: reviewForm.effectiveness_decision,
                          effectiveness_notes: reviewForm.effectiveness_notes,
                          evidence_of_review: reviewForm.evidence_of_review,
                          final_result: reviewForm.final_result,
                          review_date: reviewForm.review_date || null,
                          reviewed_by: reviewForm.reviewed_by || null,
                        } as Parameters<typeof updateObjective.mutateAsync>[0]['payload'],
                      });
                      setEditingReview(false);
                    }}
                    disabled={updateObjective.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-700 text-white text-xs font-medium hover:bg-primary-800 disabled:opacity-50 transition-colors"
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                    {updateObjective.isPending ? 'Saving…' : 'Save Review'}
                  </button>
                  <button onClick={() => setEditingReview(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-slate-500 text-xs font-medium hover:bg-stone-50 transition-colors">
                    <XMarkIcon className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EffectivenessBadge value={objective.effectiveness_decision} />
                  {objective.review_date && (
                    <span className="text-xs text-slate-400">
                      Reviewed {formatDate(objective.review_date)}
                      {objective.reviewed_by_name && ` by ${objective.reviewed_by_name}`}
                    </span>
                  )}
                </div>
                {(objective.effectiveness_notes || objective.evidence_of_review || objective.final_result) ? (
                  <dl className="space-y-3 pt-3 border-t border-stone-100">
                    {objective.effectiveness_notes && (
                      <div>
                        <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Effectiveness Notes</dt>
                        <dd className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{objective.effectiveness_notes}</dd>
                      </div>
                    )}
                    {objective.evidence_of_review && (
                      <div>
                        <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Evidence of Review</dt>
                        <dd className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{objective.evidence_of_review}</dd>
                      </div>
                    )}
                    {objective.final_result && (
                      <div>
                        <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Final Result</dt>
                        <dd className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{objective.final_result}</dd>
                      </div>
                    )}
                  </dl>
                ) : objective.effectiveness_decision === 'pending' ? (
                  <p className="text-xs text-slate-400">No review recorded yet. Click "Record Review" to document the effectiveness assessment.</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Log Measurement — supervisor+ only */}
          {can.logMeasurements(user?.role ?? '') && <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Log Measurement</h2>

            {objective.linked_metric !== 'manual' && !computeResult && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-3">
                  This objective is linked to a system metric. You can compute the current value
                  automatically, or enter it manually.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<SparklesIcon className="w-3.5 h-3.5" />}
                  loading={computeMetric.isPending}
                  onClick={handleCompute}
                >
                  Compute Current Value
                </Button>
              </div>
            )}

            {computeResult && (
              <div className="mb-4 flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                <CheckBadgeIcon className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary-700">Computed value</p>
                  <p className="text-xs text-primary-600 mt-0.5">
                    {computeResult.suggested_value} {objective.unit} for period{' '}
                    {formatDate(computeResult.period_start)} — {formatDate(computeResult.period_end)}
                  </p>
                  <button
                    onClick={() => setComputeResult(null)}
                    className="text-[11px] text-primary-500 hover:text-primary-700 mt-1"
                  >
                    Clear and enter manually
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Value <span className="text-red-500">*</span>
                    {objective.unit && (
                      <span className="ml-1 font-normal text-slate-400">({objective.unit})</span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('value')}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                  />
                  {errors.value && (
                    <p className="mt-1 text-xs text-red-600">{errors.value.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Measured Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('measured_at')}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                  />
                  {errors.measured_at && (
                    <p className="mt-1 text-xs text-red-600">{errors.measured_at.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Optional notes about this measurement…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors resize-none"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                loading={isSubmitting || createMeasurement.isPending}
              >
                Log Measurement
              </Button>
            </form>
          </div>}

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Trend</h2>
            <p className="text-xs text-slate-400 mb-5">Historical measurements over time</p>

            {chartData.length < 2 ? (
              <div className="flex items-center justify-center h-40 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-xs text-slate-400">Log at least 2 measurements to see the trend.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={target}
                    stroke="#6366f1"
                    strokeDasharray="6 3"
                    label={{ value: 'Target', fill: '#6366f1', fontSize: 11, position: 'insideTopRight' }}
                  />
                  <ReferenceLine
                    y={baseline}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={{ value: 'Baseline', fill: '#94a3b8', fontSize: 11, position: 'insideBottomRight' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Measurement history */}
          {objective.measurements.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100">
                <h2 className="text-sm font-semibold text-slate-900">Measurement History</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Date', 'Value', 'Notes', 'Recorded By', ''].map((col) => (
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
                  {[...objective.measurements].reverse().map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-slate-500">{formatDate(m.measured_at)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {m.value}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">{objective.unit}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[240px]">
                        <span className="text-xs text-slate-500 truncate block">{m.notes || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-slate-500">{m.recorded_by_name ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {m.is_auto_computed && (
                          <span className="text-[10px] font-medium bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full border border-primary-100">
                            Auto
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
