import { Link } from 'react-router-dom';
import { ArrowLeftIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import { useLeagueTable } from '../hooks/useLeagueTable';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="animate-pulse rounded bg-slate-100 h-3 w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Score cell ───────────────────────────────────────────────────────────────

function ScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-sm font-medium text-slate-300">No data</span>;
  }
  const colorClass =
    score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <span className={cn('text-xl font-bold tabular-nums', colorClass)}>
      {Math.round(score)}
      <span className="text-xs font-normal ml-0.5 opacity-70">%</span>
    </span>
  );
}

// ─── Rank medal ──────────────────────────────────────────────────────────────

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-semibold text-slate-400 tabular-nums">{rank}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeagueTablePage() {
  const { data: rows = [], isLoading } = useLeagueTable();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-[1100px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/objectives"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white hover:border hover:border-slate-200 transition-all"
          >
            <ArrowLeftIcon className="w-[18px] h-[18px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Performance League Table
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ranked by weighted average achievement across individual objectives.
            </p>
          </div>
        </div>

        {/* Explanation banner */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl px-5 py-4 mb-6">
          <p className="text-xs font-medium text-primary-700">
            Scores are weighted averages of achievement % across all individual-scoped objectives
            assigned to each person. Higher weight objectives contribute more to the final score.
            A score of 100% means all targets are fully achieved.
          </p>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Rank', 'Person', 'Score', 'Objectives', 'On Track', 'At Risk', 'Behind', 'Achieved'].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 whitespace-nowrap bg-stone-50/60"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<TrophyIcon className="w-6 h-6" />}
              title="No individual objectives yet"
              description="Create individual-scoped objectives and assign them to team members to populate the league table."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Rank', 'Person', 'Score', 'Objectives', 'On Track', 'At Risk', 'Behind', 'Achieved'].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 whitespace-nowrap bg-stone-50/60"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr key={row.user_id} className="hover:bg-stone-50/40 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <RankCell rank={index + 1} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900 text-sm">{row.full_name}</p>
                      {row.job_title && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{row.job_title}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <ScoreCell score={row.score} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-700 tabular-nums">
                        {row.objective_count}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-emerald-600 font-medium tabular-nums">
                        {row.on_track}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-amber-600 font-medium tabular-nums">
                        {row.at_risk}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-red-500 font-medium tabular-nums">
                        {row.behind}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600 font-medium tabular-nums">
                        {row.achieved}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
