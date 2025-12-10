import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Configurar React Query con opciones optimizadas para rendimiento
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - datos considerados frescos
      gcTime: 1000 * 60 * 10, // 10 minutos - tiempo en caché después de no usarse
      refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
      refetchOnMount: false, // No refetch al montar si hay datos en caché
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