// Types principaux pour l'application

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profileImage?: string;
  enabled: boolean;
  roleName: string;
  createdAt: string;
  updatedAt: string;
  favoriteBookIds: number[];
  downloadCount: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publicationYear?: number;
  pageCount?: number;
  language?: string;
  coverImage?: string;
  pdfFile?: string;
  fileSize?: number;
  downloadCount: number;
  favoriteCount: number;
  available: boolean;
  categoryId: number;
  categoryName: string;
  tagNames: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  recommendationScore?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
  color?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  book: Book;
  score: number;
  reason: string;
  recommendationType: 'personalized' | 'category' | 'similar' | 'trending';
}

export interface DownloadHistory {
  id: number;
  book: Book;
  downloadedAt: string;
  ipAddress?: string;
}

// Types pour l'authentification
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  roles: string[];
}

// Types pour les formulaires
export interface BookCreateRequest {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publicationYear?: number;
  pageCount?: number;
  language?: string;
  categoryId: number;
  tagNames?: string[];
}

export interface BookUpdateRequest {
  title?: string;
  author?: string;
  description?: string;
  categoryId?: number;
  tagNames?: string[];
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface TagCreateRequest {
  name: string;
  description?: string;
  color?: string;
}

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Types pour les statistiques
export interface PlatformStats {
  totalBooks: number;
  totalUsers: number;
  totalCategories: number;
  totalDownloads: number;
  downloadsLastWeek: number;
  downloadsLastMonth: number;
  mostDownloadedBooks: Book[];
  mostFavoritedBooks: Book[];
}

export interface CategoryStats {
  categoryId: number;
  categoryName: string;
  bookCount: number;
  totalDownloads: number;
  averageDownloadsPerBook: number;
}

export interface AuthorStats {
  authorName: string;
  bookCount: number;
  totalDownloads: number;
}

export interface UserActivityStats {
  userId: number;
  username: string;
  fullName: string;
  downloadCount: number;
}

// Types pour les paramètres de recherche
export interface SearchParams {
  query?: string;
  categoryId?: number;
  tags?: string[];
  title?: string;
  author?: string;
  language?: string;
  publicationYear?: number;
  minYear?: number;
  maxYear?: number;
  sortBy?: 'title' | 'author' | 'createdAt' | 'downloadCount' | 'favoriteCount' | 'publicationYear';
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// Types pour les filtres
export interface BookFilters {
  categories: number[];
  tags: string[];
  authors: string[];
  languages: string[];
  yearRange: [number, number];
  availableOnly: boolean;
}

// Types pour l'état de l'application
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Types pour les modals
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Types pour les composants de formulaire
export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

// Types pour les hooks
export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  staleTime?: number;
  cacheTime?: number;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

// Types pour les événements
export interface BookEvent {
  type: 'download' | 'favorite' | 'unfavorite' | 'view';
  bookId: number;
  userId: number;
  timestamp: string;
}

// Types utilitaires
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Constantes
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
} as const;

export const BOOK_LANGUAGES = [
  'Français',
  'Anglais',
  'Espagnol',
  'Allemand',
  'Italien',
  'Portugais',
  'Russe',
  'Chinois',
  'Japonais',
  'Arabe',
] as const;

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date d\'ajout' },
  { value: 'title', label: 'Titre' },
  { value: 'author', label: 'Auteur' },
  { value: 'downloadCount', label: 'Popularité' },
  { value: 'favoriteCount', label: 'Favoris' },
  { value: 'publicationYear', label: 'Année de publication' },
] as const;

export const PAGE_SIZES = [12, 24, 48, 96] as const;