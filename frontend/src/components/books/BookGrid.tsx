import React from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookCard } from './BookCard';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../utils/cn';
import type { Book } from '../../types';

interface BookGridProps {
  books: Book[];
  loading?: boolean;
  error?: Error | null;
  variant?: 'default' | 'compact';
  emptyMessage?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  className?: string;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  loading = false,
  error = null,
  variant = 'default',
  emptyMessage = 'Aucun livre trouvé',
  emptyDescription = 'Aucun livre ne correspond à vos critères.',
  onRetry,
  className,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <BookOpen className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || 'Une erreur est survenue lors du chargement des livres.'}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <BookOpen className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {emptyDescription}
        </p>
      </div>
    );
  }

  const gridClasses = variant === 'compact'
    ? 'space-y-4'
    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';

  return (
    <div className={cn(gridClasses, className)}>
      <AnimatePresence>
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <BookCard book={book} variant={variant} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};