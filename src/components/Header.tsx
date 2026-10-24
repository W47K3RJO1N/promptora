import React from 'react';
import { UserButton } from '@clerk/react';
import { Settings, Github, Layers } from 'lucide-react';
import { OllamaHealth } from '../types';

interface HeaderProps {
  health: OllamaHealth;
  onRefreshHealth: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  activeSection: 'workspace' | 'preservation' | 'comparison';
  setActiveSection: (sec: 'workspace' | 'preservation' | 'comparison') => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onRefreshHealth,
  onOpenSettings,
  onOpenHistory,
  activeSection,
  setActiveSection,
  historyCount,
}) => {
  const isOnline = health.status === 'online';
  const isChecking = health.status === 'checking';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-900 text-emerald-100 flex items-center justify-center shadow-xs">
            {/* Minimal Leaf / Efficiency Mark */}
            <svg
              className="w-4.5 h-4.5 text-emerald-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-base sm:text-lg tracking-tight text-stone-900">
              Promptora
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean text) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveSection('workspace')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeSection === 'workspace'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            Optimizer Workspace
          </button>
          <button
            onClick={() => setActiveSection('preservation')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeSection === 'preservation'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            Preservation Audit
          </button>
          <button
            onClick={() => setActiveSection('comparison')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeSection === 'comparison'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            Response Testing
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Connection Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* History button */}
          <button
            onClick={onOpenHistory}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Recent optimizations"
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 text-[11px] font-mono text-stone-500">
                ({historyCount})
              </span>
            )}
          </button>

          {/* Model & Ollama Status pill */}
          <button
            onClick={onOpenSettings}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
              isOnline
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/60'
                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200/80'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isOnline
                  ? health.modelInstalled
                    ? 'bg-emerald-600'
                    : 'bg-amber-500'
                  : 'bg-stone-400'
              }`}
            />
            <span className="font-mono text-[11px] max-w-[110px] truncate">
              {health.configuredModel}
            </span>
            <span className="text-[11px] text-stone-500 hidden lg:inline">
              {isChecking
                ? 'checking'
                : isOnline
                ? health.modelInstalled
                  ? 'ready'
                  : 'missing'
                : 'offline'}
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>

          {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && <UserButton />}

          {/* GitHub link */}
          <a
            href="https://github.com/tokenwise/tokenwise"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
