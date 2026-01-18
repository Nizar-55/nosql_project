import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/types';
import { toast } from 'react-hot-toast';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading, isAuthenticated } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginData: LoginRequest = {
        username: data.username,
        password: data.password,
      };

      await login(loginData);
      
      // Redirection après connexion réussie
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (error: any) {
      // Gérer les erreurs spécifiques
      if (error.response?.status === 401) {
        setError('username', { message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        setError('password', { message: 'Nom d\'utilisateur ou mot de passe incorrect' });
      } else if (error.response?.status === 403) {
        toast.error('Compte désactivé. Contactez l\'administrateur.');
      } else {
        toast.error('Erreur de connexion. Veuillez réessayer.');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Connexion - Online Library Platform</title>
        <meta name="description" content="Connectez-vous à votre compte pour accéder à votre bibliothèque personnelle." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <BookOpen className="w-8 h-8" />
              <span>Library</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Bon retour !
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Connectez-vous à votre compte pour continuer
            </p>
          </motion.div>

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Nom d'utilisateur */}
                  <div>
                    <Input
                      {...register('username', {
                        required: 'Le nom d\'utilisateur est requis',
                        minLength: {
                          value: 3,
                          message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
                        },
                      })}
                      label="Nom d'utilisateur"
                      placeholder="Entrez votre nom d'utilisateur"
                      leftIcon={<Mail className="w-4 h-4" />}
                      error={errors.username?.message}
                      autoComplete="username"
                      autoFocus
                    />
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <Input
                      {...register('password', {
                        required: 'Le mot de passe est requis',
                        minLength: {
                          value: 6,
                          message: 'Le mot de passe doit contenir au moins 6 caractères',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      label="Mot de passe"
                      placeholder="Entrez votre mot de passe"
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                      error={errors.password?.message}
                      autoComplete="current-password"
                    />
                  </div>

                  {/* Se souvenir de moi */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        {...register('rememberMe')}
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Se souvenir de moi
                      </label>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {/* Bouton de connexion */}
                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    className="text-base py-3"
                  >
                    Se connecter
                  </Button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Nouveau sur la plateforme ?
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lien d'inscription */}
                <div className="mt-6 text-center">
                  <Link
                    to="/register"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    Créer un compte gratuit
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Liens utiles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center space-y-2"
          >
            <Link
              to="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};