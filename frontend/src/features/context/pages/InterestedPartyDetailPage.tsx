import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { useInterestedParty } from '../hooks/useInterestedParties';
import { useContextIssues } from '../hooks/useContextIssues';

export default function InterestedPartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: party, isLoading } = useInterestedParty(id!);
  const { data: allIssues = [] } = useContextIssues();
  const linkedIssues = allIssues.filter((issue) => issue.interested_party === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Interested party not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[900px] mx-auto px-8 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/context" className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white hover:border hover:border-slate-200 transition-all">
            <ArrowLeftIcon className="w-[18px] h-[18px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{party.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500 capitalize">Interested Party · {party.party_type}</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium bg-stone-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">{party.party_type}</span>
              {party.is_compliance_obligation && (
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
                  Compliance Obligation
                </span>
              )}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${party.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-slate-500'}`}>
                {party.status}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">Needs and Expectations</p>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">{party.needs_and_expectations}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <p className="text-xs text-slate-400">Review Frequency</p>
                  <p className="mt-0.5 text-sm text-slate-700 capitalize">{party.review_frequency.replace('_', '-')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Last Reviewed</p>
                  <p className="mt-0.5 text-sm text-slate-700">
                    {party.last_reviewed_date ? formatDate(party.last_reviewed_date) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Added</p>
                  <p className="mt-0.5 text-sm text-slate-700">{formatDate(party.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Issues */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Linked Context Issues</h2>
            {linkedIssues.length === 0 ? (
              <p className="text-sm text-slate-400">No issues linked to this interested party.</p>
            ) : (
              <div className="space-y-2">
                {linkedIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/context/issues/${issue.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors"
                  >
                    {issue.classification === 'risk' ? (
                      <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">Risk</span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">Opportunity</span>
                    )}
                    <span className="text-sm font-medium text-slate-700">{issue.title}</span>
                    <span className="ml-auto text-xs text-slate-400 capitalize">{issue.status}</span>
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
