import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  searchQuery: string;
  selectedCategory: number | null;
  selectedTags: string[];
  selectedLanguage: string | null;
  selectedAuthor: string | null;
  yearRange: [number | null, number | null];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  pageSize: number;
}

interface AppActions {
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  setSelectedTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setSelectedLanguage: (language: string | null) => void;
  setSelectedAuthor: (author: string | null) => void;
  setYearRange: (range: [number | null, number | null]) => void;
  setSortBy: (sortBy: string) => void;
  setSortDir: (sortDir: 'asc' | 'desc') => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // État initial
      theme: 'light',
      sidebarOpen: false,
      searchQuery: '',
      selectedCategory: null,
      selectedTags: [],
      selectedLanguage: null,
      selectedAuthor: null,
      yearRange: [null, null],
      sortBy: 'createdAt',
      sortDir: 'desc',
      pageSize: 12,

      // Actions
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        
        // Appliquer le thème au document
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        
        // Appliquer le thème au document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedCategory: (categoryId: number | null) => {
        set({ selectedCategory: categoryId });
      },

      setSelectedTags: (tags: string[]) => {
        set({ selectedTags: tags });
      },

      addTag: (tag: string) => {
        const currentTags = get().selectedTags;
        if (!currentTags.includes(tag)) {
          set({ selectedTags: [...currentTags, tag] });
        }
      },

      removeTag: (tag: string) => {
        const currentTags = get().selectedTags;
        set({ selectedTags: currentTags.filter(t => t !== tag) });
      },

      setSelectedLanguage: (language: string | null) => {
        set({ selectedLanguage: language });
      },

      setSelectedAuthor: (author: string | null) => {
        set({ selectedAuthor: author });
      },

      setYearRange: (range: [number | null, number | null]) => {
        set({ yearRange: range });
      },

      setSortBy: (sortBy: string) => {
        set({ sortBy });
      },

      setSortDir: (sortDir: 'asc' | 'desc') => {
        set({ sortDir });
      },

      setPageSize: (size: number) => {
        set({ pageSize: size });
      },

      resetFilters: () => {
        set({
          searchQuery: '',
          selectedCategory: null,
          selectedTags: [],
          selectedLanguage: null,
          selectedAuthor: null,
          yearRange: [null, null],
          sortBy: 'createdAt',
          sortDir: 'desc',
        });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sortBy: state.sortBy,
        sortDir: state.sortDir,
        pageSize: state.pageSize,
      }),
    }
  )
);

// Sélecteurs pour une utilisation optimisée
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);
export const useSelectedCategory = () => useAppStore((state) => state.selectedCategory);
export const useSelectedTags = () => useAppStore((state) => state.selectedTags);
export const useSortBy = () => useAppStore((state) => state.sortBy);
export const useSortDir = () => useAppStore((state) => state.sortDir);
export const usePageSize = () => useAppStore((state) => state.pageSize);

// Hook pour les filtres actifs
export const useActiveFilters = () => {
  return useAppStore((state) => ({
    searchQuery: state.searchQuery,
    selectedCategory: state.selectedCategory,
    selectedTags: state.selectedTags,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
  }));
};

// Hook pour vérifier si des filtres sont actifs
export const useHasActiveFilters = () => {
  return useAppStore((state) => 
    state.searchQuery !== '' || 
    state.selectedCategory !== null || 
    state.selectedTags.length > 0 ||
    state.selectedLanguage !== null ||
    state.selectedAuthor !== null ||
    state.yearRange[0] !== null ||
    state.yearRange[1] !== null
  );
};