/**
 * 2BAConcours Design System Tokens
 *
 * Based on brand guidelines:
 * - Primary: Brand Purple (#b02d94) - Education, ambition, excellence
 * - Secondary: Pink (#e84393) - Energy, action, engagement
 * - Typography: Inter font family
 * - Style: Modern educational platform
 */

export const designTokens = {
  // Brand Colors (2BAConcours)
  colors: {
    primary: {
      // Brand Purple - Education, ambition, excellence
      main: "#b02d94",
      alternative: "#8b2277", // Darker variant
      rgb: "176 45 148", // RGB values for CSS variables
    },
    secondary: {
      // Pink - Energy, action, engagement
      pink: "#e84393",
      light: "#f368a0",
      rgb: "232 67 147", // Pink RGB
    },
    accent: {
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
    backgrounds: {
      main: "#F8FAFC",
      card: "#FFFFFF",
      border: "#E5E7EB",
    },
    
    // Vibrant Metric Colors (Modern dashboard inspired)
    metrics: {
      blue: {
        light: "#E8F1FF",
        main: "#5B93FF",
        dark: "#3B6DA3",
        rgb: "232 241 255",
      },
      orange: {
        light: "#FFF5E6",
        main: "#FF9F43",
        dark: "#E8843C",
        rgb: "255 245 230",
      },
      cyan: {
        light: "#E6F9FF",
        main: "#00CFE8",
        dark: "#00ACC1",
        rgb: "230 249 255",
      },
      rose: {
        light: "#FFE8E8",
        main: "#FF6B6B",
        dark: "#E85B5B",
        rgb: "255 232 232",
      },
      mint: {
        light: "#E6FFF5",
        main: "#28C76F",
        dark: "#1FAF5F",
        rgb: "230 255 245",
      },
      purple: {
        light: "#F0ECFF",
        main: "#7367F0",
        dark: "#5E55E0",
        rgb: "240 236 255",
      },
      yellow: {
        light: "#FFF8E1",
        main: "#FFC107",
        dark: "#FFA000",
        rgb: "255 248 225",
      },
      teal: {
        light: "#E0F2F1",
        main: "#00BFA5",
        dark: "#00A085",
        rgb: "224 242 241",
      },
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "Inter, system-ui, -apple-system, sans-serif",
      mono: "ui-monospace, SFMono-Regular, monospace",
    },
    weights: {
      regular: 400, // Body
      medium: 500, // Labels
      semibold: 600, // Headings
      bold: 700, // Key metrics
    },
    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
    },
  },

  // Spacing
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
  },

  // Border Radius
  radius: {
    sm: "4px",
    base: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },

  // Shadows (subtle, professional)
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },

  // Layout
  layout: {
    maxWidth: {
      container: "1280px",
      content: "1200px",
    },
    sidebar: {
      width: "256px",
      collapsedWidth: "64px",
    },
  },

  // Breakpoints (Tailwind defaults)
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;

/**
 * CSS Variable Names
 * Use these for consistent theming
 */
export const cssVariables = {
  // Primary Colors
  "--ops-primary": designTokens.colors.primary.rgb,
  "--ops-primary-alt": "30 42 56", // #1E2A38 RGB

  // Secondary Colors
  "--ops-secondary": designTokens.colors.secondary.rgb,
  "--ops-secondary-teal": "31 182 166", // #1FB6A6 RGB

  // Accent Colors
  "--ops-success": "34 197 94", // #22C55E RGB
  "--ops-warning": "245 158 11", // #F59E0B RGB
  "--ops-danger": "239 68 68", // #EF4444 RGB

  // Backgrounds
  "--ops-bg-main": "248 250 252", // #F8FAFC RGB
  "--ops-bg-card": "255 255 255", // #FFFFFF RGB
  "--ops-bg-border": "229 231 235", // #E5E7EB RGB
} as const;
