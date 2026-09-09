import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './store'; // Initializes dev window.__store per PHASES.md §0.4
import './styles/tokens.css';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
