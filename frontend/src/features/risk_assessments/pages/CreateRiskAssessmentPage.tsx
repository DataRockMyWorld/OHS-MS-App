import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import { useDepartments } from '@/features/accounts/hooks/useTeam';
import { useCreateAssessment } from '../hooks/useRA';
import type { CreateAssessmentPayload } from '../types/ra.types';

interface FormValues {
  title: string;
  description: string;
  work_area: string;
  department: string;
  assessment_date: string;
  next_review_date: string;
  assessed_by: string;
  reviewed_by: string;
}

export default function CreateRiskAssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orgUsers = [] } = useOrgUsers();
  const { data: departments = [] } = useDepartments();
  const create = useCreateAssessment();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      work_area: '',
      department: '',
      assessment_date: new Date().toISOString().slice(0, 10),
      next_review_date: '',
      assessed_by: user?.id ?? '',
      reviewed_by: '',
    },
  });

  function onSubmit(values: FormValues) {
    const payload: CreateAssessmentPayload = {
      title: values.title,
      description: values.description,
      work_area: values.work_area,
      department: values.department || null,
      assessment_date: values.assessment_date,
      next_review_date: values.next_review_date || null,
      assessed_by: values.assessed_by,
      reviewed_by: values.reviewed_by || null,
    };
    create.mutate(payload, {
      onSuccess: (data) => navigate(`/risk-assessments/${data.id}`),
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">New Risk Assessment</h2>
        <p className="text-sm text-slate-500 mt-0.5">Hazard Identification & Risk Assessment (HIRA)</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
          <input
            {...register('title', { required: 'Required' })}
            placeholder="e.g. Warehouse Forklift Operations"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Scope and purpose of this assessment…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Work area / location</label>
            <input
              {...register('work_area')}
              placeholder="e.g. Warehouse B, Level 2"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Assessment date *</label>
            <input
              type="date"
              {...register('assessment_date', { required: 'Required' })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Next review date</label>
            <input
              type="date"
              {...register('next_review_date')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Assessed by *</label>
            <Controller
              name="assessed_by"
              control={control}
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">— Select —</option>
                  {orgUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              )}
            />
            {errors.assessed_by && <p className="text-xs text-red-500 mt-1">{errors.assessed_by.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reviewed by</label>
            <Controller
              name="reviewed_by"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">— None —</option>
                  {orgUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              )}
            />
          </div>
        </div>

        {create.isError && (
          <p className="text-xs text-red-500">Failed to create assessment. Please try again.</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/risk-assessments')}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creating…' : 'Create & add hazards'}
          </button>
        </div>
      </form>
    </div>
  );
}
