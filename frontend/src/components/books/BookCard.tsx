import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Download, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFavorites } from '../../hooks/useFavorites';
import { formatFileSize } from '../../utils/format';
import { apiService } from '../../services/api';
import { cn } from '../../utils/cn';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact';
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  variant = 'default',
  className,
}) => {
  const { toggleFavorite, isToggling } = useFavorites();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(book.id);
  };

  // Construire l'URL de la couverture
  const getCoverImageUrl = () => {
    if (!book.coverImage) return null;
    
    // Si l'URL commence par "covers/", extraire juste le nom du fichier
    const fileName = book.coverImage.startsWith('covers/') 
      ? book.coverImage.replace('covers/', '')
      : book.coverImage;
    
    return apiService.getImageUrl(fileName);
  };

  const coverImageUrl = getCoverImageUrl();

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow',
          className
        )}
      >
        <Link to={`/books/${book.id}`} className="block p-4">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                {coverImageUrl ? (
                  <img
                    src={coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // En cas d'erreur de chargement, afficher l'icône par défaut
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={cn(
                  "w-full h-full flex items-center justify-center",
                  coverImageUrl && "hidden"
                )}>
                  <BookOpen className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {book.author}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" size="sm">
                  {book.categoryName}
                </Badge>
                <span className="text-xs text-gray-500">
                  {book.downloadCount} téléchargements
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className={cn(
                'flex-shrink-0',
                book.isFavorite && 'text-red-600'
              )}
            >
              <Heart className={cn('w-4 h-4', book.isFavorite && 'fill-current')} />
            </Button>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow',
        className
      )}
    >
      <Link to={`/books/${book.id}`} className="block">
        {/* Couverture */}
        <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // En cas d'erreur de chargement, afficher l'icône par défaut
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={cn(
            "w-full h-full flex items-center justify-center absolute inset-0",
            coverImageUrl && "hidden"
          )}>
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          
          {/* Badge favori */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={isToggling}
            className={cn(
              'absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
              book.isFavorite && 'text-red-600'
            )}
          >
            <Heart className={cn('w-4 h-4', book.isFavorite && 'fill-current')} />
          </Button>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            par {book.author}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" size="sm">
              {book.categoryName}
            </Badge>
            {book.fileSize && (
              <span className="text-xs text-gray-500">
                {formatFileSize(book.fileSize)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>{book.downloadCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{book.favoriteCount}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};