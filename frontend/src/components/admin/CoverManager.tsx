import React, { useState } from 'react';
import { RefreshCw, Image, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { toast } from 'react-hot-toast';

export const CoverManager: React.FC = () => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isLoadingDiagnostic, setIsLoadingDiagnostic] = useState(false);

  const runDiagnostic = async () => {
    setIsLoadingDiagnostic(true);
    try {
      const response = await fetch('/api/books/test/covers');
      if (response.ok) {
        const result = await response.json();
        setDiagnosticResult(result);
        toast.success('Diagnostic terminé');
      } else {
        throw new Error(`Erreur ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur diagnostic:', error);
      toast.error('Erreur lors du diagnostic');
    } finally {
      setIsLoadingDiagnostic(false);
    }
  };

  const regenerateCovers = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/books/regenerate-covers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Couvertures régénérées: ${result.successCount} succès, ${result.errorCount} erreurs`);
        
        // Relancer le diagnostic après régénération
        setTimeout(() => {
          runDiagnostic();
        }, 1000);
      } else {
        throw new Error(`Erreur ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur régénération:', error);
      toast.error('Erreur lors de la régénération des couvertures');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Gestionnaire de Couvertures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Boutons d'action */}
            <div className="flex space-x-4">
              <Button
                onClick={runDiagnostic}
                disabled={isLoadingDiagnostic}
                variant="outline"
              >
                <Info className={`w-4 h-4 mr-2 ${isLoadingDiagnostic ? 'animate-spin' : ''}`} />
                Diagnostic
              </Button>
              
              <Button
                onClick={regenerateCovers}
                disabled={isRegenerating}
                variant="primary"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                Régénérer les couvertures
              </Button>
            </div>

            {/* Résultats du diagnostic */}
            {diagnosticResult && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Résultats du diagnostic</h3>
                
                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {diagnosticResult.totalBooks || 0}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Total livres
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {diagnosticResult.booksWithPdf || 0}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Avec PDF
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {diagnosticResult.booksWithCover || 0}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      Avec couverture
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {diagnosticResult.booksWithoutCover || 0}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Sans couverture
                    </div>
                  </div>
                </div>

                {/* État des dossiers */}
                <div className="space-y-2">
                  <h4 className="font-medium">État des dossiers :</h4>
                  <div className="flex items-center space-x-2">
                    {diagnosticResult.uploadsExists ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Dossier uploads: {diagnosticResult.uploadsPath}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {diagnosticResult.coversExists ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Dossier covers: {diagnosticResult.coversPath}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {diagnosticResult.pdfBoxAvailable ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      PDFBox disponible
                    </span>
                  </div>
                </div>

                {/* Échantillon de livres */}
                {diagnosticResult.sampleBooks && diagnosticResult.sampleBooks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Échantillon de livres :</h4>
                    <div className="space-y-2">
                      {diagnosticResult.sampleBooks.map((book: any, index: number) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium">{book.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-x-4">
                            <span>
                              PDF: {book.hasPdf ? (
                                <span className="text-green-600">✓ {book.pdfFile}</span>
                              ) : (
                                <span className="text-red-600">✗ Aucun</span>
                              )}
                            </span>
                            <span>
                              Couverture: {book.hasCover ? (
                                <span className="text-green-600">✓ {book.coverImage}</span>
                              ) : (
                                <span className="text-red-600">✗ Aucune</span>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Recommandations :
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    {diagnosticResult.booksWithPdf > 0 && diagnosticResult.booksWithCover === 0 && (
                      <li>• Il y a des livres avec PDF mais sans couverture - cliquez sur "Régénérer"</li>
                    )}
                    {diagnosticResult.booksWithPdf === 0 && (
                      <li>• Aucun livre n'a de fichier PDF - ajoutez des PDFs pour générer des couvertures</li>
                    )}
                    {!diagnosticResult.pdfBoxAvailable && (
                      <li>• PDFBox n'est pas disponible - vérifiez les dépendances Maven</li>
                    )}
                    {!diagnosticResult.coversExists && (
                      <li>• Le dossier covers n'existe pas - il sera créé automatiquement</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};