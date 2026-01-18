import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import type { Book, BookCreateRequest, BookUpdateRequest, Category, Tag } from '../../types';

interface BookFormProps {
  book?: Book;
  categories: Category[];
  tags: Tag[];
  onSubmit: (data: BookCreateRequest | BookUpdateRequest, file?: File) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const BookForm: React.FC<BookFormProps> = ({
  book,
  categories,
  tags,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    description: book?.description || '',
    publicationYear: book?.publicationYear?.toString() || '',
    pageCount: book?.pageCount?.toString() || '',
    language: book?.language || 'Français',
    categoryId: book?.categoryId || (categories[0]?.id || 0),
    tagNames: book?.tagNames || [],
  });

  const [newTag, setNewTag] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        description: book.description || '',
        publicationYear: book.publicationYear?.toString() || '',
        pageCount: book.pageCount?.toString() || '',
        language: book.language || 'Français',
        categoryId: book.categoryId,
        tagNames: book.tagNames || [],
      });
    }
  }, [book]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'L\'auteur est requis';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'La catégorie est requise';
    }

    if (formData.publicationYear && (
      isNaN(Number(formData.publicationYear)) ||
      Number(formData.publicationYear) < 1000 ||
      Number(formData.publicationYear) > new Date().getFullYear()
    )) {
      newErrors.publicationYear = 'Année de publication invalide';
    }

    if (formData.pageCount && (
      isNaN(Number(formData.pageCount)) ||
      Number(formData.pageCount) < 1
    )) {
      newErrors.pageCount = 'Nombre de pages invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (book) {
      // Mode édition - BookUpdateRequest
      const submitData: BookUpdateRequest = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId,
        tagNames: formData.tagNames.length > 0 ? formData.tagNames : undefined,
      };
      onSubmit(submitData, selectedFile || undefined);
    } else {
      // Mode création - BookCreateRequest
      const submitData: BookCreateRequest = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim() || undefined,
        description: formData.description.trim() || undefined,
        publicationYear: formData.publicationYear ? Number(formData.publicationYear) : undefined,
        pageCount: formData.pageCount ? Number(formData.pageCount) : undefined,
        language: formData.language || undefined,
        categoryId: formData.categoryId,
        tagNames: formData.tagNames.length > 0 ? formData.tagNames : undefined,
      };
      onSubmit(submitData, selectedFile || undefined);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tagNames.includes(tag)) {
      handleInputChange('tagNames', [...formData.tagNames, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tagNames', formData.tagNames.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Titre"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          required
          placeholder="Titre du livre"
        />

        <Input
          label="Auteur"
          value={formData.author}
          onChange={(e) => handleInputChange('author', e.target.value)}
          error={errors.author}
          required
          placeholder="Nom de l'auteur"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ISBN"
          value={formData.isbn}
          onChange={(e) => handleInputChange('isbn', e.target.value)}
          error={errors.isbn}
          placeholder="978-2-123456-78-9"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Catégorie <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', Number(e.target.value))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.categoryId}
            </p>
          )}
        </div>
      </div>

      {/* Fichier PDF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fichier PDF {book ? '(Laisser vide pour conserver)' : ''}
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
        />
        {book?.pdfFile && (
          <p className="text-sm text-gray-500 mt-1">
            Fichier actuel disponible
          </p>
        )}
      </div>

      {/* Description */}
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={errors.description}
        placeholder="Description du livre..."
        rows={4}
      />

      {/* Détails */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Année de publication"
          type="number"
          value={formData.publicationYear}
          onChange={(e) => handleInputChange('publicationYear', e.target.value)}
          error={errors.publicationYear}
          placeholder="2023"
          min="1000"
          max={new Date().getFullYear()}
        />

        <Input
          label="Nombre de pages"
          type="number"
          value={formData.pageCount}
          onChange={(e) => handleInputChange('pageCount', e.target.value)}
          error={errors.pageCount}
          placeholder="250"
          min="1"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Langue
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Français">Français</option>
            <option value="Anglais">Anglais</option>
            <option value="Espagnol">Espagnol</option>
            <option value="Allemand">Allemand</option>
            <option value="Italien">Italien</option>
            <option value="Portugais">Portugais</option>
            <option value="Russe">Russe</option>
            <option value="Chinois">Chinois</option>
            <option value="Japonais">Japonais</option>
            <option value="Arabe">Arabe</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        
        {/* Tags existants */}
        {formData.tagNames.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tagNames.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                onClick={() => removeTag(tag)}
              >
                {tag}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* Ajouter un tag */}
        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ajouter un tag..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={!newTag.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Tags suggérés */}
        {tags.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Tags populaires:
            </p>
            <div className="flex flex-wrap gap-1">
              {tags
                .filter((tag: any) => !formData.tagNames.includes(tag.name))
                .slice(0, 10)
                .map((tag: any) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleInputChange('tagNames', [...formData.tagNames, tag.name])}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-900 dark:hover:text-primary-300 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {book ? 'Mettre à jour' : 'Créer le livre'}
        </Button>
      </div>
    </form>
  );
};