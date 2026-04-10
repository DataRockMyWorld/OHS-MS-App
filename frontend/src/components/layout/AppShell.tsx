import { Outlet, useMatches } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

function usePageTitle(): string {
  const matches = useMatches();
  const last = matches[matches.length - 1];
  const path = last?.pathname ?? '';
  const segment = path.split('/').filter(Boolean)[0] ?? 'dashboard';
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AppShell() {
  const title = usePageTitle();

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar />
      <div className="pl-60">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100 h-14 flex items-center justify-between px-6">
          <h1 className="text-sm font-semibold text-slate-700 capitalize">{title}</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        <main className="min-h-[calc(100vh-56px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
