#!/bin/bash

# Script to replace hardcoded CSS variable colors with utility classes

echo "🎨 Fixing hardcoded colors..."

# Find all .tsx files
FILES=$(find app components lib -name "*.tsx" -type f 2>/dev/null)

COUNT=0

for file in $FILES; do
  # Check if file has hardcoded colors
  if grep -q "text-\[rgb(var(--\|bg-\[rgb(var(--\|border-\[rgb(var(--" "$file" 2>/dev/null; then
    # Make a backup
    cp "$file" "$file.bak"

    # Success colors
    sed -i '' 's/text-\[rgb(var(--success-light))\]/text-success-light/g' "$file"
    sed -i '' 's/text-\[rgb(var(--success-dark))\]/text-success-dark/g' "$file"
    sed -i '' 's/text-\[rgb(var(--success))\]/text-success/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--success-light))\]/bg-success-light/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--success-dark))\]/bg-success-dark/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--success))\]/bg-success/g' "$file"
    sed -i '' 's/border-\[rgb(var(--success-light))\]/border-success-light/g' "$file"
    sed -i '' 's/border-\[rgb(var(--success))\]/border-success/g' "$file"

    # Error colors
    sed -i '' 's/text-\[rgb(var(--error-light))\]/text-error-light/g' "$file"
    sed -i '' 's/text-\[rgb(var(--error-dark))\]/text-error-dark/g' "$file"
    sed -i '' 's/text-\[rgb(var(--error))\]/text-error/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--error-light))\]/bg-error-light/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--error-dark))\]/bg-error-dark/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--error))\]/bg-error/g' "$file"
    sed -i '' 's/border-\[rgb(var(--error-light))\]/border-error-light/g' "$file"
    sed -i '' 's/border-\[rgb(var(--error))\]/border-error/g' "$file"

    # Warning colors
    sed -i '' 's/text-\[rgb(var(--warning-light))\]/text-warning-light/g' "$file"
    sed -i '' 's/text-\[rgb(var(--warning-dark))\]/text-warning-dark/g' "$file"
    sed -i '' 's/text-\[rgb(var(--warning))\]/text-warning/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--warning-light))\]/bg-warning-light/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--warning-dark))\]/bg-warning-dark/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--warning))\]/bg-warning/g' "$file"
    sed -i '' 's/border-\[rgb(var(--warning-light))\]/border-warning-light/g' "$file"
    sed -i '' 's/border-\[rgb(var(--warning))\]/border-warning/g' "$file"

    # Brand colors
    sed -i '' 's/text-\[rgb(var(--brand-500))\]/text-brand-500/g' "$file"
    sed -i '' 's/text-\[rgb(var(--brand-600))\]/text-brand-600/g' "$file"
    sed -i '' 's/text-\[rgb(var(--brand-700))\]/text-brand-700/g' "$file"
    sed -i '' 's/text-\[rgb(var(--brand-200))\]/text-brand-200/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-50))\]/bg-brand-50/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-100))\]/bg-brand-100/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-200))\]/bg-brand-200/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-500))\]/bg-brand-500/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-600))\]/bg-brand-600/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-700))\]/bg-brand-700/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-950))\]/bg-brand-950/g' "$file"
    sed -i '' 's/border-\[rgb(var(--brand-200))\]/border-brand-200/g' "$file"
    sed -i '' 's/border-\[rgb(var(--brand-500))\]/border-brand-500/g' "$file"

    # Neutral colors
    sed -i '' 's/text-\[rgb(var(--neutral-400))\]/text-neutral-400/g' "$file"
    sed -i '' 's/text-\[rgb(var(--neutral-600))\]/text-neutral-600/g' "$file"
    sed -i '' 's/text-\[rgb(var(--neutral-700))\]/text-neutral-700/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-50))\]/bg-neutral-50/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-100))\]/bg-neutral-100/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-200))\]/bg-neutral-200/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-400))\]/bg-neutral-400/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-600))\]/bg-neutral-600/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-700))\]/bg-neutral-700/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-900))\]/bg-neutral-900/g' "$file"
    sed -i '' 's/border-\[rgb(var(--neutral-200))\]/border-neutral-200/g' "$file"

    # Metric colors
    sed -i '' 's/bg-\[rgb(var(--metric-blue-main))\]/bg-metric-blue-main/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--metric-orange-main))\]/bg-metric-orange-main/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--metric-cyan-main))\]/bg-metric-cyan-main/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--metric-rose-main))\]/bg-metric-rose-main/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--metric-mint-main))\]/bg-metric-mint-main/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--metric-purple-main))\]/bg-metric-purple-main/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--metric-yellow-main))\]/bg-metric-yellow-main/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--metric-teal-main))\]/bg-metric-teal-main/g' "$file"

    # Dark mode variants
    sed -i '' 's/dark:bg-\[rgb(var(--success))\]\/30/dark:bg-success\/30/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--success-light))\]/dark:text-success-light/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--success))\]/dark:text-success/g' "$file"
    sed -i '' 's/dark:bg-\[rgb(var(--neutral-900))\]\/30/dark:bg-neutral-900\/30/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--neutral-400))\]/dark:text-neutral-400/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--neutral-700))\]/dark:text-neutral-700/g' "$file"
    sed -i '' 's/dark:bg-\[rgb(var(--error))\]/dark:bg-error/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--error))\]/dark:text-error/g' "$file"

    # Check if file was actually modified
    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
      echo "✓ Fixed: $file"
      COUNT=$((COUNT + 1))
    fi

    # Remove backup
    rm "$file.bak"
  fi
done

echo ""
echo "✨ Fixed $COUNT files!"
