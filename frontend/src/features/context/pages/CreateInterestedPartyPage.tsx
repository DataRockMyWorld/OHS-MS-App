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
import { useCreateInterestedParty } from '../hooks/useInterestedParties';
import type { PartyCategory, PartyType, ReviewFrequency } from '../types/context.types';

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(255),
  category: z.enum(['internal', 'external']),
  party_type: z.enum(['worker', 'contractor', 'regulator', 'supplier', 'customer', 'community', 'investor', 'other']),
  needs_and_expectations: z.string().min(1, 'Needs and expectations are required'),
  is_compliance_obligation: z.boolean(),
  review_frequency: z.enum(['annually', 'semi_annually', 'quarterly']),
  last_reviewed_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const SELECT_CLS = "w-full h-9 pl-3 pr-9 text-sm rounded-lg border border-stone-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors";
const SELECT_ARROW = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '14px',
};

export default function CreateInterestedPartyPage() {
  const navigate = useNavigate();
  const createParty = useCreateInterestedParty();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'internal',
      party_type: 'other',
      is_compliance_obligation: false,
      review_frequency: 'annually',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await createParty.mutateAsync({
        name: data.name,
        category: data.category as PartyCategory,
        party_type: data.party_type as PartyType,
        needs_and_expectations: data.needs_and_expectations,
        is_compliance_obligation: data.is_compliance_obligation,
        review_frequency: data.review_frequency as ReviewFrequency,
        last_reviewed_date: data.last_reviewed_date || null,
      });
      navigate(`/context/interested-parties/${result.id}`);
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
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">New Interested Party</h1>
            <p className="mt-0.5 text-sm text-slate-500">Record a party and their needs per ISO 45001 Clause 4.2</p>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="space-y-4">
              <Input id="name" label="Name" placeholder="e.g. Employees, Health & Safety Regulator" required error={errors.name?.message} {...register('name')} />

              <div>
                <p className="block text-xs font-medium text-slate-700 mb-2">Category <span className="text-red-500">*</span></p>
                <div className="flex gap-3">
                  {(['internal', 'external'] as const).map((val) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={val} {...register('category')} className="w-4 h-4 text-primary-600 border-stone-300 focus:ring-primary-500" />
                      <span className="text-sm text-slate-700 capitalize">{val}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="party_type" className="block text-xs font-medium text-slate-700 mb-1.5">Party Type</label>
                <select id="party_type" {...register('party_type')} className={SELECT_CLS} style={SELECT_ARROW}>
                  <option value="worker">Worker</option>
                  <option value="contractor">Contractor</option>
                  <option value="regulator">Regulator</option>
                  <option value="supplier">Supplier</option>
                  <option value="customer">Customer</option>
                  <option value="community">Community</option>
                  <option value="investor">Investor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Textarea
                id="needs_and_expectations"
                label="Needs and Expectations"
                placeholder="What does this party need or expect from the OH&S management system?"
                rows={4}
                required
                error={errors.needs_and_expectations?.message}
                {...register('needs_and_expectations')}
              />

              <div className="flex items-center gap-3">
                <input
                  id="is_compliance_obligation"
                  type="checkbox"
                  {...register('is_compliance_obligation')}
                  className="w-4 h-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_compliance_obligation" className="text-sm font-medium text-slate-700 cursor-pointer">
                  This is a compliance obligation
                  <span className="block text-xs font-normal text-slate-400 mt-0.5">
                    Legal, regulatory, or contractual requirements that must be complied with.
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="review_frequency" className="block text-xs font-medium text-slate-700 mb-1.5">Review Frequency</label>
                  <select id="review_frequency" {...register('review_frequency')} className={SELECT_CLS} style={SELECT_ARROW}>
                    <option value="annually">Annually</option>
                    <option value="semi_annually">Semi-Annually</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <Input id="last_reviewed_date" type="date" label="Last Reviewed Date" {...register('last_reviewed_date')} />
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between pt-2 pb-8">
            <Link to="/context">
              <Button type="button" variant="ghost" size="md">Cancel</Button>
            </Link>
            <Button type="button" size="md" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              Create Interested Party
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
