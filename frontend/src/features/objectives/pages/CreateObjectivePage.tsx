import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { useCreateObjective } from '../hooks/useObjectives';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import type {
  ObjectiveScope,
  ObjectiveCategory,
  ObjectiveDirection,
  ObjectiveFrequency,
  LinkedMetric,
} from '../types/objective.types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: z.string().optional(),
    scope: z.enum(['organizational', 'individual']),
    category: z.enum(['lagging', 'leading']),
    unit: z.string().min(1, 'Unit is required').max(50),
    direction: z.enum(['increase', 'decrease', 'maintain']),
    linked_metric: z.enum([
      'manual',
      'near_miss_count',
      'total_incident_count',
      'injury_count',
      'critical_incident_count',
      'open_incident_count',
      'overdue_ca_count',
      'ca_closure_rate',
      'open_investigation_count',
    ]),
    measurement_frequency: z.enum(['monthly', 'quarterly', 'bi_annually']),
    baseline_value: z.coerce.number({ invalid_type_error: 'Baseline is required' }),
    target_value: z.coerce.number({ invalid_type_error: 'Target is required' }),
    start_date: z.string().min(1, 'Start date is required'),
    target_date: z.string().min(1, 'Target date is required'),
    owner: z.string().optional(),
    weight: z.coerce.number().min(1).optional(),
  })
  .refine((d) => new Date(d.target_date) > new Date(d.start_date), {
    message: 'Target date must be after start date',
    path: ['target_date'],
  });

type FormValues = z.infer<typeof schema>;

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-50 border border-primary-100 shrink-0 mt-0.5">
          <span className="text-xs font-bold text-primary-700">{step}</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

