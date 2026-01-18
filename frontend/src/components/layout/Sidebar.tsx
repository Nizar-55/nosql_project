import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Heart, 
  Download, 
  User, 
  Settings, 
  BarChart3,
  Users,
  Tag,
  Folder,
  TrendingUp
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import { cn } from '@/utils/cn';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Livres', href: '/books', icon: BookOpen },
  { name: 'Favoris', href: '/favorites', icon: Heart },
  { name: 'Téléchargements', href: '/downloads', icon: Download },
  { name: 'Profil', href: '/profile', icon: User },
];

const adminNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Gestion Livres', href: '/admin/books', icon: BookOpen },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  
  const isAdmin = user?.roleName === 'ROLE_ADMIN' || user?.roleName === 'ADMIN';

  const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)} // Fermer sur mobile
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          isActive
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
            : 'text-gray-700 dark:text-gray-300'
        )}
      >
        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
        {item.badge && (
          <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
          'transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white"
            >
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span>Library</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* Navigation principale */}
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>

            {/* Navigation utilisateur authentifié */}
            {isAuthenticated && (
              <>
                <div className="pt-6">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mon Compte
                  </h3>
                  <div className="mt-2 space-y-1">
                    <NavLink item={{ name: 'Mes Favoris', href: '/favorites', icon: Heart }} />
                    <NavLink item={{ name: 'Mes Téléchargements', href: '/downloads', icon: Download }} />
                    <NavLink item={{ name: 'Mon Profil', href: '/profile', icon: User }} />
                  </div>
                </div>
              </>
            )}

            {/* Navigation admin */}
            {isAuthenticated && isAdmin && (
              <div className="pt-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Administration
                </h3>
                <div className="mt-2 space-y-1">
                  {adminNavigation.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Catégories rapides */}
            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Catégories
              </h3>
              <div className="mt-2 space-y-1">
                <Link
                  to="/books?category=science-fiction"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Folder className="w-4 h-4 mr-3 text-blue-500" />
                  Science Fiction
                </Link>
                <Link
                  to="/books?category=romance"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Folder className="w-4 h-4 mr-3 text-pink-500" />
                  Romance
                </Link>
                <Link
                  to="/books?category=thriller"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Folder className="w-4 h-4 mr-3 text-red-500" />
                  Thriller
                </Link>
                <Link
                  to="/books?category=science"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Folder className="w-4 h-4 mr-3 text-green-500" />
                  Science
                </Link>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2024 Online Library
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};