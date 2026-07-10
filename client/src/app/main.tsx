import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../redux/store.js';
import { ThemeProvider } from '../providers/ThemeProvider.js';
import { ReactQueryProvider } from '../providers/ReactQueryProvider.js';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import { AppRoutes } from '../routes/index.js';
import '../styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeProvider>
          <ReactQueryProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ReactQueryProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