function RadioGroup<T extends string>({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; description?: string }[];
  error?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={[
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all',
              value === opt.value
                ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-300'
                : 'border-stone-200 bg-white text-slate-600 hover:border-stone-300 hover:bg-stone-50',
            ].join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateObjectivePage() {
  const navigate = useNavigate();
  const createObjective = useCreateObjective();
  const { data: users = [] } = useOrgUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scope: 'organizational',
      category: 'lagging',
      direction: 'decrease',
      linked_metric: 'manual',
      measurement_frequency: 'monthly',
      weight: 1,
    },
  });

  const scope = watch('scope') as ObjectiveScope;
  const direction = watch('direction') as ObjectiveDirection;
  const linked_metric = watch('linked_metric') as LinkedMetric;
  const measurement_frequency = watch('measurement_frequency') as ObjectiveFrequency;
  const category = watch('category') as ObjectiveCategory;

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await createObjective.mutateAsync({
        title: data.title,
        description: data.description || '',
        scope: data.scope,
        category: data.category,
        unit: data.unit,
        direction: data.direction,
        linked_metric: data.linked_metric,
        measurement_frequency: data.measurement_frequency,
        baseline_value: data.baseline_value,
        target_value: data.target_value,
        start_date: data.start_date,
        target_date: data.target_date,
        owner: data.owner || null,
        weight: data.weight ?? 1,
      });
      navigate(`/objectives/${result.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[860px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/objectives"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white hover:border hover:border-slate-200 transition-all"
          >
            <ArrowLeftIcon className="w-[18px] h-[18px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">New Objective</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Define a safety objective and its measurement criteria.
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Step 1: Basics */}
          <SectionCard step={1} title="Basics" description="What is this objective about?">
            <div className="space-y-4">
              <Input
                id="title"
                label="Objective Title"
                placeholder="e.g. Reduce near-miss incidents by 20%"
                required
                error={errors.title?.message}
                {...register('title')}
              />
              <Textarea
                id="description"
                label="Description"
                placeholder="Additional context or rationale for this objective…"
                rows={3}
                {...register('description')}
              />
              <RadioGroup<ObjectiveScope>
                label="Scope"
                name="scope"
                value={scope}
                onChange={(v) => setValue('scope', v)}
                options={[
                  { value: 'organizational', label: 'Organizational' },
                  { value: 'individual', label: 'Individual' },
                ]}
                error={errors.scope?.message}
              />
              <RadioGroup<ObjectiveCategory>
                label="Category"
                name="category"
                value={category}
                onChange={(v) => setValue('category', v)}
                options={[
                  { value: 'lagging', label: 'Lagging' },
                  { value: 'leading', label: 'Leading' },
                ]}
                error={errors.category?.message}
              />
            </div>
          </SectionCard>

          {/* Step 2: Metric */}
          <SectionCard step={2} title="Metric" description="How will this objective be measured?">
            <div className="space-y-4">
              <Input
                id="unit"
                label="Unit"
                placeholder="e.g. count, %, rate, days"
                required
                error={errors.unit?.message}
                {...register('unit')}
              />
              <RadioGroup<ObjectiveDirection>
                label="Direction"
                name="direction"
                value={direction}
                onChange={(v) => setValue('direction', v)}
                options={[
                  { value: 'increase', label: 'Increase' },
                  { value: 'decrease', label: 'Decrease' },
                  { value: 'maintain', label: 'Maintain' },
                ]}
                error={errors.direction?.message}
              />
              <div>
                <label htmlFor="linked_metric" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Linked Metric
                </label>
                <select
                  id="linked_metric"
                  {...register('linked_metric')}
                  className="w-full h-9 pl-3 pr-9 text-sm rounded-lg border border-stone-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '14px',
                  }}
                >
                  <option value="manual">Manual Entry</option>
                  <option value="near_miss_count">Near Miss Count</option>
                  <option value="total_incident_count">Total Incident Count</option>
                  <option value="injury_count">Injury Count</option>
                  <option value="critical_incident_count">Critical Incident Count</option>
                  <option value="open_incident_count">Open Incident Count</option>
                  <option value="overdue_ca_count">Overdue Corrective Actions</option>
                  <option value="ca_closure_rate">CA On-Time Closure Rate (%)</option>
                  <option value="open_investigation_count">Open Investigation Count</option>
                </select>
                {errors.linked_metric && (
                  <p className="mt-1 text-xs text-red-600">{errors.linked_metric.message}</p>
                )}
              </div>
              <RadioGroup<ObjectiveFrequency>
                label="Measurement Frequency"
                name="measurement_frequency"
                value={measurement_frequency}
                onChange={(v) => setValue('measurement_frequency', v)}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'bi_annually', label: 'Bi-Annually' },
                ]}
                error={errors.measurement_frequency?.message}
              />
            </div>
          </SectionCard>

          {/* Step 3: Targets */}
          <SectionCard step={3} title="Targets" description="Set the baseline, target and timeline.">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="baseline_value"
                  type="number"
                  label="Baseline Value"
                  placeholder="Starting point"
                  required
                  error={errors.baseline_value?.message}
                  {...register('baseline_value')}
                />
                <Input
                  id="target_value"
                  type="number"
                  label="Target Value"
                  placeholder="Goal to reach"
                  required
                  error={errors.target_value?.message}
                  {...register('target_value')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="start_date"
                  type="date"
                  label="Start Date"
                  required
                  error={errors.start_date?.message}
                  {...register('start_date')}
                />
                <Input
                  id="target_date"
                  type="date"
                  label="Target Date"
                  required
                  error={errors.target_date?.message}
                  {...register('target_date')}
                />
              </div>
            </div>
          </SectionCard>

          {/* Step 4: Ownership */}
          <SectionCard
            step={4}
            title="Ownership"
            description="Assign an owner and set the relative weight."
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="owner" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Owner
                </label>
                <select
                  id="owner"
                  {...register('owner')}
                  className="w-full h-9 pl-3 pr-9 text-sm rounded-lg border border-stone-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '14px',
                  }}
                >
                  <option value="">No owner assigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email}
                    </option>
                  ))}
                </select>
              </div>

              {scope === 'individual' && (
                <Input
                  id="weight"
                  type="number"
                  label="Weight"
                  hint="Relative weight for league table scoring (default: 1)"
                  error={errors.weight?.message}
                  {...register('weight')}
                />
              )}
            </div>
          </SectionCard>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Link to="/objectives">
              <Button type="button" variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              size="md"
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              Create Objective
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
