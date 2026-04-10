import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  UserPlusIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { hasMinRole } from '@/lib/permissions';
import {
  useTeamMembers,
  useDepartments,
  useInviteMember,
  useUpdateMember,
  useToggleMemberActive,
} from '../hooks/useTeam';
import type {
  TeamMember,
  UserRole,
  InviteMemberPayload,
  UpdateMemberPayload,
  InviteResponse,
} from '../types/user.types';
import { USER_ROLE_LABELS } from '../types/user.types';

// ── Role badge ────────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<UserRole, string> = {
  super_admin:  'bg-purple-100 text-purple-700',
  org_admin:    'bg-indigo-100 text-indigo-700',
  hse_manager:  'bg-teal-100 text-teal-700',
  supervisor:   'bg-blue-100 text-blue-700',
  employee:     'bg-slate-100 text-slate-600',
  auditor:      'bg-amber-100 text-amber-700',
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600')}>
      {USER_ROLE_LABELS[role] ?? role}
    </span>
  );
}

function Avatar({ member }: { member: TeamMember }) {
  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase() || member.email[0].toUpperCase();
  return (
    <div className={cn(
      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
      member.is_active ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400',
    )}>
      {initials}
    </div>
  );
}

// ── Invite / Edit Modal ───────────────────────────────────────────────────────
interface MemberFormValues {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  job_title: string;
  phone: string;
  department: string;
}

interface MemberModalProps {
  mode: 'invite' | 'edit';
  member?: TeamMember;
  onClose: () => void;
}

function MemberModal({ mode, member, onClose }: MemberModalProps) {
  const { data: departments = [] } = useDepartments();
  const invite = useInviteMember();
  const update = useUpdateMember(member?.id ?? '');
  const [createdMember, setCreatedMember] = useState<InviteResponse | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<MemberFormValues>({
    defaultValues: {
      email: '',
      first_name: member?.first_name ?? '',
      last_name: member?.last_name ?? '',
      role: member?.role ?? 'employee',
      job_title: member?.job_title ?? '',
      phone: member?.phone ?? '',
      department: member?.department ?? '',
    },
  });

  function onSubmit(values: MemberFormValues) {
    if (mode === 'invite') {
      const payload: InviteMemberPayload = {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role,
        job_title: values.job_title,
        phone: values.phone,
        department: values.department || null,
      };
      invite.mutate(payload, {
        onSuccess: (data) => setCreatedMember(data),
      });
    } else {
      const payload: UpdateMemberPayload = {
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role,
        job_title: values.job_title,
        phone: values.phone,
        department: values.department || null,
      };
      update.mutate(payload, { onSuccess: onClose });
    }
  }

  const isPending = invite.isPending || update.isPending;

  // ── Success screen after invite ──────────────────────────────────────────
  if (createdMember) {
    return (
      <div className="p-6 text-center space-y-4">
        <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="font-semibold text-slate-800">Member invited!</h3>
        <p className="text-sm text-slate-600">
          Share this temporary password with <strong>{createdMember.email}</strong>. They should change it on first login.
        </p>
        <div className="bg-slate-100 rounded-xl px-4 py-3 font-mono text-lg tracking-widest text-slate-800 select-all">
          {createdMember.temp_password}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <h3 className="font-semibold text-slate-800">
        {mode === 'invite' ? 'Invite team member' : 'Edit member'}
      </h3>

      {mode === 'invite' && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
          <input
            {...register('email', { required: 'Required' })}
            type="email"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">First name *</label>
          <input
            {...register('first_name', { required: 'Required' })}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Last name *</label>
          <input
            {...register('last_name', { required: 'Required' })}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Role *</label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Job title</label>
          <input
            {...register('job_title')}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
          <input
            {...register('phone')}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        />
      </div>

      {(invite.isError || update.isError) && (
        <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : mode === 'invite' ? 'Send invite' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

// ── Dialog wrapper ────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const { user } = useAuth();
  const isAdmin = hasMinRole(user?.role, 'org_admin');

  const { data: members = [], isLoading } = useTeamMembers();
  const toggleActive = useToggleMemberActive();

  const [modal, setModal] = useState<
    | { type: 'invite' }
    | { type: 'edit'; member: TeamMember }
    | null
  >(null);

  const activeCount = members.filter((m) => m.is_active).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Team</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeCount} active member{activeCount !== 1 ? 's' : ''}
            {members.length > activeCount && ` · ${members.length - activeCount} inactive`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModal({ type: 'invite' })}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700"
          >
            <UserPlusIcon className="w-4 h-4" />
            Invite member
          </button>
        )}
      </div>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No team members yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs">Member</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs">Role</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs">Department</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs">Status</th>
                {isAdmin && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map((m) => (
                <tr key={m.id} className={cn('hover:bg-slate-50/50 transition-colors', !m.is_active && 'opacity-60')}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar member={m} />
                      <div>
                        <p className="font-medium text-slate-800">{m.full_name}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                        {m.job_title && <p className="text-xs text-slate-400">{m.job_title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {m.department_name ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    {m.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <CheckCircleIcon className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <XCircleIcon className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setModal({ type: 'edit', member: m })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        {m.id !== user?.id && (
                          <button
                            onClick={() => toggleActive.mutate(m.id)}
                            disabled={toggleActive.isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            title={m.is_active ? 'Deactivate' : 'Reactivate'}
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          {modal.type === 'invite' ? (
            <MemberModal mode="invite" onClose={() => setModal(null)} />
          ) : (
            <MemberModal mode="edit" member={modal.member} onClose={() => setModal(null)} />
          )}
        </Modal>
      )}
    </div>
  );
}
