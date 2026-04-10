import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { useCreateRiskOpportunity } from '../hooks/useRisksOpportunities';
import { useContextIssues } from '../hooks/useContextIssues';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import type { ROType, SeverityLevel } from '../types/context.types';

const schema = z.object({
  type: z.enum(['risk', 'opportunity']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(1, 'Description is required'),
  severity_level: z.enum(['high', 'medium', 'low']),
  controls: z.string().optional(),
  potential_benefit: z.string().optional(),
  owner: z.string().optional(),
  source_issue: z.string().optional(),
  status: z.enum(['open', 'being_addressed', 'closed']).optional(),
});

type FormValues = z.infer<typeof schema>;

function RadioGroup<T extends string>({
  label, name, value, onChange, options, error,
}: {
  label: string; name: string; value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[]; error?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt.value} className={[
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all',
            value === opt.value
              ? 'border-primary-400 bg-primary-50 text-primary-700 ring-1 ring-primary-300'
              : 'border-stone-200 bg-white text-slate-600 hover:border-stone-300 hover:bg-stone-50',
          ].join(' ')}>
            <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="sr-only" />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SectionCard({ step, title, description, children }: {
  step: number; title: string; description?: string; children: React.ReactNode;
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

const SELECT_CLS = "w-full h-9 pl-3 pr-9 text-sm rounded-lg border border-stone-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors";
const SELECT_ARROW = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '14px',
};

export default function CreateRiskOpportunityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillSourceIssue = searchParams.get('source_issue') ?? '';

  const createRO = useCreateRiskOpportunity();
  const { data: issues = [] } = useContextIssues();
  const { data: users = [] } = useOrgUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'risk',
      severity_level: 'medium',
      status: 'open',
      source_issue: prefillSourceIssue,
    },
  });

  const roType = watch('type') as ROType;
  const severity = watch('severity_level') as SeverityLevel;

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await createRO.mutateAsync({
        type: data.type,
        title: data.title,
        description: data.description,
        severity_level: data.severity_level,
        controls: data.controls || '',
        potential_benefit: data.potential_benefit || '',
        owner: data.owner || null,
        source_issue: data.source_issue || null,
        status: data.status ?? 'open',
      });
      navigate(`/context/risks-and-opportunities/${result.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[860px] mx-auto px-8 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/context" className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white hover:border hover:border-slate-200 transition-all">
            <ArrowLeftIcon className="w-[18px] h-[18px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">New Risk or Opportunity</h1>
            <p className="mt-0.5 text-sm text-slate-500">Record a risk to control or an opportunity to pursue</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Step 1: Classification */}
          <SectionCard step={1} title="Classification" description="Is this a risk to address or an opportunity to pursue?">
            <div className="space-y-4">
              <RadioGroup<ROType>
                label="Type"
                name="type"
                value={roType}
                onChange={(v) => setValue('type', v)}
                options={[
                  { value: 'risk', label: 'Risk' },
                  { value: 'opportunity', label: 'Opportunity' },
                ]}
                error={errors.type?.message}
              />
              <Input id="title" label="Title" placeholder={roType === 'risk' ? 'e.g. Inadequate emergency response procedures' : 'e.g. Partner with safety training provider'} required error={errors.title?.message} {...register('title')} />
              <Textarea id="description" label="Description" placeholder="Describe this risk or opportunity in detail…" rows={3} error={errors.description?.message} {...register('description')} />
            </div>
          </SectionCard>

          {/* Step 2: Assessment */}
          <SectionCard step={2} title="Assessment" description="How significant is this and what actions are planned?">
            <div className="space-y-4">
              <RadioGroup<SeverityLevel>
                label="Severity Level"
                name="severity_level"
                value={severity}
                onChange={(v) => setValue('severity_level', v)}
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                error={errors.severity_level?.message}
              />
              {roType === 'risk' ? (
                <Textarea id="controls" label="Controls" placeholder="What controls or mitigations are in place or planned?" rows={3} {...register('controls')} />
              ) : (
                <Textarea id="potential_benefit" label="Potential Benefit" placeholder="What safety improvements or benefits could this bring?" rows={3} {...register('potential_benefit')} />
              )}
              <div>
                <label htmlFor="owner" className="block text-xs font-medium text-slate-700 mb-1.5">Owner</label>
                <select id="owner" {...register('owner')} className={SELECT_CLS} style={SELECT_ARROW}>
                  <option value="">No owner assigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Step 3: Source */}
          <SectionCard step={3} title="Source (Optional)" description="Link this to a context issue from Clause 4.1.">
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Linking to an issue creates traceability from your context analysis to your risk register.
              </p>
              <div>
                <label htmlFor="source_issue" className="block text-xs font-medium text-slate-700 mb-1.5">Source Issue</label>
                <select id="source_issue" {...register('source_issue')} className={SELECT_CLS} style={SELECT_ARROW}>
                  <option value="">No source issue</option>
                  {issues.map((issue) => (
                    <option key={issue.id} value={issue.id}>{issue.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
                <select id="status" {...register('status')} className={SELECT_CLS} style={SELECT_ARROW}>
                  <option value="open">Open</option>
                  <option value="being_addressed">Being Addressed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Link to="/context">
              <Button type="button" variant="ghost" size="md">Cancel</Button>
            </Link>
            <Button type="button" size="md" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              Create {roType === 'risk' ? 'Risk' : 'Opportunity'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
