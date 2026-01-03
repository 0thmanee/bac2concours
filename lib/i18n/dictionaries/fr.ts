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
    startups: "Startups",
    budgets: "Budgets",
    expenses: "Dépenses",
    reports: "Rapports",
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
        totalStartups: "Total Startups",
        totalBudget: "Budget Total Alloué",
        totalExpenses: "Dépenses Totales",
        activePrograms: "Programmes Actifs",
      },
      quickActions: {
        title: "Actions Rapides",
        addStartup: {
          title: "Ajouter une Startup",
          description:
            "Enregistrer une nouvelle startup dans le programme d'incubation",
        },
        reviewExpenses: {
          title: "Examiner les Dépenses",
          description: "Vérifier les rapports de dépenses en attente",
        },
        generateReport: {
          title: "Générer un Rapport",
          description: "Créer des rapports financiers et des exports",
        },
      },
    },

    startups: {
      title: "Startups",
      description: "Gérer les startups dans le programme d'incubation",
      addNew: "Ajouter une Startup",
      searchPlaceholder: "Rechercher des startups...",
      noStartups: "Aucune startup trouvée",
      noStartupsDescription: "Commencez par créer votre première startup",
      tryAdjustSearch: "Essayez d'ajuster votre requête de recherche",
      table: {
        name: "Nom",
        industry: "Industrie",
        founders: "Fondateurs",
        budget: "Budget",
        status: "Statut",
        incubationPeriod: "Période d'Incubation",
        noFounders: "Aucun fondateur",
        moreFounders: "de plus",
      },
      create: {
        title: "Ajouter une Nouvelle Startup",
        description:
          "Enregistrer une nouvelle startup dans le programme d'incubation",
        cardTitle: "Informations sur la Startup",
        fields: {
          name: {
            label: "Nom de la Startup",
            placeholder: "Acme Inc.",
          },
          description: {
            label: "Description",
            placeholder: "Brève description de la startup...",
            help: "Que fait cette startup?",
          },
          industry: {
            label: "Industrie",
            placeholder: "par ex., FinTech, HealthTech",
          },
          incubationStart: {
            label: "Date de Début d'Incubation",
          },
          incubationEnd: {
            label: "Date de Fin d'Incubation",
          },
          totalBudget: {
            label: "Budget Total",
            placeholder: "50000",
            help: "Budget total alloué à cette startup (en USD)",
          },
          founders: {
            label: "Fondateurs",
            help: "Sélectionnez un ou plusieurs fondateurs pour cette startup",
            noFounders: "Aucun fondateur disponible",
            noFoundersDescription:
              "Veuillez d'abord créer des comptes de fondateurs.",
            loading: "Chargement des fondateurs...",
          },
        },
        buttons: {
          create: "Créer la Startup",
          creating: "Création...",
        },
      },
      delete: {
        title: "Êtes-vous sûr?",
        description:
          "Cela supprimera définitivement la startup et toutes les données associées. Cette action ne peut pas être annulée.",
        deleting: "Suppression...",
      },
    },

    budgets: {
      title: "Gestion du Budget",
      description:
        "Gérer les allocations budgétaires et les catégories pour les startups",
      addCategory: "Ajouter une Catégorie",
      selectStartup: "Sélectionner une startup...",
      noStartups: "Aucune startup disponible",
      noStartupsDescription: "Créez d'abord une startup pour gérer les budgets",
      selectStartupPrompt: {
        title: "Sélectionner une startup",
        description:
          "Choisissez une startup dans le menu déroulant ci-dessus pour voir et gérer ses catégories de budget",
      },
      summary: {
        totalBudget: "Budget Total",
        totalAllocated: "Total Alloué",
        totalSpent: "Total Dépensé",
        ofBudget: "du budget",
        ofAllocated: "de l'alloué",
      },
      categories: {
        noCategories: "Aucune catégorie de budget",
        noCategoriesDescription:
          "Créez votre première catégorie de budget pour commencer à suivre les dépenses",
        table: {
          category: "Catégorie",
          description: "Description",
          allocated: "Alloué",
          spent: "Dépensé",
          remaining: "Restant",
          used: "utilisé",
        },
      },
      delete: {
        title: "Êtes-vous sûr?",
        description:
          "Cela supprimera définitivement la catégorie de budget. Cette action ne peut pas être annulée.",
        deleting: "Suppression...",
      },
    },

    expenses: {
      title: "Gestion des Dépenses",
      description:
        "Examiner et approuver les demandes de dépenses des startups",
      filters: {
        status: "Statut",
        all: "Tous",
        pending: "En attente",
        approved: "Approuvé",
        rejected: "Rejeté",
      },
      noExpenses: "Aucune dépense trouvée",
      noExpensesDescription:
        "Aucune demande de dépense à examiner pour le moment",
      table: {
        startup: "Startup",
        category: "Catégorie",
        description: "Description",
        amount: "Montant",
        date: "Date",
        status: "Statut",
        submittedBy: "Soumis par",
      },
      actions: {
        approve: "Approuver",
        reject: "Rejeter",
        viewDetails: "Voir les Détails",
      },
      approve: {
        title: "Approuver la Dépense",
        description: "Êtes-vous sûr de vouloir approuver cette dépense?",
        approving: "Approbation...",
      },
      reject: {
        title: "Rejeter la Dépense",
        description:
          "Veuillez fournir une raison pour le rejet de cette dépense",
        commentLabel: "Commentaire Admin",
        commentPlaceholder: "Raison du rejet...",
        rejecting: "Rejet...",
      },
      status: {
        pending: "En attente",
        approved: "Approuvé",
        rejected: "Rejeté",
      },
    },

    settings: {
      title: "Paramètres",
      description: "Gérer les paramètres et configurations du système",
      comingSoon: "Bientôt Disponible",
      comingSoonDescription: "Les paramètres système seront disponibles ici",
    },

    reports: {
      title: "Rapports",
      description: "Générer et exporter des rapports financiers",
      comingSoon: "Bientôt Disponible",
      comingSoonDescription:
        "Les fonctionnalités de génération de rapports seront disponibles ici",
    },
  },

  // Founder Dashboard
  founder: {
    dashboard: {
      title: "Tableau de bord Fondateur",
      welcomeBack: "Bon retour",
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
    startups: "Chargement des startups...",
    budgets: "Chargement des budgets...",
    expenses: "Chargement des dépenses...",
    founders: "Chargement des fondateurs...",
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
