import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  UserPlusIcon,
  PaperClipIcon,
  PhotoIcon,
  DocumentIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Card, CardTitle, CardDivider } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { formatDate, formatDateTime, formatFileSize } from '@/lib/utils';
import Input from '@/components/ui/Input';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import { useIncident } from '../hooks/useIncidents';
import { useTransitionStatus, useSubmitIncident, useAssignIncident } from '../hooks/useIncidentMutations';
import IncidentStatusBadge from '../components/IncidentStatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import {
  INCIDENT_TYPE_LABELS,
  INCIDENT_STATUS_LABELS,
} from '../types/incident.types';
import type { IncidentStatus, IncidentAttachment, Incident } from '../types/incident.types';

// ── Severity accent — drives the hero card's left border color ─────────────

const SEVERITY_ACCENT: Record<string, string> = {
  critical: 'border-l-[3px] border-l-red-500',
  high:     'border-l-[3px] border-l-orange-400',
  medium:   'border-l-[3px] border-l-amber-400',
  low:      'border-l-[3px] border-l-slate-300',
};

// ── Sub-components ─────────────────────────────────────────────────────────

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

function DetailField({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <dt className="text-xs font-medium text-slate-400 mb-1.5">{label}</dt>
      <dd className="text-sm text-slate-800">
        {value || <span className="text-slate-300">—</span>}
      </dd>
    </div>
  );
}

function NarrativeBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-2.5">{label}</p>
      <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function ImpactFlag({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors',
        active
          ? 'bg-red-50 text-red-700 border-red-100'
          : 'bg-transparent text-slate-400 border-stone-100',
      )}
    >
      {active ? (
        <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
      ) : (
        <CheckCircleIcon className="w-4 h-4 shrink-0 text-slate-300" />
      )}
      {label}
    </div>
  );
}

