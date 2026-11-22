import { LogIn, LogOut, MessageSquare, Moon, Sun } from 'lucide-react';
import type { UserProfile, UserRole } from '../types/marketplace';

interface WorkspaceBarProps {
  profile: UserProfile;
  isDark: boolean;
  onToggleTheme: () => void;
  onChangeRole: (role: UserRole) => void;
  dealsCount: number;
  onOpenDealRoom: () => void;
  isFirebaseAuthenticated: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  authLoading: boolean;
}

export function WorkspaceBar({
  profile,
  isDark,
  onToggleTheme,
  onChangeRole,
  dealsCount,
  onOpenDealRoom,
  isFirebaseAuthenticated,
  onSignInGoogle,
  onSignOut,
  authLoading,
}: WorkspaceBarProps) {
  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0F1521]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 overflow-x-auto">
        {/* Role Perspective Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="hidden sm:inline">Workspace </span>Role
          </span>
          <div
            role="group"
            aria-label="Workspace role switcher"
            className="inline-flex items-center rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5"
          >
            <button
              type="button"
              onClick={() => onChangeRole('poster')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                profile.activeRole === 'poster'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Problem Poster
            </button>
            <button
              type="button"
              onClick={() => onChangeRole('builder')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                profile.activeRole === 'builder'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Builder
            </button>
          </div>
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenDealRoom}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Deal Room</span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              ({dealsCount})
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          {isFirebaseAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                {profile.displayName}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={authLoading}
              onClick={onSignInGoogle}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-blue-500 dark:hover:border-blue-400 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <LogIn className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
