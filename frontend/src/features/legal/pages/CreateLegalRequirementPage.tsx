import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import { useDepartments } from '@/features/accounts/hooks/useTeam';
import { useCreateLegalRequirement } from '../hooks/useLegal';
import type { CreateLegalRequirementPayload, RequirementType, Jurisdiction, ComplianceStatus } from '../types/legal.types';
import {
  REQUIREMENT_TYPE_LABELS,
  JURISDICTION_LABELS,
  COMPLIANCE_STATUS_LABELS,
} from '../types/legal.types';

interface FormValues {
  title: string;
  requirement_type: RequirementType;
  jurisdiction: Jurisdiction;
  description: string;
  applicable_clauses: string;
  source_url: string;
  department: string;
  responsible_person: string;
  compliance_status: ComplianceStatus;
  compliance_notes: string;
  effective_date: string;
  review_date: string;
}

export default function CreateLegalRequirementPage() {
  const navigate = useNavigate();
  const { data: orgUsers = [] } = useOrgUsers();
  const { data: departments = [] } = useDepartments();
  const create = useCreateLegalRequirement();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      requirement_type: 'legislation',
      jurisdiction: 'national',
      description: '',
      applicable_clauses: '',
      source_url: '',
      department: '',
      responsible_person: '',
      compliance_status: 'not_assessed',
      compliance_notes: '',
      effective_date: '',
      review_date: '',
    },
  });

  function onSubmit(values: FormValues) {
    const payload: CreateLegalRequirementPayload = {
      title: values.title,
      requirement_type: values.requirement_type,
      jurisdiction: values.jurisdiction,
      description: values.description,
      applicable_clauses: values.applicable_clauses,
      source_url: values.source_url,
      department: values.department || null,
      responsible_person: values.responsible_person || null,
      compliance_status: values.compliance_status,
      compliance_notes: values.compliance_notes,
      effective_date: values.effective_date || null,
      review_date: values.review_date || null,
    };
    create.mutate(payload, {
      onSuccess: (data) => navigate(`/legal/${data.id}`),
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Add Legal Requirement</h2>
        <p className="text-sm text-slate-500 mt-0.5">ISO 45001 Clause 6.1.3 — Legal & other requirements</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
          <input
            {...register('title', { required: 'Required' })}
            placeholder="e.g. Health and Safety at Work Act 2015"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
            <select
              {...register('requirement_type')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(REQUIREMENT_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Jurisdiction *</label>
            <select
              {...register('jurisdiction')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(JURISDICTION_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Summary of the requirement and how it applies to your organisation…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Applicable clauses / sections</label>
          <input
            {...register('applicable_clauses')}
            placeholder="e.g. Part 2, Section 36–38"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Source URL</label>
          <input
            {...register('source_url')}
            type="url"
            placeholder="Link to official document"
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
              <option value="">— All departments —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Responsible person</label>
            <select
              {...register('responsible_person')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Unassigned —</option>
              {orgUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Effective date</label>
            <input
              type="date"
              {...register('effective_date')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Next review date</label>
            <input
              type="date"
              {...register('review_date')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Initial compliance status</label>
          <select
            {...register('compliance_status')}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {Object.entries(COMPLIANCE_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Compliance notes</label>
          <textarea
            {...register('compliance_notes')}
            rows={2}
            placeholder="How the organisation meets this requirement…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {create.isError && (
          <p className="text-xs text-red-500">Failed to save. Please try again.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/legal')}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {create.isPending ? 'Saving…' : 'Add requirement'}
          </button>
        </div>
      </form>
    </div>
  );
}
