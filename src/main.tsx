import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './i18n/i18nContext';
import './index.css';
import { ThemeProvider } from './theme/themeContext';
import { App } from './ui/App';

const rootEl = document.getElementById('root');

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ThemeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
