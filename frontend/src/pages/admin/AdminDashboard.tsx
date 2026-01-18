import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, 
  Users, 
  Download, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatNumber } from '@/utils/format';
import type { PlatformStats } from '@/types';

// Composant pour les statistiques rapides
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  change?: number;
  changeLabel?: string;
}> = ({ title, value, icon: Icon, color, change, changeLabel }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(value)}
          </p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% {changeLabel}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Composant pour les livres populaires
const PopularBooksList: React.FC<{ books: any[]; title: string }> = ({ books, title }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {books.slice(0, 5).map((book, index) => (
          <div key={book.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {book.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {book.author}
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {title.includes('téléchargés') ? book.downloadCount : book.favoriteCount}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const AdminDashboard: React.FC = () => {
  // Récupérer les statistiques de la plateforme
  const { data: stats, isLoading } = useQuery<PlatformStats>(
    'platform-stats',
    () => apiService.getPlatformStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 30 * 1000, // Actualiser toutes les 30 secondes
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Impossible de charger les statistiques de la plateforme.
        </p>
      </div>
    );
  }

  const weeklyGrowth = stats.downloadsLastWeek > 0 
    ? ((stats.downloadsLastWeek / (stats.totalDownloads - stats.downloadsLastWeek)) * 100)
    : 0;

  const monthlyGrowth = stats.downloadsLastMonth > 0
    ? ((stats.downloadsLastMonth / (stats.totalDownloads - stats.downloadsLastMonth)) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>Tableau de bord Admin | Online Library Platform</title>
        <meta name="description" content="Tableau de bord administrateur avec statistiques et métriques" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vue d'ensemble de votre plateforme de bibliothèque
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.location.href = '/admin/analytics'}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics détaillées
            </Button>
            <Button onClick={() => window.location.href = '/admin/books'}>
              <BookOpen className="w-4 h-4 mr-2" />
              Gérer les livres
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <StatCard
              title="Total des livres"
              value={stats.totalBooks}
              icon={BookOpen}
              color="bg-blue-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Utilisateurs actifs"
              value={stats.totalUsers}
              icon={Users}
              color="bg-green-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Téléchargements"
              value={stats.totalDownloads}
              icon={Download}
              color="bg-purple-500"
              change={weeklyGrowth}
              changeLabel="cette semaine"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Catégories"
              value={stats.totalCategories}
              icon={PieChart}
              color="bg-orange-500"
            />
          </motion.div>
        </div>

        {/* Graphiques et listes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Livres les plus téléchargés */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PopularBooksList
              books={stats.mostDownloadedBooks}
              title="Livres les plus téléchargés"
            />
          </motion.div>

          {/* Livres les plus aimés */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PopularBooksList
              books={stats.mostFavoritedBooks}
              title="Livres les plus aimés"
            />
          </motion.div>
        </div>

        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Activité récente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.downloadsLastWeek}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Téléchargements cette semaine
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.downloadsLastMonth}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Téléchargements ce mois
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(monthlyGrowth)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Croissance mensuelle
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => window.location.href = '/admin/books'}
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Ajouter un livre</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => window.location.href = '/admin/users'}
                >
                  <Users className="w-6 h-6" />
                  <span>Gérer les utilisateurs</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => window.location.href = '/admin/analytics'}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span>Voir les analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};