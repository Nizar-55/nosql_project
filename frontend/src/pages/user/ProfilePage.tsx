import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Download, 
  Heart,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { UserUpdateRequest } from '@/types';

interface ProfileStats {
  totalDownloads: number;
  totalFavorites: number;
  joinedDaysAgo: number;
  favoriteCategory: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isUpdating } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
  });

  // Statistiques simulées (dans une vraie app, ces données viendraient de l'API)
  const stats: ProfileStats = {
    totalDownloads: user?.downloadCount || 0,
    totalFavorites: user?.favoriteBookIds?.length || 0,
    joinedDaysAgo: user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    favoriteCategory: 'Fiction', // À récupérer depuis l'API
  };

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const updateData: UserUpdateRequest = {
        firstName: profileData.firstName || undefined,
        lastName: profileData.lastName || undefined,
        bio: profileData.bio || undefined,
      };

      await updateProfile(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Ici vous pourriez implémenter l'upload d'image
      console.log('Upload image:', file);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connexion requise
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vous devez être connecté pour voir votre profil.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mon profil | Online Library Platform</title>
        <meta name="description" content="Gérez votre profil et vos préférences" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mon profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        {/* Profil principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations personnelles</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Modifier</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isUpdating}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isUpdating}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Enregistrer
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0 text-center">
                  <div className="relative inline-block">
                    <Avatar
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      size="xl"
                      fallback={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Informations */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prénom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom
                      </label>
                      {isEditing ? (
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Votre prénom"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {user.firstName || 'Non renseigné'}
                        </p>
                      )}
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom
                      </label>
                      {isEditing ? (
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Votre nom"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {user.lastName || 'Non renseigné'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email (non modifiable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>

                  {/* Nom d'utilisateur (non modifiable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom d'utilisateur
                    </label>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{user.username}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Biographie
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Parlez-nous de vous..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {user.bio || 'Aucune biographie renseignée'}
                      </p>
                    )}
                  </div>

                  {/* Informations système */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Membre depuis le {formatDate(user.createdAt)}</span>
                    </div>
                    <Badge variant={(user.roleName === 'ROLE_ADMIN' || user.roleName === 'ADMIN') ? 'primary' : 'secondary'}>
                      {(user.roleName === 'ROLE_ADMIN' || user.roleName === 'ADMIN') ? 'Administrateur' : 'Utilisateur'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mes statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
                    <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDownloads}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Téléchargements
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg mx-auto mb-2">
                    <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalFavorites}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Favoris
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.joinedDaysAgo}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Jours d'ancienneté
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.favoriteCategory}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Catégorie préférée
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Préférences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Notifications par email
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir des notifications pour les nouveaux livres
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Recommandations personnalisées
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Utiliser mon historique pour des recommandations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Profil public
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permettre aux autres utilisateurs de voir votre profil
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};