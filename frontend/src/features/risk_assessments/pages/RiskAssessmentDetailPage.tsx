import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import {
  useAssessment,
  useTransitionAssessment,
  useAddHazard,
  useUpdateHazard,
  useDeleteHazard,
} from '../hooks/useRA';
import type {
  Hazard,
  HazardCategory,
  RiskLevel,
  CreateHazardPayload,
  AssessmentStatus,
} from '../types/ra.types';
import {
  ASSESSMENT_STATUS_LABELS,
  HAZARD_CATEGORY_LABELS,
} from '../types/ra.types';

// ── Risk colour system (inline styles — avoids Tailwind purge on dynamic classes) ─

const RATING_TO_LEVEL = (r: number): RiskLevel => {
  if (r <= 4) return 'low';
  if (r <= 9) return 'medium';
  if (r <= 16) return 'high';
  return 'critical';
};

const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

const LEVEL_STYLE: Record<RiskLevel, { bg: string; color: string; border: string }> = {
  low:      { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  medium:   { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
  high:     { bg: '#fff7ed', color: '#9a3412', border: '#fdba74' },
  critical: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
};

function RiskChip({ level }: { level: RiskLevel | null | undefined }) {
  if (!level) return <span className="text-slate-300 text-xs">—</span>;
  const s = LEVEL_STYLE[level];
  return (
    <span
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="text-xs font-semibold px-2 py-0.5 rounded-full border"
    >
      {LEVEL_LABEL[level]}
    </span>
  );
}

function RatingCell({ value }: { value: number }) {
  const level = RATING_TO_LEVEL(value);
  const s = LEVEL_STYLE[level];
  return (
    <div
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border"
    >
      {value}
    </div>
  );
}

// ── Status badge + transitions ────────────────────────────────────────────────

const STATUS_COLORS: Record<AssessmentStatus, string> = {
  draft:        'bg-slate-100 text-slate-600',
  active:       'bg-emerald-100 text-emerald-700',
  under_review: 'bg-amber-100 text-amber-700',
  archived:     'bg-slate-100 text-slate-400',
};

const NEXT_STATUS: Record<AssessmentStatus, AssessmentStatus[]> = {
  draft:        ['active'],
  active:       ['under_review', 'archived'],
  under_review: ['active', 'archived'],
  archived:     ['active'],
};

const STATUS_ACTION_LABELS: Record<string, string> = {
  active: 'Activate',
  under_review: 'Send for review',
  archived: 'Archive',
};

// ── Hazard form ───────────────────────────────────────────────────────────────

interface HazardFormValues {
  hazard_description: string;
  hazard_category: HazardCategory;
  who_is_at_risk: string;
  existing_controls: string;
  likelihood_before: number;
  consequence_before: number;
  additional_controls: string;
  responsible_person: string;
  target_date: string;
  likelihood_after: string;
  consequence_after: string;
}

function HazardForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: Partial<HazardFormValues>;
  onSubmit: (v: HazardFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { data: orgUsers = [] } = useOrgUsers();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<HazardFormValues>({
    defaultValues: {
      hazard_description: '',
      hazard_category: 'physical',
      who_is_at_risk: '',
      existing_controls: '',
      likelihood_before: 1,
      consequence_before: 1,
      additional_controls: '',
      responsible_person: '',
      target_date: '',
      likelihood_after: '',
      consequence_after: '',
      ...defaultValues,
    },
  });

  const l = Number(watch('likelihood_before'));
  const c = Number(watch('consequence_before'));
  const rating = l * c;
  const level = RATING_TO_LEVEL(rating);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-200">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Hazard description *</label>
          <textarea
            {...register('hazard_description', { required: 'Required' })}
            rows={2}
            placeholder="Describe the hazard…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white"
          />
          {errors.hazard_description && <p className="text-xs text-red-500 mt-1">{errors.hazard_description.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
          <select
            {...register('hazard_category')}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {Object.entries(HAZARD_CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Who is at risk</label>
          <input
            {...register('who_is_at_risk')}
            placeholder="e.g. Forklift operators, pedestrians"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Existing controls</label>
          <textarea
            {...register('existing_controls')}
            rows={2}
            placeholder="Controls already in place…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white"
          />
        </div>
      </div>

      {/* Initial risk rating */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <p className="text-xs font-semibold text-slate-600 mb-3">Initial risk rating (before additional controls)</p>
        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Likelihood (1–5)</label>
            <input
              type="number" min={1} max={5}
              {...register('likelihood_before', { required: true, min: 1, max: 5, valueAsNumber: true })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Consequence (1–5)</label>
            <input
              type="number" min={1} max={5}
              {...register('consequence_before', { required: true, min: 1, max: 5, valueAsNumber: true })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <RatingCell value={rating} />
            <RiskChip level={level} />
          </div>
        </div>
      </div>

      {/* Additional controls + residual risk */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Additional controls recommended</label>
        <textarea
          {...register('additional_controls')}
          rows={2}
          placeholder="Further controls to reduce risk…"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Responsible person</label>
          <select
            {...register('responsible_person')}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">— None —</option>
            {orgUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Target date</label>
          <input
            type="date"
            {...register('target_date')}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
      </div>

      {/* Residual risk */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <p className="text-xs font-semibold text-slate-600 mb-3">Residual risk (after additional controls)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Likelihood after (1–5)</label>
            <input
              type="number" min={1} max={5}
              {...register('likelihood_after')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Consequence after (1–5)</label>
            <input
              type="number" min={1} max={5}
              {...register('consequence_after')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-white"
        >
          <XMarkIcon className="w-4 h-4" /> Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          <CheckIcon className="w-4 h-4" /> {isPending ? 'Saving…' : 'Save hazard'}
        </button>
      </div>
    </form>
  );
}

function formValuesToPayload(values: HazardFormValues): CreateHazardPayload {
  return {
    hazard_description: values.hazard_description,
    hazard_category: values.hazard_category,
    who_is_at_risk: values.who_is_at_risk,
    existing_controls: values.existing_controls,
    likelihood_before: Number(values.likelihood_before),
    consequence_before: Number(values.consequence_before),
    additional_controls: values.additional_controls,
    responsible_person: values.responsible_person || null,
    target_date: values.target_date || null,
    likelihood_after: values.likelihood_after ? Number(values.likelihood_after) : null,
    consequence_after: values.consequence_after ? Number(values.consequence_after) : null,
  };
}

// ── Hazard row ────────────────────────────────────────────────────────────────

function HazardRow({
  hazard,
  assessmentId,
  onEdit,
}: {
  hazard: Hazard;
  assessmentId: string;
  onEdit: (h: Hazard) => void;
}) {
  const deleteHazard = useDeleteHazard(assessmentId);

  return (
    <div className="grid grid-cols-[2fr_1fr_auto_auto_auto_auto] gap-3 items-center px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
      <div>
        <p className="text-sm text-slate-800 font-medium">{hazard.hazard_description}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {hazard.hazard_category_display}
          {hazard.who_is_at_risk && <> · {hazard.who_is_at_risk}</>}
        </p>
      </div>
      <div className="text-xs text-slate-500 line-clamp-2">{hazard.existing_controls || <span className="text-slate-300">—</span>}</div>
      <div className="flex items-center gap-2">
        <RatingCell value={hazard.risk_rating_before} />
        <RiskChip level={hazard.risk_level_before} />
      </div>
      <div>
        {hazard.risk_rating_after ? (
          <div className="flex items-center gap-2">
            <RatingCell value={hazard.risk_rating_after} />
            <RiskChip level={hazard.risk_level_after} />
          </div>
        ) : (
          <span className="text-xs text-slate-300">No residual</span>
        )}
      </div>
      <div className="text-xs text-slate-400">
        {hazard.responsible_person_detail?.full_name ?? '—'}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(hazard)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteHazard.mutate(hazard.id)}
          disabled={deleteHazard.isPending}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RiskAssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: assessment, isLoading } = useAssessment(id!);
  const transition = useTransitionAssessment(id!);
  const addHazard = useAddHazard(id!);
  const updateHazard = useUpdateHazard(id!);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHazard, setEditingHazard] = useState<Hazard | null>(null);

  if (isLoading) {
    return <div className="p-6 text-center text-sm text-slate-400">Loading…</div>;
  }
  if (!assessment) {
    return <div className="p-6 text-center text-sm text-red-500">Assessment not found.</div>;
  }

  function handleAddHazard(values: HazardFormValues) {
    addHazard.mutate(formValuesToPayload(values), {
      onSuccess: () => setShowAddForm(false),
    });
  }

  function handleEditHazard(values: HazardFormValues) {
    if (!editingHazard) return;
    updateHazard.mutate(
      { hazardId: editingHazard.id, payload: formValuesToPayload(values) },
      { onSuccess: () => setEditingHazard(null) },
    );
  }

  const nextStatuses = NEXT_STATUS[assessment.status] ?? [];

  const criticals = assessment.hazards.filter((h) => h.risk_level_before === 'critical').length;
  const highs = assessment.hazards.filter((h) => h.risk_level_before === 'high').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link to="/risk-assessments" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
        <ChevronLeftIcon className="w-4 h-4" /> Risk Assessments
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-slate-400">{assessment.reference_number}</span>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[assessment.status])}>
                {ASSESSMENT_STATUS_LABELS[assessment.status]}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">{assessment.title}</h2>
            {assessment.description && (
              <p className="text-sm text-slate-500 mt-1">{assessment.description}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => transition.mutate(s)}
                disabled={transition.isPending}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {STATUS_ACTION_LABELS[s] ?? s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Assessment date</p>
            <p className="font-medium text-slate-700 mt-0.5">{assessment.assessment_date}</p>
          </div>
          {assessment.next_review_date && (
            <div>
              <p className="text-xs text-slate-400">Next review</p>
              <p className="font-medium text-slate-700 mt-0.5">{assessment.next_review_date}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400">Assessed by</p>
            <p className="font-medium text-slate-700 mt-0.5">{assessment.assessed_by_detail?.full_name}</p>
          </div>
          {assessment.reviewed_by_detail && (
            <div>
              <p className="text-xs text-slate-400">Reviewed by</p>
              <p className="font-medium text-slate-700 mt-0.5">{assessment.reviewed_by_detail.full_name}</p>
            </div>
          )}
          {assessment.work_area && (
            <div>
              <p className="text-xs text-slate-400">Work area</p>
              <p className="font-medium text-slate-700 mt-0.5">{assessment.work_area}</p>
            </div>
          )}
          {assessment.department_name && (
            <div>
              <p className="text-xs text-slate-400">Department</p>
              <p className="font-medium text-slate-700 mt-0.5">{assessment.department_name}</p>
            </div>
          )}
        </div>

        {/* Risk summary chips */}
        {assessment.hazards.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-slate-500">{assessment.hazards.length} hazards identified</span>
            {criticals > 0 && <RiskChip level="critical" />}
            {highs > 0 && <RiskChip level="high" />}
          </div>
        )}
      </div>

      {/* Hazard register + Risk matrix side-by-side */}
      <div className="flex gap-5 items-start">

        {/* Hazard register — takes remaining width */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Hazard Register</h3>
            {!showAddForm && !editingHazard && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-xl text-xs font-medium hover:bg-primary-700"
              >
                <PlusIcon className="w-3.5 h-3.5" /> Add hazard
              </button>
            )}
          </div>

          {assessment.hazards.length > 0 && (
            <div className="grid grid-cols-[2fr_1fr_auto_auto_auto_auto] gap-3 px-5 py-2 bg-slate-50/60 border-b border-slate-100">
              {['Hazard', 'Existing controls', 'Initial risk', 'Residual risk', 'Responsible', ''].map((h) => (
                <p key={h} className="text-xs font-medium text-slate-400">{h}</p>
              ))}
            </div>
          )}

          <div>
            {assessment.hazards.map((hazard) =>
              editingHazard?.id === hazard.id ? (
                <div key={hazard.id} className="px-5 py-4">
                  <HazardForm
                    defaultValues={{
                      hazard_description: hazard.hazard_description,
                      hazard_category: hazard.hazard_category,
                      who_is_at_risk: hazard.who_is_at_risk,
                      existing_controls: hazard.existing_controls,
                      likelihood_before: hazard.likelihood_before,
                      consequence_before: hazard.consequence_before,
                      additional_controls: hazard.additional_controls,
                      responsible_person: hazard.responsible_person ?? '',
                      target_date: hazard.target_date ?? '',
                      likelihood_after: hazard.likelihood_after?.toString() ?? '',
                      consequence_after: hazard.consequence_after?.toString() ?? '',
                    }}
                    onSubmit={handleEditHazard}
                    onCancel={() => setEditingHazard(null)}
                    isPending={updateHazard.isPending}
                  />
                </div>
              ) : (
                <HazardRow
                  key={hazard.id}
                  hazard={hazard}
                  assessmentId={id!}
                  onEdit={setEditingHazard}
                />
              )
            )}

            {assessment.hazards.length === 0 && !showAddForm && (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-400">No hazards added yet.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add the first hazard
                </button>
              </div>
            )}
          </div>

          {showAddForm && (
            <div className="px-5 py-4 border-t border-slate-100">
              <HazardForm
                onSubmit={handleAddHazard}
                onCancel={() => setShowAddForm(false)}
                isPending={addHazard.isPending}
              />
            </div>
          )}
        </div>

        {/* Risk matrix — sticky sidebar */}
        <div className="sticky top-16 w-72 shrink-0 bg-white rounded-2xl border border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
            Risk Matrix
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">Likelihood × Consequence</p>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-1 text-slate-400 font-medium text-center w-7">L\C</th>
                {[1, 2, 3, 4, 5].map((c) => (
                  <th key={c} className="p-1 text-center text-slate-500 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[5, 4, 3, 2, 1].map((l) => (
                <tr key={l}>
                  <td className="p-1 text-slate-500 font-medium text-center">{l}</td>
                  {[1, 2, 3, 4, 5].map((col) => {
                    const r = l * col;
                    const level = RATING_TO_LEVEL(r);
                    const s = LEVEL_STYLE[level];
                    return (
                      <td key={col} className="p-0.5">
                        <div
                          style={{ background: s.bg, borderColor: s.border, color: s.color }}
                          className="w-full h-8 rounded-md flex items-center justify-center border font-bold text-xs"
                        >
                          {r}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map((lv) => {
              const s = LEVEL_STYLE[lv];
              return (
                <div key={lv} className="flex items-center gap-1.5">
                  <span
                    style={{ background: s.bg, borderColor: s.border }}
                    className="w-3 h-3 rounded shrink-0 border"
                  />
                  <span style={{ color: s.color }} className="text-[11px] font-medium">
                    {LEVEL_LABEL[lv]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-400">
            <p>1–4 · Low &nbsp;&nbsp; 5–9 · Medium</p>
            <p>10–16 · High &nbsp;&nbsp; 17–25 · Critical</p>
          </div>
        </div>

      </div>
    </div>
  );
}
