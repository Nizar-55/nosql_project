import React, { useState } from 'react';
import { RefreshCw, Image, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { apiService } from '../../services/api';
import { toast } from 'react-hot-toast';

interface CoverPreviewProps {
  bookId: number;
  title: string;
  author: string;
  coverImage?: string;
  onCoverUpdated?: (newCoverImage: string) => void;
}

export const CoverPreview: React.FC<CoverPreviewProps> = ({
  bookId,
  title,
  author,
  coverImage,
  onCoverUpdated,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getCoverImageUrl = () => {
    if (!coverImage) return null;
    
    const fileName = coverImage.startsWith('covers/') 
      ? coverImage.replace('covers/', '')
      : coverImage;
    
    return apiService.getImageUrl(fileName);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // Appeler l'endpoint de régénération pour tous les livres
      // En production, vous pourriez vouloir un endpoint spécifique pour un livre
      const response = await fetch(`${apiService.api.defaults.baseURL}/books/regenerate-covers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Couvertures régénérées avec succès');
        
        // Recharger les données du livre pour obtenir la nouvelle couverture
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Erreur lors de la régénération');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la régénération des couvertures');
    } finally {
      setIsRegenerating(false);
    }
  };

  const coverImageUrl = getCoverImageUrl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Couverture
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            Régénérer
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Prévisualisation de la couverture */}
          <div className="flex justify-center">
            <div className="w-48 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
              {coverImageUrl && !imageError ? (
                <img
                  src={coverImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <span className="text-sm text-center px-2">
                    {imageError ? 'Erreur de chargement' : 'Pas de couverture'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              par {author}
            </p>
            {coverImage && (
              <p className="text-xs text-gray-500">
                Fichier: {coverImage}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <p className="mb-1">
              <strong>Génération automatique:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Si un PDF est disponible, la première page sera utilisée</li>
              <li>Sinon, une couverture par défaut sera générée avec le titre</li>
              <li>Les couvertures sont automatiquement redimensionnées</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};