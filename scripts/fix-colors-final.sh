#!/bin/bash

echo "🎨 Final color fixes..."

FILES=$(find app components lib -name "*.tsx" -type f 2>/dev/null)
COUNT=0

for file in $FILES; do
  if grep -q "text-\[rgb(var(--\|bg-\[rgb(var(--\|border-\[rgb(var(--" "$file" 2>/dev/null; then
    cp "$file" "$file.bak"

    # Additional neutral colors
    sed -i '' 's/text-\[rgb(var(--neutral-500))\]/text-neutral-500/g' "$file"
    sed -i '' 's/text-\[rgb(var(--neutral-900))\]/text-neutral-900/g' "$file"
    sed -i '' 's/bg-\[rgb(var(--neutral-800))\]/bg-neutral-800/g' "$file"
    sed -i '' 's/border-\[rgb(var(--neutral-300))\]/border-neutral-300/g' "$file"
    sed -i '' 's/border-\[rgb(var(--neutral-600))\]/border-neutral-600/g' "$file"
    sed -i '' 's/border-\[rgb(var(--neutral-700))\]/border-neutral-700/g' "$file"

    # Hover states
    sed -i '' 's/hover:border-\[rgb(var(--neutral-400))\]/hover:border-neutral-400/g' "$file"
    sed -i '' 's/hover:border-\[rgb(var(--neutral-600))\]/hover:border-neutral-600/g' "$file"
    sed -i '' 's/group-hover:text-\[rgb(var(--neutral-500))\]/group-hover:text-neutral-500/g' "$file"

    # Dark mode
    sed -i '' 's/dark:text-\[rgb(var(--neutral-500))\]/dark:text-neutral-500/g' "$file"
    sed -i '' 's/dark:border-\[rgb(var(--neutral-700))\]/dark:border-neutral-700/g' "$file"
    sed -i '' 's/dark:border-\[rgb(var(--neutral-600))\]/dark:border-neutral-600/g' "$file"
    sed -i '' 's/dark:hover:border-\[rgb(var(--neutral-600))\]/dark:hover:border-neutral-600/g' "$file"
    sed -i '' 's/dark:bg-\[rgb(var(--neutral-800))\]/dark:bg-neutral-800/g' "$file"
    sed -i '' 's/dark:placeholder:text-\[rgb(var(--neutral-500))\]/dark:placeholder:text-neutral-500/g' "$file"
    sed -i '' 's/dark:group-hover:text-neutral-400/dark:group-hover:text-neutral-400/g' "$file"
    sed -i '' 's/dark:hover:bg-\[rgb(var(--neutral-800))\]/dark:hover:bg-neutral-800/g' "$file"

    if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
      echo "✓ Fixed: $file"
      COUNT=$((COUNT + 1))
    fi

    rm "$file.bak"
  fi
done

echo ""
echo "✨ Fixed $COUNT more files!"
