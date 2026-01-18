import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster, toast } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Store
import { useAuthStore, useAppStore } from '@/store';

// Components
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { BooksPage } from '@/pages/books/BooksPage';
import { BookDetailPage } from '@/pages/books/BookDetailPage';
import { FavoritesPage } from '@/pages/user/FavoritesPage';
import { ProfilePage } from '@/pages/user/ProfilePage';
import { DownloadsPage } from '@/pages/user/DownloadsPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminBooksPage } from '@/pages/admin/AdminBooksPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const { validateToken, isLoading: authLoading } = useAuthStore();
  const { theme, setTheme } = useAppStore();

  // Initialiser l'application
  useEffect(() => {
    // Valider le token au démarrage
    validateToken();

    // Écouter les événements de déconnexion automatique
    const handleAutoLogout = () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        toast.error('Session expirée. Veuillez vous reconnecter.');
      }
    };

    window.addEventListener('auth:logout', handleAutoLogout);

    // Appliquer le thème initial
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Détecter les préférences système si pas de thème défini
    if (!localStorage.getItem('app-storage')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    // Cleanup
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [validateToken, theme, setTheme]);

  // Afficher un spinner pendant la validation du token
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Routes avec layout */}
              <Route path="/" element={<Layout />}>
                {/* Page d'accueil */}
                <Route index element={<HomePage />} />
                
                {/* Pages des livres */}
                <Route path="books" element={<BooksPage />} />
                <Route path="books/:id" element={<BookDetailPage />} />
                
                {/* Routes protégées utilisateur */}
                <Route element={<ProtectedRoute />}>
                  <Route path="favorites" element={<FavoritesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="downloads" element={<DownloadsPage />} />
                </Route>
                
                {/* Routes admin */}
                <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/books" element={<AdminBooksPage />} />
                  <Route path="admin/users" element={<AdminUsersPage />} />
                  <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
                </Route>
              </Route>
              
              {/* Page 404 */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
              style: {
                background: theme === 'dark' ? '#1f2937' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000',
              },
            }}
          />
        </Router>
        
        {/* React Query DevTools (uniquement en développement) */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;