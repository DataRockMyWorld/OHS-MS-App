import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateInvestigation } from '../hooks/useInvestigationMutations';
import type { RCAMethod } from '../types/investigation.types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  rca_method: z.string().optional() as z.ZodType<RCAMethod | ''>,
  scope: z.string().optional(),
  target_completion_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OpenInvestigationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('incident');
  const { user } = useAuth();

  const createInvestigation = useCreateInvestigation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rca_method: '',
    },
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      title: values.title,
      incident: incidentId ?? undefined,
      rca_method: (values.rca_method as RCAMethod) || undefined,
      scope: values.scope || undefined,
      target_completion_date: values.target_completion_date || undefined,
      lead_investigator: user!.id,
    };

    const created = await createInvestigation.mutateAsync(payload);
    navigate(`/investigations/${created.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[860px] mx-auto px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            to="/investigations"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Investigations
          </Link>
          {incidentId && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400 text-xs">From incident</span>
            </>
          )}
        </div>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-700 shrink-0">
              <MagnifyingGlassIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Open Investigation</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Start a formal root cause investigation. You can add details after creation.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Section 1: Investigation Details */}
          <SectionCard
            step={1}
            title="Investigation Details"
            description="Provide a title and select the investigation method."
          >
            <div className="space-y-4">
              <Input
                id="title"
                label="Investigation Title"
                placeholder="e.g. Root Cause Analysis — Forklift Near-Miss"
                required
                error={errors.title?.message}
                {...register('title')}
              />

              <Select
                id="rca_method"
                label="RCA Method"
                hint="You can change this later once the analysis begins."
                {...register('rca_method')}
              >
                <option value="">Select a method (optional)</option>
                <option value="five_whys">5 Whys</option>
                <option value="fishbone">Fishbone (Ishikawa)</option>
                <option value="fault_tree">Fault Tree Analysis</option>
                <option value="bow_tie">Bow Tie Analysis</option>
                <option value="icam">ICAM</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </SectionCard>

          {/* Section 2: Scope */}
          <SectionCard
            step={2}
            title="Scope"
            description="Define the boundaries and focus of this investigation."
          >
            <Textarea
              id="scope"
              label="Scope of Investigation"
              placeholder="Describe what this investigation will cover — which systems, processes, or areas are in scope…"
              rows={4}
              hint="This helps the team understand the investigation boundaries."
              {...register('scope')}
            />
          </SectionCard>

          {/* Section 3: Timeline */}
          <SectionCard
            step={3}
            title="Target Completion"
            description="Set an expected completion date for the investigation."
          >
            <Input
              id="target_completion_date"
              label="Target Completion Date"
              type="date"
              hint="ISO 45001 requires investigations be completed in a timely manner."
              {...register('target_completion_date')}
            />
          </SectionCard>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 pb-4">
            <Link to="/investigations">
              <Button variant="ghost" type="button" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="md"
              loading={isSubmitting || createInvestigation.isPending}
            >
              Open Investigation
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
