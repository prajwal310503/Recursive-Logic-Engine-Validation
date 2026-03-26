import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GraphProvider } from './store/graphContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GraphProvider>
      <App />
    </GraphProvider>
  </React.StrictMode>
);
