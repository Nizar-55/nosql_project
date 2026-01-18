import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Accès refusé | Online Library Platform</title>
        <meta name="description" content="Vous n'avez pas les permissions nécessaires pour accéder à cette page" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <Shield className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Accès refusé
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="lg"
              className="w-full"
            >
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Page précédente
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};