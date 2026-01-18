import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';
import type { 
  Book, 
  PaginatedResponse, 
  SearchParams, 
  BookCreateRequest, 
  BookUpdateRequest 
} from '@/types';

// Clés de cache pour React Query
export const BOOKS_QUERY_KEYS = {
  all: ['books'] as const,
  lists: () => [...BOOKS_QUERY_KEYS.all, 'list'] as const,
  list: (params: SearchParams) => [...BOOKS_QUERY_KEYS.lists(), params] as const,
  details: () => [...BOOKS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BOOKS_QUERY_KEYS.details(), id] as const,
  search: (params: SearchParams) => [...BOOKS_QUERY_KEYS.all, 'search', params] as const,
  category: (categoryId: number, page: number, size: number) => 
    [...BOOKS_QUERY_KEYS.all, 'category', categoryId, page, size] as const,
};

// Hook pour récupérer la liste des livres
export const useBooks = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.list(params),
    queryFn: () => apiService.getBooks(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer un livre par ID
export const useBook = (id: number, enabled = true) => {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.detail(id),
    queryFn: () => apiService.getBook(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour la recherche de livres
export const useSearchBooks = (params: SearchParams) => {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.search(params),
    queryFn: () => apiService.searchBooks(params),
    enabled: !!params.query,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour récupérer les livres par catégorie
export const useBooksByCategory = (categoryId: number, page = 0, size = 12) => {
  return useQuery({
    queryKey: BOOKS_QUERY_KEYS.category(categoryId, page, size),
    queryFn: () => apiService.getBooksByCategory(categoryId, page, size),
    enabled: !!categoryId,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook pour créer un livre
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, file }: { data: BookCreateRequest; file?: File }) => apiService.createBook(data, file),
    onSuccess: (newBook) => {
      // Invalider les caches des listes de livres
      queryClient.invalidateQueries(BOOKS_QUERY_KEYS.lists());
      
      // Ajouter le nouveau livre au cache
      queryClient.setQueryData(BOOKS_QUERY_KEYS.detail(newBook.id), newBook);
      
      toast.success('Livre créé avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du livre');
    },
  });
};

// Hook pour mettre à jour un livre
export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, file }: { id: number; data: BookUpdateRequest; file?: File }) => 
      apiService.updateBook(id, data, file),
    onSuccess: (updatedBook) => {
      // Mettre à jour le cache du livre
      queryClient.setQueryData(BOOKS_QUERY_KEYS.detail(updatedBook.id), updatedBook);
      
      // Invalider les listes pour refléter les changements
      queryClient.invalidateQueries(BOOKS_QUERY_KEYS.lists());
      
      toast.success('Livre mis à jour avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du livre');
    },
  });
};

// Hook pour supprimer un livre
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteBook(id),
    onSuccess: (_, deletedId) => {
      // Supprimer du cache
      queryClient.removeQueries(BOOKS_QUERY_KEYS.detail(deletedId));
      
      // Invalider les listes
      queryClient.invalidateQueries(BOOKS_QUERY_KEYS.lists());
      
      toast.success('Livre supprimé avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du livre');
    },
  });
};

// Hook pour uploader un PDF
export const useUploadBookPdf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, file }: { bookId: number; file: File }) => 
      apiService.uploadBookPdf(bookId, file),
    onSuccess: (_, { bookId }) => {
      // Invalider le cache du livre pour récupérer les nouvelles données
      queryClient.invalidateQueries(BOOKS_QUERY_KEYS.detail(bookId));
      
      toast.success('PDF uploadé avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload du PDF');
    },
  });
};

// Hook pour uploader une couverture
export const useUploadBookCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, file }: { bookId: number; file: File }) => 
      apiService.uploadBookCover(bookId, file),
    onSuccess: (_, { bookId }) => {
      // Invalider le cache du livre pour récupérer les nouvelles données
      queryClient.invalidateQueries(BOOKS_QUERY_KEYS.detail(bookId));
      
      toast.success('Couverture uploadée avec succès !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload de la couverture');
    },
  });
};

// Hook pour télécharger un livre
export const useDownloadBook = () => {
  return useMutation({
    mutationFn: (bookId: number) => apiService.downloadBook(bookId),
    onSuccess: (blob, bookId) => {
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `book-${bookId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Téléchargement démarré !');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du téléchargement');
    },
  });
};

// Hook personnalisé pour la pagination
export const useBooksWithPagination = (initialParams: SearchParams = {}) => {
  const [params, setParams] = useState(initialParams);
  const query = useBooks(params);

  const goToPage = (page: number) => {
    setParams(prev => ({ ...prev, page }));
  };

  const changePageSize = (size: number) => {
    setParams(prev => ({ ...prev, size, page: 0 }));
  };

  const updateFilters = (newParams: Partial<SearchParams>) => {
    setParams(prev => ({ ...prev, ...newParams, page: 0 }));
  };

  return {
    ...query,
    params,
    goToPage,
    changePageSize,
    updateFilters,
  };
};

// Hook pour les statistiques de livres (pour les graphiques)
export const useBooksStats = () => {
  return useQuery({
    queryKey: ['books', 'stats'],
    queryFn: async () => {
      // Cette fonction pourrait appeler plusieurs endpoints pour récupérer des stats
      const [books, categories] = await Promise.all([
        apiService.getBooks({ size: 1000 }), // Récupérer beaucoup de livres pour les stats
        apiService.getCategories(),
      ]);

      // Calculer des statistiques côté client
      const totalBooks = books.totalElements;
      const booksByCategory = categories.map(category => ({
        name: category.name,
        count: books.content.filter(book => book.categoryId === category.id).length,
      }));

      const booksByYear = books.content.reduce((acc, book) => {
        const year = book.publicationYear || 'Inconnu';
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalBooks,
        booksByCategory,
        booksByYear: Object.entries(booksByYear).map(([year, count]) => ({
          year,
          count,
        })),
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};