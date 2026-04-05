import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be wrapped in <Tabs>');
  return ctx;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ─── Tab list ─────────────────────────────────────────────────────────────────

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className={cn('flex border-b border-slate-200 gap-1', className)}>
      {children}
    </div>
  );
}

// ─── Tab trigger ──────────────────────────────────────────────────────────────

interface TabProps {
  value: string;
  children: ReactNode;
  className?: string;
  count?: number;
}

export function Tab({ value, children, className, count }: TabProps) {
  const { value: active, onChange } = useTabsContext();
  const isActive = active === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onChange(value)}
      className={cn(
        'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-lg',
        isActive ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800',
        className,
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold px-1',
            isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500',
          )}
        >
          {count}
        </span>
      )}
      {isActive && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-700 rounded-full" />
      )}
    </button>
  );
}

// ─── Tab panel ────────────────────────────────────────────────────────────────

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return <div role="tabpanel" className={className}>{children}</div>;
}