function AttachmentThumbnail({ attachment }: { attachment: IncidentAttachment }) {
  if (attachment.is_photo) {
    return (
      <a
        href={attachment.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-square rounded-xl overflow-hidden border border-stone-100 bg-stone-50 shadow-sm hover:shadow transition-shadow"
      >
        <img
          src={attachment.file_url}
          alt={attachment.caption || attachment.file_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {attachment.caption && (
          <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-xs text-white truncate">{attachment.caption}</p>
          </div>
        )}
      </a>
    );
  }

  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-stone-100 bg-stone-50 hover:bg-white hover:border-stone-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-stone-100 shrink-0">
        <DocumentIcon className="w-[18px] h-[18px] text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{attachment.file_name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(attachment.file_size)}</p>
      </div>
    </a>
  );
}

function StatusTimeline({ incident }: { incident: Incident }) {
  const history = [...incident.status_history].reverse();

  return (
    <div className="space-y-0">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-2 h-2 rounded-full mt-1.5 shrink-0 ring-2 ring-white',
                index === 0 ? 'bg-primary-500' : 'bg-slate-200',
              )}
            />
            {index < history.length - 1 && (
              <div className="w-px flex-1 bg-stone-100 my-1.5" />
            )}
          </div>
          <div className="pb-5">
            <IncidentStatusBadge status={entry.to_status} size="sm" />
            <p className="text-xs text-slate-400 mt-1.5">
              {entry.changed_by.full_name}
              <span className="mx-1">·</span>
              {formatDateTime(entry.created_at)}
            </p>
            {entry.comment && (
              <p className="mt-2 text-xs text-slate-500 bg-stone-50 rounded-lg px-2.5 py-1.5 italic border border-stone-100">
                "{entry.comment}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Sidebar date row ───────────────────────────────────────────────────────

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-3.5 w-20 rounded-lg" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3.5 w-28 rounded-lg" />
        </div>
        <Skeleton className="w-full h-40 rounded-2xl mb-7" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            <Skeleton className="w-full h-72 rounded-2xl" />
            <Skeleton className="w-full h-32 rounded-2xl" />
          </div>
          <div className="space-y-5">
            <Skeleton className="w-full h-28 rounded-2xl" />
            <Skeleton className="w-full h-44 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Transition modal ───────────────────────────────────────────────────────

function TransitionModal({
  isOpen,
  targetStatus,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  targetStatus: IncidentStatus | null;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  isLoading: boolean;
}) {
  const [comment, setComment] = useState('');

  function handleConfirm() { onConfirm(comment); }
  function handleClose() { setComment(''); onClose(); }

  if (!targetStatus) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Transition to: ${INCIDENT_STATUS_LABELS[targetStatus]}`}
      description="Optionally add a comment explaining this status change."
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" loading={isLoading} onClick={handleConfirm}>
            Confirm Transition
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
          <ArrowsRightLeftIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-sm text-slate-600">
            Status will change to{' '}
            <span className="font-medium text-slate-900">
              {INCIDENT_STATUS_LABELS[targetStatus]}
            </span>
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

// ── Assign Incident modal ──────────────────────────────────────────────────

function AssignIncidentModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  currentAssigneeId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assigneeId: string, comment: string) => void;
  isLoading: boolean;
  currentAssigneeId?: string;
}) {
  const { data: users = [], isLoading: loadingUsers } = useOrgUsers();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>(currentAssigneeId ?? '');
  const [comment, setComment] = useState('');

  function handleClose() {
    setSearch('');
    setSelectedId(currentAssigneeId ?? '');
    setComment('');
    onClose();
  }

  function handleConfirm() {
    if (!selectedId) return;
    onConfirm(selectedId, comment);
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.job_title ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Incident"
      description="Select a team member to take responsibility for this incident."
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={isLoading}
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          id="assign-search"
          placeholder="Search by name or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-60 overflow-y-auto space-y-1 -mx-1 px-1">
          {loadingUsers ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No users found</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedId(u.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors border',
                  selectedId === u.id
                    ? 'bg-primary-50 border-primary-200'
                    : 'border-transparent hover:bg-stone-50',
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 shrink-0">
                  <span className="text-xs font-bold text-primary-700">
                    {u.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {u.job_title || u.role.replace('_', ' ')}
                  </p>
                </div>
                {selectedId === u.id && (
                  <CheckCircleIcon className="w-4 h-4 text-primary-600 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <Textarea
          id="assign-comment"
          label="Comment (optional)"
          placeholder="Add a note about this assignment…"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [transitionModal, setTransitionModal] = useState<{
    open: boolean;
    targetStatus: IncidentStatus | null;
  }>({ open: false, targetStatus: null });
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const { data: incident, isLoading, error } = useIncident(id!);
  const transitionStatus = useTransitionStatus(id!);
  const submitIncident = useSubmitIncident();
  const assignIncident = useAssignIncident(id!);

  function openTransitionModal(status: IncidentStatus) {
    setTransitionModal({ open: true, targetStatus: status });
  }
  function closeTransitionModal() {
    setTransitionModal({ open: false, targetStatus: null });
  }
  async function handleTransition(comment: string) {
    if (!transitionModal.targetStatus) return;
    await transitionStatus.mutateAsync({
      new_status: transitionModal.targetStatus,
      comment: comment || undefined,
    });
    closeTransitionModal();
  }
  async function handleSubmit() {
    await submitIncident.mutateAsync(id!);
  }

  async function handleAssign(assigneeId: string, comment: string) {
    await assignIncident.mutateAsync({ assignee_id: assigneeId, comment: comment || undefined });
    setAssignModalOpen(false);
  }

  if (isLoading) return <DetailSkeleton />;

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <EmptyState
          title="Incident not found"
          description="This incident may have been deleted or you may not have access to it."
          action={
            <Link to="/incidents">
              <Button variant="secondary" size="sm">Back to Incidents</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const photos = incident.attachments.filter((a) => a.is_photo);
  const docs = incident.attachments.filter((a) => !a.is_photo);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1280px] mx-auto px-8 py-8">

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-7 text-sm">
          <Link
            to="/incidents"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Incidents
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 font-mono text-xs">{incident.reference_number}</span>
        </div>

        {/* ── Hero card ─────────────────────────────────────────────── */}
        <div className={cn(
          'bg-white rounded-2xl border border-stone-100 shadow-sm px-7 py-6 mb-7',
          SEVERITY_ACCENT[incident.severity],
        )}>
          {/* Row 1: Identity badges + action buttons */}
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] text-slate-400 bg-stone-100 px-2 py-1 rounded-md leading-none">
                {incident.reference_number}
              </span>
              <IncidentStatusBadge status={incident.status} />
              <SeverityBadge severity={incident.severity} />
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {!incident.investigation_id && incident.status !== 'draft' && (
                <Link to={`/investigations/new?incident=${incident.id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<MagnifyingGlassIcon className="w-3.5 h-3.5" />}
                  >
                    Open Investigation
                  </Button>
                </Link>
              )}
              {incident.investigation_id && (
                <Link to={`/investigations/${incident.investigation_id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<MagnifyingGlassIcon className="w-3.5 h-3.5" />}
                  >
                    View Investigation
                  </Button>
                </Link>
              )}
              <Link to={`/incidents/${id}/edit`}>
                <Button variant="secondary" size="sm" iconLeft={<PencilSquareIcon className="w-3.5 h-3.5" />}>
                  Edit
                </Button>
              </Link>
              {incident.status === 'draft' && (
                <Button size="sm" loading={submitIncident.isPending} onClick={handleSubmit}>
                  Submit for Review
                </Button>
              )}
              {incident.allowed_transitions.length > 0 && incident.status !== 'draft' && (
                incident.allowed_transitions.map((newStatus) => (
                  <Button
                    key={newStatus}
                    variant={newStatus === 'closed' || newStatus === 'reopened' ? 'secondary' : 'primary'}
                    size="sm"
                    iconLeft={<ArrowsRightLeftIcon className="w-3.5 h-3.5" />}
                    onClick={() => openTransitionModal(newStatus)}
                  >
                    {INCIDENT_STATUS_LABELS[newStatus]}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Row 2: Title — visual anchor of the page */}
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight leading-snug mb-6">
            {incident.title}
          </h1>

          {/* Row 3: Metadata — separated with a top rule */}
          <div className="flex items-start gap-8 pt-5 border-t border-stone-100 flex-wrap">
            <MetaItem
              icon={CalendarDaysIcon}
              label="Incident Date"
              value={formatDate(incident.date_of_incident)}
            />
            {(incident.site_name || incident.location_detail) && (
              <MetaItem
                icon={MapPinIcon}
                label="Location"
                value={[incident.site_name, incident.location_detail].filter(Boolean).join(' · ')}
              />
            )}
            <MetaItem
              icon={UserCircleIcon}
              label="Reported By"
              value={incident.reported_by.full_name}
            />
            {incident.department_name && (
              <MetaItem
                icon={UserPlusIcon}
                label="Department"
                value={incident.department_name}
              />
            )}
          </div>
        </div>

        {/* ── Two-column body ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6">

          {/* Main content */}
          <div className="col-span-2 space-y-5">

            {/* Incident Information */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-5">Incident Information</CardTitle>

              {/* Fact grid */}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
                <DetailField
                  label="Incident Type"
                  value={INCIDENT_TYPE_LABELS[incident.incident_type] ?? incident.incident_type_display}
                />
                <DetailField
                  label="Date of Incident"
                  value={formatDate(incident.date_of_incident)}
                />
                {incident.time_of_incident && (
                  <DetailField label="Time" value={incident.time_of_incident} />
                )}
                {incident.site_name && (
                  <DetailField label="Site" value={incident.site_name} />
                )}
                {incident.department_name && (
                  <DetailField label="Department" value={incident.department_name} />
                )}
                {incident.location_detail && (
                  <DetailField label="Location Detail" value={incident.location_detail} />
                )}
              </dl>

              <CardDivider className="border-stone-100" />

              {/* Narrative blocks */}
              <div className="space-y-5">
                <NarrativeBlock label="Description" content={incident.description} />
                {incident.immediate_action_taken && (
                  <NarrativeBlock
                    label="Immediate Action Taken"
                    content={incident.immediate_action_taken}
                  />
                )}
              </div>
            </Card>

            {/* Impact Assessment */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Impact Assessment</CardTitle>
              <div className="grid grid-cols-3 gap-3">
                <ImpactFlag active={incident.injury_occurred} label="Injury occurred" />
                <ImpactFlag active={incident.environmental_impact} label="Environmental impact" />
                <ImpactFlag active={incident.property_damage} label="Property damage" />
              </div>
            </Card>

            {/* People Involved */}
            {(incident.persons_involved.length > 0 || incident.witnesses.length > 0) && (
              <Card className="border-stone-100 rounded-2xl">
                <CardTitle className="mb-5">People Involved</CardTitle>
                <div className="grid grid-cols-2 gap-6">
                  {incident.persons_involved.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-3">Persons Involved</p>
                      <ul className="space-y-2">
                        {incident.persons_involved.map((name, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {incident.witnesses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-3">Witnesses</p>
                      <ul className="space-y-2">
                        {incident.witnesses.map((name, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Attachments */}
            <Card className="border-stone-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-5">
                <PaperClipIcon className="w-4 h-4 text-slate-400" />
                <CardTitle>
                  Attachments
                  {incident.attachments.length > 0 && (
                    <span className="ml-1 text-slate-400 font-normal">
                      ({incident.attachments.length})
                    </span>
                  )}
                </CardTitle>
              </div>

              {incident.attachments.length === 0 ? (
                <EmptyState
                  icon={<PhotoIcon className="w-5 h-5" />}
                  title="No attachments"
                  description="No photos or documents have been attached to this incident."
                  className="py-6"
                />
              ) : (
                <div className="space-y-5">
                  {photos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-3">
                        Photos ({photos.length})
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {photos.map((a) => (
                          <AttachmentThumbnail key={a.id} attachment={a} />
                        ))}
                      </div>
                    </div>
                  )}
                  {docs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-3">
                        Documents ({docs.length})
                      </p>
                      <div className="space-y-2">
                        {docs.map((a) => (
                          <AttachmentThumbnail key={a.id} attachment={a} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Assignment */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Assigned To</CardTitle>
              {incident.assigned_to ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50 shrink-0">
                      <span className="text-sm font-bold text-primary-700">
                        {incident.assigned_to.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {incident.assigned_to.full_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {incident.assigned_to.job_title}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconLeft={<UserPlusIcon className="w-3 h-3" />}
                    onClick={() => setAssignModalOpen(true)}
                  >
                    Reassign
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">Not yet assigned</p>
                  <Button
                    variant="outline"
                    size="xs"
                    iconLeft={<UserPlusIcon className="w-3 h-3" />}
                    onClick={() => setAssignModalOpen(true)}
                  >
                    Assign Incident
                  </Button>
                </div>
              )}
            </Card>

            {/* Key Dates */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Key Dates</CardTitle>
              <dl className="space-y-4">
                <DateRow
                  label="Incident date"
                  value={formatDate(incident.date_of_incident)}
                />
                {incident.report_date && (
                  <DateRow label="Reported" value={formatDateTime(incident.report_date)} />
                )}
                {incident.reviewed_at && (
                  <DateRow label="Reviewed" value={formatDateTime(incident.reviewed_at)} />
                )}
                {incident.closed_at && (
                  <DateRow label="Closed" value={formatDateTime(incident.closed_at)} />
                )}
              </dl>
            </Card>

            {/* Status Timeline */}
            <Card className="border-stone-100 rounded-2xl">
              <CardTitle className="mb-4">Status Timeline</CardTitle>
              {incident.status_history.length > 0 ? (
                <StatusTimeline incident={incident} />
              ) : (
                <p className="text-xs text-slate-400 py-2">No history yet.</p>
              )}
            </Card>

          </div>
        </div>
      </div>

      <TransitionModal
        isOpen={transitionModal.open}
        targetStatus={transitionModal.targetStatus}
        onClose={closeTransitionModal}
        onConfirm={handleTransition}
        isLoading={transitionStatus.isPending}
      />

      <AssignIncidentModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onConfirm={handleAssign}
        isLoading={assignIncident.isPending}
        currentAssigneeId={incident.assigned_to?.id}
      />
    </div>
  );
}
