import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './features/auth/context/AuthContext.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Configurar React Query con opciones optimizadas para rendimiento
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mesa de ayuda: los reportes cambian seguido. 30 s de caché y, al volver a una
      // pantalla, se recarga en segundo plano si los datos son más viejos.
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 10, // 10 minutos - tiempo en caché después de no usarse
      refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
      refetchOnMount: true,
      retry: 1, // Solo reintentar 1 vez en caso de error
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)