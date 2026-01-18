import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  Eye,
  Download,
  X,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook, useUploadBookPdf, useUploadBookCover } from '../../hooks/useBooks';
import { useQuery } from 'react-query';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BookForm } from '../../components/admin/BookForm';
import { FileUpload } from '../../components/ui/FileUpload';
import { formatDate, formatFileSize } from '../../utils/format';
import { cn } from '../../utils/cn';
import type { Book, BookCreateRequest, BookUpdateRequest } from '../../types';

export const AdminBooksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [uploadingBook, setUploadingBook] = useState<Book | null>(null);
  const [uploadType, setUploadType] = useState<'pdf' | 'cover'>('pdf');

  // Vérifier l'authentification
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.roleName === 'ROLE_ADMIN' || user?.roleName === 'ADMIN';

  // Hooks pour les données - seulement si authentifié et admin
  const { data: booksData, isLoading } = useBooks({
    query: searchQuery || undefined,
    categoryId: selectedCategory || undefined,
    size: 50,
  });

  const { data: categories } = useQuery(
    'categories', 
    () => apiService.getCategories(),
    {
      enabled: isAuthenticated && isAdmin,
    }
  );
  
  const { data: tags } = useQuery(
    'tags', 
    () => apiService.getTags(),
    {
      enabled: isAuthenticated && isAdmin,
    }
  );

  // Hooks pour les mutations
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();
  const uploadPdfMutation = useUploadBookPdf();
  const uploadCoverMutation = useUploadBookCover();

  const books = booksData?.content || [];

  const handleCreateBook = async (data: BookCreateRequest, file?: File) => {
    try {
      await createBookMutation.mutateAsync({ data, file });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdateBook = async (data: BookUpdateRequest, file?: File) => {
    if (!editingBook) return;
    
    try {
      await updateBookMutation.mutateAsync({ id: editingBook.id, data, file });
      setEditingBook(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;
    
    try {
      await deleteBookMutation.mutateAsync(deletingBook.id);
      setDeletingBook(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleFileUpload = async (file: File | File[]) => {
    if (!uploadingBook) return;

    const singleFile = Array.isArray(file) ? file[0] : file;
    if (!singleFile) return;

    try {
      if (uploadType === 'pdf') {
        await uploadPdfMutation.mutateAsync({ bookId: uploadingBook.id, file: singleFile });
      } else {
        await uploadCoverMutation.mutateAsync({ bookId: uploadingBook.id, file: singleFile });
      }
      setUploadingBook(null);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestion des livres | Admin - Online Library Platform</title>
        <meta name="description" content="Interface d'administration pour gérer les livres" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des livres
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {books.length} livre{books.length > 1 ? 's' : ''} dans la bibliothèque
            </p>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un livre
          </Button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Input
                type="search"
                placeholder="Rechercher par titre, auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtre par catégorie */}
          <div className="lg:w-64">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Toutes les catégories</option>
              {categories?.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des livres */}
        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement des livres...</p>
              </div>
            ) : books.length > 0 ? (
              books.map((book: any, index: number) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Couverture */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {book.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 truncate">
                                par {book.author}
                              </p>
                              
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge variant="secondary">
                                  {book.categoryName}
                                </Badge>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span>{book.downloadCount} téléchargements</span>
                                  <span>{book.favoriteCount} favoris</span>
                                  {book.fileSize && (
                                    <span>{formatFileSize(book.fileSize)}</span>
                                  )}
                                </div>
                              </div>

                              {/* Tags */}
                              {book.tagNames.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {book.tagNames.slice(0, 3).map((tag: string) => (
                                    <Badge key={tag} variant="secondary" size="sm">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {book.tagNames.length > 3 && (
                                    <Badge variant="secondary" size="sm">
                                      +{book.tagNames.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Ajouté le {formatDate(book.createdAt)}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/books/${book.id}`, '_blank')}
                                title="Voir le livre"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUploadingBook(book);
                                  setUploadType('cover');
                                }}
                                title="Uploader une couverture"
                              >
                                <Upload className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUploadingBook(book);
                                  setUploadType('pdf');
                                }}
                                title="Uploader le PDF"
                                className={cn(!book.pdfFile && 'text-orange-600')}
                              >
                                <Download className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingBook(book)}
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingBook(book)}
                                title="Supprimer"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun livre trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery || selectedCategory
                    ? 'Aucun livre ne correspond à vos critères de recherche.'
                    : 'Commencez par ajouter votre premier livre à la bibliothèque.'
                  }
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un livre
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal de création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Ajouter un nouveau livre"
        size="lg"
      >
        <BookForm
          categories={categories || []}
          tags={tags || []}
          onSubmit={(data, file) => handleCreateBook(data as BookCreateRequest, file)}
          onCancel={() => setShowCreateModal(false)}
          loading={createBookMutation.isLoading}
        />
      </Modal>

      {/* Modal de modification */}
      <Modal
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="Modifier le livre"
        size="lg"
      >
        {editingBook && (
          <BookForm
            book={editingBook}
            categories={categories || []}
            tags={tags || []}
            onSubmit={(data, file) => handleUpdateBook(data as BookUpdateRequest, file)}
            onCancel={() => setEditingBook(null)}
            loading={updateBookMutation.isLoading}
          />
        )}
      </Modal>

      {/* Modal d'upload */}
      <Modal
        isOpen={!!uploadingBook}
        onClose={() => setUploadingBook(null)}
        title={`Uploader ${uploadType === 'pdf' ? 'le fichier PDF' : 'la couverture'}`}
      >
        {uploadingBook && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {uploadType === 'pdf' 
                ? `Sélectionnez le fichier PDF pour "${uploadingBook.title}"`
                : `Sélectionnez l'image de couverture pour "${uploadingBook.title}"`
              }
            </p>
            
            <FileUpload
              accept={uploadType === 'pdf' ? '.pdf' : 'image/*'}
              onFileSelect={handleFileUpload}
              maxSize={uploadType === 'pdf' ? 50 * 1024 * 1024 : 5 * 1024 * 1024} // 50MB pour PDF, 5MB pour images
            />
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setUploadingBook(null)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        onConfirm={handleDeleteBook}
        title="Supprimer le livre"
        description={`Êtes-vous sûr de vouloir supprimer "${deletingBook?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        loading={deleteBookMutation.isLoading}
      />
    </>
  );
};