/**
 * French Dictionary
 * All text content for the platform in French
 */

import type { Dictionary } from "./en";

export const fr: Dictionary = {
  // Common
  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    update: "Mettre à jour",
    close: "Fermer",
    confirm: "Confirmer",
    search: "Rechercher",
    filter: "Filtrer",
    actions: "Actions",
    noData: "Aucune donnée disponible",
    error: "Une erreur s'est produite",
    success: "Succès",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    submit: "Soumettre",
    reset: "Réinitialiser",
    required: "Requis",
    optional: "Optionnel",
  },

  // Authentication
  auth: {
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    signUp: "S'inscrire",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    forgotPassword: "Mot de passe oublié?",
    resetPassword: "Réinitialiser le mot de passe",
    rememberMe: "Se souvenir de moi",
    noAccount: "Vous n'avez pas de compte?",
    hasAccount: "Vous avez déjà un compte?",
    verifyEmail: "Vérifier l'email",
    emailVerified: "Email vérifié avec succès",
    checkEmail: "Vérifiez votre email",
    resetLinkSent: "Lien de réinitialisation envoyé à votre email",
    invalidCredentials: "Email ou mot de passe invalide",
    welcomeBack: "Bon retour",
    getStarted: "Commencer",
    emailNotVerified: "Veuillez vérifier votre email avant de vous connecter",
    verificationEmailSent:
      "Email de vérification envoyé. Veuillez vérifier votre boîte de réception.",
  },

  // Navigation
  nav: {
    dashboard: "Tableau de bord",
    books: "Livres",
    videos: "Vidéos",
    users: "Utilisateurs",
    payments: "Paiements",
    settings: "Paramètres",
    profile: "Profil",
    logout: "Déconnexion",
  },

  // Admin Dashboard
  admin: {
    dashboard: {
      title: "Tableau de bord Admin",
      welcomeBack: "Bon retour",
      stats: {
        totalUsers: "Total Utilisateurs",
        totalBooks: "Total Livres",
        totalVideos: "Total Vidéos",
        pendingPayments: "Paiements en Attente",
      },
      quickActions: {
        title: "Actions Rapides",
        addBook: {
          title: "Ajouter un Livre",
          description: "Ajouter un nouveau livre à la bibliothèque",
        },
        addVideo: {
          title: "Ajouter une Vidéo",
          description: "Ajouter une nouvelle vidéo éducative",
        },
        reviewPayments: {
          title: "Examiner les Paiements",
          description: "Vérifier les paiements en attente",
        },
      },
    },

    users: {
      title: "Utilisateurs",
      description: "Gérer les utilisateurs de la plateforme",
      addNew: "Ajouter un Utilisateur",
      searchPlaceholder: "Rechercher des utilisateurs...",
      noUsers: "Aucun utilisateur trouvé",
      noUsersDescription: "Commencez par créer votre premier utilisateur",
      table: {
        name: "Nom",
        email: "Email",
        role: "Rôle",
        status: "Statut",
        createdAt: "Date de création",
      },
    },

    books: {
      title: "Livres",
      description: "Gérer les livres et ressources éducatives",
      addNew: "Ajouter un Livre",
      searchPlaceholder: "Rechercher des livres...",
      noBooks: "Aucun livre trouvé",
      noBooksDescription: "Commencez par ajouter votre premier livre",
    },

    videos: {
      title: "Vidéos",
      description: "Gérer les vidéos éducatives",
      addNew: "Ajouter une Vidéo",
      searchPlaceholder: "Rechercher des vidéos...",
      noVideos: "Aucune vidéo trouvée",
      noVideosDescription: "Commencez par ajouter votre première vidéo",
    },

    settings: {
      title: "Paramètres",
      description: "Gérer les paramètres et configurations du système",
      comingSoon: "Bientôt Disponible",
      comingSoonDescription: "Les paramètres système seront disponibles ici",
    },
  },

  // Student Dashboard
  student: {
    dashboard: {
      title: "Tableau de bord Étudiant",
      welcomeBack: "Bon retour",
    },
    books: {
      title: "Bibliothèque",
      description: "Parcourir les livres et ressources éducatives",
    },
    videos: {
      title: "Vidéos",
      description: "Regarder les vidéos éducatives",
    },
  },

  // Errors
  errors: {
    notFound: "Page non trouvée",
    forbidden: "Accès interdit",
    unauthorized: "Accès non autorisé",
    serverError: "Erreur serveur",
    networkError: "Erreur réseau",
    tryAgain: "Réessayer",
    goBack: "Retour",
    goHome: "Aller à l'accueil",
  },

  // Validation Messages
  validation: {
    required: "Ce champ est requis",
    email: "Veuillez entrer une adresse email valide",
    minLength: "Doit contenir au moins {min} caractères",
    maxLength: "Doit contenir au plus {max} caractères",
    min: "Doit être au moins {min}",
    max: "Doit être au plus {max}",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    invalidDate: "Date invalide",
    dateRange: "La date de fin doit être après la date de début",
  },

  // Loading States
  loading: {
    page: "Chargement de la page...",
    data: "Chargement des données...",
    users: "Chargement des utilisateurs...",
    books: "Chargement des livres...",
    videos: "Chargement des vidéos...",
    saving: "Enregistrement...",
    creating: "Création...",
    updating: "Mise à jour...",
    deleting: "Suppression...",
    submitting: "Soumission...",
  },

  // Empty States
  empty: {
    noResults: "Aucun résultat trouvé",
    noData: "Aucune donnée disponible",
    startSearch: "Commencez à rechercher pour voir les résultats",
  },
};
