import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateCA } from '../hooks/useCorrectiveActionMutations';
import type { CAType, CAPriority, CASource } from '../types/ca.types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  action_type: z.string().min(1, 'Please select an action type') as z.ZodType<CAType>,
  priority: z.string().min(1, 'Please select a priority') as z.ZodType<CAPriority>,
  source_type: z.string().min(1, 'Please select a source') as z.ZodType<CASource>,
  description: z.string().optional(),
  planned_action: z.string().optional(),
  target_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OpenCAPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const investigationId = searchParams.get('investigation');
  const incidentId = searchParams.get('incident');
  const { user } = useAuth();

  const createCA = useCreateCA();

  // Pre-set source type based on query param
  const defaultSourceType: CASource = investigationId
    ? 'investigation'
    : incidentId
    ? 'incident'
    : 'other';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      action_type: 'corrective',
      priority: 'medium',
      source_type: defaultSourceType,
    },
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      title: values.title,
      action_type: values.action_type,
      priority: values.priority,
      source_type: values.source_type,
      description: values.description || undefined,
      planned_action: values.planned_action || undefined,
      target_date: values.target_date || undefined,
      source_investigation: investigationId ?? undefined,
      source_incident: incidentId ?? undefined,
      assigned_to: user!.id,
    };

    const created = await createCA.mutateAsync(payload);
    navigate(`/corrective-actions/${created.id}`);
  }

  const backHref = investigationId
    ? `/investigations/${investigationId}`
    : incidentId
    ? `/incidents/${incidentId}`
    : '/corrective-actions';

  const backLabel = investigationId
    ? 'Investigation'
    : incidentId
    ? 'Incident'
    : 'Corrective Actions';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[860px] mx-auto px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            to={backHref}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            {backLabel}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 text-xs">New Action</span>
        </div>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-700 shrink-0">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Raise Corrective Action</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Document the action required. Effectiveness will be reviewed after implementation.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Section 1: Classification */}
          <SectionCard
            step={1}
            title="Classification"
            description="Categorise this action by type, priority, and source."
          >
            <div className="space-y-4">
              <Input
                id="title"
                label="Action Title"
                placeholder="e.g. Install machine guarding on conveyor belt"
                required
                error={errors.title?.message}
                {...register('title')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="action_type"
                  label="Action Type"
                  required
                  error={errors.action_type?.message}
                  {...register('action_type')}
                >
                  <option value="corrective">Corrective</option>
                  <option value="preventive">Preventive</option>
                  <option value="improvement">Improvement Opportunity</option>
                </Select>

                <Select
                  id="priority"
                  label="Priority"
                  required
                  error={errors.priority?.message}
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>

              <Select
                id="source_type"
                label="Source"
                required
                hint="What triggered this corrective action?"
                error={errors.source_type?.message}
                {...register('source_type')}
              >
                <option value="investigation">Investigation</option>
                <option value="incident">Incident</option>
                <option value="audit">Audit</option>
                <option value="risk_assessment">Risk Assessment</option>
                <option value="management_review">Management Review</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </SectionCard>

          {/* Section 2: Description */}
          <SectionCard
            step={2}
            title="Description"
            description="Describe the nonconformity or problem this action addresses."
          >
            <Textarea
              id="description"
              label="Problem Description"
              placeholder="Describe the issue, nonconformity, or opportunity that this action addresses…"
              rows={4}
              {...register('description')}
            />
          </SectionCard>

          {/* Section 3: Planned Action */}
          <SectionCard
            step={3}
            title="Planned Action"
            description="Describe what will be done to address the problem."
          >
            <Textarea
              id="planned_action"
              label="Planned Action"
              placeholder="Describe the specific steps that will be taken to resolve this issue…"
              rows={4}
              hint="Be specific — this becomes the implementation checklist for the assignee."
              {...register('planned_action')}
            />
          </SectionCard>

          {/* Section 4: Target Date */}
          <SectionCard
            step={4}
            title="Target Completion"
            description="Set a deadline for implementation."
          >
            <Input
              id="target_date"
              label="Target Completion Date"
              type="date"
              hint="ISO 45001 requires corrective actions be completed in a timely manner."
              {...register('target_date')}
            />
          </SectionCard>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 pb-4">
            <Link to={backHref}>
              <Button variant="ghost" type="button" size="md">Cancel</Button>
            </Link>
            <Button
              type="submit"
              size="md"
              loading={isSubmitting || createCA.isPending}
            >
              Raise Corrective Action
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
