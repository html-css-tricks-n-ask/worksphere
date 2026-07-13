import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../redux/store';
import { ThemeProvider } from '../providers/ThemeProvider';
import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppRoutes } from '../routes/index';
import '../styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null
    , React.createElement(ErrorBoundary, null
      , React.createElement(ReduxProvider, { store: store,}
        , React.createElement(ThemeProvider, null
          , React.createElement(ReactQueryProvider, null
            , React.createElement(BrowserRouter, null
              , React.createElement(AppRoutes, null )
            )
          )
        )
      )
    )
  )
);

// Register PWA service worker in production environments
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
      .catch((err) => console.error('PWA Service Worker registration failed:', err));
  });
}
