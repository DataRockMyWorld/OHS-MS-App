import { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink, Link } from 'react-router-dom';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  ISO_45001,
  findClauseById,
  getTopClause,
} from '../data/iso45001';
import type { TopClause, ClauseItem, LinkedModule } from '../data/iso45001';

// ─── Left navigation ──────────────────────────────────────────────────────────

function NavGroup({ clause, activeId }: { clause: TopClause; activeId: string }) {
  const isActive = activeId.split('.')[0] === String(clause.number);
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const hasChildren = clause.children.length > 0 &&
    !(clause.children.length === 1 && clause.children[0].id === String(clause.number));

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors duration-100',
          isActive
            ? 'text-primary-700 bg-primary-50'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70',
        )}
      >
        <span className="flex-1 text-xs font-semibold">
          <span className="text-slate-400 mr-1.5">{clause.number}.</span>
          {clause.title}
        </span>
        {hasChildren ? (
          open
            ? <ChevronDownIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            : <ChevronRightIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        ) : null}
        {!hasChildren && (
          <NavLink
            to={`/standard/${clause.children[0]?.id ?? clause.id}`}
            className="sr-only"
          />
        )}
      </button>

      {hasChildren && open && (
        <div className="ml-3 mt-0.5 pl-3 border-l border-slate-100 space-y-0.5">
          {clause.children.map((child) => (
            <NavItemTree key={child.id} item={child} activeId={activeId} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function NavItemTree({
  item,
  activeId,
  depth,
}: {
  item: ClauseItem;
  activeId: string;
  depth: number;
}) {
  const isActive = activeId === item.id;
  const isAncestor = activeId.startsWith(item.id + '.');
  const hasChildren = (item.children?.length ?? 0) > 0;
  const [open, setOpen] = useState(isActive || isAncestor);

  useEffect(() => {
    if (isActive || isAncestor) setOpen(true);
  }, [isActive, isAncestor]);

  return (
    <div>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-600"
          >
            {open
              ? <ChevronDownIcon className="w-3 h-3" />
              : <ChevronRightIcon className="w-3 h-3" />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <NavLink
          to={`/standard/${item.id}`}
          className={cn(
            'flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors duration-100 min-w-0',
            isActive
              ? 'text-primary-700 bg-primary-50 font-medium'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70',
          )}
        >
          <span className="text-slate-400 shrink-0 tabular-nums">{item.number}</span>
          <span className="truncate">{item.title}</span>
        </NavLink>
      </div>

      {hasChildren && open && (
        <div className="ml-4 mt-0.5 pl-3 border-l border-slate-100 space-y-0.5">
          {item.children!.map((child) => (
            <NavItemTree key={child.id} item={child} activeId={activeId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main content sub-components ──────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</h3>
    </div>
  );
}

function LinkedModulePill({ mod }: { mod: LinkedModule }) {
  if (mod.available) {
    return (
      <Link
        to={mod.href}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-100 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
      >
        <LinkIcon className="w-3 h-3" />
        {mod.label}
      </Link>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-100 text-xs font-medium text-slate-400">
      {mod.label}
      <span className="text-[10px] font-semibold bg-slate-200 text-slate-400 px-1.5 py-0.5 rounded leading-none">
        Soon
      </span>
    </span>
  );
}

function TermsGlossary({ terms }: { terms: NonNullable<ClauseItem['keyTerms']> }) {
  const [search, setSearch] = useState('');
  const filtered = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search terms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-8 pr-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
        />
      </div>
      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t.term} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="w-48 shrink-0">
              <p className="text-sm font-semibold text-slate-900">{t.term}</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{t.definition}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 py-4 text-center">
            No terms matching "{search}"
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Clause content view ─────────────────────────────────────────────────────

function ClauseContent({ clause }: { clause: ClauseItem }) {
  const isTermsClause = clause.id === '3';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            ISO 45001:2018 §{clause.number}
          </span>
          {clause.linkedModules.some((m) => m.available) && (
            <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
              Module Available
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          {clause.number} — {clause.title}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          {clause.summary}
        </p>
      </div>

      {/* Purpose */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            Why this clause exists
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">{clause.purpose}</p>
        </div>
      </div>

      {/* Terms glossary (Clause 3 only) */}
      {isTermsClause && clause.keyTerms && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <SectionHeading icon={BookOpenIcon} label="Key Terms & Definitions" />
          <TermsGlossary terms={clause.keyTerms} />
        </div>
      )}

      {/* Key Requirements */}
      {clause.requirements.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <SectionHeading icon={ClipboardDocumentListIcon} label="Key Requirements" />
          <ol className="space-y-3">
            {clause.requirements.map((req, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{req}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Audit Questions */}
      {clause.auditQuestions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <SectionHeading icon={CheckCircleIcon} label="Audit Questions" />
          <p className="text-xs text-slate-400 mb-4 -mt-2">
            What an ISO 45001 auditor will typically ask during a certification or surveillance audit.
          </p>
          <ul className="space-y-3">
            {clause.auditQuestions.map((q, i) => (
              <li key={i} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Modules */}
      {clause.linkedModules.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <SectionHeading icon={LinkIcon} label="Related Modules" />
          <p className="text-xs text-slate-400 mb-4 -mt-2">
            Modules in this platform that directly support compliance with this clause.
          </p>
          <div className="flex flex-wrap gap-2">
            {clause.linkedModules.map((mod) => (
              <LinkedModulePill key={mod.href} mod={mod} />
            ))}
          </div>
        </div>
      )}

      {/* Child clauses overview (when a parent is selected and has children) */}
      {(clause.children?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Sub-clauses
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {clause.children!.map((child) => (
              <Link
                key={child.id}
                to={`/standard/${child.id}`}
                className="group flex items-start gap-4 bg-white rounded-xl border border-slate-200 px-5 py-4 hover:border-primary-200 hover:shadow-sm transition-all duration-150"
              >
                <span className="font-mono text-sm font-bold text-primary-700 shrink-0 mt-0.5 min-w-[2.5rem]">
                  {child.number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                    {child.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {child.summary}
                  </p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-primary-500 shrink-0 mt-0.5 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top clause overview ──────────────────────────────────────────────────────

function TopClauseOverview({ clause }: { clause: TopClause }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            ISO 45001:2018
          </span>
          {clause.isHLS && (
            <span className="text-xs text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              HLS Clause
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          Clause {clause.number} — {clause.title}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">{clause.overview}</p>
      </div>

      {/* Child clause cards */}
      {clause.children.length > 0 && (
        clause.children.length === 1 && clause.children[0].id === String(clause.number) ? (
          <ClauseContent clause={clause.children[0]} />
        ) : (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              {clause.children.length} Clause{clause.children.length !== 1 ? 's' : ''}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {clause.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/standard/${child.id}`}
                  className="group flex items-start gap-4 bg-white rounded-xl border border-slate-200 px-5 py-4 hover:border-primary-200 hover:shadow-sm transition-all duration-150"
                >
                  <span className="font-mono text-sm font-bold text-primary-700 shrink-0 mt-0.5 min-w-[2.5rem]">
                    {child.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                      {child.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {child.summary}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-primary-500 shrink-0 mt-0.5 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StandardPage() {
  const { clauseId } = useParams<{ clauseId?: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Default to first clause
  const activeId = clauseId ?? '1';

  // Redirect root to clause 1
  useEffect(() => {
    if (!clauseId) navigate('/standard/1', { replace: true });
  }, [clauseId, navigate]);

  const activeClause = findClauseById(activeId);
  const activeTopClause = getTopClause(activeId);

  // Search: filter top clauses and their children
  const searchResults = search.trim().length > 1
    ? ISO_45001.flatMap((tc) => {
        const matches: { id: string; number: string; title: string; clause: number }[] = [];
        function scan(items: ClauseItem[]) {
          for (const item of items) {
            if (
              item.title.toLowerCase().includes(search.toLowerCase()) ||
              item.number.includes(search)
            ) {
              matches.push({ id: item.id, number: item.number, title: item.title, clause: tc.number });
            }
            if (item.children?.length) scan(item.children);
          }
        }
        scan(tc.children);
        return matches;
      })
    : [];

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden bg-slate-50">

      {/* ── Left nav ───────────────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-700 shrink-0">
              <ShieldCheckIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">ISO 45001:2018</p>
              <p className="text-[10px] text-slate-400">OH&S Management System</p>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clauses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Nav content */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">

          {/* Search results */}
          {search.trim().length > 1 ? (
            <div>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.length === 0 ? (
                <p className="px-3 text-xs text-slate-400">No clauses found.</p>
              ) : (
                searchResults.map((r) => (
                  <NavLink
                    key={r.id}
                    to={`/standard/${r.id}`}
                    onClick={() => setSearch('')}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors duration-100',
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900',
                      )
                    }
                  >
                    <span className="text-slate-400 tabular-nums shrink-0">{r.number}</span>
                    <span className="truncate">{r.title}</span>
                  </NavLink>
                ))
              )}
            </div>
          ) : (
            <>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                HLS Structure
              </p>
              {ISO_45001.map((clause) => (
                <NavGroup key={clause.id} clause={clause} activeId={activeId} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Requirements summarised for operational guidance. Refer to the official ISO 45001:2018 standard for certification purposes.
          </p>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-8">

          {/* Breadcrumb */}
          {activeTopClause && (
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
              <span>ISO 45001:2018</span>
              <ChevronRightIcon className="w-3 h-3" />
              <Link
                to={`/standard/${activeTopClause.children[0]?.id ?? activeTopClause.id}`}
                className={cn(
                  'hover:text-slate-700 transition-colors',
                  activeId === String(activeTopClause.number) && 'text-slate-700 font-medium',
                )}
              >
                Clause {activeTopClause.number}: {activeTopClause.title}
              </Link>
              {activeClause && activeClause.id !== String(activeTopClause.number) && (
                <>
                  <ChevronRightIcon className="w-3 h-3" />
                  <span className="text-slate-700 font-medium">{activeClause.number}</span>
                </>
              )}
            </nav>
          )}

          {/* Content */}
          {activeClause ? (
            <ClauseContent clause={activeClause} />
          ) : activeTopClause ? (
            <TopClauseOverview clause={activeTopClause} />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <BookOpenIcon className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Clause not found</p>
              <Link to="/standard/1" className="mt-3 text-sm text-primary-600 hover:underline">
                Start from Clause 1
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
