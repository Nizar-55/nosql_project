import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, 
  Users, 
  Download, 
  Star, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Heart,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RecommendationSection } from '@/components/recommendations/RecommendationSection';
import { BookGrid } from '@/components/books/BookGrid';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useHomeRecommendations } from '@/hooks/useRecommendations';
import { useBooks } from '@/hooks/useBooks';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { personalized, trending } = useHomeRecommendations();
  
  // Récupérer les nouveaux livres et les plus populaires
  const { data: newBooks } = useBooks({ 
    sortBy: 'createdAt', 
    sortDir: 'desc', 
    size: 8 
  });
  
  const { data: popularBooks } = useBooks({ 
    sortBy: 'downloadCount', 
    sortDir: 'desc', 
    size: 8 
  });

  const stats = [
    { label: 'Livres disponibles', value: '10,000+', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Utilisateurs actifs', value: '5,000+', icon: Users, color: 'text-green-600' },
    { label: 'Téléchargements', value: '50,000+', icon: Download, color: 'text-purple-600' },
    { label: 'Note moyenne', value: '4.8/5', icon: Star, color: 'text-yellow-600' },
  ];

  const features = [
    {
      title: 'Recommandations IA',
      description: 'Notre algorithme intelligent analyse vos préférences pour vous suggérer les livres parfaits.',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Bibliothèque Immense',
      description: 'Accédez à des milliers de livres dans toutes les catégories et langues.',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Lecture Hors Ligne',
      description: 'Téléchargez vos livres favoris et lisez-les partout, même sans connexion.',
      icon: Download,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Communauté Active',
      description: 'Rejoignez une communauté de lecteurs passionnés et partagez vos découvertes.',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Accueil - Online Library Platform</title>
        <meta 
          name="description" 
          content="Découvrez des milliers de livres avec notre système de recommandation intelligent. Rejoignez la plus grande bibliothèque en ligne." 
        />
      </Helmet>

      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 rounded-2xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative px-8 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                  Votre bibliothèque
                  <span className="block text-yellow-300">intelligente</span>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                  Découvrez des milliers de livres avec notre système de recommandation IA
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                {isAuthenticated ? (
                  <Link 
                    to="/books"
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-colors"
                  >
                    Explorer les livres
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/register"
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-colors"
                    >
                      Commencer gratuitement
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <Link 
                      to="/books"
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg border border-white text-white hover:bg-white hover:text-primary-600 transition-colors"
                    >
                      Parcourir les livres
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Recherche rapide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="max-w-md mx-auto"
              >
                <div className="relative">
                  <Input
                    placeholder="Rechercher un livre, un auteur..."
                    className="bg-white/10 border-white/20 text-white placeholder-white/70 backdrop-blur-sm"
                    leftIcon={<Search className="w-4 h-4 text-white/70" />}
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-primary-600 hover:bg-gray-100"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <stat.icon className={cn('w-8 h-8 mx-auto mb-3', stat.color)} />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recommandations personnalisées */}
        {isAuthenticated && personalized.data && personalized.data.length > 0 && (
          <RecommendationSection
            title={`Bonjour ${user?.firstName} !`}
            description="Vos recommandations personnalisées"
            books={personalized.data?.map(rec => rec.book) || []}
            loading={personalized.isLoading}
            error={personalized.error as Error | null}
            viewAllLink="/recommendations"
          />
        )}

        {/* Tendances */}
        {trending.data && trending.data.length > 0 && (
          <RecommendationSection
            title="Tendances du moment"
            description="Les livres les plus populaires cette semaine"
            books={trending.data?.map(rec => rec.book) || []}
            loading={trending.isLoading}
            error={trending.error as Error | null}
            viewAllLink="/books?sort=trending"
          />
        )}

        {/* Nouveautés */}
        {newBooks && newBooks.content.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nouveautés
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Les derniers livres ajoutés à notre collection
                </p>
              </div>
              <Link 
                to="/books?sort=newest"
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <BookGrid
              books={newBooks.content}
              variant="default"
              className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            />
          </section>
        )}

        {/* Fonctionnalités */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir notre plateforme ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une expérience de lecture moderne avec des fonctionnalités avancées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={cn('w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center', feature.bgColor)}>
                      <feature.icon className={cn('w-6 h-6', feature.color)} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        {!isAuthenticated && (
          <section className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à commencer votre aventure littéraire ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Rejoignez des milliers de lecteurs et découvrez votre prochain livre favori
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-colors"
              >
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg border border-white text-white hover:bg-white hover:text-primary-600 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
};