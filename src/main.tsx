import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes"
import App from './App.tsx'
import { SupabaseProvider } from './providers/SupabaseProvider'
import './index.css'

createRoot(document.getElementById("root")!).render(
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
);
