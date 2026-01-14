# IncubationOS Design System

This directory contains the design system tokens and guidelines for IncubationOS.

## Brand Colors

### Primary Color: Midnight Blue

- **Hex**: `#0B1C2D`
- **RGB**: `11 28 45`
- **Usage**: Primary buttons, headings, key UI elements
- **Meaning**: Trust, stability, governance, authority

### Secondary Color: Cyan

- **Hex**: `#00C2FF`
- **RGB**: `0 194 255`
- **Usage**: Action buttons, active states, key metrics, focus rings
- **Alternative**: Teal `#1FB6A6` (can be used interchangeably)

### Accent Colors

- **Success**: `#22C55E` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)

## Typography

### Font Family

- **Primary**: Inter (system fallback)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Usage

- **Body text**: 400 (regular)
- **Labels**: 500 (medium)
- **Headings**: 600 (semibold)
- **Key metrics**: 700 (bold)

## Design Principles

1. **Minimal**: High contrast, heavy whitespace
2. **Professional**: No gradients, no decorative elements
3. **Enterprise-grade**: Stripe/Linear/SAP Fiori inspired
4. **Clarity over beauty**: Numbers over charts, tables over visualizations

## CSS Variables

All design tokens are available as CSS variables:

```css
/* Primary Colors */
rgb(var(--ops-action-primary))        /* Midnight Blue */
rgb(var(--ops-action-secondary))      /* Cyan */

/* Text Colors */
rgb(var(--ops-text-primary))          /* Main text */
rgb(var(--ops-text-secondary))        /* Secondary text */
rgb(var(--ops-text-tertiary))          /* Tertiary text */

/* Backgrounds */
rgb(var(--ops-background))             /* Main background */
rgb(var(--ops-surface))                /* Card background */
rgb(var(--ops-border))                 /* Border color */
```

## Component Classes

### Buttons

- `.ops-btn-primary` - Primary action button (Midnight Blue)
- `.` - Secondary button (outline style)

### Cards

- `.ops-card` - Standard card with subtle shadow
- `.ops-card-elevated` - Elevated card with stronger shadow

### Inputs

- `.ops-input` - Form input styling

### Status Indicators

- `.ops-status-success` - Success message
- `.ops-status-warning` - Warning message
- `.ops-status-error` - Error message
- `.ops-status-info` - Info message

## Usage Example

```tsx
// Using CSS variables
<div style={{ color: 'rgb(var(--ops-text-primary))' }}>
  Content
</div>

// Using utility classes
<button className="ops-btn-primary">
  Submit
</button>

<div className="ops-card p-6">
  Card content
</div>
```

## References

- **Primary Reference**: Stripe Dashboard
- **Secondary References**: Linear, SAP Fiori, Notion
- **Brand Guidelines**: See main README.md
