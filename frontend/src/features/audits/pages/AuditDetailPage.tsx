import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  useAudit,
  useCompleteAudit,
  useAddFinding,
  useUpdateFinding,
  useDeleteFinding,
  useRaiseCA,
} from '../hooks/useAudits';
import type { AuditFinding, FindingSeverity, FindingStatus } from '../types/audit.types';
import { FINDING_SEVERITY_LABELS, AUDIT_STATUS_LABELS } from '../types/audit.types';

// ── Colours ────────────────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<FindingSeverity, { bg: string; color: string; border: string }> = {
  observation: { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
  minor_nc:    { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
  major_nc:    { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  opportunity: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
};

const FINDING_STATUS_COLORS: Record<FindingStatus, string> = {
  open:   'bg-slate-100 text-slate-600',
  raised: 'bg-violet-100 text-violet-700',
  closed: 'bg-emerald-100 text-emerald-700',
};

const AUDIT_STATUS_COLORS: Partial<Record<string, string>> = {
  planned:     'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-slate-100 text-slate-400',
};

// ── Add/Edit finding form ──────────────────────────────────────────────────────

interface FindingFormValues {
  title: string;
  description: string;
  severity: FindingSeverity;
  clause_reference: string;
  evidence: string;
  recommended_action: string;
}

const defaultFinding: FindingFormValues = {
  title: '',
  description: '',
  severity: 'observation',
  clause_reference: '',
  evidence: '',
  recommended_action: '',
};

function FindingForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Partial<FindingFormValues>;
  onSave: (v: FindingFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FindingFormValues>({
    defaultValues: { ...defaultFinding, ...initial },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Finding title *</label>
          <input
            {...register('title', { required: 'Required' })}
            placeholder="Describe the finding"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Severity *</label>
          <select
            {...register('severity')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.entries(FINDING_SEVERITY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Clause reference</label>
          <input
            {...register('clause_reference')}
            placeholder="e.g. ISO 45001 Cl. 9.2"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Description / evidence</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Recommended action</label>
          <textarea
            {...register('recommended_action')}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save finding'}
        </button>
      </div>
    </form>
  );
}

// ── Complete modal ─────────────────────────────────────────────────────────────

function CompleteModal({
  onConfirm,
  onClose,
  isPending,
}: {
  onConfirm: (summary: string, conclusion: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [summary, setSummary] = useState('');
  const [conclusion, setConclusion] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
        <h3 className="font-semibold text-slate-800">Complete audit</h3>
        <p className="text-sm text-slate-500">
          Mark this audit as completed. You can optionally add a summary and overall conclusion.
        </p>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Overall conclusion</label>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(summary, conclusion)}
            disabled={isPending}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? 'Completing…' : 'Complete audit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: audit, isLoading } = useAudit(id!);
  const completeAudit = useCompleteAudit(id!);
  const addFinding = useAddFinding(id!);
  const updateFinding = useUpdateFinding(id!);
  const deleteFinding = useDeleteFinding(id!);
  const raiseCA = useRaiseCA(id!);

  const [showAddFinding, setShowAddFinding] = useState(false);
  const [editingFinding, setEditingFinding] = useState<AuditFinding | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>;
  if (!audit) return <div className="p-8 text-center text-slate-400 text-sm">Audit not found.</div>;

  const isCompleted = audit.status === 'completed';
  const isCancelled = audit.status === 'cancelled';
  const canEdit = !isCompleted && !isCancelled;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400">{audit.reference_number}</span>
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                AUDIT_STATUS_COLORS[audit.status] ?? 'bg-slate-100 text-slate-600'
              )}
            >
              {AUDIT_STATUS_LABELS[audit.status]}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">{audit.title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {audit.audit_type_display}
            {audit.department_name && <> · {audit.department_name}</>}
            {audit.location && <> · {audit.location}</>}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowComplete(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Complete audit
          </button>
        )}
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Planned date', value: audit.planned_date },
          { label: 'Actual date', value: audit.actual_date ?? '—' },
          { label: 'Lead auditor', value: audit.lead_auditor_detail?.full_name ?? '—' },
          { label: 'Auditee', value: audit.auditee || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Scope / objectives / criteria */}
      {(audit.scope || audit.objectives || audit.criteria) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          {audit.scope && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Scope</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{audit.scope}</p>
            </div>
          )}
          {audit.objectives && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Objectives</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{audit.objectives}</p>
            </div>
          )}
          {audit.criteria && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Criteria</p>
              <p className="text-sm text-slate-700">{audit.criteria}</p>
            </div>
          )}
        </div>
      )}

      {/* Findings register */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Findings register</h3>
            <p className="text-xs text-slate-400 mt-0.5">{audit.findings.length} findings</p>
          </div>
          {canEdit && !showAddFinding && (
            <button
              onClick={() => setShowAddFinding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add finding
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          {showAddFinding && (
            <FindingForm
              onSave={(v) => {
                addFinding.mutate(v, { onSuccess: () => setShowAddFinding(false) });
              }}
              onCancel={() => setShowAddFinding(false)}
              isPending={addFinding.isPending}
            />
          )}

          {audit.findings.length === 0 && !showAddFinding && (
            <p className="py-8 text-center text-sm text-slate-400">
              No findings recorded yet.{canEdit && ' Click "Add finding" to record one.'}
            </p>
          )}

          {audit.findings.map((f: AuditFinding) => {
            const s = SEVERITY_STYLE[f.severity as FindingSeverity] ?? { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
            const isEditing = editingFinding?.id === f.id;

            if (isEditing) {
              return (
                <FindingForm
                  key={f.id}
                  initial={f}
                  onSave={(v) => {
                    updateFinding.mutate(
                      { findingId: f.id, payload: v },
                      { onSuccess: () => setEditingFinding(null) }
                    );
                  }}
                  onCancel={() => setEditingFinding(null)}
                  isPending={updateFinding.isPending}
                />
              );
            }

            return (
              <div
                key={f.id}
                className="rounded-xl border p-4 space-y-2"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                        style={{ background: s.bg, color: s.color, borderColor: s.border }}
                      >
                        {FINDING_SEVERITY_LABELS[f.severity as FindingSeverity]}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          FINDING_STATUS_COLORS[f.status as FindingStatus]
                        )}
                      >
                        {f.status_display}
                      </span>
                      {f.clause_reference && (
                        <span className="text-xs text-slate-400">{f.clause_reference}</span>
                      )}
                    </div>
                    <p className="font-medium text-slate-800 text-sm mt-1">{f.title}</p>
                    {f.description && (
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{f.description}</p>
                    )}
                    {f.recommended_action && (
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-medium">Recommended: </span>
                        {f.recommended_action}
                      </p>
                    )}
                    {f.ca_reference && f.ca_id && (
                      <Link
                        to={`/corrective-actions/${f.ca_id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 mt-1 hover:underline"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        CA: {f.ca_reference}
                      </Link>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      {!f.ca_id && (
                        <button
                          onClick={() => raiseCA.mutate(f.id)}
                          disabled={raiseCA.isPending}
                          className="px-2 py-1 text-xs rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 font-medium"
                        >
                          Raise CA
                        </button>
                      )}
                      <button
                        onClick={() => setEditingFinding(f)}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this finding?')) deleteFinding.mutate(f.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary / conclusion (completed audits) */}
      {isCompleted && (audit.summary || audit.overall_conclusion) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">Audit conclusions</h3>
          {audit.summary && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Summary</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{audit.summary}</p>
            </div>
          )}
          {audit.overall_conclusion && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Overall conclusion</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{audit.overall_conclusion}</p>
            </div>
          )}
        </div>
      )}

      {/* Complete modal */}
      {showComplete && (
        <CompleteModal
          onClose={() => setShowComplete(false)}
          onConfirm={(summary, conclusion) => {
            completeAudit.mutate(
              { summary, overall_conclusion: conclusion },
              { onSuccess: () => setShowComplete(false) }
            );
          }}
          isPending={completeAudit.isPending}
        />
      )}
    </div>
  );
}
