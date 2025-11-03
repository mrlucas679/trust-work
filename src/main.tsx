import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes"
import App from './App.tsx'
import { SupabaseProvider } from './providers/SupabaseProvider'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import './index.css'

// Initialize Sentry for error tracking
initSentry();

createRoot(document.getElementById("root")!).render(
  <SentryErrorBoundary fallback={<div>An error occurred. Please refresh the page.</div>}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </ThemeProvider>
  </SentryErrorBoundary>
);
