import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types';

// Clés de cache pour React Query
export const FAVORITES_QUERY_KEYS = {
  all: ['favorites'] as const,
  list: () => [...FAVORITES_QUERY_KEYS.all, 'list'] as const,
};

// Hook pour récupérer les favoris de l'utilisateur
export const useFavorites = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Récupérer la liste des favoris
  const favoritesQuery = useQuery({
    queryKey: FAVORITES_QUERY_KEYS.list(),
    queryFn: () => apiService.getUserFavorites(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Ajouter aux favoris
  const addToFavoritesMutation = useMutation({
    mutationFn: (bookId: number) => apiService.addToFavorites(bookId),
    onSuccess: (_, bookId) => {
      // Invalider et refetch les favoris
      queryClient.invalidateQueries(FAVORITES_QUERY_KEYS.list());
      
      // Mettre à jour le cache des livres pour marquer comme favori
      queryClient.setQueriesData(['books'], (oldData: any) => {
        if (oldData?.content) {
          return {
            ...oldData,
            content: oldData.content.map((book: Book) =>
              book.id === bookId ? { ...book, isFavorite: true } : book
            ),
          };
        }
        return oldData;
      });

      toast.success('Livre ajouté aux favoris !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout aux favoris');
    },
  });

  // Retirer des favoris
  const removeFromFavoritesMutation = useMutation({
    mutationFn: (bookId: number) => apiService.removeFromFavorites(bookId),
    onSuccess: (_, bookId) => {
      // Invalider et refetch les favoris
      queryClient.invalidateQueries(FAVORITES_QUERY_KEYS.list());
      
      // Mettre à jour le cache des livres pour démarquer comme favori
      queryClient.setQueriesData(['books'], (oldData: any) => {
        if (oldData?.content) {
          return {
            ...oldData,
            content: oldData.content.map((book: Book) =>
              book.id === bookId ? { ...book, isFavorite: false } : book
            ),
          };
        }
        return oldData;
      });

      toast.success('Livre retiré des favoris !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression des favoris');
    },
  });

  // Vider tous les favoris
  const clearAllFavoritesMutation = useMutation({
    mutationFn: async () => {
      // Comme il n'y a pas d'endpoint pour vider tous les favoris,
      // on supprime un par un
      const favorites = favoritesQuery.data || [];
      await Promise.all(
        favorites.map(book => apiService.removeFromFavorites(book.id))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(FAVORITES_QUERY_KEYS.list());
      queryClient.setQueriesData(['books'], (oldData: any) => {
        if (oldData?.content) {
          return {
            ...oldData,
            content: oldData.content.map((book: Book) => ({ ...book, isFavorite: false })),
          };
        }
        return oldData;
      });
      toast.success('Tous les favoris ont été supprimés !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression des favoris');
    },
  });

  // Fonction pour basculer le statut favori d'un livre
  const toggleFavorite = (bookId: number) => {
    const favorites = favoritesQuery.data || [];
    const isFavorite = favorites.some(book => book.id === bookId);
    
    if (isFavorite) {
      removeFromFavoritesMutation.mutate(bookId);
    } else {
      addToFavoritesMutation.mutate(bookId);
    }
  };

  // Fonction pour vérifier si un livre est en favori
  const isFavorite = (bookId: number): boolean => {
    const favorites = favoritesQuery.data || [];
    return favorites.some(book => book.id === bookId);
  };

  return {
    // Données
    data: favoritesQuery.data,
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error,
    
    // Actions
    toggleFavorite,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
    clearAllFavorites: clearAllFavoritesMutation.mutate,
    
    // États des mutations
    isToggling: addToFavoritesMutation.isLoading || removeFromFavoritesMutation.isLoading,
    isAdding: addToFavoritesMutation.isLoading,
    isRemoving: removeFromFavoritesMutation.isLoading,
    isClearing: clearAllFavoritesMutation.isLoading,
    
    // Utilitaires
    isFavorite,
    refetch: favoritesQuery.refetch,
  };
};

// Hook pour vérifier si un livre spécifique est en favori
export const useIsFavorite = (bookId: number) => {
  const { data: favorites } = useQuery({
    queryKey: FAVORITES_QUERY_KEYS.list(),
    queryFn: () => apiService.getUserFavorites(),
    staleTime: 5 * 60 * 1000,
  });

  return favorites?.some(book => book.id === bookId) || false;
};

// Hook pour les statistiques des favoris
export const useFavoritesStats = () => {
  const { data: favorites, isLoading } = useFavorites();

  const stats = React.useMemo(() => {
    if (!favorites) return null;

    // Calculer les statistiques
    const totalFavorites = favorites.length;
    
    // Catégories les plus aimées
    const categoryCount = favorites.reduce((acc, book) => {
      acc[book.categoryName] = (acc[book.categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Auteurs les plus aimés
    const authorCount = favorites.reduce((acc, book) => {
      acc[book.author] = (acc[book.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topAuthors = Object.entries(authorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalFavorites,
      topCategories,
      topAuthors,
    };
  }, [favorites]);

  return {
    stats,
    isLoading,
  };
};