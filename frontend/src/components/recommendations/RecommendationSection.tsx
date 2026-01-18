import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BookGrid } from '../books/BookGrid';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../utils/cn';
import type { Book } from '../../types';

interface RecommendationSectionProps {
  title: string;
  description?: string;
  books: Book[];
  loading?: boolean;
  error?: Error | null;
  viewAllLink?: string;
  onRetry?: () => void;
  className?: string;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title,
  description,
  books,
  loading = false,
  error = null,
  viewAllLink,
  onRetry,
  className,
}) => {
  return (
    <section className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {viewAllLink && !loading && !error && books.length > 0 && (
          <Button variant="ghost">
            <Link to={viewAllLink} className="flex items-center space-x-2">
              <span>Voir tout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <RefreshCw className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error.message || 'Impossible de charger les recommandations.'}
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            )}
          </div>
        ) : (
          <BookGrid
            books={books.slice(0, 8)} // Limiter à 8 livres pour les recommandations
            variant="default"
            emptyMessage="Aucune recommandation"
            emptyDescription="Nous n'avons pas de recommandations à vous proposer pour le moment."
          />
        )}
      </motion.div>
    </section>
  );
};