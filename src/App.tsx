import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import AppShell from './components/layout/AppShell';
import HomePage from './components/home/HomePage';

const HAS_VISITED_APP_KEY = 'classforge.hasVisitedApp';

function readHasVisitedApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(HAS_VISITED_APP_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Phase 37 — a pre-app marketing homepage sits in front of the workspace.
 * This is a pure client-side view toggle, not a router (PRD.md §7.1 keeps
 * the app itself single-route) — switching views never touches the app's
 * own localStorage-persisted state (documents/profiles/attempts).
 */
export function App() {
  const [view, setView] = useState<'home' | 'app'>(() => (readHasVisitedApp() ? 'app' : 'home'));

  const enterApp = () => {
    try {
      window.localStorage.setItem(HAS_VISITED_APP_KEY, 'true');
    } catch {
      // Best-effort only — still enter the app even if storage is blocked.
    }
    setView('app');
  };

  const goHome = () => setView('home');

  if (view === 'home') {
    return <HomePage onLaunch={enterApp} />;
  }

  return (
    <ReactFlowProvider>
      <AppShell onGoHome={goHome} />
    </ReactFlowProvider>
  );
}

export default App;
