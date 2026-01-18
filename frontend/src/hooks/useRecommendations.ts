import React from 'react';
import { useQuery } from 'react-query';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { Recommendation, Book } from '@/types';

// Clés de cache pour React Query
export const RECOMMENDATIONS_QUERY_KEYS = {
  all: ['recommendations'] as const,
  personalized: () => [...RECOMMENDATIONS_QUERY_KEYS.all, 'personalized'] as const,
  category: (categoryId: number) => [...RECOMMENDATIONS_QUERY_KEYS.all, 'category', categoryId] as const,
  similar: (bookId: number) => [...RECOMMENDATIONS_QUERY_KEYS.all, 'similar', bookId] as const,
  trending: () => [...RECOMMENDATIONS_QUERY_KEYS.all, 'trending'] as const,
};

// Hook pour les recommandations personnalisées
export const usePersonalizedRecommendations = (limit = 10) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEYS.personalized(),
    queryFn: () => apiService.getPersonalizedRecommendations(limit),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

// Hook pour les recommandations par catégorie
export const useCategoryRecommendations = (categoryId: number, limit = 10) => {
  return useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEYS.category(categoryId),
    queryFn: () => apiService.getCategoryRecommendations(categoryId, limit),
    enabled: !!categoryId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};

// Hook pour les livres similaires
export const useSimilarBooks = (bookId: number, limit = 10) => {
  return useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEYS.similar(bookId),
    queryFn: () => apiService.getSimilarBooks(bookId, limit),
    enabled: !!bookId,
    staleTime: 20 * 60 * 1000, // 20 minutes
    retry: 1,
  });
};

// Hook pour les recommandations tendances
export const useTrendingRecommendations = (limit = 10) => {
  return useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEYS.trending(),
    queryFn: () => apiService.getTrendingRecommendations(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook générique pour les recommandations (utilisé dans BookDetailPage)
export const useRecommendations = (bookId: number, limit = 6) => {
  const { user } = useAuthStore();

  // Si l'utilisateur est connecté, on privilégie les recommandations personnalisées
  // Sinon, on utilise les livres similaires
  const personalizedQuery = usePersonalizedRecommendations(limit);
  const similarBooksQuery = useSimilarBooks(bookId, limit);

  // Retourner les données appropriées selon le contexte
  if (user && personalizedQuery.data) {
    // Convertir les recommandations en livres simples
    const books: Book[] = personalizedQuery.data.map(rec => rec.book);
    return {
      data: books,
      isLoading: personalizedQuery.isLoading,
      error: personalizedQuery.error,
      refetch: personalizedQuery.refetch,
    };
  } else {
    // Utiliser les livres similaires
    const books: Book[] = similarBooksQuery.data?.map(rec => rec.book) || [];
    return {
      data: books,
      isLoading: similarBooksQuery.isLoading,
      error: similarBooksQuery.error,
      refetch: similarBooksQuery.refetch,
    };
  }
};

// Hook pour obtenir des recommandations mixtes pour la page d'accueil
export const useHomeRecommendations = () => {
  const { user } = useAuthStore();

  const personalizedQuery = usePersonalizedRecommendations(8);
  const trendingQuery = useTrendingRecommendations(8);

  return {
    personalized: {
      data: personalizedQuery.data,
      isLoading: personalizedQuery.isLoading,
      error: personalizedQuery.error,
    },
    trending: {
      data: trendingQuery.data,
      isLoading: trendingQuery.isLoading,
      error: trendingQuery.error,
    },
    // Recommandations à afficher (personnalisées si connecté, sinon tendances)
    featured: user ? personalizedQuery : trendingQuery,
  };
};

// Hook pour les recommandations basées sur l'historique de l'utilisateur
export const useUserBasedRecommendations = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['recommendations', 'user-based'],
    queryFn: async () => {
      // Récupérer les favoris de l'utilisateur
      const favorites = await apiService.getUserFavorites();
      
      if (favorites.length === 0) {
        // Si pas de favoris, retourner les tendances
        return apiService.getTrendingRecommendations(10);
      }

      // Récupérer des recommandations basées sur les catégories favorites
      const categoryIds = [...new Set(favorites.map(book => book.categoryId))];
      const recommendations = await Promise.all(
        categoryIds.map(categoryId => 
          apiService.getCategoryRecommendations(categoryId, 3)
        )
      );

      // Fusionner et mélanger les recommandations
      const allRecommendations = recommendations.flat();
      return allRecommendations
        .sort(() => Math.random() - 0.5) // Mélanger
        .slice(0, 10); // Limiter à 10
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Hook pour les statistiques de recommandations (pour les analytics)
export const useRecommendationStats = () => {
  const personalizedQuery = usePersonalizedRecommendations(100);
  const trendingQuery = useTrendingRecommendations(100);

  const stats = React.useMemo(() => {
    const personalized = personalizedQuery.data || [];
    const trending = trendingQuery.data || [];

    // Calculer les scores moyens
    const avgPersonalizedScore = personalized.length > 0
      ? personalized.reduce((sum, rec) => sum + rec.score, 0) / personalized.length
      : 0;

    const avgTrendingScore = trending.length > 0
      ? trending.reduce((sum, rec) => sum + rec.score, 0) / trending.length
      : 0;

    // Analyser les types de recommandations
    const recommendationTypes = personalized.reduce((acc, rec) => {
      acc[rec.recommendationType] = (acc[rec.recommendationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPersonalized: personalized.length,
      totalTrending: trending.length,
      avgPersonalizedScore: Math.round(avgPersonalizedScore * 100) / 100,
      avgTrendingScore: Math.round(avgTrendingScore * 100) / 100,
      recommendationTypes,
    };
  }, [personalizedQuery.data, trendingQuery.data]);

  return {
    stats,
    isLoading: personalizedQuery.isLoading || trendingQuery.isLoading,
  };
};