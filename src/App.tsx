
import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import AppShell from './components/layout/AppShell';
import HomePage from './components/home/HomePage';

/**
 * Main App entry point.
 * Defaults to the marketing homepage / landing page on root load or page refresh.
 * Switching to the workspace ('app') is session-driven so refreshing always returns
 * to the landing page as requested by user.
 */
export function App() {
  const [view, setView] = useState<'home' | 'app'>('home');

  useEffect(() => {
    // Clean up any legacy localStorage key that previously forced redirect to app
    try {
      window.localStorage.removeItem('classforge.hasVisitedApp');
    } catch {
      // ignore
    }
  }, []);

  const enterApp = () => {
    setView('app');
  };

  const goHome = () => {
    setView('home');
  };

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
