import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Download, 
  Heart, 
  HeartOff, 
  Share2, 
  BookOpen, 
  Calendar, 
  User, 
  Tag, 
  FileText,
  ArrowLeft,
  Star,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBook, useDownloadBook } from '@/hooks/useBooks';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BookGrid } from '@/components/books/BookGrid';
import { formatDate, formatFileSize } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Book } from '@/types';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const bookId = parseInt(id || '0', 10);
  const { data: book, isLoading, error } = useBook(bookId);
  const { data: recommendations } = useRecommendations(bookId);
  const { toggleFavorite, isToggling } = useFavorites();
  const downloadMutation = useDownloadBook();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <BookOpen className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Livre introuvable
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Le livre que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => navigate('/books')}>
          Retour aux livres
        </Button>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!book?.pdfFile) {
      return;
    }
    
    downloadMutation.mutate(book.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Découvrez "${book.title}" par ${book.author}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    } else {
      // Fallback: copier l'URL dans le presse-papiers
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite(book.id);
  };

  return (
    <>
      <Helmet>
        <title>{book.title} - {book.author} | Online Library Platform</title>
        <meta name="description" content={book.description || `Découvrez "${book.title}" par ${book.author}`} />
      </Helmet>

      <div className="space-y-8">
        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête du livre */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row gap-6"
            >
              {/* Couverture */}
              <div className="flex-shrink-0">
                <div className="w-48 h-64 mx-auto md:mx-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {book.title}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    par {book.author}
                  </p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{book.categoryName}</Badge>
                    {book.tagNames.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{book.downloadCount} téléchargements</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{book.favoriteCount} favoris</span>
                    </div>
                    {book.pageCount && (
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{book.pageCount} pages</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleDownload}
                    disabled={!book.pdfFile || downloadMutation.isLoading}
                    className="flex items-center space-x-2"
                  >
                    {downloadMutation.isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{downloadMutation.isLoading ? 'Téléchargement...' : 'Télécharger'}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleToggleFavorite}
                    disabled={isToggling}
                    className={cn(
                      'flex items-center space-x-2',
                      book.isFavorite && 'text-red-600 border-red-300 hover:bg-red-50'
                    )}
                  >
                    {book.isFavorite ? (
                      <Heart className="w-4 h-4 fill-current" />
                    ) : (
                      <HeartOff className="w-4 h-4" />
                    )}
                    <span>{book.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            {book.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      'text-gray-700 dark:text-gray-300 leading-relaxed',
                      !showFullDescription && book.description.length > 500 && 'line-clamp-6'
                    )}>
                      {book.description}
                    </div>
                    {book.description.length > 500 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-3 p-0 h-auto"
                      >
                        {showFullDescription ? 'Voir moins' : 'Voir plus'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recommandations */}
            {recommendations && recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Livres similaires
                </h2>
                <BookGrid
                  books={recommendations.slice(0, 6)}
                  loading={false}
                  variant="compact"
                />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Détails techniques */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Détails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {book.isbn && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ISBN</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{book.isbn}</dd>
                    </div>
                  )}
                  
                  {book.publicationYear && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Année de publication
                      </dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{book.publicationYear}</dd>
                    </div>
                  )}
                  
                  {book.language && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Langue</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{book.language}</dd>
                    </div>
                  )}
                  
                  {book.fileSize && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Taille du fichier
                      </dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {formatFileSize(book.fileSize)}
                      </dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ajouté le
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {formatDate(book.createdAt)}
                    </dd>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Score de recommandation */}
            {book.recommendationScore && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>Score de recommandation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                          style={{ width: `${book.recommendationScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(book.recommendationScore)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Basé sur vos préférences et votre historique
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};