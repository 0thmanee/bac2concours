#!/bin/bash

# Fix remaining hardcoded colors in the last 5 files

echo "Fixing remaining hardcoded colors..."

# Fix brand-300 with opacity
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i '' 's/bg-\[rgb(var(--brand-300))\]\/20/bg-brand-300\/20/g' {} +

# Fix sidebar background
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i '' 's/bg-\[rgb(var(--sidebar))\]/bg-sidebar/g' {} +

# Fix hover border brand-400
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i '' 's/hover:border-\[rgb(var(--brand-400))\]/hover:border-brand-400/g' {} +

# Fix dark hover border brand-600
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i '' 's/dark:hover:border-\[rgb(var(--brand-600))\]/dark:hover:border-brand-600/g' {} +

# Fix metric orange light background
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i '' 's/bg-\[rgb(var(--metric-orange-light))\]/bg-metric-orange-light/g' {} +

# Fix metric orange main text
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i '' 's/text-\[rgb(var(--metric-orange-main))\]/text-metric-orange/g' {} +

# Fix hover border brand-300
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i '' 's/hover:border-\[rgb(var(--brand-300))\]/hover:border-brand-300/g' {} +

echo "Done! Checking remaining hardcoded colors..."

# Check for any remaining hardcoded colors
echo ""
echo "Files with remaining hardcoded rgb(var(...)) patterns:"
grep -r "rgb(var(--" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next . | grep -E "(bg|text|border)-\[" | wc -l
