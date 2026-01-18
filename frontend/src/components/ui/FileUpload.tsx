import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { formatFileSize } from '../../utils/format';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // en bytes
  multiple?: boolean;
  onFileSelect: (file: File | File[]) => void;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB par défaut
  multiple = false,
  onFileSelect,
  className,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`Le fichier "${file.name}" est trop volumineux. Taille maximale: ${formatFileSize(maxSize)}`);
      return false;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType === fileExtension;
        }
        if (acceptedType.includes('*')) {
          const baseType = acceptedType.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return acceptedType === fileType;
      });

      if (!isAccepted) {
        setError(`Type de fichier non supporté. Types acceptés: ${accept}`);
        return false;
      }
    }

    return true;
  };

  const handleFiles = (files: FileList) => {
    setError('');
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      setError('Un seul fichier est autorisé');
      return;
    }

    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length === 0) {
      return;
    }

    setSelectedFiles(validFiles);
    onFileSelect(multiple ? validFiles : validFiles[0]);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      setError('');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Zone de drop */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-300 bg-red-50 dark:bg-red-900/20'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="text-center">
          <Upload className={cn(
            'mx-auto h-12 w-12 mb-4',
            dragActive ? 'text-primary-500' : 'text-gray-400'
          )} />
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                Cliquez pour sélectionner
              </span>
              {' '}ou glissez-déposez vos fichiers ici
            </p>
            
            {accept && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Types acceptés: {accept}
              </p>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Taille maximale: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fichiers sélectionnés */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Fichier{selectedFiles.length > 1 ? 's' : ''} sélectionné{selectedFiles.length > 1 ? 's' : ''}:
            </h4>
            
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};