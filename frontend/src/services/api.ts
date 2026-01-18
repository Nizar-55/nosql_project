import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import type {
  User,
  Book,
  Category,
  Tag,
  Recommendation,
  DownloadHistory,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  BookCreateRequest,
  BookUpdateRequest,
  UserUpdateRequest,
  CategoryCreateRequest,
  TagCreateRequest,
  PaginatedResponse,
  SearchParams,
  PlatformStats,
  CategoryStats,
  AuthorStats,
  UserActivityStats,
  ApiError,
} from '@/types';

// Configuration de base d'Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur de requête pour ajouter le token JWT
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse pour gérer les erreurs globalement
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiError>) => {
        const { response } = error;

        if (response?.status === 401) {
          // Token expiré ou invalide - nettoyer le localStorage seulement
          // Le store d'authentification se chargera de la redirection
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          // Ne pas rediriger ici, laisser React Router gérer cela
          // window.location.href = '/login';
          
          // Optionnel: émettre un événement pour notifier le store
          window.dispatchEvent(new CustomEvent('auth:logout'));
          
        } else if (response?.status === 403) {
          toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        } else if (response?.status === 404) {
          // Ne pas afficher d'erreur pour les 404, laisser les composants gérer
          // toast.error('Ressource non trouvée.');
        } else if (response?.status && response.status >= 500) {
          toast.error('Erreur serveur. Veuillez réessayer plus tard.');
        } else if (response?.data?.message) {
          toast.error(response.data.message);
        } else {
          toast.error('Une erreur inattendue s\'est produite.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Méthodes utilitaires
  private handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }

  // === AUTHENTIFICATION ===

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return this.handleResponse(response);
  }

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>('/auth/register', userData);
    return this.handleResponse(response);
  }

  async validateToken(): Promise<User> {
    const response = await this.api.get<User>('/auth/validate');
    return this.handleResponse(response);
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  // === UTILISATEURS ===

  async getUserProfile(): Promise<User> {
    const response = await this.api.get<User>('/users/profile');
    return this.handleResponse(response);
  }

  async updateUserProfile(userData: UserUpdateRequest): Promise<User> {
    const response = await this.api.put<User>('/users/profile', userData);
    return this.handleResponse(response);
  }

  async getUserFavorites(): Promise<Book[]> {
    const response = await this.api.get<Book[]>('/users/favorites');
    return this.handleResponse(response);
  }

  async addToFavorites(bookId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/users/favorites/${bookId}`);
    return this.handleResponse(response);
  }

  async removeFromFavorites(bookId: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/users/favorites/${bookId}`);
    return this.handleResponse(response);
  }

  async getUserDownloads(page = 0, size = 10): Promise<PaginatedResponse<DownloadHistory>> {
    const params = this.buildQueryParams({ page, size });
    const response = await this.api.get<PaginatedResponse<DownloadHistory>>(`/users/downloads?${params}`);
    return this.handleResponse(response);
  }

  async downloadBook(bookId: number): Promise<Blob> {
    const response = await this.api.get(`/users/download/${bookId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // === LIVRES ===

  async getBooks(params: SearchParams = {}): Promise<PaginatedResponse<Book>> {
    const queryParams = this.buildQueryParams({
      page: params.page || 0,
      size: params.size || 12,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc',
      categoryId: params.categoryId,
      tags: params.tags?.join(','),
    });
    const response = await this.api.get<PaginatedResponse<Book>>(`/books?${queryParams}`);
    return this.handleResponse(response);
  }

  async getBookFilters(): Promise<{
    languages: string[];
    years: number[];
    categories: { id: number; name: string }[];
  }> {
    const response = await this.api.get('/books/filters');
    return this.handleResponse(response);
  }

  async getBook(id: number): Promise<Book> {
    const response = await this.api.get<Book>(`/books/${id}`);
    return this.handleResponse(response);
  }

  async searchBooks(params: SearchParams): Promise<PaginatedResponse<Book>> {
    const queryParams = this.buildQueryParams({
      query: params.query,
      page: params.page || 0,
      size: params.size || 12,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc',
      categoryId: params.categoryId,
      tags: params.tags?.join(','),
    });
    const response = await this.api.get<PaginatedResponse<Book>>(`/books/search?${queryParams}`);
    return this.handleResponse(response);
  }

  async getBooksByCategory(categoryId: number, page = 0, size = 12): Promise<PaginatedResponse<Book>> {
    const params = this.buildQueryParams({ page, size });
    const response = await this.api.get<PaginatedResponse<Book>>(`/books/category/${categoryId}?${params}`);
    return this.handleResponse(response);
  }

  async createBook(bookData: BookCreateRequest, file?: File): Promise<Book> {
    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }

    const response = await this.api.post<Book>('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return this.handleResponse(response);
  }

  async updateBook(id: number, bookData: BookUpdateRequest, file?: File): Promise<Book> {
    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }

    const response = await this.api.put<Book>(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return this.handleResponse(response);
  }

  async deleteBook(id: number): Promise<void> {
    await this.api.delete(`/books/${id}`);
  }

  async uploadBookPdf(bookId: number, file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post<{ message: string }>(
      `/books/${bookId}/upload-pdf`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return this.handleResponse(response);
  }

  async uploadBookCover(bookId: number, file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post<{ message: string }>(
      `/books/${bookId}/upload-cover`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return this.handleResponse(response);
  }

  // === CATÉGORIES ===

  async getCategories(): Promise<Category[]> {
    const response = await this.api.get<Category[]>('/categories');
    return this.handleResponse(response);
  }

  async getCategory(id: number): Promise<Category> {
    const response = await this.api.get<Category>(`/categories/${id}`);
    return this.handleResponse(response);
  }

  async createCategory(categoryData: CategoryCreateRequest): Promise<Category> {
    const response = await this.api.post<Category>('/categories', categoryData);
    return this.handleResponse(response);
  }

  async updateCategory(id: number, categoryData: Partial<CategoryCreateRequest>): Promise<Category> {
    const response = await this.api.put<Category>(`/categories/${id}`, categoryData);
    return this.handleResponse(response);
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // === TAGS ===

  async getTags(): Promise<Tag[]> {
    const response = await this.api.get<Tag[]>('/tags');
    return this.handleResponse(response);
  }

  async searchTags(query: string): Promise<Tag[]> {
    const params = this.buildQueryParams({ query });
    const response = await this.api.get<Tag[]>(`/tags/search?${params}`);
    return this.handleResponse(response);
  }

  async createTag(tagData: TagCreateRequest): Promise<Tag> {
    const response = await this.api.post<Tag>('/tags', tagData);
    return this.handleResponse(response);
  }

  async updateTag(id: number, tagData: Partial<TagCreateRequest>): Promise<Tag> {
    const response = await this.api.put<Tag>(`/tags/${id}`, tagData);
    return this.handleResponse(response);
  }

  async deleteTag(id: number): Promise<void> {
    await this.api.delete(`/tags/${id}`);
  }

  // === RECOMMANDATIONS ===

  async getPersonalizedRecommendations(limit = 10): Promise<Recommendation[]> {
    const params = this.buildQueryParams({ limit });
    const response = await this.api.get<Recommendation[]>(`/recommendations/personalized?${params}`);
    return this.handleResponse(response);
  }

  async getCategoryRecommendations(categoryId: number, limit = 10): Promise<Recommendation[]> {
    const params = this.buildQueryParams({ limit });
    const response = await this.api.get<Recommendation[]>(`/recommendations/category/${categoryId}?${params}`);
    return this.handleResponse(response);
  }

  async getSimilarBooks(bookId: number, limit = 10): Promise<Recommendation[]> {
    const params = this.buildQueryParams({ limit });
    const response = await this.api.get<Recommendation[]>(`/recommendations/similar/${bookId}?${params}`);
    return this.handleResponse(response);
  }

  async getTrendingRecommendations(limit = 10): Promise<Recommendation[]> {
    const params = this.buildQueryParams({ limit });
    const response = await this.api.get<Recommendation[]>(`/recommendations/trending?${params}`);
    return this.handleResponse(response);
  }

  // === ANALYTICS (Admin uniquement) ===

  async getPlatformStats(): Promise<PlatformStats> {
    const response = await this.api.get<PlatformStats>('/analytics/platform');
    return this.handleResponse(response);
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    const response = await this.api.get<CategoryStats[]>('/analytics/categories');
    return this.handleResponse(response);
  }

  async getPopularAuthors(limit = 20): Promise<AuthorStats[]> {
    const params = this.buildQueryParams({ limit });
    const response = await this.api.get<AuthorStats[]>(`/analytics/authors/popular?${params}`);
    return this.handleResponse(response);
  }

  async getMostActiveUsers(days = 30, limit = 20): Promise<UserActivityStats[]> {
    const params = this.buildQueryParams({ days, limit });
    const response = await this.api.get<UserActivityStats[]>(`/analytics/users/active?${params}`);
    return this.handleResponse(response);
  }

  // === ADMIN - GESTION DES UTILISATEURS ===

  async getUsers(params: {
    search?: string;
    role?: string;
    enabled?: boolean;
    page?: number;
    size?: number;
  } = {}): Promise<PaginatedResponse<User>> {
    const queryParams = this.buildQueryParams({
      search: params.search,
      role: params.role,
      enabled: params.enabled,
      page: params.page || 0,
      size: params.size || 50,
    });
    const response = await this.api.get<PaginatedResponse<User>>(`/admin/users?${queryParams}`);
    return this.handleResponse(response);
  }

  async updateUserStatus(userId: number, enabled: boolean): Promise<User> {
    const response = await this.api.put<User>(`/admin/users/${userId}/status`, { enabled });
    return this.handleResponse(response);
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    const response = await this.api.put<User>(`/admin/users/${userId}/role`, { role });
    return this.handleResponse(response);
  }

  // === ANALYTICS AVANCÉES ===

  async getAnalytics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<{
    totalDownloads: number;
    activeUsers: number;
    newBooks: number;
    engagementRate: number;
    downloadGrowth: number;
    userGrowth: number;
    booksPerDay: number;
  }> {
    const response = await this.api.get(`/analytics/dashboard/${timeRange}`);
    return this.handleResponse(response);
  }

  async getAuthorStats(): Promise<AuthorStats[]> {
    const response = await this.api.get<AuthorStats[]>('/analytics/authors');
    return this.handleResponse(response);
  }

  async getUserActivity(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<UserActivityStats[]> {
    const response = await this.api.get<UserActivityStats[]>(`/analytics/users/activity/${timeRange}`);
    return this.handleResponse(response);
  }

  async clearDownloadHistory(): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>('/users/downloads/clear');
    return this.handleResponse(response);
  }

  // Endpoint de test temporaire
  async testDownloads(): Promise<any> {
    const response = await this.api.get('/admin/test/downloads');
    return this.handleResponse(response);
  }

  // Test de connectivité
  async ping(): Promise<any> {
    const response = await this.api.get('/books/test/ping');
    return this.handleResponse(response);
  }

  // Debug downloads
  async debugDownloads(): Promise<any> {
    const response = await this.api.get('/users/downloads-debug');
    return this.handleResponse(response);
  }

  // Diagnostic des téléchargements
  async getDownloadsDiagnostic(): Promise<any> {
    const response = await this.api.get('/users/downloads-diagnostic');
    return this.handleResponse(response);
  }

  // Debug downloads avancé
  async debugDownloadsAdvanced(): Promise<any> {
    const response = await this.api.get('/users/downloads-debug-advanced');
    return this.handleResponse(response);
  }

  // === FICHIERS ===

  getFileUrl(fileName: string): string {
    return `${API_BASE_URL}/files/download/${fileName}`;
  }

  getImageUrl(fileName: string): string {
    return `${API_BASE_URL}/files/images/${fileName}`;
  }
}

// Instance singleton de l'API
export const apiService = new ApiService();

// Export des méthodes pour une utilisation directe
export const {
  login,
  register,
  validateToken,
  logout,
  getUserProfile,
  updateUserProfile,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getUserDownloads,
  downloadBook,
  getBooks,
  getBook,
  searchBooks,
  getBooksByCategory,
  createBook,
  updateBook,
  deleteBook,
  uploadBookPdf,
  uploadBookCover,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  searchTags,
  createTag,
  updateTag,
  deleteTag,
  getPersonalizedRecommendations,
  getCategoryRecommendations,
  getSimilarBooks,
  getTrendingRecommendations,
  getPlatformStats,
  getCategoryStats,
  getPopularAuthors,
  getMostActiveUsers,
  getFileUrl,
  getImageUrl,
} = apiService;