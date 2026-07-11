import * as React from "react"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/providers'
import { AppRouter } from './app/router'
import { AuthProvider } from './components/auth/AuthProvider'
import './styles/globals.css'

import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AuthProvider>
        <AppRouter />
        <Toaster theme="dark" position="bottom-right" className="!font-sans" toastOptions={{ className: "border border-white/10 bg-background/80 backdrop-blur-md shadow-2xl rounded-2xl text-foreground" }} />
      </AuthProvider>
    </AppProviders>
  </StrictMode>,
);
