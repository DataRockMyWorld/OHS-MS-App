import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  LinkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { Card, CardTitle, CardDivider } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useCorrectiveAction } from '../hooks/useCorrectiveActions';
import { useUpdateCA, useAddEffectivenessReview } from '../hooks/useCorrectiveActionMutations';
import CAStatusBadge from '../components/CAStatusBadge';
import CAPriorityBadge from '../components/CAPriorityBadge';
import {
  CA_TYPE_LABELS,
  EFFECTIVENESS_RATING_LABELS,
} from '../types/ca.types';
import type {
  CorrectiveAction,
  EffectivenessRating,
  EffectivenessReview,
} from '../types/ca.types';

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-1">{label}</p>
        <p className="text-sm text-slate-700 font-medium leading-none">{value || '—'}</p>
      </div>
    </div>
  );
}

function NarrativeField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-2.5">{label}</p>
      <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
}

function EffectivenessRatingIcon({ rating }: { rating: EffectivenessRating }) {
  if (rating === 'fully_effective') return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
  if (rating === 'partially_effective') return <ExclamationCircleIcon className="w-4 h-4 text-amber-500" />;
  return <XCircleIcon className="w-4 h-4 text-red-500" />;
}

function EffectivenessRatingChip({ rating }: { rating: EffectivenessRating }) {
  const configs = {
    fully_effective:    { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    partially_effective: { bg: 'bg-amber-50 border-amber-100 text-amber-700' },
    not_effective:      { bg: 'bg-red-50 border-red-100 text-red-700' },
  };
  const { bg } = configs[rating];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
      <EffectivenessRatingIcon rating={rating} />
      {EFFECTIVENESS_RATING_LABELS[rating]}
    </span>
  );
}

