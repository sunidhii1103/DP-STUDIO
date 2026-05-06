/* ============================================================================
 * DPVis — App Context & Provider
 * Single source of truth for all visualization state (SRS §3.3).
 * Implemented with React Context + useReducer (no Redux in v1.0).
 * ============================================================================ */

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { appReducer } from './AppReducer';
import { initialState, type AppState } from './initialState';
import type { AppAction } from './actions';

/* ── Context Definition ───────────────────────────────────────────────────── */

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/* ── Provider ─────────────────────────────────────────────────────────────── */

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────────────────────────────── */

/**
 * Access the global AppState and dispatch function.
 * AGENTS.md §6.3: Prefer selector hooks (useCurrentStep, usePlayback)
 * over raw context for component subscriptions.
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
