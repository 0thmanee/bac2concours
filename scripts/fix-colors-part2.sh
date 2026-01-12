#!/bin/bash

echo "🎨 Fixing remaining hardcoded colors..."

FILES=$(find app components lib -name "*.tsx" -type f 2>/dev/null)
COUNT=0

for file in $FILES; do
  if grep -q "text-\[rgb(var(--\|bg-\[rgb(var(--\|border-\[rgb(var(--" "$file" 2>/dev/null; then
    cp "$file" "$file.bak"

    # Info colors
    sed -i '' 's/text-\[rgb(var(--info-light))\]/text-info-light/g' "$file"
    sed -i '' 's/text-\[rgb(var(--info-dark))\]/text-info-dark/g' "$file"
    sed -i '' 's/text-\[rgb(var(--info))\]/text-info/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--info-light))\]/bg-info-light/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--info-dark))\]/bg-info-dark/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--info))\]/bg-info/g' "$file"
    sed -i '' 's/border-\[rgb(var(--info-dark))\]/border-info-dark/g' "$file"
    sed -i '' 's/border-\[rgb(var(--info))\]/border-info/g' "$file"

    # Additional brand colors
    sed -i '' 's/text-\[rgb(var(--brand-400))\]/text-brand-400/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-400))\]/bg-brand-400/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-800))\]/bg-brand-800/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--brand-900))\]/bg-brand-900/g' "$file"
    sed -i '' 's/border-\[rgb(var(--brand-800))\]/border-brand-800/g' "$file"

    # Additional neutral
    sed -i '' 's/text-\[rgb(var(--neutral-300))\]/text-neutral-300/g' "$file"

    # Additional borders
    sed -i '' 's/border-\[rgb(var(--success-dark))\]/border-success-dark/g' "$file"

    # Dark mode variants
    sed -i '' 's/dark:text-\[rgb(var(--brand-400))\]/dark:text-brand-400/g' "$file"
    sed -i '' 's/dark:bg-\[rgb(var(--brand-900))\]/dark:bg-brand-900/g' "$file"
    sed -i '' 's/dark:bg-\[rgb(var(--brand-800))\]/dark:bg-brand-800/g' "$file"
    sed -i '' 's/dark:border-\[rgb(var(--brand-800))\]/dark:border-brand-800/g' "$file"
    sed -i '' 's/dark:border-\[rgb(var(--success-dark))\]/dark:border-success-dark/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--info))\]/dark:text-info/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--info-dark))\]/dark:text-info-dark/g' "$file"
    sed -i '' 's/dark:bg-\[rgb(var(--info-dark))\]/dark:bg-info-dark/g' "$file"
    sed -i '' 's/dark:border-\[rgb(var(--info))\]/dark:border-info/g' "$file"
    sed -i '' 's/dark:border-\[rgb(var(--info-dark))\]/dark:border-info-dark/g' "$file"
    sed -i '' 's/dark:text-\[rgb(var(--neutral-300))\]/dark:text-neutral-300/g' "$file"

    # Ops colors
    sed -i '' 's/text-\[rgb(var(--ops-text-secondary))\]/text-muted-foreground/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--ops-action-primary))\]/bg-primary/g' "$file"

    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
      echo "✓ Fixed: $file"
      COUNT=$((COUNT + 1))
    fi

    rm "$file.bak"
  fi
done

echo ""
echo "✨ Fixed $COUNT more files!"
