import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { useCreateIssue } from '../hooks/useContextIssues';
import { useInterestedParties } from '../hooks/useInterestedParties';
import { useOrgUsers } from '@/features/accounts/hooks/useOrgUsers';
import type { IssueType, AnalysisTag, IssueClassification } from '../types/context.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SWOT_AUTO: Record<string, IssueClassification> = {
  swot_strength: 'opportunity',
  swot_weakness: 'risk',
  swot_opportunity: 'opportunity',
  swot_threat: 'risk',
};

const SWOT_EXPLAINER: Record<string, string> = {
  swot_strength: 'Strengths are automatically classified as Opportunities.',
  swot_weakness: 'Weaknesses are automatically classified as Risks.',
  swot_opportunity: 'SWOT Opportunities are automatically classified as Opportunities.',
  swot_threat: 'Threats are automatically classified as Risks.',
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['internal', 'external']),
  analysis_tag: z.enum([
    'swot_strength', 'swot_weakness', 'swot_opportunity', 'swot_threat',
    'pestle_political', 'pestle_economic', 'pestle_social', 'pestle_technological',
    'pestle_legal', 'pestle_environmental', 'other',
  ]),
  classification: z.enum(['risk', 'opportunity']),
  identified_date: z.string().min(1, 'Date is required'),
  identified_by: z.string().optional(),
  interested_party: z.string().optional(),
  status: z.enum(['open', 'monitored', 'addressed', 'closed']).optional(),
});

type FormValues = z.infer<typeof schema>;

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
  options: { value: T; label: string }[];
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateIssuePage() {
  const navigate = useNavigate();
  const createIssue = useCreateIssue();
  const { data: parties = [] } = useInterestedParties();
  const { data: users = [] } = useOrgUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'internal',
      analysis_tag: 'other',
      classification: 'risk',
      status: 'open',
      identified_date: new Date().toISOString().split('T')[0],
    },
  });

  const analysisTag = watch('analysis_tag') as AnalysisTag;
  const category = watch('category') as IssueType;
  const classification = watch('classification') as IssueClassification;

  const isSwot = analysisTag.startsWith('swot_');
  const autoClassification = isSwot ? SWOT_AUTO[analysisTag] : null;
  const explainer = isSwot ? SWOT_EXPLAINER[analysisTag] : null;

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await createIssue.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        analysis_tag: data.analysis_tag,
        classification: autoClassification ?? data.classification,
        interested_party: data.interested_party || null,
        status: data.status ?? 'open',
        identified_date: data.identified_date,
        identified_by: data.identified_by || null,
      });
      navigate(`/context/issues/${result.id}`);
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
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">New Context Issue</h1>
            <p className="mt-0.5 text-sm text-slate-500">Identify an internal or external issue per ISO 45001 Clause 4.1</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Step 1: Basics */}
          <SectionCard step={1} title="Basics" description="What is this issue about?">
            <div className="space-y-4">
              <Input id="title" label="Issue Title" placeholder="e.g. Inadequate contractor safety induction" required error={errors.title?.message} {...register('title')} />
              <Textarea id="description" label="Description" placeholder="Describe the issue in detail…" rows={3} error={errors.description?.message} {...register('description')} />
              <RadioGroup<IssueType>
                label="Category"
                name="category"
                value={category}
                onChange={(v) => setValue('category', v)}
                options={[
                  { value: 'internal', label: 'Internal' },
                  { value: 'external', label: 'External' },
                ]}
                error={errors.category?.message}
              />
            </div>
          </SectionCard>

          {/* Step 2: Analysis */}
          <SectionCard step={2} title="Analysis" description="Classify using SWOT or PESTLE framework.">
            <div className="space-y-4">
              <div>
                <label htmlFor="analysis_tag" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Analysis Tag
                </label>
                <select id="analysis_tag" {...register('analysis_tag')} className={SELECT_CLS} style={SELECT_ARROW}>
                  <optgroup label="SWOT">
                    <option value="swot_strength">SWOT — Strength</option>
                    <option value="swot_weakness">SWOT — Weakness</option>
                    <option value="swot_opportunity">SWOT — Opportunity</option>
                    <option value="swot_threat">SWOT — Threat</option>
                  </optgroup>
                  <optgroup label="PESTLE">
                    <option value="pestle_political">PESTLE — Political</option>
                    <option value="pestle_economic">PESTLE — Economic</option>
                    <option value="pestle_social">PESTLE — Social</option>
                    <option value="pestle_technological">PESTLE — Technological</option>
                    <option value="pestle_legal">PESTLE — Legal</option>
                    <option value="pestle_environmental">PESTLE — Environmental</option>
                  </optgroup>
                  <option value="other">Other</option>
                </select>
              </div>

              {isSwot && autoClassification && explainer ? (
                <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-primary-700">
                      Auto-classified as:{' '}
                      <span className="capitalize">{autoClassification}</span>
                    </p>
                    <p className="text-xs text-primary-600 mt-0.5">{explainer}</p>
                  </div>
                </div>
              ) : (
                <RadioGroup<IssueClassification>
                  label="Classification"
                  name="classification"
                  value={classification}
                  onChange={(v) => setValue('classification', v)}
                  options={[
                    { value: 'risk', label: 'Risk' },
                    { value: 'opportunity', label: 'Opportunity' },
                  ]}
                  error={errors.classification?.message}
                />
              )}
            </div>
          </SectionCard>

          {/* Step 3: Context */}
          <SectionCard step={3} title="Context" description="Who identified this and when?">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input id="identified_date" type="date" label="Identified Date" required error={errors.identified_date?.message} {...register('identified_date')} />
                <div>
                  <label htmlFor="identified_by" className="block text-xs font-medium text-slate-700 mb-1.5">Identified By</label>
                  <select id="identified_by" {...register('identified_by')} className={SELECT_CLS} style={SELECT_ARROW}>
                    <option value="">Select person…</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="interested_party" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Related Interested Party <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select id="interested_party" {...register('interested_party')} className={SELECT_CLS} style={SELECT_ARROW}>
                  <option value="">None</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
                <select id="status" {...register('status')} className={SELECT_CLS} style={SELECT_ARROW}>
                  <option value="open">Open</option>
                  <option value="monitored">Monitored</option>
                  <option value="addressed">Addressed</option>
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
              Create Issue
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
