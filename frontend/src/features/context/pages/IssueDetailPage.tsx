import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { useContextIssue } from '../hooks/useContextIssues';
import { useRisksOpportunities } from '../hooks/useRisksOpportunities';
import type { IssueClassification } from '../types/context.types';

function ClassificationBadge({ value }: { value: IssueClassification }) {
  return value === 'risk' ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">Risk</span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Opportunity</span>
  );
}

function StatusChip({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-slate-600 capitalize">
      {value.replace('_', ' ')}
    </span>
  );
}

function AnalysisTagChip({ value }: { value: string }) {
  const isSwot = value.startsWith('swot_');
  const label = value.replace('swot_', '').replace('pestle_', '').replace('_', ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${isSwot ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
      {isSwot ? 'SWOT' : 'PESTLE'} · {label}
    </span>
  );
}

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: issue, isLoading } = useContextIssue(id!);
  const { data: allROs = [] } = useRisksOpportunities();
  const linkedROs = allROs.filter((ro) => ro.source_issue === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Issue not found.</p>
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
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{issue.title}</h1>
            <p className="mt-0.5 text-sm text-slate-500">Context Issue · Clause 4.1</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <ClassificationBadge value={issue.classification} />
              <StatusChip value={issue.status} />
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${issue.category === 'internal' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-violet-50 text-violet-700 border-violet-100'}`}>{issue.category}</span>
              <AnalysisTagChip value={issue.analysis_tag} />
            </div>
            {issue.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{issue.description}</p>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-slate-400">Identified Date</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{formatDate(issue.identified_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Identified By</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{issue.identified_by_name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Interested Party</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{issue.interested_party_name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Created</dt>
                <dd className="mt-0.5 text-sm text-slate-700">{formatDate(issue.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Linked R&Os */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Linked Risks &amp; Opportunities</h2>
              <button
                onClick={() => navigate(`/context/risks-and-opportunities/new?source_issue=${id}`)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Create R&amp;O from this issue
              </button>
            </div>
            {linkedROs.length === 0 ? (
              <p className="text-sm text-slate-400">No risks or opportunities linked to this issue yet.</p>
            ) : (
              <div className="space-y-2">
                {linkedROs.map((ro) => (
                  <Link
                    key={ro.id}
                    to={`/context/risks-and-opportunities/${ro.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors"
                  >
                    {ro.type === 'risk' ? (
                      <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">Risk</span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">Opportunity</span>
                    )}
                    <span className="text-sm font-medium text-slate-700">{ro.title}</span>
                    <span className="ml-auto text-xs text-slate-400 capitalize">{ro.severity_level}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
