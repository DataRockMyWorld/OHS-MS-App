import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useRiskOpportunity } from '../hooks/useRisksOpportunities';
import type { ROType, SeverityLevel } from '../types/context.types';

function ROTypeBadge({ value }: { value: ROType }) {
  return value === 'risk' ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">Risk</span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Opportunity</span>
  );
}

function SeverityBadge({ value }: { value: SeverityLevel }) {
  const styles: Record<SeverityLevel, string> = {
    high: 'bg-red-50 text-red-700 border-red-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${styles[value]}`}>
      {value} Severity
    </span>
  );
}

function StatusChip({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-slate-600 capitalize">
      {value.replace('_', ' ')}
    </span>
  );
}

export default function RiskOpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ro, isLoading } = useRiskOpportunity(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!ro) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Risk or opportunity not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[900px] mx-auto px-8 py-8">

        {/* Back */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/context" className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white hover:border hover:border-slate-200 transition-all">
            <ArrowLeftIcon className="w-[18px] h-[18px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{ro.title}</h1>
            <p className="mt-0.5 text-sm text-slate-500 capitalize">{ro.type} · Context Register</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <ROTypeBadge value={ro.type} />
              <SeverityBadge value={ro.severity_level} />
              <StatusChip value={ro.status} />
              {ro.owner_name && (
                <span className="text-xs text-slate-500">
                  Owner: <span className="font-medium text-slate-700">{ro.owner_name}</span>
                </span>
              )}
            </div>
            {ro.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{ro.description}</p>
            )}
          </div>

          {/* Assessment card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              {ro.type === 'risk' ? 'Controls' : 'Potential Benefit'}
            </h2>
            {ro.type === 'risk' ? (
              ro.controls ? (
                <p className="text-sm text-slate-600 leading-relaxed">{ro.controls}</p>
              ) : (
                <p className="text-sm text-slate-400">No controls documented yet.</p>
              )
            ) : (
              ro.potential_benefit ? (
                <p className="text-sm text-slate-600 leading-relaxed">{ro.potential_benefit}</p>
              ) : (
                <p className="text-sm text-slate-400">No potential benefit documented yet.</p>
              )
            )}
          </div>

          {/* Source issue card */}
          {ro.source_issue && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Source Issue</h2>
              <Link
                to={`/context/issues/${ro.source_issue}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700">{ro.source_issue_title}</span>
                <span className="ml-auto text-xs font-medium text-primary-600">View issue →</span>
              </Link>
            </div>
          )}

          {/* Linked objectives */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Linked Objectives</h2>
                <p className="text-xs text-slate-400 mt-0.5">{ro.linked_objectives_count} objective{ro.linked_objectives_count !== 1 ? 's' : ''} address this {ro.type}</p>
              </div>
              <button
                onClick={() => navigate(`/objectives/new?risk_or_opportunity=${id}`)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Create Objective from this {ro.type}
              </button>
            </div>
            {ro.linked_objectives_count === 0 ? (
              <p className="text-sm text-slate-400">
                No objectives linked yet. Create an objective and link it to this {ro.type} to track your response.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                {ro.linked_objectives_count} objective{ro.linked_objectives_count !== 1 ? 's are' : ' is'} addressing this {ro.type}. View them in the Objectives &amp; KPIs module.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
