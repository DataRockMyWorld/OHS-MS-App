import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import FileUpload from '@/components/ui/FileUpload';
import { useCreateIncident, useSubmitIncident } from '../hooks/useIncidentMutations';
import type { IncidentType, IncidentSeverity } from '../types/incident.types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  incident_type: z.string().min(1, 'Please select an incident type') as z.ZodType<IncidentType>,
  severity: z.string().min(1, 'Please select severity') as z.ZodType<IncidentSeverity>,
  date_of_incident: z.string().min(1, 'Date of incident is required'),
  time_of_incident: z.string().optional(),
  location_detail: z.string().optional(),
  description: z.string().min(10, 'Please provide more detail (at least 10 characters)'),
  immediate_action_taken: z.string().optional(),
  persons_involved: z.string().optional(),
  witnesses: z.string().optional(),
  injury_occurred: z.boolean(),
  environmental_impact: z.boolean(),
  property_damage: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ─── Options ──────────────────────────────────────────────────────────────────

const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: 'near_miss',          label: 'Near Miss' },
  { value: 'injury',             label: 'Injury' },
  { value: 'first_aid',          label: 'First Aid Case' },
  { value: 'medical_treatment',  label: 'Medical Treatment Case' },
  { value: 'lost_time_injury',   label: 'Lost Time Injury' },
  { value: 'fatality',           label: 'Fatality' },
  { value: 'property_damage',    label: 'Property Damage' },
  { value: 'environmental_spill',label: 'Environmental Spill' },
  { value: 'unsafe_act',         label: 'Unsafe Act' },
  { value: 'unsafe_condition',   label: 'Unsafe Condition' },
  { value: 'fire',               label: 'Fire' },
  { value: 'vehicle_incident',   label: 'Vehicle Incident' },
  { value: 'other',              label: 'Other' },
];

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

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-slate-200 peer-checked:bg-primary-600 rounded-full transition-colors duration-200" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 leading-5">
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportIncidentPage() {
  const navigate = useNavigate();
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [submitLoading, setSubmitLoading] = useState<'draft' | 'submit' | null>(null);

  const createIncident = useCreateIncident();
  const submitIncident = useSubmitIncident();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      injury_occurred: false,
      environmental_impact: false,
      property_damage: false,
      severity: 'low',
    },
  });

  const injury_occurred    = watch('injury_occurred');
  const environmental_impact = watch('environmental_impact');
  const property_damage    = watch('property_damage');

  async function uploadFiles(incidentId: string) {
    if (stagedFiles.length === 0) return;
    await Promise.allSettled(
      stagedFiles.map((file) => {
        const fd = new FormData();
        fd.append('file', file);
        return fetch(`/api/v1/incidents/${incidentId}/attachments/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
          },
          body: fd,
        });
      }),
    );
  }

  async function onSaveDraft(data: FormValues) {
    setSubmitLoading('draft');
    try {
      const incident = await createIncident.mutateAsync({
        title: data.title,
        incident_type: data.incident_type,
        date_of_incident: data.date_of_incident,
        time_of_incident: data.time_of_incident || undefined,
        location_detail: data.location_detail || undefined,
        description: data.description,
        immediate_action_taken: data.immediate_action_taken || undefined,
        persons_involved: data.persons_involved
          ? data.persons_involved.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        witnesses: data.witnesses
          ? data.witnesses.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        injury_occurred: data.injury_occurred,
        environmental_impact: data.environmental_impact,
        property_damage: data.property_damage,
        severity: data.severity,
      });
      await uploadFiles(incident.id);
      navigate(`/incidents/${incident.id}`);
    } finally {
      setSubmitLoading(null);
    }
  }

  async function onSubmitIncident(data: FormValues) {
    setSubmitLoading('submit');
    try {
      const incident = await createIncident.mutateAsync({
        title: data.title,
        incident_type: data.incident_type,
        date_of_incident: data.date_of_incident,
        time_of_incident: data.time_of_incident || undefined,
        location_detail: data.location_detail || undefined,
        description: data.description,
        immediate_action_taken: data.immediate_action_taken || undefined,
        persons_involved: data.persons_involved
          ? data.persons_involved.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        witnesses: data.witnesses
          ? data.witnesses.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        injury_occurred: data.injury_occurred,
        environmental_impact: data.environmental_impact,
        property_damage: data.property_damage,
        severity: data.severity,
      });
      await uploadFiles(incident.id);
      await submitIncident.mutateAsync(incident.id);
      navigate(`/incidents/${incident.id}`);
    } finally {
      setSubmitLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[860px] mx-auto px-8 py-8">

        {/* ── Page header ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/incidents"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white hover:border hover:border-slate-200 transition-all"
          >
            <ArrowLeftIcon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Report an Incident
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Complete all required fields. You can save as a draft and submit later.
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── 1. Incident Details ──────────────────────────────────────────── */}
          <SectionCard
            step={1}
            title="Incident Details"
            description="Basic classification and timing of the event."
          >
            <div className="space-y-4">
              <Input
                id="title"
                label="Incident Title"
                placeholder="Brief, descriptive title of the incident"
                required
                error={errors.title?.message}
                {...register('title')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  id="incident_type"
                  label="Incident Type"
                  required
                  placeholder="Select type…"
                  error={errors.incident_type?.message}
                  {...register('incident_type')}
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <Select
                  id="severity"
                  label="Severity"
                  required
                  error={errors.severity?.message}
                  {...register('severity')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="date_of_incident"
                  type="date"
                  label="Date of Incident"
                  required
                  error={errors.date_of_incident?.message}
                  {...register('date_of_incident')}
                />
                <Input
                  id="time_of_incident"
                  type="time"
                  label="Time of Incident"
                  hint="Approximate time is acceptable"
                  {...register('time_of_incident')}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── 2. Location ──────────────────────────────────────────────────── */}
          <SectionCard
            step={2}
            title="Location"
            description="Where did the incident take place?"
          >
            <Input
              id="location_detail"
              label="Location / Area"
              placeholder="e.g. Warehouse B – Loading Bay 3"
              hint="Be as specific as possible"
              {...register('location_detail')}
            />
          </SectionCard>

          {/* ── 3. Description & Impact ──────────────────────────────────────── */}
          <SectionCard
            step={3}
            title="Description & Impact"
            description="What happened, and what were the consequences?"
          >
            <div className="space-y-4">
              <Textarea
                id="description"
                label="Description"
                placeholder="Describe the sequence of events leading to and including the incident. Include as much detail as possible."
                required
                rows={5}
                error={errors.description?.message}
                {...register('description')}
              />
              <Textarea
                id="immediate_action_taken"
                label="Immediate Action Taken"
                placeholder="What immediate steps were taken to control the situation?"
                rows={3}
                {...register('immediate_action_taken')}
              />

              <div className="pt-1">
                <p className="text-sm font-medium text-slate-700 mb-3">Consequences</p>
                <div className="space-y-3 pl-1">
                  <ToggleField
                    label="Injury occurred"
                    description="One or more persons were physically hurt"
                    checked={injury_occurred}
                    onChange={(v) => setValue('injury_occurred', v)}
                  />
                  <ToggleField
                    label="Environmental impact"
                    description="Spill, emission, or other environmental consequence"
                    checked={environmental_impact}
                    onChange={(v) => setValue('environmental_impact', v)}
                  />
                  <ToggleField
                    label="Property damage"
                    description="Equipment, vehicles, or infrastructure was damaged"
                    checked={property_damage}
                    onChange={(v) => setValue('property_damage', v)}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── 4. People ────────────────────────────────────────────────────── */}
          <SectionCard
            step={4}
            title="People Involved"
            description="List persons involved and any witnesses. Enter one name per line."
          >
            <div className="grid grid-cols-2 gap-4">
              <Textarea
                id="persons_involved"
                label="Persons Involved"
                placeholder={"John Smith\nJane Doe"}
                rows={4}
                hint="One name per line"
                {...register('persons_involved')}
              />
              <Textarea
                id="witnesses"
                label="Witnesses"
                placeholder={"Alex Johnson\nSam Williams"}
                rows={4}
                hint="One name per line"
                {...register('witnesses')}
              />
            </div>
          </SectionCard>

          {/* ── 5. Evidence ──────────────────────────────────────────────────── */}
          <SectionCard
            step={5}
            title="Attachments & Evidence"
            description="Upload photos, documents, or video evidence. Max 20 MB per file."
          >
            <FileUpload onFilesChange={setStagedFiles} />
          </SectionCard>

          {/* ── Actions ──────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Link to="/incidents">
              <Button type="button" variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                loading={submitLoading === 'draft'}
                disabled={submitLoading !== null}
                onClick={handleSubmit(onSaveDraft)}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                size="md"
                loading={submitLoading === 'submit'}
                disabled={submitLoading !== null}
                onClick={handleSubmit(onSubmitIncident)}
              >
                Submit Incident
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
