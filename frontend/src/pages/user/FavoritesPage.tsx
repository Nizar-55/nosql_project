import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Heart, Filter, SortAsc, SortDesc, Grid3X3, List, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';
import { BookGrid } from '@/components/books/BookGrid';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/utils/cn';
import type { Book } from '@/types';

const SORT_OPTIONS = [
  { value: 'addedAt', label: 'Récemment ajoutés', icon: SortDesc },
  { value: 'title', label: 'Titre A-Z', icon: SortAsc },
  { value: 'author', label: 'Auteur A-Z', icon: SortAsc },
  { value: 'downloadCount', label: 'Plus téléchargés', icon: SortDesc },
  { value: 'publicationYear', label: 'Année de publication', icon: SortDesc },
];

export const FavoritesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: favorites, isLoading, clearAllFavorites, isClearing } = useFavorites();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Trier et filtrer les favoris
  const processedFavorites = React.useMemo(() => {
    if (!favorites) return [];

    let filtered = [...favorites];

    // Filtrer par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(book => book.categoryName === selectedCategory);
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'downloadCount':
          aValue = a.downloadCount;
          bValue = b.downloadCount;
          break;
        case 'publicationYear':
          aValue = a.publicationYear || 0;
          bValue = b.publicationYear || 0;
          break;
        case 'addedAt':
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
      }

      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [favorites, selectedCategory, sortBy, sortDir]);

  // Obtenir les catégories uniques
  const categories = React.useMemo(() => {
    if (!favorites) return [];
    
    const categoryMap = new Map<string, number>();
    favorites.forEach(book => {
      const count = categoryMap.get(book.categoryName) || 0;
      categoryMap.set(book.categoryName, count + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [favorites]);

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDir('desc');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllFavorites();
      setShowClearDialog(false);
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connexion requise
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vous devez être connecté pour voir vos favoris.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mes favoris | Online Library Platform</title>
        <meta name="description" content="Gérez votre collection de livres favoris" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <Heart className="w-8 h-8 text-red-500" />
              <span>Mes favoris</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {favorites ? (
                `${favorites.length} livre${favorites.length > 1 ? 's' : ''} dans vos favoris`
              ) : (
                'Chargement de vos favoris...'
              )}
            </p>
          </div>

          {/* Actions */}
          {favorites && favorites.length > 0 && (
            <div className="flex items-center space-x-3">
              {/* Mode d'affichage */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Supprimer tous */}
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(true)}
                disabled={isClearing}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Tout supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Filtres et tri */}
        {favorites && favorites.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtres par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Filtrer par catégorie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                    !selectedCategory
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  Toutes les catégories
                  <span className="text-xs text-gray-500 ml-2">
                    ({favorites.length})
                  </span>
                </button>
                {categories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={cn(
                      'block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                      selectedCategory === category.name
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {category.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({category.count})
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Contenu principal */}
            <div className="lg:col-span-3 space-y-6">
              {/* Options de tri */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                  Trier par:
                </span>
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
                    {sortBy === option.value && sortDir === 'asc' && (
                      <SortAsc className="w-3 h-3" />
                    )}
                  </Button>
                ))}
              </div>

              {/* Filtres actifs */}
              {selectedCategory && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Filtre actif:
                  </span>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    {selectedCategory}
                    <button className="ml-1 hover:text-red-600">×</button>
                  </Badge>
                </div>
              )}

              {/* Grille de livres */}
              <AnimatePresence mode="wait">
                {processedFavorites.length > 0 ? (
                  <motion.div
                    key="favorites-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <BookGrid
                      books={processedFavorites}
                      loading={isLoading}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  </motion.div>
                ) : selectedCategory ? (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={Filter}
                      title="Aucun livre dans cette catégorie"
                      description="Vous n'avez pas de livres favoris dans cette catégorie."
                      action={
                        <Button onClick={() => setSelectedCategory(null)}>
                          Voir tous les favoris
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
                      icon={Heart}
                      title="Aucun livre favori"
                      description="Vous n'avez pas encore ajouté de livres à vos favoris. Explorez notre collection et ajoutez vos livres préférés !"
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
          </div>
        )}

        {/* État de chargement */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Chargement de vos favoris...
            </p>
          </div>
        )}

        {/* État vide initial */}
        {!isLoading && (!favorites || favorites.length === 0) && (
          <EmptyState
            icon={Heart}
            title="Aucun livre favori"
            description="Vous n'avez pas encore ajouté de livres à vos favoris. Explorez notre collection et ajoutez vos livres préférés !"
            action={
              <Button onClick={() => window.location.href = '/books'}>
                Découvrir des livres
              </Button>
            }
          />
        )}
      </div>

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title="Supprimer tous les favoris"
        description="Êtes-vous sûr de vouloir supprimer tous vos livres favoris ? Cette action est irréversible."
        confirmText="Supprimer tout"
        cancelText="Annuler"
        variant="danger"
        loading={isClearing}
      />
    </>
  );
};