import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Squares2X2Icon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  FlagIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  soon?: boolean;
}

const MODULES: NavItem[] = [
  { label: 'Dashboard',          href: '/dashboard',           icon: Squares2X2Icon },
  { label: 'Incidents',          href: '/incidents',           icon: ExclamationTriangleIcon },
  { label: 'Investigations',     href: '/investigations',       icon: MagnifyingGlassIcon },
  { label: 'Corrective Actions', href: '/corrective-actions',  icon: CheckCircleIcon },
  { label: 'Objectives & KPIs',  href: '/objectives',          icon: FlagIcon },
  { label: 'Documents',          href: '/documents',           icon: DocumentTextIcon,           soon: true },
  { label: 'Audits',             href: '/audits',              icon: ClipboardDocumentCheckIcon, soon: true },
  { label: 'Risk Assessments',   href: '/risk-assessments',   icon: ShieldExclamationIcon,      soon: true },
  { label: 'Reports',            href: '/reports',             icon: ChartBarIcon,               soon: true },
];

const REFERENCE: NavItem[] = [
  { label: 'ISO 45001:2018',     href: '/standard',            icon: BookOpenIcon },
];

function NavItemRow({ item }: { item: NavItem }) {
  if (item.soon) {
    return (
      <li>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 cursor-default select-none">
          <item.icon className="w-[17px] h-[17px] shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md leading-none">
            Soon
          </span>
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-100',
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon
              className={cn('w-[17px] h-[17px] shrink-0', isActive ? 'text-primary-700' : 'text-slate-400')}
            />
            <span className="flex-1 truncate">{item.label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  const initials = user
    ? (user.first_name?.[0] ?? '') + (user.last_name?.[0] ?? '')
    : '?';

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-100 flex flex-col z-10">
      {/* Brand */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-slate-100/80">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-700 shrink-0">
          <ShieldCheckIcon className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-none">OHS-MS</p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-none">ISO 45001:2018</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
          Modules
        </p>
        <ul className="space-y-0.5">
          {MODULES.map((item) => (
            <NavItemRow key={item.href} item={item} />
          ))}
        </ul>

        <p className="px-3 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
          Reference
        </p>
        <ul className="space-y-0.5">
          {REFERENCE.map((item) => (
            <NavItemRow key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100/80">
        {/* Org context */}
        {user?.organization_name && (
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wide">Organization</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{user.organization_name}</p>
          </div>
        )}

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-100 text-primary-700 text-xs font-semibold shrink-0 uppercase">
            {initials || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{user?.full_name ?? 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate capitalize">
              {user?.role?.replace('_', ' ') ?? ''}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
