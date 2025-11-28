import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes"
import App from './App.tsx'
import { SupabaseProvider } from './providers/SupabaseProvider'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import './index.css'

// Initialize Sentry for error tracking
initSentry();

createRoot(document.getElementById("root")!).render(
  <SentryErrorBoundary fallback={<div className="flex items-center justify-center min-h-screen p-4 text-center"><div><h1 className="text-xl font-semibold mb-2">Something went wrong</h1><p className="text-muted-foreground mb-4">An unexpected error occurred. Please refresh the page.</p><button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Refresh Page</button></div></div>}>
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
