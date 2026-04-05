import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { Card, CardTitle, CardDivider } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useInvestigation } from '../hooks/useInvestigations';
import {
  useTransitionInvestigation,
  useUpdateInvestigation,
  useAddRootCause,
  useDeleteRootCause,
} from '../hooks/useInvestigationMutations';
import InvestigationStatusBadge from '../components/InvestigationStatusBadge';
import {
  INVESTIGATION_STATUS_LABELS,
  RCA_METHOD_LABELS,
  ROOT_CAUSE_CATEGORY_LABELS,
} from '../types/investigation.types';
import type {
  InvestigationStatus,
  Investigation,
  RootCauseCategory,
  RCAMethod,
} from '../types/investigation.types';

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-1">
          {label}
        </p>
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

function StatusTimeline({ investigation }: { investigation: Investigation }) {
  const history = [...investigation.status_history].reverse();

  return (
    <div className="space-y-0">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ring-2 ring-white ${
                index === 0 ? 'bg-primary-500' : 'bg-slate-200'
              }`}
            />
            {index < history.length - 1 && (
              <div className="w-px flex-1 bg-stone-100 my-1.5" />
            )}
          </div>
          <div className="pb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <InvestigationStatusBadge status={entry.to_status} size="sm" />
            </div>
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
            <Skeleton className="w-full h-32 rounded-2xl" />
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

// ─── Transition modal ─────────────────────────────────────────────────────────

function TransitionModal({
  isOpen,
  targetStatus,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  targetStatus: InvestigationStatus | null;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isLoading: boolean;
}) {
  const [comment, setComment] = useState('');

  function handleConfirm() {
    onConfirm(comment);
  }

  function handleClose() {
    setComment('');
    onClose();
  }

  if (!targetStatus) return null;

  const label = INVESTIGATION_STATUS_LABELS[targetStatus];
  const isReopen = targetStatus === 'initiated';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isReopen ? 'Reopen Investigation' : `Advance to: ${label}`}
      description="Optionally add a comment to explain this status change."
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" loading={isLoading} onClick={handleConfirm}>
            {isReopen ? 'Reopen' : 'Confirm'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
          <ArrowsRightLeftIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-sm text-slate-600">
            Status will change to{' '}
            <span className="font-medium text-slate-900">{label}</span>
          </p>
        </div>
        <Textarea
          id="transition-comment"
          label="Comment (optional)"
          placeholder="Add a note about this transition…"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
}

// ─── Add root cause modal ─────────────────────────────────────────────────────

function AddRootCauseModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: RootCauseCategory, description: string) => void;
  isLoading: boolean;
}) {
  const [category, setCategory] = useState<RootCauseCategory | ''>('');
  const [description, setDescription] = useState('');

  function handleConfirm() {
    if (!category || !description.trim()) return;
    onConfirm(category as RootCauseCategory, description.trim());
  }

  function handleClose() {
    setCategory('');
    setDescription('');
    onClose();
  }

  const canSubmit = Boolean(category && description.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Root Cause"
      description="Identify a specific root cause contributing to this incident."
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" loading={isLoading} onClick={handleConfirm} disabled={!canSubmit}>
            Add Root Cause
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          id="rc-category"
          label="Category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value as RootCauseCategory)}
        >
          <option value="">Select a category…</option>
          {Object.entries(ROOT_CAUSE_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Textarea
          id="rc-description"
          label="Description"
          required
          placeholder="Describe this root cause in detail…"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function OverviewPanel({ investigation }: { investigation: Investigation }) {
  const updateInvestigation = useUpdateInvestigation(investigation.id);
  const [editing, setEditing] = useState(false);
  const [scopeVal, setScopeVal] = useState(investigation.scope);
  const [timelineVal, setTimelineVal] = useState(investigation.timeline_of_events);

  async function handleSave() {
    await updateInvestigation.mutateAsync({
      scope: scopeVal,
      timeline_of_events: timelineVal,
    });
    setEditing(false);
  }

  return (
    <div className="space-y-5 pt-5">
      <Card className="border-stone-100 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <CardTitle>Scope & Timeline</CardTitle>
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
            <Textarea
              id="scope"
              label="Scope of Investigation"
              rows={4}
              value={scopeVal}
              onChange={(e) => setScopeVal(e.target.value)}
            />
            <Textarea
              id="timeline"
              label="Timeline of Events"
              rows={5}
              placeholder="Chronological sequence of events leading to the incident…"
              value={timelineVal}
              onChange={(e) => setTimelineVal(e.target.value)}
            />
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setScopeVal(investigation.scope);
                  setTimelineVal(investigation.timeline_of_events);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={updateInvestigation.isPending}
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <dl className="space-y-5">
            <NarrativeField label="Scope" value={investigation.scope} />
            <NarrativeField label="Timeline of Events" value={investigation.timeline_of_events} />
            {!investigation.scope && !investigation.timeline_of_events && (
              <p className="text-sm text-slate-400 py-2">
                No scope or timeline recorded yet.{' '}
                <button
                  className="text-primary-600 hover:underline"
                  onClick={() => setEditing(true)}
                >
                  Add details
                </button>
              </p>
            )}
          </dl>
        )}
      </Card>

      {investigation.incident && (
        <Card className="border-stone-100 rounded-2xl">
          <CardTitle className="mb-4">Linked Incident</CardTitle>
          <Link
            to={`/incidents/${investigation.incident.id}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 border border-red-100 shrink-0">
              <ExclamationTriangleIcon className="w-4.5 h-4.5 w-[18px] h-[18px] text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                {investigation.incident.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {investigation.incident.reference_number}
                <span className="font-sans"> · {formatDate(investigation.incident.date_of_incident)}</span>
              </p>
            </div>
            <LinkIcon className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors shrink-0" />
          </Link>
        </Card>
      )}
    </div>
  );
}

