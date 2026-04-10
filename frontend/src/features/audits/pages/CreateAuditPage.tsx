import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import { useDepartments } from '@/features/accounts/hooks/useTeam';
import { useCreateAudit } from '../hooks/useAudits';
import type { CreateAuditPayload, AuditType } from '../types/audit.types';
import { AUDIT_TYPE_LABELS } from '../types/audit.types';

interface FormValues {
  title: string;
  audit_type: AuditType;
  scope: string;
  objectives: string;
  criteria: string;
  planned_date: string;
  department: string;
  location: string;
  lead_auditor: string;
  auditee: string;
}

export default function CreateAuditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orgUsers = [] } = useOrgUsers();
  const { data: departments = [] } = useDepartments();
  const create = useCreateAudit();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      audit_type: 'internal',
      scope: '',
      objectives: '',
      criteria: '',
      planned_date: new Date().toISOString().slice(0, 10),
      department: '',
      location: '',
      lead_auditor: user?.id ?? '',
      auditee: '',
    },
  });

  function onSubmit(values: FormValues) {
    const payload: CreateAuditPayload = {
      title: values.title,
      audit_type: values.audit_type,
      scope: values.scope,
      objectives: values.objectives,
      criteria: values.criteria,
      planned_date: values.planned_date,
      department: values.department || null,
      location: values.location,
      lead_auditor: values.lead_auditor || null,
      auditee: values.auditee,
    };
    create.mutate(payload, {
      onSuccess: (data) => navigate(`/audits/${data.id}`),
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Schedule Audit</h2>
        <p className="text-sm text-slate-500 mt-0.5">ISO 45001 Clause 9.2 — Internal audit programme</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
          <input
            {...register('title', { required: 'Required' })}
            placeholder="e.g. Q2 Internal Health & Safety Audit"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Audit type *</label>
            <select
              {...register('audit_type', { required: true })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(AUDIT_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Planned date *</label>
            <input
              type="date"
              {...register('planned_date', { required: 'Required' })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Scope</label>
          <textarea
            {...register('scope')}
            rows={2}
            placeholder="Areas, processes, or clauses in scope…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Objectives</label>
          <textarea
            {...register('objectives')}
            rows={2}
            placeholder="Audit objectives…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Criteria <span className="font-normal text-slate-400">(standards / clauses)</span>
          </label>
          <input
            {...register('criteria')}
            placeholder="e.g. ISO 45001:2018 Clauses 6, 8, 9"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
            <select
              {...register('department')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— None —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <input
              {...register('location')}
              placeholder="Building / site"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Lead auditor</label>
            <select
              {...register('lead_auditor')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Unassigned —</option>
              {orgUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Auditee</label>
            <input
              {...register('auditee')}
              placeholder="Person / team / area being audited"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {create.isError && (
          <p className="text-xs text-red-500">Failed to create audit. Please try again.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/audits')}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {create.isPending ? 'Scheduling…' : 'Schedule audit'}
          </button>
        </div>
      </form>
    </div>
  );
}