function StatusTimeline({ ca }: { ca: CorrectiveAction }) {
  const history = [...ca.status_history].reverse();
  return (
    <div className="space-y-0">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ring-2 ring-white ${index === 0 ? 'bg-primary-500' : 'bg-slate-200'}`} />
            {index < history.length - 1 && <div className="w-px flex-1 bg-stone-100 my-1.5" />}
          </div>
          <div className="pb-5">
            <CAStatusBadge status={entry.to_status} size="sm" />
            <p className="text-xs text-slate-500 mt-1">
              {entry.changed_by.full_name}
              <span className="text-slate-400"> · </span>
              {formatDateTime(entry.created_at)}
            </p>
            {entry.comment && (
              <p className="mt-1.5 text-xs text-slate-500 bg-stone-50 rounded-lg px-2.5 py-1.5 italic border border-stone-100">
                "{entry.comment}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-8 h-8 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-lg" />
            <Skeleton className="h-3 w-64 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-full h-36 rounded-2xl mb-7" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            <Skeleton className="w-full h-64 rounded-2xl" />
          </div>
          <div className="space-y-5">
            <Skeleton className="w-full h-28 rounded-2xl" />
            <Skeleton className="w-full h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Effectiveness review modal ───────────────────────────────────────────────

function AddEffectivenessReviewModal({
  isOpen, onClose, onConfirm, isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { review_date: string; rating: EffectivenessRating; evidence_description: string; notes: string; next_review_date: string }) => void;
  isLoading: boolean;
}) {
  const [rating, setRating] = useState<EffectivenessRating | ''>('');
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [evidence, setEvidence] = useState('');
  const [notes, setNotes] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('');

  const needsFollowUp = rating === 'partially_effective' || rating === 'not_effective';
  const canSubmit = Boolean(rating && reviewDate && (!needsFollowUp || nextReviewDate));

  function handleClose() {
    setRating(''); setReviewDate(new Date().toISOString().split('T')[0]);
    setEvidence(''); setNotes(''); setNextReviewDate('');
    onClose();
  }

  function handleConfirm() {
    if (!rating) return;
    onConfirm({
      review_date: reviewDate,
      rating: rating as EffectivenessRating,
      evidence_description: evidence,
      notes,
      next_review_date: nextReviewDate,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Effectiveness Review"
      description="Assess whether the corrective action has been effective in eliminating the root cause."
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>Cancel</Button>
          <Button size="sm" loading={isLoading} onClick={handleConfirm} disabled={!canSubmit}>
            Submit Review
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* Rating selection */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">Effectiveness Rating <span className="text-red-400">*</span></p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: 'fully_effective',    label: 'Fully Effective',    desc: 'Root cause eliminated, no recurrence', color: 'emerald' },
                { value: 'partially_effective', label: 'Partially Effective', desc: 'Improvement observed, further action needed', color: 'amber' },
                { value: 'not_effective',      label: 'Not Effective',      desc: 'No improvement observed, action must be revised', color: 'red' },
              ] as const
            ).map(({ value, label, desc, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all ${
                  rating === value
                    ? `border-${color}-400 bg-${color}-50`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <EffectivenessRatingIcon rating={value} />
                <p className="text-xs font-semibold text-slate-900">{label}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="review-date"
            label="Review Date"
            type="date"
            required
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
          />
          {needsFollowUp && (
            <Input
              id="next-review-date"
              label="Next Review Date"
              type="date"
              required
              hint="Required when action is not fully effective."
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
            />
          )}
        </div>

        <Textarea
          id="evidence"
          label="Evidence of Effectiveness"
          placeholder="Describe what was observed to assess effectiveness — inspections, records reviewed, interviews conducted…"
          rows={3}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />

        <Textarea
          id="review-notes"
          label="Notes"
          placeholder="Additional observations or recommendations…"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {needsFollowUp && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              This action will be returned to <strong>In Progress</strong> for further remediation.
              A next review date is required.
            </p>
          </div>
        )}

        {rating === 'fully_effective' && (
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">
              This action will be automatically <strong>closed</strong> as fully effective.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function DetailsPanel({ ca }: { ca: CorrectiveAction }) {
  const updateCA = useUpdateCA(ca.id);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    description: ca.description,
    planned_action: ca.planned_action,
    implementation_notes: ca.implementation_notes,
    implementation_evidence: ca.implementation_evidence,
  });

  async function handleSave() {
    await updateCA.mutateAsync(fields);
    setEditing(false);
  }

  const hasContent = Object.values(fields).some(Boolean);

  return (
    <div className="space-y-5 pt-5">
      <Card className="border-stone-100 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <CardTitle>Action Details</CardTitle>
          {!editing && (
            <Button
              variant="ghost"
              size="xs"
              iconLeft={<PencilSquareIcon className="w-3.5 h-3.5" />}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            {(
              [
                { key: 'description',            label: 'Problem Description',    placeholder: 'Describe the issue or nonconformity…', rows: 4 },
                { key: 'planned_action',          label: 'Planned Action',         placeholder: 'Describe the steps to address the issue…', rows: 4 },
                { key: 'implementation_notes',    label: 'Implementation Notes',   placeholder: 'Notes on how the action was implemented…', rows: 4 },
                { key: 'implementation_evidence', label: 'Implementation Evidence', placeholder: 'Evidence that the action was completed…', rows: 3 },
              ] as const
            ).map(({ key, label, placeholder, rows }) => (
              <Textarea
                key={key}
                id={key}
                label={label}
                rows={rows}
                placeholder={placeholder}
                value={fields[key]}
                onChange={(e) => setFields(f => ({ ...f, [key]: e.target.value }))}
              />
            ))}
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFields({
                    description: ca.description,
                    planned_action: ca.planned_action,
                    implementation_notes: ca.implementation_notes,
                    implementation_evidence: ca.implementation_evidence,
                  });
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" loading={updateCA.isPending} onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : hasContent ? (
          <dl className="space-y-6">
            <NarrativeField label="Problem Description" value={ca.description} />
            {ca.description && ca.planned_action && <CardDivider />}
            <NarrativeField label="Planned Action" value={ca.planned_action} />
            {ca.planned_action && (ca.implementation_notes || ca.implementation_evidence) && <CardDivider />}
            <NarrativeField label="Implementation Notes" value={ca.implementation_notes} />
            <NarrativeField label="Implementation Evidence" value={ca.implementation_evidence} />
          </dl>
        ) : (
          <p className="text-sm text-slate-400 py-2">
            No details recorded yet.{' '}
            <button className="text-primary-600 hover:underline" onClick={() => setEditing(true)}>
              Add details
            </button>
          </p>
        )}
      </Card>

      {/* Source links */}
      {(ca.source_investigation || ca.source_incident) && (
        <Card className="border-stone-100 rounded-2xl">
          <CardTitle className="mb-4">Source</CardTitle>
          <div className="space-y-2">
            {ca.source_investigation && (
              <Link
                to={`/investigations/${ca.source_investigation.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 shrink-0">
                  <CheckCircleIcon className="w-4.5 h-4.5 w-[18px] h-[18px] text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Investigation</p>
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                    {ca.source_investigation.title}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{ca.source_investigation.reference_number}</p>
                </div>
                <LinkIcon className="w-4 h-4 text-slate-300 group-hover:text-primary-400 shrink-0" />
              </Link>
            )}
            {ca.source_incident && (
              <Link
                to={`/incidents/${ca.source_incident.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 border border-red-100 shrink-0">
                  <ExclamationTriangleIcon className="w-4.5 h-4.5 w-[18px] h-[18px] text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Incident</p>
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                    {ca.source_incident.title}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{ca.source_incident.reference_number}</p>
                </div>
                <LinkIcon className="w-4 h-4 text-slate-300 group-hover:text-primary-400 shrink-0" />
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function EffectivenessPanel({ ca, onAddReview }: { ca: CorrectiveAction; onAddReview: () => void }) {
  const reviews = ca.effectiveness_reviews;
  const canAddReview = ca.status === 'implemented';

  return (
    <div className="space-y-5 pt-5">
      {/* Guidance card */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900 mb-1">ISO 45001 Clause 10.2 — Effectiveness Verification</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            After an action is implemented, its effectiveness must be reviewed to confirm the root cause
            has been eliminated. A "Fully Effective" review closes the action. Partial or ineffective
            ratings cycle it back for further remediation.
          </p>
        </div>
      </div>

      {/* Add review button — only when status is implemented */}
      {canAddReview && (
        <div className="flex justify-end">
          <Button
            size="sm"
            iconLeft={<CheckCircleIcon className="w-3.5 h-3.5" />}
            onClick={onAddReview}
          >
            Record Effectiveness Review
          </Button>
        </div>
      )}

      {!canAddReview && ca.status !== 'closed' && (
        <div className="flex items-start gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-100">
          <ExclamationCircleIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Effectiveness reviews can only be added when the action is in{' '}
            <strong>Implemented — Awaiting Review</strong> status.
          </p>
        </div>
      )}

      {/* Review history */}
      {reviews.length === 0 ? (
        <Card className="border-stone-100 rounded-2xl">
          <EmptyState
            icon={<CheckCircleIcon className="w-5 h-5" />}
            title="No reviews yet"
            description={
              canAddReview
                ? 'This action has been implemented. Record an effectiveness review to verify it worked.'
                : 'Reviews will appear here once the action reaches Implemented status.'
            }
            className="py-8"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <EffectivenessReviewCard key={review.id} review={review} reviewNumber={reviews.length - index} />
          ))}
        </div>
      )}
    </div>
  );
}

function EffectivenessReviewCard({ review, reviewNumber }: { review: EffectivenessReview; reviewNumber: number }) {
  return (
    <Card className="border-stone-100 rounded-2xl">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold shrink-0">
            {reviewNumber}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Review {reviewNumber}</p>
            <p className="text-sm text-slate-700">
              {review.reviewer.full_name}
              <span className="text-slate-400"> · </span>
              {formatDate(review.review_date)}
            </p>
          </div>
        </div>
        <EffectivenessRatingChip rating={review.rating} />
      </div>

      {(review.evidence_description || review.notes) && <CardDivider />}

      <dl className="space-y-4 mt-4">
        {review.evidence_description && (
          <div>
            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Evidence of Effectiveness
            </dt>
            <dd className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {review.evidence_description}
            </dd>
          </div>
        )}
        {review.notes && (
          <div>
            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notes</dt>
            <dd className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{review.notes}</dd>
          </div>
        )}
        {review.next_review_date && (
          <div className="flex items-center gap-2 pt-1">
            <CalendarDaysIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">
              Next review scheduled: {formatDate(review.next_review_date)}
            </span>
          </div>
        )}
      </dl>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CADetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('details');
  const [reviewModal, setReviewModal] = useState(false);

  const { data: ca, isLoading, error } = useCorrectiveAction(id!);
  const addReview = useAddEffectivenessReview(id!);

  async function handleAddReview(data: {
    review_date: string;
    rating: EffectivenessRating;
    evidence_description: string;
    notes: string;
    next_review_date: string;
  }) {
    await addReview.mutateAsync({
      review_date: data.review_date,
      rating: data.rating,
      evidence_description: data.evidence_description || undefined,
      notes: data.notes || undefined,
      next_review_date: data.next_review_date || undefined,
    });
    setReviewModal(false);
  }

  if (isLoading) return <DetailSkeleton />;

  if (error || !ca) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <EmptyState
          title="Action not found"
          description="This corrective action may have been deleted or you may not have access to it."
          action={
            <Link to="/corrective-actions">
              <Button variant="secondary" size="sm">Back to Corrective Actions</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">

        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/corrective-actions" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Corrective Actions
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 font-mono text-xs">{ca.reference_number}</span>
        </div>

        {/* ── Hero card ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-7 py-6 mb-7">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="font-mono text-[11px] text-slate-400 bg-stone-100 px-2 py-1 rounded-md leading-none">
                  {ca.reference_number}
                </span>
                <CAStatusBadge status={ca.status} />
                <CAPriorityBadge priority={ca.priority} size="sm" />
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {CA_TYPE_LABELS[ca.action_type]}
                </span>
                {ca.is_overdue && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    <ClockIcon className="w-3 h-3" />
                    Overdue
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight leading-snug mb-5">
                {ca.title}
              </h1>

              {/* Metadata row */}
              <div className="flex items-start gap-8 pt-5 border-t border-stone-100 flex-wrap">
                <MetaItem icon={CalendarDaysIcon} label="Raised" value={formatDate(ca.created_at)} />
                {ca.assigned_to && (
                  <MetaItem icon={UserCircleIcon} label="Assigned To" value={ca.assigned_to.full_name} />
                )}
                {ca.target_date && (
                  <MetaItem
                    icon={ClockIcon}
                    label="Target Date"
                    value={
                      <span className={ca.is_overdue ? 'text-red-600' : undefined}>
                        {formatDate(ca.target_date)}
                      </span>
                    }
                  />
                )}
                {ca.effectiveness_review_count > 0 && (
                  <MetaItem
                    icon={CheckCircleIcon}
                    label="Reviews"
                    value={`${ca.effectiveness_review_count} effectiveness review${ca.effectiveness_review_count !== 1 ? 's' : ''}`}
                  />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {ca.status === 'implemented' && (
                <Button
                  size="sm"
                  iconLeft={<CheckCircleIcon className="w-3.5 h-3.5" />}
                  onClick={() => { setActiveTab('effectiveness'); setReviewModal(true); }}
                >
                  Record Review
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6">

          {/* ── Tabbed main content ──────────────────────────────────────────── */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <Tabs value={activeTab} onChange={setActiveTab}>
                <TabList className="px-4 bg-white">
                  <Tab value="details">Details</Tab>
                  <Tab
                    value="effectiveness"
                    count={ca.effectiveness_review_count || undefined}
                  >
                    Effectiveness
                  </Tab>
                  <Tab value="history">History</Tab>
                </TabList>
                <div className="px-5 pb-5">
                  <TabPanel value="details">
                    <DetailsPanel ca={ca} />
                  </TabPanel>
                  <TabPanel value="effectiveness">
                    <EffectivenessPanel ca={ca} onAddReview={() => setReviewModal(true)} />
                  </TabPanel>
                  <TabPanel value="history">
                    <div className="pt-5">
                      <Card className="border-stone-100 rounded-2xl">
                        <CardTitle className="mb-4">Status History</CardTitle>
                        {ca.status_history.length > 0 ? (
                          <StatusTimeline ca={ca} />
                        ) : (
                          <p className="text-xs text-slate-400 py-2">No history yet.</p>
                        )}
                      </Card>
                    </div>
                  </TabPanel>
                </div>
              </Tabs>
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Assigned To */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Assigned To</CardTitle>
              {ca.assigned_to ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-100 shrink-0">
                    <span className="text-sm font-bold text-primary-700">
                      {ca.assigned_to.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{ca.assigned_to.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{ca.assigned_to.job_title}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">Not assigned</p>
              )}
            </Card>

            {/* Key Dates */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Key Dates</CardTitle>
              <dl className="space-y-3.5">
                <div>
                  <dt className="text-xs font-medium text-slate-400">Raised</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-800">{formatDate(ca.created_at)}</dd>
                </div>
                {ca.target_date && (
                  <div>
                    <dt className="text-xs font-medium text-slate-400">Target Date</dt>
                    <dd className={`mt-0.5 text-sm font-medium ${ca.is_overdue ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatDate(ca.target_date)}
                    </dd>
                  </div>
                )}
                {ca.implementation_date && (
                  <div>
                    <dt className="text-xs font-medium text-slate-400">Implemented</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800">{formatDate(ca.implementation_date)}</dd>
                  </div>
                )}
                {ca.closed_at && (
                  <div>
                    <dt className="text-xs font-medium text-slate-400">Closed</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800">{formatDateTime(ca.closed_at)}</dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Effectiveness Summary */}
            {ca.effectiveness_reviews.length > 0 && (
              <Card className="border-stone-100 rounded-2xl">
                <CardTitle className="mb-4">Latest Review</CardTitle>
                <div className="space-y-2">
                  <EffectivenessRatingChip rating={ca.effectiveness_reviews[0].rating} />
                  <p className="text-xs text-slate-500 mt-1">
                    By {ca.effectiveness_reviews[0].reviewer.full_name}
                    {' · '}
                    {formatDate(ca.effectiveness_reviews[0].review_date)}
                  </p>
                  {ca.effectiveness_review_count > 1 && (
                    <button
                      className="text-xs text-primary-600 hover:underline"
                      onClick={() => setActiveTab('effectiveness')}
                    >
                      View all {ca.effectiveness_review_count} reviews
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Raised By */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Raised By</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 shrink-0">
                  <span className="text-sm font-bold text-slate-600">
                    {ca.created_by.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{ca.created_by.full_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{ca.created_by.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      <AddEffectivenessReviewModal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        onConfirm={handleAddReview}
        isLoading={addReview.isPending}
      />
    </div>
  );
}
