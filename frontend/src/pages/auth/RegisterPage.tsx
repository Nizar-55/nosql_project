import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { BookOpen, Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import type { RegisterRequest } from '@/types';
import { toast } from 'react-hot-toast';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    // Vérifier que les mots de passe correspondent
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Les mots de passe ne correspondent pas' });
      return;
    }

    // Vérifier l'acceptation des conditions
    if (!data.acceptTerms) {
      toast.error('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    try {
      const registerData: RegisterRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      await registerUser(registerData);
      
      // Redirection vers la page de connexion avec message de succès
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
      
    } catch (error: any) {
      // Gérer les erreurs spécifiques
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || '';
        if (message.includes('username')) {
          setError('username', { message: 'Ce nom d\'utilisateur est déjà pris' });
        } else if (message.includes('email')) {
          setError('email', { message: 'Cette adresse email est déjà utilisée' });
        } else {
          toast.error('Données invalides. Veuillez vérifier vos informations.');
        }
      } else {
        toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    }
  };

  // Validation de la force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Très faible', color: 'text-red-600' },
      { score: 2, label: 'Faible', color: 'text-orange-600' },
      { score: 3, label: 'Moyen', color: 'text-yellow-600' },
      { score: 4, label: 'Fort', color: 'text-green-600' },
      { score: 5, label: 'Très fort', color: 'text-green-700' },
    ];

    return levels[score];
  };

  const passwordStrength = getPasswordStrength(password || '');

  return (
    <>
      <Helmet>
        <title>Inscription - Online Library Platform</title>
        <meta name="description" content="Créez votre compte gratuit pour accéder à des milliers de livres et bénéficier de recommandations personnalisées." />
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
              Rejoignez-nous !
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Créez votre compte gratuit et découvrez des milliers de livres
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
                  {/* Prénom et Nom */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      {...register('firstName', {
                        required: 'Le prénom est requis',
                        minLength: {
                          value: 2,
                          message: 'Le prénom doit contenir au moins 2 caractères',
                        },
                      })}
                      label="Prénom"
                      placeholder="Votre prénom"
                      leftIcon={<User className="w-4 h-4" />}
                      error={errors.firstName?.message}
                      autoComplete="given-name"
                    />
                    
                    <Input
                      {...register('lastName', {
                        required: 'Le nom est requis',
                        minLength: {
                          value: 2,
                          message: 'Le nom doit contenir au moins 2 caractères',
                        },
                      })}
                      label="Nom"
                      placeholder="Votre nom"
                      error={errors.lastName?.message}
                      autoComplete="family-name"
                    />
                  </div>

                  {/* Nom d'utilisateur */}
                  <Input
                    {...register('username', {
                      required: 'Le nom d\'utilisateur est requis',
                      minLength: {
                        value: 3,
                        message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores',
                      },
                    })}
                    label="Nom d'utilisateur"
                    placeholder="Choisissez un nom d'utilisateur"
                    leftIcon={<User className="w-4 h-4" />}
                    error={errors.username?.message}
                    autoComplete="username"
                  />

                  {/* Email */}
                  <Input
                    {...register('email', {
                      required: 'L\'adresse email est requise',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Adresse email invalide',
                      },
                    })}
                    type="email"
                    label="Adresse email"
                    placeholder="votre@email.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={errors.email?.message}
                    autoComplete="email"
                  />

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
                      placeholder="Choisissez un mot de passe"
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
                      autoComplete="new-password"
                    />
                    
                    {/* Indicateur de force du mot de passe */}
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.score <= 2 ? 'bg-red-500' :
                                passwordStrength.score <= 3 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmation du mot de passe */}
                  <Input
                    {...register('confirmPassword', {
                      required: 'Veuillez confirmer votre mot de passe',
                      validate: (value) =>
                        value === password || 'Les mots de passe ne correspondent pas',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirmer le mot de passe"
                    placeholder="Confirmez votre mot de passe"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    error={errors.confirmPassword?.message}
                    autoComplete="new-password"
                  />

                  {/* Conditions d'utilisation */}
                  <div className="flex items-start">
                    <input
                      {...register('acceptTerms', {
                        required: 'Vous devez accepter les conditions d\'utilisation',
                      })}
                      id="accept-terms"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      J'accepte les{' '}
                      <Link
                        to="/terms"
                        className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                        target="_blank"
                      >
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link
                        to="/privacy"
                        className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                        target="_blank"
                      >
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.acceptTerms.message}
                    </p>
                  )}

                  {/* Bouton d'inscription */}
                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    className="text-base py-3"
                  >
                    Créer mon compte
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
                        Déjà un compte ?
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lien de connexion */}
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    Se connecter
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