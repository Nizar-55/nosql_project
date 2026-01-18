import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List, 
  Search,
  X,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookGrid } from '@/components/books/BookGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { useBooks, useSearchBooks } from '@/hooks/useBooks';
import { useQuery } from 'react-query';
import { apiService } from '@/services/api';
import { useAppStore } from '@/store/appStore';
import type { SearchParams } from '@/types';
import { cn } from '@/utils/cn';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Plus récents', icon: SortDesc },
  { value: 'title', label: 'Titre A-Z', icon: SortAsc },
  { value: 'author', label: 'Auteur A-Z', icon: SortAsc },
  { value: 'downloadCount', label: 'Plus téléchargés', icon: SortDesc },
  { value: 'favoriteCount', label: 'Plus aimés', icon: SortDesc },
  { value: 'publicationYear', label: 'Année de publication', icon: SortDesc },
];

const PAGE_SIZES = [12, 24, 48, 96];

export const BooksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // États temporaires pour les filtres (avant confirmation) - SIMPLIFIÉ
  const [tempSelectedCategory, setTempSelectedCategory] = useState<number | null>(null);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>([]);
  
  const {
    searchQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    sortDir,
    pageSize,
    setSearchQuery,
    setSelectedCategory,
    setSelectedTags,
    setSortBy,
    setSortDir,
    setPageSize,
    resetFilters,
  } = useAppStore();

  // État local pour la pagination
  const [currentPage, setCurrentPage] = useState(0);
  
  // Initialiser les filtres temporaires avec les valeurs actuelles - SIMPLIFIÉ
  useEffect(() => {
    setTempSelectedCategory(selectedCategory);
    setTempSelectedTags(selectedTags);
  }, [selectedCategory, selectedTags]);

  // Construire les paramètres de recherche - SIMPLIFIÉ
  const searchParameters: SearchParams = {
    query: searchQuery || undefined,
    categoryId: selectedCategory || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    sortBy: sortBy as 'title' | 'author' | 'createdAt' | 'downloadCount' | 'favoriteCount' | 'publicationYear',
    sortDir,
    page: currentPage,
    size: pageSize,
  };

  // Hooks pour récupérer les données
  // Utiliser useSearchBooks seulement si on a une query de recherche textuelle
  // Sinon utiliser useBooks même avec des filtres
  const booksQuery = searchQuery && searchQuery.trim() !== ''
    ? useSearchBooks(searchParameters)
    : useBooks(searchParameters);

  const { data: categories } = useQuery('categories', () => apiService.getCategories());
  const { data: tags } = useQuery('tags', () => apiService.getTags());
  const { data: bookFilters } = useQuery('bookFilters', () => apiService.getBookFilters());

  // Synchroniser avec les paramètres d'URL
  useEffect(() => {
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    const page = searchParams.get('page');

    if (query && query !== searchQuery) {
      setSearchQuery(query);
      setLocalSearchQuery(query);
    }
    if (category) {
      const categoryId = categories?.find(c => c.name.toLowerCase() === category.toLowerCase())?.id;
      if (categoryId && categoryId !== selectedCategory) {
        setSelectedCategory(categoryId);
      }
    }
    if (sort && sort !== sortBy) {
      setSortBy(sort);
    }
    if (page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum) && pageNum !== currentPage) {
        setCurrentPage(pageNum);
      }
    }
  }, [searchParams, categories]);

  // Mettre à jour l'URL quand les filtres changent
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory && categories) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) params.set('category', category.name.toLowerCase());
    }
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (currentPage > 0) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, currentPage, categories, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearchQuery);
    setCurrentPage(0);
  };

  // Appliquer les filtres temporaires aux filtres réels - SIMPLIFIÉ
  const applyFilters = () => {
    setSelectedCategory(tempSelectedCategory);
    setSelectedTags(tempSelectedTags);
    setCurrentPage(0);
    setShowFilters(false);
  };

  // Réinitialiser les filtres temporaires - SIMPLIFIÉ
  const resetTempFilters = () => {
    setTempSelectedCategory(null);
    setTempSelectedTags([]);
  };

  // Annuler les modifications (revenir aux filtres actuels) - SIMPLIFIÉ
  const cancelFilters = () => {
    setTempSelectedCategory(selectedCategory);
    setTempSelectedTags(selectedTags);
    setShowFilters(false);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setTempSelectedCategory(categoryId);
  };

  const handleTagFilter = (tagName: string) => {
    const newTags = tempSelectedTags.includes(tagName)
      ? tempSelectedTags.filter(t => t !== tagName)
      : [...tempSelectedTags, tagName];
    setTempSelectedTags(newTags);
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDir('desc');
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    resetFilters();
    setLocalSearchQuery('');
    setCurrentPage(0);
    // Réinitialiser aussi les filtres temporaires - SIMPLIFIÉ
    resetTempFilters();
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTags.length > 0;
                        
  const hasTempChanges = tempSelectedCategory !== selectedCategory || 
                        JSON.stringify(tempSelectedTags) !== JSON.stringify(selectedTags);

  return (
    <>
      <Helmet>
        <title>
          {searchQuery ? `Recherche: ${searchQuery}` : 'Tous les livres'} - Online Library Platform
        </title>
        <meta 
          name="description" 
          content={searchQuery 
            ? `Résultats de recherche pour "${searchQuery}"`
            : 'Découvrez notre collection complète de livres numériques avec des milliers de titres dans toutes les catégories.'
          } 
        />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {searchQuery ? `Recherche: "${searchQuery}"` : 'Tous les livres'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {booksQuery.data ? (
                `${booksQuery.data.totalElements} livre${booksQuery.data.totalElements > 1 ? 's' : ''} trouvé${booksQuery.data.totalElements > 1 ? 's' : ''}`
              ) : (
                'Découvrez notre collection complète'
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="flex-1 lg:flex-none">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="w-full lg:w-64"
                />
                {localSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearchQuery('');
                      setSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Filtres */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                hasActiveFilters && 'border-primary-500 text-primary-600',
                hasTempChanges && 'border-amber-500 text-amber-600'
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {hasActiveFilters && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {(selectedCategory ? 1 : 0) + selectedTags.length + (searchQuery ? 1 : 0)}
                </Badge>
              )}
              {hasTempChanges && (
                <Badge variant="warning" size="sm" className="ml-2">
                  !
                </Badge>
              )}
            </Button>

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
          </div>
        </div>

        {/* Filtres actifs - SIMPLIFIÉ */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtres actifs:</span>
            
            {searchQuery && (
              <Badge variant="primary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                Recherche: {searchQuery}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            
            {selectedCategory && categories && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                {categories.find(c => c.id === selectedCategory)?.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            
            {selectedTags.map(tag => (
              <Badge 
                key={tag}
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
              >
                {tag}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Tout effacer
            </Button>
          </div>
        )}

        {/* Panel de filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Catégories */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Catégories
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => handleCategoryFilter(null)}
                          className={cn(
                            'block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                            !tempSelectedCategory
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          )}
                        >
                          Toutes les catégories
                        </button>
                        {categories?.map(category => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryFilter(category.id)}
                            className={cn(
                              'block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                              tempSelectedCategory === category.id
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                          >
                            {category.name}
                            <span className="text-xs text-gray-500 ml-2">
                              ({category.bookCount})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {tags?.slice(0, 20).map(tag => (
                          <Badge
                            key={tag.id}
                            variant={tempSelectedTags.includes(tag.name) ? 'primary' : 'secondary'}
                            className="cursor-pointer text-xs"
                            onClick={() => handleTagFilter(tag.name)}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Boutons de confirmation */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetTempFilters}
                        >
                          Réinitialiser
                        </Button>
                        {hasTempChanges && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            Modifications non appliquées
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelFilters}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={applyFilters}
                          disabled={!hasTempChanges}
                        >
                          Appliquer les filtres
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grille de livres */}
        <BookGrid
          books={booksQuery.data?.content || []}
          loading={booksQuery.isLoading}
          error={booksQuery.error as Error | null}
          variant={viewMode === 'list' ? 'compact' : 'default'}
          emptyMessage={searchQuery ? 'Aucun livre trouvé' : 'Aucun livre disponible'}
          emptyDescription={
            searchQuery 
              ? 'Essayez de modifier votre recherche ou vos filtres.'
              : 'Il n\'y a actuellement aucun livre dans cette sélection.'
          }
          onRetry={() => booksQuery.refetch()}
        />

        {/* Pagination */}
        {booksQuery.data && booksQuery.data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage + 1} sur {booksQuery.data.totalPages} 
              ({booksQuery.data.totalElements} résultats)
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Précédent
              </Button>
              
              {/* Pages */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, booksQuery.data.totalPages) }, (_, i) => {
                  const page = Math.max(0, Math.min(
                    booksQuery.data.totalPages - 5,
                    currentPage - 2
                  )) + i;
                  
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page + 1}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= booksQuery.data.totalPages - 1}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};