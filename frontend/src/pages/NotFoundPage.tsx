import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Page introuvable | Online Library Platform</title>
        <meta name="description" content="La page que vous recherchez n'existe pas ou a été déplacée." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Illustration 404 */}
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
                  404
                </div>
                <motion.div
                  initial={{ opacity: 0, rotate: -10 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <BookOpen className="w-16 h-16 text-primary-500" />
                </motion.div>
              </motion.div>
            </div>

            {/* Titre et description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Page introuvable
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Oops ! La page que vous recherchez n'existe pas ou a été déplacée.
                Elle pourrait être dans une autre section de notre bibliothèque.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Retour à l'accueil</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Page précédente</span>
                </Button>
              </div>

              <div className="pt-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/books')}
                  className="flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <Search className="w-4 h-4" />
                  <span>Explorer la bibliothèque</span>
                </Button>
              </div>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Que souhaitez-vous faire ?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <button
                  onClick={() => navigate('/books')}
                  className="p-4 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Parcourir les livres
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Découvrez notre collection complète
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/favorites')}
                  className="p-4 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Mes favoris
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Retrouvez vos livres préférés
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};