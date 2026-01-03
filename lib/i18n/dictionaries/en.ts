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
    startups: "Startups",
    budgets: "Budgets",
    expenses: "Expenses",
    reports: "Reports",
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
        totalStartups: "Total Startups",
        totalBudget: "Total Budget Allocated",
        totalExpenses: "Total Expenses",
        activePrograms: "Active Programs",
      },
      quickActions: {
        title: "Quick Actions",
        addStartup: {
          title: "Add New Startup",
          description: "Register a new startup in the incubation program",
        },
        reviewExpenses: {
          title: "Review Expenses",
          description: "Check pending expense reports",
        },
        generateReport: {
          title: "Generate Report",
          description: "Create financial reports and exports",
        },
      },
    },

    startups: {
      title: "Startups",
      description: "Manage startups in the incubation program",
      addNew: "Add Startup",
      searchPlaceholder: "Search startups...",
      noStartups: "No startups found",
      noStartupsDescription: "Get started by creating your first startup",
      tryAdjustSearch: "Try adjusting your search query",
      table: {
        name: "Name",
        industry: "Industry",
        founders: "Founders",
        budget: "Budget",
        status: "Status",
        incubationPeriod: "Incubation Period",
        noFounders: "No founders",
        moreFounders: "more",
      },
      create: {
        title: "Add New Startup",
        description: "Register a new startup in the incubation program",
        cardTitle: "Startup Information",
        fields: {
          name: {
            label: "Startup Name",
            placeholder: "Acme Inc.",
          },
          description: {
            label: "Description",
            placeholder: "Brief description of the startup...",
            help: "What does this startup do?",
          },
          industry: {
            label: "Industry",
            placeholder: "e.g., FinTech, HealthTech",
          },
          incubationStart: {
            label: "Incubation Start Date",
          },
          incubationEnd: {
            label: "Incubation End Date",
          },
          totalBudget: {
            label: "Total Budget",
            placeholder: "50000",
            help: "Total budget allocated to this startup (in USD)",
          },
          founders: {
            label: "Founders",
            help: "Select one or more founders for this startup",
            noFounders: "No founders available",
            noFoundersDescription: "Please create founder accounts first.",
            loading: "Loading founders...",
          },
        },
        buttons: {
          create: "Create Startup",
          creating: "Creating...",
        },
      },
      delete: {
        title: "Are you sure?",
        description:
          "This will permanently delete the startup and all associated data. This action cannot be undone.",
        deleting: "Deleting...",
      },
    },

    budgets: {
      title: "Budget Management",
      description: "Manage budget allocations and categories for startups",
      addCategory: "Add Category",
      selectStartup: "Select a startup...",
      noStartups: "No startups available",
      noStartupsDescription: "Create a startup first to manage budgets",
      selectStartupPrompt: {
        title: "Select a startup",
        description:
          "Choose a startup from the dropdown above to view and manage its budget categories",
      },
      summary: {
        totalBudget: "Total Budget",
        totalAllocated: "Total Allocated",
        totalSpent: "Total Spent",
        ofBudget: "of budget",
        ofAllocated: "of allocated",
      },
      categories: {
        noCategories: "No budget categories",
        noCategoriesDescription:
          "Create your first budget category to start tracking expenses",
        table: {
          category: "Category",
          description: "Description",
          allocated: "Allocated",
          spent: "Spent",
          remaining: "Remaining",
          used: "used",
        },
      },
      delete: {
        title: "Are you sure?",
        description:
          "This will permanently delete the budget category. This action cannot be undone.",
        deleting: "Deleting...",
      },
    },

    expenses: {
      title: "Expense Management",
      description: "Review and approve expense requests from startups",
      filters: {
        status: "Status",
        all: "All",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
      },
      noExpenses: "No expenses found",
      noExpensesDescription: "No expense requests to review at this time",
      table: {
        startup: "Startup",
        category: "Category",
        description: "Description",
        amount: "Amount",
        date: "Date",
        status: "Status",
        submittedBy: "Submitted By",
      },
      actions: {
        approve: "Approve",
        reject: "Reject",
        viewDetails: "View Details",
      },
      approve: {
        title: "Approve Expense",
        description: "Are you sure you want to approve this expense?",
        approving: "Approving...",
      },
      reject: {
        title: "Reject Expense",
        description: "Please provide a reason for rejecting this expense",
        commentLabel: "Admin Comment",
        commentPlaceholder: "Reason for rejection...",
        rejecting: "Rejecting...",
      },
      status: {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
      },
    },

    settings: {
      title: "Settings",
      description: "Manage system settings and configurations",
      comingSoon: "Coming Soon",
      comingSoonDescription: "System settings will be available here",
    },

    reports: {
      title: "Reports",
      description: "Generate and export financial reports",
      comingSoon: "Coming Soon",
      comingSoonDescription:
        "Report generation features will be available here",
    },
  },

  // Founder Dashboard
  founder: {
    dashboard: {
      title: "Founder Dashboard",
      welcomeBack: "Welcome back",
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
    startups: "Loading startups...",
    budgets: "Loading budgets...",
    expenses: "Loading expenses...",
    founders: "Loading founders...",
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
