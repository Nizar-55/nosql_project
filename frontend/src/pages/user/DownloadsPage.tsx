import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Download, 
  Calendar, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Search, 
  X,
  FileText,
  Clock,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDate, formatFileSize } from '../../utils/format';
import { cn } from '../../utils/cn';
import type { DownloadHistory } from '../../types';

const SORT_OPTIONS = [
  { value: 'downloadedAt', label: 'Plus récents', icon: SortDesc },
  { value: 'title', label: 'Titre A-Z', icon: SortAsc },
  { value: 'author', label: 'Auteur A-Z', icon: SortAsc },
  { value: 'category', label: 'Catégorie', icon: SortAsc },
];

export const DownloadsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('downloadedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Récupérer l'historique des téléchargements
  const { data: downloads, isLoading, refetch, error } = useQuery(
    ['downloads', user?.id],
    () => {
      console.log('Fetching downloads for user:', user?.id);
      return apiService.getUserDownloads(0, 100);
    },
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Réessayer seulement une fois
      onError: (error) => {
        console.error('Error fetching downloads:', error);
      },
      onSuccess: (data) => {
        console.log('Downloads fetched successfully:', data);
      }
    }
  );

  // Debug: afficher les données reçues
  console.log('Downloads data:', downloads);
  console.log('Downloads error:', error);
  console.log('User:', user);
  console.log('Is loading:', isLoading);

  // Filtrer et trier les téléchargements
  const processedDownloads = React.useMemo(() => {
    if (!downloads?.content) return [];

    let filtered = [...downloads.content];

    // Vérifier et nettoyer les données
    filtered = filtered.map(download => {
      // S'assurer que le livre existe
      if (!download.book) {
        console.warn('Téléchargement sans livre détecté:', download.id);
        return {
          ...download,
          book: {
            id: 0,
            title: "Livre non disponible",
            author: "Auteur inconnu",
            isbn: undefined,
            description: undefined,
            publicationYear: undefined,
            pageCount: undefined,
            language: undefined,
            coverImage: undefined,
            pdfFile: undefined,
            fileSize: 0,
            downloadCount: 0,
            favoriteCount: 0,
            available: false,
            categoryId: 0,
            categoryName: "Non classé",
            tagNames: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: false,
            recommendationScore: undefined
          }
        };
      }
      return download;
    });

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(download =>
        download.book.title?.toLowerCase().includes(query) ||
        download.book.author?.toLowerCase().includes(query)
      );
    }

    // Filtrer par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(download => 
        download.book.categoryName === selectedCategory
      );
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.book.title?.toLowerCase() || '';
          bValue = b.book.title?.toLowerCase() || '';
          break;
        case 'author':
          aValue = a.book.author?.toLowerCase() || '';
          bValue = b.book.author?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.book.categoryName?.toLowerCase() || '';
          bValue = b.book.categoryName?.toLowerCase() || '';
          break;
        case 'downloadedAt':
        default:
          aValue = new Date(a.downloadedAt).getTime();
          bValue = new Date(b.downloadedAt).getTime();
          break;
      }

      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [downloads, searchQuery, selectedCategory, sortBy, sortDir]);

  // Obtenir les catégories uniques
  const categories = React.useMemo(() => {
    if (!downloads?.content) return [];
    
    const categoryMap = new Map<string, number>();
    downloads.content.forEach(download => {
      // Vérifier que le livre et la catégorie existent
      if (download.book && download.book.categoryName) {
        const count = categoryMap.get(download.book.categoryName) || 0;
        categoryMap.set(download.book.categoryName, count + 1);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [downloads]);

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDir('desc');
    }
  };

  const handleClearHistory = async () => {
    try {
      await apiService.clearDownloadHistory();
      refetch();
      setShowClearDialog(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
    }
  };

  const handleRedownload = async (bookId: number) => {
    try {
      const blob = await apiService.downloadBook(bookId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `book-${bookId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connexion requise
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vous devez être connecté pour voir votre historique de téléchargements.
        </p>
      </div>
    );
  }

  // Afficher les erreurs
  if (error) {
    return (
      <div className="text-center py-12">
        <Download className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Impossible de charger votre historique de téléchargements.
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {error instanceof Error ? error.message : 'Erreur inconnue'}
        </p>
        <Button onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mes téléchargements | Online Library Platform</title>
        <meta name="description" content="Consultez votre historique de téléchargements" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <Download className="w-8 h-8 text-blue-500" />
              <span>Mes téléchargements</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {downloads?.content ? (
                `${downloads.content.length} téléchargement${downloads.content.length > 1 ? 's' : ''} dans votre historique`
              ) : (
                'Chargement de votre historique...'
              )}
            </p>
          </div>

          {/* Actions */}
          {downloads?.content && downloads.content.length > 0 && (
            <div className="flex items-center space-x-3">
              {/* Recherche */}
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Supprimer l'historique */}
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(true)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vider l'historique
              </Button>
            </div>
          )}

          {/* Bouton de test temporaire */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const pingResult = await apiService.ping();
                  console.log('Ping result:', pingResult);
                  alert(`API connectée: ${pingResult.message}`);
                } catch (error) {
                  console.error('Ping error:', error);
                  alert('Erreur de connectivité API');
                }
              }}
              className="text-green-600 border-green-300"
            >
              Test Connectivité
            </Button>
            
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const debugResult = await apiService.debugDownloads();
                  console.log('Debug downloads result:', debugResult);
                  alert(`Debug: ${debugResult.totalDownloads} téléchargements, ${debugResult.downloadsFound} trouvés`);
                } catch (error) {
                  console.error('Debug error:', error);
                  alert('Erreur lors du debug');
                }
              }}
              className="text-purple-600 border-purple-300"
            >
              Debug Downloads
            </Button>
            
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const testResult = await apiService.testDownloads();
                  console.log('Test downloads result:', testResult);
                  alert(`Total téléchargements: ${testResult.totalDownloads}, Récents: ${testResult.recentDownloadsCount}`);
                } catch (error) {
                  console.error('Test error:', error);
                  alert('Erreur lors du test des téléchargements');
                }
              }}
              className="text-blue-600 border-blue-300"
            >
              Test Téléchargements
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const diagnosticResult = await apiService.getDownloadsDiagnostic();
                  console.log('Diagnostic result:', diagnosticResult);
                  alert(`Diagnostic: ${diagnosticResult.totalDownloads} téléchargements total, ${diagnosticResult.downloadsWithBook} avec livre, ${diagnosticResult.downloadsWithoutBook} sans livre`);
                } catch (error) {
                  console.error('Diagnostic error:', error);
                  alert('Erreur lors du diagnostic');
                }
              }}
              className="text-orange-600 border-orange-300"
            >
              Diagnostic Complet
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const advancedResult = await apiService.debugDownloadsAdvanced();
                  console.log('Debug avancé result:', advancedResult);
                  alert(`Debug avancé: ${advancedResult.allDownloadsCount} téléchargements trouvés (simple), ${advancedResult.paginatedDownloadsCount} avec pagination. Voir console pour détails.`);
                } catch (error) {
                  console.error('Debug avancé error:', error);
                  alert('Erreur lors du debug avancé');
                }
              }}
              className="text-red-600 border-red-300"
            >
              Debug Avancé
            </Button>
          </div>
        </div>

        {/* Filtres et tri */}
        {downloads?.content && downloads.content.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtres par catégorie */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Options de tri */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trier par:</span>
              {SORT_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange(option.value)}
                  className="flex items-center space-x-1"
                >
                  <option.icon className="w-3 h-3" />
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Filtres actifs */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Filtres actifs:
            </span>
            
            {searchQuery && (
              <Badge variant="primary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                Recherche: {searchQuery}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            
            {selectedCategory && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                {selectedCategory}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        )}

        {/* Liste des téléchargements */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Chargement de votre historique...
              </p>
            </div>
          ) : processedDownloads.length > 0 ? (
            <motion.div
              key="downloads-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {processedDownloads.map((download, index) => {
                const book = download.book || {
                  id: 0,
                  title: "Livre non disponible",
                  author: "Auteur inconnu",
                  isbn: undefined,
                  description: undefined,
                  publicationYear: undefined,
                  pageCount: undefined,
                  language: undefined,
                  coverImage: undefined,
                  pdfFile: undefined,
                  fileSize: 0,
                  downloadCount: 0,
                  favoriteCount: 0,
                  available: false,
                  categoryId: 0,
                  categoryName: "Non classé",
                  tagNames: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isFavorite: false,
                  recommendationScore: undefined
                };

                return (
                  <motion.div
                    key={download.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Couverture */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                              {book.coverImage ? (
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Informations */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                  {book.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 truncate">
                                  par {book.author}
                                </p>
                                
                                <div className="flex items-center space-x-4 mt-2">
                                  {book.categoryName && book.categoryName !== "Non classé" && (
                                    <Badge variant="secondary">
                                      {book.categoryName}
                                    </Badge>
                                  )}
                                  
                                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDate(download.downloadedAt)}</span>
                                  </div>
                                  
                                  {book.fileSize && book.fileSize > 0 && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatFileSize(book.fileSize)}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRedownload(book.id)}
                                  className="flex items-center space-x-1"
                                  disabled={!book.id || book.id === 0}
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Retélécharger</span>
                                </Button>
                                
                                {book.id && book.id > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.location.href = `/books/${book.id}`}
                                  >
                                    Voir le livre
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : searchQuery || selectedCategory ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={Search}
                title="Aucun téléchargement trouvé"
                description="Aucun téléchargement ne correspond à vos critères de recherche."
                action={
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}>
                    Effacer les filtres
                  </Button>
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={Download}
                title="Aucun téléchargement"
                description="Vous n'avez pas encore téléchargé de livres. Explorez notre collection et téléchargez vos premiers livres !"
                action={
                  <Button onClick={() => window.location.href = '/books'}>
                    Découvrir des livres
                  </Button>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearHistory}
        title="Vider l'historique"
        description="Êtes-vous sûr de vouloir supprimer tout votre historique de téléchargements ? Cette action est irréversible."
        confirmText="Vider l'historique"
        cancelText="Annuler"
        variant="danger"
      />
    </>
  );
};