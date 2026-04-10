import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useLegalRequirement, useUpdateLegalRequirement, useAddLegalReview } from '../hooks/useLegal';
import type { ComplianceStatus, AddReviewPayload } from '../types/legal.types';
import { COMPLIANCE_STATUS_LABELS } from '../types/legal.types';

// ── Compliance status colours ──────────────────────────────────────────────────

const STATUS_STYLE: Record<ComplianceStatus, { bg: string; color: string; border: string }> = {
  compliant:           { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  partially_compliant: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
  non_compliant:       { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  not_assessed:        { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  not_applicable:      { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0' },
};

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
      className="text-sm font-semibold px-3 py-1 rounded-full border"
    >
      {COMPLIANCE_STATUS_LABELS[status]}
    </span>
  );
}

// ── Inline edit form ───────────────────────────────────────────────────────────

interface EditFormValues {
  compliance_status: ComplianceStatus;
  compliance_notes: string;
  compliance_evidence: string;
  review_date: string;
  responsible_person: string;
}

// ── Record review form ─────────────────────────────────────────────────────────

interface ReviewFormValues {
  review_date: string;
  compliance_status: ComplianceStatus;
  findings: string;
  evidence: string;
  next_review_date: string;
}

function RecordReviewForm({
  onSave,
  onCancel,
  isPending,
}: {
  onSave: (v: ReviewFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ReviewFormValues>({
    defaultValues: {
      review_date: new Date().toISOString().slice(0, 10),
      compliance_status: 'compliant',
      findings: '',
      evidence: '',
      next_review_date: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
      <p className="text-xs font-semibold text-slate-700">Record compliance review</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Review date *</label>
          <input
            type="date"
            {...register('review_date', { required: 'Required' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.review_date && <p className="text-xs text-red-500 mt-1">{errors.review_date.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Outcome *</label>
          <select
            {...register('compliance_status')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.entries(COMPLIANCE_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Findings</label>
          <textarea
            {...register('findings')}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Evidence</label>
          <textarea
            {...register('evidence')}
            rows={2}
            placeholder="Reference to evidence of compliance…"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Next review date</label>
          <input
            type="date"
            {...register('next_review_date')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
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
          {isPending ? 'Saving…' : 'Save review'}
        </button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LegalRequirementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: req, isLoading } = useLegalRequirement(id!);
  const update = useUpdateLegalRequirement(id!);
  const addReview = useAddLegalReview(id!);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingCompliance, setEditingCompliance] = useState(false);

  const editForm = useForm<EditFormValues>();

  if (isLoading) return <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>;
  if (!req) return <div className="p-8 text-center text-slate-400 text-sm">Requirement not found.</div>;

  const s = STATUS_STYLE[req.compliance_status];

  function startEdit() {
    editForm.reset({
      compliance_status: req!.compliance_status,
      compliance_notes: req!.compliance_notes,
      compliance_evidence: req!.compliance_evidence,
      review_date: req!.review_date ?? '',
      responsible_person: req!.responsible_person ?? '',
    });
    setEditingCompliance(true);
  }

  function onEditSubmit(values: EditFormValues) {
    update.mutate(
      {
        compliance_status: values.compliance_status,
        compliance_notes: values.compliance_notes,
        compliance_evidence: values.compliance_evidence,
        review_date: values.review_date || null,
        responsible_person: values.responsible_person || null,
      },
      { onSuccess: () => setEditingCompliance(false) }
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/legal" className="hover:text-primary-600">Legal Register</Link>
        <span>›</span>
        <span className="text-slate-600">{req.reference_number}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{req.title}</h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge status={req.compliance_status} />
            <span className="text-xs text-slate-400">{req.requirement_type_display}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">{req.jurisdiction_display}</span>
            {req.source_url && (
              <a
                href={req.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                Source document
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Reference', value: req.reference_number },
          { label: 'Effective date', value: req.effective_date ?? '—' },
          { label: 'Next review', value: req.review_date ? (
            <span className={req.is_overdue_review ? 'text-amber-600 font-semibold' : ''}>
              {req.review_date}{req.is_overdue_review ? ' ⚠ Overdue' : ''}
            </span>
          ) : '—' },
          { label: 'Owner', value: req.responsible_person_detail?.full_name ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Description & clauses */}
      {(req.description || req.applicable_clauses) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          {req.description && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{req.description}</p>
            </div>
          )}
          {req.applicable_clauses && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Applicable clauses / sections</p>
              <p className="text-sm text-slate-700">{req.applicable_clauses}</p>
            </div>
          )}
        </div>
      )}

      {/* Compliance panel */}
      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{ background: s.bg, borderColor: s.border }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: s.color }}>Compliance status</h3>
          {!editingCompliance && (
            <button
              onClick={startEdit}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              Edit
            </button>
          )}
        </div>

        {editingCompliance ? (
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="bg-white rounded-xl p-4 space-y-3 border border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  {...editForm.register('compliance_status')}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(COMPLIANCE_STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Next review date</label>
                <input
                  type="date"
                  {...editForm.register('review_date')}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Compliance notes</label>
                <textarea
                  {...editForm.register('compliance_notes')}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Evidence</label>
                <textarea
                  {...editForm.register('compliance_evidence')}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingCompliance(false)}
                className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={update.isPending}
                className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {update.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {req.compliance_notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{req.compliance_notes}</p>
              </div>
            )}
            {req.compliance_evidence && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Evidence</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{req.compliance_evidence}</p>
              </div>
            )}
            {!req.compliance_notes && !req.compliance_evidence && (
              <p className="text-xs text-slate-400 italic">No compliance notes yet. Click Edit to add.</p>
            )}
            {req.last_reviewed_date && (
              <p className="text-xs text-slate-400">
                Last reviewed: {req.last_reviewed_date}
                {req.last_reviewed_by_name && <> by {req.last_reviewed_by_name}</>}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Compliance review history */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Review history</h3>
            <p className="text-xs text-slate-400 mt-0.5">{req.reviews.length} review{req.reviews.length !== 1 ? 's' : ''} recorded</p>
          </div>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Record review
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          {showReviewForm && (
            <RecordReviewForm
              onSave={(v) => {
                addReview.mutate(
                  {
                    review_date: v.review_date,
                    compliance_status: v.compliance_status,
                    findings: v.findings,
                    evidence: v.evidence,
                    next_review_date: v.next_review_date || null,
                  } as AddReviewPayload,
                  { onSuccess: () => setShowReviewForm(false) }
                );
              }}
              onCancel={() => setShowReviewForm(false)}
              isPending={addReview.isPending}
            />
          )}

          {req.reviews.length === 0 && !showReviewForm && (
            <div className="py-8 text-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No reviews recorded. Click "Record review" to add one.</p>
            </div>
          )}

          {req.reviews.map((r) => {
            const rs = STATUS_STYLE[r.compliance_status];
            return (
              <div
                key={r.id}
                className="rounded-xl border p-4"
                style={{ background: rs.bg, borderColor: rs.border }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                        style={{ background: rs.bg, color: rs.color, borderColor: rs.border }}
                      >
                        {r.compliance_status_display}
                      </span>
                      <span className="text-xs text-slate-500">{r.review_date}</span>
                      {r.reviewed_by_name && (
                        <span className="text-xs text-slate-400">by {r.reviewed_by_name}</span>
                      )}
                    </div>
                    {r.findings && (
                      <p className="text-xs text-slate-700 mt-2 whitespace-pre-line">
                        <span className="font-medium">Findings: </span>{r.findings}
                      </p>
                    )}
                    {r.evidence && (
                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-medium">Evidence: </span>{r.evidence}
                      </p>
                    )}
                    {r.next_review_date && (
                      <p className="text-xs text-slate-400 mt-1">Next review: {r.next_review_date}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
