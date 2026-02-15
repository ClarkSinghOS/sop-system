'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { 
    id: 'processes', 
    label: 'Processes', 
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  { 
    id: 'executions', 
    label: 'Executions', 
    href: '/executions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    badge: 'Live',
  },
  { 
    id: 'training', 
    label: 'Training', 
    href: '/training',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    href: '/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  { 
    id: 'api', 
    label: 'API', 
    href: '/api-docs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`relative flex-shrink-0 flex flex-col transition-all duration-300 ease-out ${
          sidebarOpen ? 'w-64' : 'w-[72px]'
        }`}
        style={{
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-void) 100%)',
        }}
      >
        {/* Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-50" />
        
        {/* Logo Section */}
        <div className={`h-16 flex items-center gap-3 px-4 border-b border-[var(--border-subtle)] ${mounted ? 'animate-reveal-up' : 'opacity-0'}`}>
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo Mark */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-lime)] flex items-center justify-center shadow-lg group-hover:shadow-[var(--glow-cyan)] transition-shadow duration-300">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-lime)] blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            </div>
            
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  ProcessCore
                </span>
                <span className="text-[10px] font-medium text-[var(--accent-cyan)] uppercase tracking-widest">
                  Command Center
                </span>
              </div>
            )}
          </Link>
          
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${mounted ? 'animate-reveal-up' : 'opacity-0'}
                  ${isActive
                    ? 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }
                `}
                style={{ animationDelay: `${(index + 1) * 50}ms` }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--accent-cyan)] rounded-r-full shadow-[var(--glow-cyan)]" />
                )}
                
                <span className={`flex-shrink-0 ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'} transition-colors`}>
                  {item.icon}
                </span>
                
                {sidebarOpen && (
                  <>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/20">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button (when collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all shadow-lg"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Bottom Section */}
        <div className={`p-3 border-t border-[var(--border-subtle)] ${mounted ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)]
              border border-[var(--border-subtle)] hover:border-[var(--border-default)]
              text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
              transition-all duration-200 group
            `}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {sidebarOpen && (
              <>
                <span className="text-sm">Search...</span>
                <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-muted)]">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
          
          {/* Status Indicator */}
          {sidebarOpen && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-success)]/5 border border-[var(--status-success)]/10">
              <div className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse-glow" />
              <span className="text-xs font-medium text-[var(--status-success)]">System Operational</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[var(--accent-cyan)]/0 via-[var(--accent-cyan)]/30 to-[var(--accent-cyan)]/0" />
        
        {children}
      </main>

      {/* Search Modal */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          onClick={() => setSearchOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-reveal-scale" style={{ animationDuration: '0.2s' }} />
          
          {/* Modal */}
          <div 
            className="relative w-full max-w-2xl mx-4 animate-reveal-up"
            onClick={e => e.stopPropagation()}
            style={{ animationDuration: '0.3s' }}
          >
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-default)] shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
                <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search processes, steps, keywords..."
                  className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] text-base"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs font-mono rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  ESC
                </kbd>
              </div>
              
              {/* Quick Actions */}
              <div className="p-4">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Start New Process', icon: '⚡' },
                    { label: 'View Analytics', icon: '📊' },
                    { label: 'Training Mode', icon: '📚' },
                    { label: 'API Documentation', icon: '🔌' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-default)] transition-all text-left group"
                    >
                      <span className="text-lg">{action.icon}</span>
                      <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
