import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '@/services/api';
import type { User, LoginRequest, RegisterRequest } from '@/types';
import { toast } from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isUpdating: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiService.login(credentials);
          
          // Stocker le token
          localStorage.setItem('accessToken', response.accessToken);
          
          // Récupérer les informations complètes de l'utilisateur
          const userProfile = await apiService.getUserProfile();
          
          set({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          toast.success(`Bienvenue, ${userProfile.firstName || userProfile.username} !`);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur de connexion';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          await apiService.register(userData);
          
          set({ isLoading: false, error: null });
          
          toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          // Ignorer les erreurs de déconnexion côté serveur
          console.warn('Erreur lors de la déconnexion côté serveur:', error);
        } finally {
          // Nettoyer l'état local dans tous les cas
          localStorage.removeItem('accessToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          toast.success('Déconnexion réussie');
        }
      },

      validateToken: async () => {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        try {
          set({ isLoading: true });
          
          const user = await apiService.validateToken();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token invalide ou expiré
          localStorage.removeItem('accessToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      updateProfile: async (userData: any) => {
        try {
          set({ isUpdating: true, error: null });
          
          const updatedUser = await apiService.updateUserProfile(userData);
          
          set({
            user: updatedUser,
            isUpdating: false,
            error: null,
          });
          
          toast.success('Profil mis à jour avec succès !');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
          set({
            isUpdating: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Sélecteurs pour une utilisation optimisée
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Hook pour vérifier les rôles
export const useHasRole = (role: string) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  
  const userRole = user.roleName.startsWith('ROLE_') ? user.roleName : `ROLE_${user.roleName}`;
  const targetRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
  
  return userRole === targetRole;
};

export const useIsAdmin = () => useHasRole('ROLE_ADMIN');
export const useIsUser = () => useHasRole('ROLE_USER');