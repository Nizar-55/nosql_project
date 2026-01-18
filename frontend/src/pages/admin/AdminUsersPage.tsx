import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail,
  Calendar,
  Download,
  Heart,
  MoreHorizontal,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { User } from '@/types';

const ROLE_COLORS = {
  ROLE_ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  ROLE_USER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const STATUS_COLORS = {
  enabled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  disabled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export const AdminUsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'enable' | 'disable' | 'promote' | 'demote' | null>(null);

  const queryClient = useQueryClient();

  // Vérifier l'authentification
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.roleName === 'ROLE_ADMIN' || user?.roleName === 'ADMIN';

  // Récupérer la liste des utilisateurs
  const { data: users, isLoading } = useQuery(
    ['admin-users', searchQuery, roleFilter, statusFilter],
    () => apiService.getUsers({
      search: searchQuery || undefined,
      role: roleFilter || undefined,
      enabled: statusFilter ? statusFilter === 'enabled' : undefined,
    }),
    {
      enabled: isAuthenticated && isAdmin,
      staleTime: 30 * 1000, // 30 secondes
    }
  );

  // Mutations pour les actions utilisateur
  const toggleUserStatusMutation = useMutation(
    ({ userId, enabled }: { userId: number; enabled: boolean }) =>
      apiService.updateUserStatus(userId, enabled),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        setSelectedUser(null);
        setActionType(null);
      },
    }
  );

  const updateUserRoleMutation = useMutation(
    ({ userId, role }: { userId: number; role: string }) =>
      apiService.updateUserRole(userId, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        setSelectedUser(null);
        setActionType(null);
      },
    }
  );

  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      switch (actionType) {
        case 'enable':
          await toggleUserStatusMutation.mutateAsync({ userId: selectedUser.id, enabled: true });
          break;
        case 'disable':
          await toggleUserStatusMutation.mutateAsync({ userId: selectedUser.id, enabled: false });
          break;
        case 'promote':
          await updateUserRoleMutation.mutateAsync({ userId: selectedUser.id, role: 'ROLE_ADMIN' });
          break;
        case 'demote':
          await updateUserRoleMutation.mutateAsync({ userId: selectedUser.id, role: 'ROLE_USER' });
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'action utilisateur:', error);
    }
  };

  const getActionText = () => {
    if (!selectedUser || !actionType) return '';
    
    switch (actionType) {
      case 'enable':
        return `Êtes-vous sûr de vouloir activer le compte de ${selectedUser.username} ?`;
      case 'disable':
        return `Êtes-vous sûr de vouloir désactiver le compte de ${selectedUser.username} ? L'utilisateur ne pourra plus se connecter.`;
      case 'promote':
        return `Êtes-vous sûr de vouloir promouvoir ${selectedUser.username} en tant qu'administrateur ?`;
      case 'demote':
        return `Êtes-vous sûr de vouloir rétrograder ${selectedUser.username} en tant qu'utilisateur standard ?`;
      default:
        return '';
    }
  };

  const filteredUsers = users?.content || [];

  return (
    <>
      <Helmet>
        <title>Gestion des utilisateurs | Admin - Online Library Platform</title>
        <meta name="description" content="Interface d'administration pour gérer les utilisateurs" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} enregistré{filteredUsers.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Input
                type="search"
                placeholder="Rechercher par nom, email, nom d'utilisateur..."
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

          {/* Filtre par rôle */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Tous les rôles</option>
              <option value="ROLE_USER">Utilisateurs</option>
              <option value="ROLE_ADMIN">Administrateurs</option>
            </select>
          </div>

          {/* Filtre par statut */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="enabled">Actifs</option>
              <option value="disabled">Désactivés</option>
            </select>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <Avatar
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          size="lg"
                          fallback={`${user.firstName?.[0] || ''}${user.lastName?.[0] || user.username[0]}`}
                        />

                        {/* Informations utilisateur */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username
                                  }
                                </h3>
                                
                                <Badge className={ROLE_COLORS[user.roleName as keyof typeof ROLE_COLORS]}>
                                  {user.roleName === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur'}
                                </Badge>
                                
                                <Badge className={STATUS_COLORS[user.enabled ? 'enabled' : 'disabled']}>
                                  {user.enabled ? 'Actif' : 'Désactivé'}
                                </Badge>
                              </div>

                              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 mt-1">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{user.email}</span>
                              </div>

                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                @{user.username}
                              </div>

                              {/* Statistiques */}
                              <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Download className="w-4 h-4" />
                                  <span>{user.downloadCount} téléchargements</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{user.favoriteBookIds?.length || 0} favoris</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Inscrit le {formatDate(user.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <DropdownMenu
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              }
                              items={[
                                {
                                  label: user.enabled ? 'Désactiver' : 'Activer',
                                  icon: user.enabled ? UserX : UserCheck,
                                  onClick: () => {
                                    setSelectedUser(user);
                                    setActionType(user.enabled ? 'disable' : 'enable');
                                  },
                                  className: user.enabled ? 'text-red-600' : 'text-green-600',
                                },
                                {
                                  label: (user.roleName === 'ROLE_ADMIN' || user.roleName === 'ADMIN') ? 'Rétrograder' : 'Promouvoir admin',
                                  icon: Shield,
                                  onClick: () => {
                                    setSelectedUser(user);
                                    setActionType((user.roleName === 'ROLE_ADMIN' || user.roleName === 'ADMIN') ? 'demote' : 'promote');
                                  },
                                  className: 'text-blue-600',
                                },
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || roleFilter || statusFilter
                    ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                    : 'Aucun utilisateur enregistré pour le moment.'
                  }
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <ConfirmDialog
        isOpen={!!selectedUser && !!actionType}
        onClose={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
        onConfirm={handleUserAction}
        title={`${actionType === 'enable' ? 'Activer' : actionType === 'disable' ? 'Désactiver' : actionType === 'promote' ? 'Promouvoir' : 'Rétrograder'} l'utilisateur`}
        description={getActionText()}
        confirmText={actionType === 'enable' ? 'Activer' : actionType === 'disable' ? 'Désactiver' : actionType === 'promote' ? 'Promouvoir' : 'Rétrograder'}
        cancelText="Annuler"
        variant={actionType === 'disable' ? 'danger' : 'primary'}
        loading={toggleUserStatusMutation.isLoading || updateUserRoleMutation.isLoading}
      />
    </>
  );
};