function RCAPanel({ investigation }: { investigation: Investigation }) {
  const [showModal, setShowModal] = useState(false);
  const addRootCause = useAddRootCause(investigation.id);
  const deleteRootCause = useDeleteRootCause(investigation.id);
  const updateInvestigation = useUpdateInvestigation(investigation.id);
  const [editingMethod, setEditingMethod] = useState(false);
  const [rcaMethod, setRcaMethod] = useState<RCAMethod | ''>(investigation.rca_method ?? '');

  async function handleAddRootCause(category: RootCauseCategory, description: string) {
    await addRootCause.mutateAsync({ category, description });
    setShowModal(false);
  }

  async function handleSaveMethod() {
    await updateInvestigation.mutateAsync({ rca_method: (rcaMethod as RCAMethod) || undefined });
    setEditingMethod(false);
  }

  return (
    <div className="space-y-5 pt-5">
      {/* RCA Method */}
      <Card className="border-stone-100 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>RCA Method</CardTitle>
          {!editingMethod && (
            <Button
              variant="ghost"
              size="xs"
              iconLeft={<PencilSquareIcon className="w-3.5 h-3.5" />}
              onClick={() => setEditingMethod(true)}
            >
              Edit
            </Button>
          )}
        </div>

        {editingMethod ? (
          <div className="space-y-3">
            <Select
              id="rca-method-edit"
              label="Method"
              value={rcaMethod}
              onChange={(e) => setRcaMethod(e.target.value as RCAMethod)}
            >
              <option value="">No method selected</option>
              {Object.entries(RCA_METHOD_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setRcaMethod(investigation.rca_method ?? ''); setEditingMethod(false); }}>
                Cancel
              </Button>
              <Button size="sm" loading={updateInvestigation.isPending} onClick={handleSaveMethod}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-800">
            {investigation.rca_method
              ? RCA_METHOD_LABELS[investigation.rca_method]
              : <span className="text-slate-400">No method selected</span>
            }
          </p>
        )}
      </Card>

      {/* Root Causes */}
      <Card className="border-stone-100 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <CardTitle>
            Root Causes
            {investigation.root_causes.length > 0 && (
              <span className="ml-1 text-slate-400 font-normal">
                ({investigation.root_causes.length})
              </span>
            )}
          </CardTitle>
          <Button
            variant="secondary"
            size="xs"
            iconLeft={<PlusIcon className="w-3.5 h-3.5" />}
            onClick={() => setShowModal(true)}
          >
            Add
          </Button>
        </div>

        {investigation.root_causes.length === 0 ? (
          <EmptyState
            icon={<CheckCircleIcon className="w-5 h-5" />}
            title="No root causes recorded"
            description="Add root causes identified during the investigation."
            className="py-6"
            action={
              <Button
                size="sm"
                variant="secondary"
                iconLeft={<PlusIcon className="w-3.5 h-3.5" />}
                onClick={() => setShowModal(true)}
              >
                Add root cause
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {investigation.root_causes.map((rc, index) => (
              <div
                key={rc.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/50"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-400 mb-1">
                    {rc.category_display}
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed">{rc.description}</p>
                </div>
                <button
                  onClick={() => deleteRootCause.mutate(rc.id)}
                  className="shrink-0 text-slate-300 hover:text-red-500 transition-colors mt-0.5"
                  title="Remove root cause"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AddRootCauseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleAddRootCause}
        isLoading={addRootCause.isPending}
      />
    </div>
  );
}

function FindingsPanel({ investigation }: { investigation: Investigation }) {
  const updateInvestigation = useUpdateInvestigation(investigation.id);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    immediate_causes: investigation.immediate_causes,
    contributing_factors: investigation.contributing_factors,
    findings: investigation.findings,
    lessons_learned: investigation.lessons_learned,
    recommendations: investigation.recommendations,
  });

  async function handleSave() {
    await updateInvestigation.mutateAsync(fields);
    setEditing(false);
  }

  const hasContent = Object.values(fields).some(Boolean);

  return (
    <div className="space-y-5 pt-5">
      <Card className="border-stone-100 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <CardTitle>Findings & Recommendations</CardTitle>
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
          <div className="space-y-5">
            {(
              [
                { key: 'immediate_causes',    label: 'Immediate Causes',    placeholder: 'The direct causes that immediately caused or contributed to the incident…' },
                { key: 'contributing_factors', label: 'Contributing Factors', placeholder: 'Underlying conditions or circumstances that contributed…' },
                { key: 'findings',            label: 'Findings',            placeholder: 'Key findings from the investigation…' },
                { key: 'lessons_learned',     label: 'Lessons Learned',     placeholder: 'What can be learned to prevent recurrence…' },
                { key: 'recommendations',     label: 'Recommendations',     placeholder: 'Corrective actions recommended to prevent recurrence…' },
              ] as const
            ).map(({ key, label, placeholder }) => (
              <Textarea
                key={key}
                id={key}
                label={label}
                rows={4}
                placeholder={placeholder}
                value={fields[key]}
                onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
              />
            ))}
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFields({
                    immediate_causes: investigation.immediate_causes,
                    contributing_factors: investigation.contributing_factors,
                    findings: investigation.findings,
                    lessons_learned: investigation.lessons_learned,
                    recommendations: investigation.recommendations,
                  });
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" loading={updateInvestigation.isPending} onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : hasContent ? (
          <dl className="space-y-6">
            <NarrativeField label="Immediate Causes" value={investigation.immediate_causes} />
            <NarrativeField label="Contributing Factors" value={investigation.contributing_factors} />
            {(investigation.immediate_causes || investigation.contributing_factors) &&
              (investigation.findings || investigation.lessons_learned || investigation.recommendations) && (
                <CardDivider />
              )}
            <NarrativeField label="Findings" value={investigation.findings} />
            <NarrativeField label="Lessons Learned" value={investigation.lessons_learned} />
            <NarrativeField label="Recommendations" value={investigation.recommendations} />
          </dl>
        ) : (
          <p className="text-sm text-slate-400 py-2">
            No findings recorded yet.{' '}
            <button className="text-primary-600 hover:underline" onClick={() => setEditing(true)}>
              Add findings
            </button>
          </p>
        )}
      </Card>
    </div>
  );
}

function TeamPanel({ investigation }: { investigation: Investigation }) {
  return (
    <div className="space-y-5 pt-5">
      <Card className="border-stone-100 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <CardTitle>
            Investigation Team
            {investigation.team_memberships.length > 0 && (
              <span className="ml-1 text-slate-400 font-normal">
                ({investigation.team_memberships.length})
              </span>
            )}
          </CardTitle>
        </div>

        {/* Lead investigator */}
        {investigation.lead_investigator && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-400 mb-3">
              Lead Investigator
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 shrink-0">
                <span className="text-sm font-bold text-primary-700">
                  {investigation.lead_investigator.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{investigation.lead_investigator.full_name}</p>
                <p className="text-xs text-slate-500">{investigation.lead_investigator.job_title}</p>
              </div>
            </div>
          </div>
        )}

        {/* Team members */}
        {investigation.team_memberships.length > 0 && (
          <>
            {investigation.lead_investigator && <CardDivider />}
            <p className="text-xs font-medium text-slate-400 mb-3">
              Team Members
            </p>
            <div className="space-y-2">
              {investigation.team_memberships.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-100"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 shrink-0">
                    <span className="text-sm font-bold text-slate-600">
                      {member.user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{member.user.full_name}</p>
                    <p className="text-xs text-slate-400">{member.user.job_title}</p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">
                    Added {formatDate(member.added_at)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {!investigation.lead_investigator && investigation.team_memberships.length === 0 && (
          <EmptyState
            icon={<UsersIcon className="w-5 h-5" />}
            title="No team members yet"
            description="Team members can be added by an HSE Manager or above."
            className="py-6"
          />
        )}
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [transitionModal, setTransitionModal] = useState<{
    open: boolean;
    targetStatus: InvestigationStatus | null;
  }>({ open: false, targetStatus: null });

  const { data: investigation, isLoading, error } = useInvestigation(id!);
  const transitionInvestigation = useTransitionInvestigation(id!);


  function openTransitionModal(status: InvestigationStatus) {
    setTransitionModal({ open: true, targetStatus: status });
  }

  function closeTransitionModal() {
    setTransitionModal({ open: false, targetStatus: null });
  }

  async function handleTransition(comment: string) {
    if (!transitionModal.targetStatus) return;
    await transitionInvestigation.mutateAsync({
      new_status: transitionModal.targetStatus,
      comment: comment || undefined,
    });
    closeTransitionModal();
  }

  if (isLoading) return <DetailSkeleton />;

  if (error || !investigation) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <EmptyState
          title="Investigation not found"
          description="This investigation may have been deleted or you may not have access to it."
          action={
            <Link to="/investigations">
              <Button variant="secondary" size="sm">Back to Investigations</Button>
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
          <Link
            to="/investigations"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Investigations
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 font-mono text-xs">{investigation.reference_number}</span>
        </div>

        {/* ── Hero card ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-7 py-6 mb-7">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="font-mono text-[11px] text-slate-400 bg-stone-100 px-2 py-1 rounded-md leading-none">
                  {investigation.reference_number}
                </span>
                <InvestigationStatusBadge status={investigation.status} />
                {investigation.is_overdue && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    <ClockIcon className="w-3 h-3" />
                    Overdue
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight leading-snug mb-5">
                {investigation.title}
              </h1>

              {/* Key metadata row */}
              <div className="flex items-start gap-8 pt-5 border-t border-stone-100 flex-wrap">
                <MetaItem
                  icon={CalendarDaysIcon}
                  label="Opened"
                  value={formatDate(investigation.created_at)}
                />
                {investigation.lead_investigator && (
                  <MetaItem
                    icon={UserCircleIcon}
                    label="Lead Investigator"
                    value={investigation.lead_investigator.full_name}
                  />
                )}
                {investigation.target_completion_date && (
                  <MetaItem
                    icon={ClockIcon}
                    label="Target Completion"
                    value={formatDate(investigation.target_completion_date)}
                  />
                )}
                {investigation.rca_method && (
                  <MetaItem
                    icon={CheckCircleIcon}
                    label="RCA Method"
                    value={RCA_METHOD_LABELS[investigation.rca_method]}
                  />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <Link to={`/corrective-actions/new?investigation=${investigation.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<CheckCircleIcon className="w-3.5 h-3.5" />}
                >
                  Raise Corrective Action
                </Button>
              </Link>
              {investigation.allowed_transitions.map((newStatus) => (
                <Button
                  key={newStatus}
                  variant={newStatus === 'closed' || newStatus === 'initiated' ? 'secondary' : 'primary'}
                  size="sm"
                  iconLeft={<ArrowsRightLeftIcon className="w-3.5 h-3.5" />}
                  onClick={() => openTransitionModal(newStatus)}
                >
                  {INVESTIGATION_STATUS_LABELS[newStatus]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main two-column layout ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6">

          {/* ── Left: Tabbed content ─────────────────────────────────────────── */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <Tabs value={activeTab} onChange={setActiveTab}>
                <TabList className="px-4 bg-white">
                  <Tab value="overview">Overview</Tab>
                  <Tab
                    value="rca"
                    count={investigation.root_causes.length || undefined}
                  >
                    Root Cause Analysis
                  </Tab>
                  <Tab value="findings">Findings</Tab>
                  <Tab
                    value="team"
                    count={investigation.team_memberships.length || undefined}
                  >
                    Team
                  </Tab>
                </TabList>

                <div className="px-5 pb-5">
                  <TabPanel value="overview">
                    <OverviewPanel investigation={investigation} />
                  </TabPanel>
                  <TabPanel value="rca">
                    <RCAPanel investigation={investigation} />
                  </TabPanel>
                  <TabPanel value="findings">
                    <FindingsPanel investigation={investigation} />
                  </TabPanel>
                  <TabPanel value="team">
                    <TeamPanel investigation={investigation} />
                  </TabPanel>
                </div>
              </Tabs>
            </div>
          </div>

          {/* ── Right: Sidebar ───────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Key Dates */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Key Dates</CardTitle>
              <dl className="space-y-3.5">
                <div>
                  <dt className="text-xs font-medium text-slate-400">Opened</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-800">
                    {formatDate(investigation.created_at)}
                  </dd>
                </div>
                {investigation.target_completion_date && (
                  <div>
                    <dt className="text-xs font-medium text-slate-400">Target Completion</dt>
                    <dd className={`mt-0.5 text-sm font-medium ${investigation.is_overdue ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatDate(investigation.target_completion_date)}
                    </dd>
                  </div>
                )}
                {investigation.actual_completion_date && (
                  <div>
                    <dt className="text-xs font-medium text-slate-400">Completed</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800">
                      {formatDate(investigation.actual_completion_date)}
                    </dd>
                  </div>
                )}
                {investigation.closed_at && (
                  <div>
                    <dt className="text-xs font-medium text-slate-400">Closed</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800">
                      {formatDateTime(investigation.closed_at)}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Opened by */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Opened By</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 shrink-0">
                  <span className="text-sm font-bold text-slate-600">
                    {investigation.created_by.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {investigation.created_by.full_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate capitalize">
                    {investigation.created_by.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Status Timeline */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Status Timeline</CardTitle>
              {investigation.status_history.length > 0 ? (
                <StatusTimeline investigation={investigation} />
              ) : (
                <p className="text-xs text-slate-400 py-2">No history yet.</p>
              )}
            </Card>

          </div>
        </div>

      </div>

      {/* ── Transition modal ─────────────────────────────────────────────────── */}
      <TransitionModal
        isOpen={transitionModal.open}
        targetStatus={transitionModal.targetStatus}
        onClose={closeTransitionModal}
        onConfirm={handleTransition}
        isLoading={transitionInvestigation.isPending}
      />

    </div>
  );
}
