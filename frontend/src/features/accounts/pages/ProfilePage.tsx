import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartments } from '../hooks/useTeam';
import { profileApi } from '../api/profileApi';
import { USER_ROLE_LABELS } from '../types/user.types';
import type { UserRole } from '../types/user.types';

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  job_title: string;
  phone: string;
  department: string;
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {isSuccess
        ? <CheckCircleIcon className="w-4 h-4 shrink-0" />
        : <ExclamationCircleIcon className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: departments = [] } = useDepartments();

  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      job_title: user?.job_title ?? '',
      phone: (user as unknown as { phone?: string })?.phone ?? '',
      department: '',
    },
  });

  const pwForm = useForm<PasswordFormValues>({
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  async function onProfileSubmit(values: ProfileFormValues) {
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      await profileApi.updateMe({
        first_name: values.first_name,
        last_name: values.last_name,
        job_title: values.job_title,
        phone: values.phone,
        department: values.department || null,
      });
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch {
      setProfileStatus({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    if (values.new_password !== values.confirm_password) {
      setPwStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    setPwSaving(true);
    setPwStatus(null);
    try {
      await profileApi.changePassword(values.current_password, values.new_password);
      setPwStatus({ type: 'success', message: 'Password changed successfully.' });
      pwForm.reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { current_password?: string[]; new_password?: string[]; detail?: string } } };
      const msg =
        error.response?.data?.current_password?.[0] ||
        error.response?.data?.new_password?.[0] ||
        error.response?.data?.detail ||
        'Failed to change password.';
      setPwStatus({ type: 'error', message: msg });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">My Profile</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your personal details and password.</p>
      </div>

      {/* Avatar + identity */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800">{user?.full_name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {USER_ROLE_LABELS[user?.role as UserRole] ?? user?.role}
          </span>
          {user?.organization_name && (
            <span className="ml-2 inline-block mt-1 text-xs text-slate-400">{user.organization_name}</span>
          )}
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Personal information</h3>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">First name</label>
              <input
                {...profileForm.register('first_name', { required: true })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last name</label>
              <input
                {...profileForm.register('last_name', { required: true })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Job title</label>
            <input
              {...profileForm.register('job_title')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input
                {...profileForm.register('phone')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <select
                {...profileForm.register('department')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">— None —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {profileStatus && <Alert type={profileStatus.type} message={profileStatus.message} />}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {profileSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Change password</h3>
        <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Current password</label>
            <input
              type="password"
              {...pwForm.register('current_password', { required: true })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">New password</label>
              <input
                type="password"
                {...pwForm.register('new_password', { required: true, minLength: 8 })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Confirm new password</label>
              <input
                type="password"
                {...pwForm.register('confirm_password', { required: true })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {pwStatus && <Alert type={pwStatus.type} message={pwStatus.message} />}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwSaving}
              className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
