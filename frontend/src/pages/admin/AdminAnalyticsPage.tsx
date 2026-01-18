import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Users, 
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatNumber } from '@/utils/format';

// Composant pour les graphiques (simulation)
const ChartPlaceholder: React.FC<{ title: string; type: 'bar' | 'pie' | 'line' }> = ({ title, type }) => (
  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
    <div className="text-center">
      {type === 'bar' && <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
      {type === 'pie' && <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
      {type === 'line' && <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
      <p className="text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xs text-gray-400 mt-1">Graphique interactif</p>
    </div>
  </div>
);

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Récupérer les données analytiques
  const { data: analytics, isLoading, refetch } = useQuery(
    ['analytics', timeRange],
    () => apiService.getAnalytics(timeRange),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: categoryStats } = useQuery(
    'category-stats',
    () => apiService.getCategoryStats(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const { data: authorStats } = useQuery(
    'author-stats',
    () => apiService.getAuthorStats(),
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  const { data: userActivity } = useQuery(
    ['user-activity', timeRange],
    () => apiService.getUserActivity(timeRange),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const timeRangeLabels = {
    '7d': '7 derniers jours',
    '30d': '30 derniers jours',
    '90d': '3 derniers mois',
    '1y': 'Dernière année',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics | Admin - Online Library Platform</title>
        <meta name="description" content="Tableau de bord analytique avec métriques détaillées" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics avancées
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analyse détaillée des performances de votre plateforme
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sélecteur de période */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {Object.entries(timeRangeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Métriques principales */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Téléchargements
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(analytics.totalDownloads)}
                      </p>
                      <p className="text-sm text-green-600">
                        +{analytics.downloadGrowth}% vs période précédente
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-500">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Utilisateurs actifs
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(analytics.activeUsers)}
                      </p>
                      <p className="text-sm text-green-600">
                        +{analytics.userGrowth}% vs période précédente
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Nouveaux livres
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(analytics.newBooks)}
                      </p>
                      <p className="text-sm text-blue-600">
                        {analytics.booksPerDay} par jour en moyenne
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-500">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Taux d'engagement
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {analytics.engagementRate}%
                      </p>
                      <p className="text-sm text-green-600">
                        Excellent niveau d'engagement
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-500">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des téléchargements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Évolution des téléchargements</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Graphique linéaire des téléchargements" type="line" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Répartition par catégories */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="Graphique en secteurs des catégories" type="pie" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top catégories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats?.slice(0, 5).map((category, index) => (
                    <div key={category.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {category.categoryName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.bookCount} livres
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatNumber(category.totalDownloads)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          téléchargements
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top auteurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Auteurs populaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {authorStats?.slice(0, 5).map((author, index) => (
                    <div key={author.authorName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {author.authorName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {author.bookCount} livres
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatNumber(author.totalDownloads)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          téléchargements
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Utilisateurs les plus actifs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs les plus actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity?.slice(0, 5).map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.downloadCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          téléchargements
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Graphique d'activité hebdomadaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Activité hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder title="Graphique en barres de l'activité par jour" type="bar" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};