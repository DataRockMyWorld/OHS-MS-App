/**
 * Public anonymous incident reporting page.
 * No auth, no sidebar — accessible at /report/:orgSlug
 */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { CheckCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  near_miss:          'Near Miss',
  injury:             'Injury / Illness',
  property_damage:    'Property Damage',
  environmental:      'Environmental',
  security:           'Security',
  hazard_observation: 'Hazard Observation',
  other:              'Other',
};

interface FormValues {
  title: string;
  description: string;
  incident_type: string;
  date_of_incident: string;
  location: string;
  immediate_action_taken: string;
  reporter_name: string;
  reporter_contact: string;
}

export default function AnonymousReportPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      incident_type: 'near_miss',
      date_of_incident: new Date().toISOString().slice(0, 10),
      location: '',
      immediate_action_taken: '',
      reporter_name: '',
      reporter_contact: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError('');
    try {
      await axios.post(`/api/v1/public/report/${orgSlug}/`, values);
      setSubmitted(true);
    } catch {
      setServerError('Something went wrong. Please try again or contact your safety team directly.');
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md w-full text-center space-y-4">
          <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-800">Report submitted</h2>
          <p className="text-sm text-slate-500">
            Thank you for your report. Your safety team has been notified and will review it promptly.
            You may close this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Branding / heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 mb-2">
            <ShieldExclamationIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Report a Safety Incident</h1>
          <p className="text-sm text-slate-500">
            This form is anonymous. You may choose to leave your contact details if you wish
            to be followed up.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">What happened? *</label>
            <input
              {...register('title', { required: 'Required' })}
              placeholder="Brief title for the incident"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <textarea
              {...register('description', { required: 'Required' })}
              rows={4}
              placeholder="Describe what happened in as much detail as you feel comfortable sharing…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident type *</label>
              <select
                {...register('incident_type')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(INCIDENT_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date of incident *</label>
              <input
                type="date"
                {...register('date_of_incident', { required: 'Required' })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <input
              {...register('location')}
              placeholder="Where did it happen?"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Immediate actions taken</label>
            <textarea
              {...register('immediate_action_taken')}
              rows={2}
              placeholder="Any steps taken immediately after the incident…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-1">
            <p className="text-xs font-medium text-slate-700">
              Optional — your contact details
            </p>
            <p className="text-xs text-slate-400 mb-3">
              Leave blank to remain fully anonymous.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <input
                  {...register('reporter_name')}
                  placeholder="Your name"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact</label>
                <input
                  {...register('reporter_contact')}
                  placeholder="Email or phone"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {serverError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Submitting…' : 'Submit report'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Your report is kept confidential and reviewed only by your organisation's safety team.
        </p>
      </div>
    </div>
  );
}
