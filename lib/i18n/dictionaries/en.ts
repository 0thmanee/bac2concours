/**
 * English Dictionary
 * All text content for the platform in English
 */

export const en = {
  // Common
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    close: "Close",
    confirm: "Confirm",
    search: "Search",
    filter: "Filter",
    actions: "Actions",
    noData: "No data available",
    error: "An error occurred",
    success: "Success",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    reset: "Reset",
    required: "Required",
    optional: "Optional",
  },

  // Authentication
  auth: {
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    rememberMe: "Remember me",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    verifyEmail: "Verify Email",
    emailVerified: "Email verified successfully",
    checkEmail: "Check your email",
    resetLinkSent: "Password reset link sent to your email",
    invalidCredentials: "Invalid email or password",
    welcomeBack: "Welcome back",
    getStarted: "Get started",
    emailNotVerified: "Please verify your email before signing in",
    verificationEmailSent: "Verification email sent. Please check your inbox.",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    books: "Books",
    videos: "Videos",
    users: "Users",
    payments: "Payments",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
  },

  // Admin Dashboard
  admin: {
    dashboard: {
      title: "Admin Dashboard",
      welcomeBack: "Welcome back",
      stats: {
        totalUsers: "Total Users",
        totalBooks: "Total Books",
        totalVideos: "Total Videos",
        pendingPayments: "Pending Payments",
      },
      quickActions: {
        title: "Quick Actions",
        addBook: {
          title: "Add New Book",
          description: "Add a new book to the library",
        },
        addVideo: {
          title: "Add New Video",
          description: "Add a new educational video",
        },
        reviewPayments: {
          title: "Review Payments",
          description: "Check pending payment submissions",
        },
      },
    },

    users: {
      title: "Users",
      description: "Manage platform users",
      addNew: "Add User",
      searchPlaceholder: "Search users...",
      noUsers: "No users found",
      noUsersDescription: "Get started by creating your first user",
      table: {
        name: "Name",
        email: "Email",
        role: "Role",
        status: "Status",
        createdAt: "Created At",
      },
    },

    books: {
      title: "Books",
      description: "Manage educational books and resources",
      addNew: "Add Book",
      searchPlaceholder: "Search books...",
      noBooks: "No books found",
      noBooksDescription: "Get started by adding your first book",
    },

    videos: {
      title: "Videos",
      description: "Manage educational videos",
      addNew: "Add Video",
      searchPlaceholder: "Search videos...",
      noVideos: "No videos found",
      noVideosDescription: "Get started by adding your first video",
    },

    settings: {
      title: "Settings",
      description: "Manage system settings and configurations",
      comingSoon: "Coming Soon",
      comingSoonDescription: "System settings will be available here",
    },
  },

  // Student Dashboard
  student: {
    dashboard: {
      title: "Student Dashboard",
      welcomeBack: "Welcome back",
    },
    books: {
      title: "Library",
      description: "Browse educational books and resources",
    },
    videos: {
      title: "Videos",
      description: "Watch educational videos",
    },
  },

  // Errors
  errors: {
    notFound: "Page not found",
    forbidden: "Access forbidden",
    unauthorized: "Unauthorized access",
    serverError: "Server error",
    networkError: "Network error",
    tryAgain: "Try again",
    goBack: "Go back",
    goHome: "Go to homepage",
  },

  // Validation Messages
  validation: {
    required: "This field is required",
    email: "Please enter a valid email address",
    minLength: "Must be at least {min} characters",
    maxLength: "Must be at most {max} characters",
    min: "Must be at least {min}",
    max: "Must be at most {max}",
    passwordMismatch: "Passwords do not match",
    invalidDate: "Invalid date",
    dateRange: "End date must be after start date",
  },

  // Loading States
  loading: {
    page: "Loading page...",
    data: "Loading data...",
    users: "Loading users...",
    books: "Loading books...",
    videos: "Loading videos...",
    saving: "Saving...",
    creating: "Creating...",
    updating: "Updating...",
    deleting: "Deleting...",
    submitting: "Submitting...",
  },

  // Empty States
  empty: {
    noResults: "No results found",
    noData: "No data available",
    startSearch: "Start searching to see results",
  },
};

export type Dictionary = typeof en;
