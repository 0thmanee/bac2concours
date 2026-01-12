#!/usr/bin/env node

/**
 * Script to replace hardcoded CSS variable colors with utility classes
 * Run with: node scripts/fix-colors.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Color replacements map
const replacements = [
  // Success colors
  { pattern: /text-\[rgb\(var\(--success-light\)\)\]/g, replace: 'text-success-light' },
  { pattern: /text-\[rgb\(var\(--success-dark\)\)\]/g, replace: 'text-success-dark' },
  { pattern: /text-\[rgb\(var\(--success\)\)\]/g, replace: 'text-success' },
  { pattern: /bg-\[rgb\(var\(--success-light\)\)\]/g, replace: 'bg-success-light' },
  { pattern: /bg-\[rgb\(var\(--success-dark\)\)\]/g, replace: 'bg-success-dark' },
  { pattern: /bg-\[rgb\(var\(--success\)\)\]/g, replace: 'bg-success' },
  { pattern: /border-\[rgb\(var\(--success-light\)\)\]/g, replace: 'border-success-light' },
  { pattern: /border-\[rgb\(var\(--success\)\)\]/g, replace: 'border-success' },

  // Error colors
  { pattern: /text-\[rgb\(var\(--error-light\)\)\]/g, replace: 'text-error-light' },
  { pattern: /text-\[rgb\(var\(--error-dark\)\)\]/g, replace: 'text-error-dark' },
  { pattern: /text-\[rgb\(var\(--error\)\)\]/g, replace: 'text-error' },
  { pattern: /bg-\[rgb\(var\(--error-light\)\)\]/g, replace: 'bg-error-light' },
  { pattern: /bg-\[rgb\(var\(--error-dark\)\)\]/g, replace: 'bg-error-dark' },
  { pattern: /bg-\[rgb\(var\(--error\)\)\]/g, replace: 'bg-error' },
  { pattern: /border-\[rgb\(var\(--error-light\)\)\]/g, replace: 'border-error-light' },
  { pattern: /border-\[rgb\(var\(--error\)\)\]/g, replace: 'border-error' },

  // Warning colors
  { pattern: /text-\[rgb\(var\(--warning-light\)\)\]/g, replace: 'text-warning-light' },
  { pattern: /text-\[rgb\(var\(--warning-dark\)\)\]/g, replace: 'text-warning-dark' },
  { pattern: /text-\[rgb\(var\(--warning\)\)\]/g, replace: 'text-warning' },
  { pattern: /bg-\[rgb\(var\(--warning-light\)\)\]/g, replace: 'bg-warning-light' },
  { pattern: /bg-\[rgb\(var\(--warning-dark\)\)\]/g, replace: 'bg-warning-dark' },
  { pattern: /bg-\[rgb\(var\(--warning\)\)\]/g, replace: 'bg-warning' },
  { pattern: /border-\[rgb\(var\(--warning-light\)\)\]/g, replace: 'border-warning-light' },
  { pattern: /border-\[rgb\(var\(--warning\)\)\]/g, replace: 'border-warning' },

  // Brand colors
  { pattern: /text-\[rgb\(var\(--brand-500\)\)\]/g, replace: 'text-brand-500' },
  { pattern: /text-\[rgb\(var\(--brand-600\)\)\]/g, replace: 'text-brand-600' },
  { pattern: /text-\[rgb\(var\(--brand-700\)\)\]/g, replace: 'text-brand-700' },
  { pattern: /text-\[rgb\(var\(--brand-200\)\)\]/g, replace: 'text-brand-200' },
  { pattern: /bg-\[rgb\(var\(--brand-50\)\)\]/g, replace: 'bg-brand-50' },
  { pattern: /bg-\[rgb\(var\(--brand-100\)\)\]/g, replace: 'bg-brand-100' },
  { pattern: /bg-\[rgb\(var\(--brand-200\)\)\]/g, replace: 'bg-brand-200' },
  { pattern: /bg-\[rgb\(var\(--brand-500\)\)\]/g, replace: 'bg-brand-500' },
  { pattern: /bg-\[rgb\(var\(--brand-600\)\)\]/g, replace: 'bg-brand-600' },
  { pattern: /bg-\[rgb\(var\(--brand-700\)\)\]/g, replace: 'bg-brand-700' },
  { pattern: /bg-\[rgb\(var\(--brand-950\)\)\]/g, replace: 'bg-brand-950' },
  { pattern: /border-\[rgb\(var\(--brand-200\)\)\]/g, replace: 'border-brand-200' },
  { pattern: /border-\[rgb\(var\(--brand-500\)\)\]/g, replace: 'border-brand-500' },

  // Neutral colors
  { pattern: /text-\[rgb\(var\(--neutral-400\)\)\]/g, replace: 'text-neutral-400' },
  { pattern: /text-\[rgb\(var\(--neutral-600\)\)\]/g, replace: 'text-neutral-600' },
  { pattern: /text-\[rgb\(var\(--neutral-700\)\)\]/g, replace: 'text-neutral-700' },
  { pattern: /bg-\[rgb\(var\(--neutral-50\)\)\]/g, replace: 'bg-neutral-50' },
  { pattern: /bg-\[rgb\(var\(--neutral-100\)\)\]/g, replace: 'bg-neutral-100' },
  { pattern: /bg-\[rgb\(var\(--neutral-200\)\)\]/g, replace: 'bg-neutral-200' },
  { pattern: /bg-\[rgb\(var\(--neutral-400\)\)\]/g, replace: 'bg-neutral-400' },
  { pattern: /bg-\[rgb\(var\(--neutral-600\)\)\]/g, replace: 'bg-neutral-600' },
  { pattern: /bg-\[rgb\(var\(--neutral-700\)\)\]/g, replace: 'bg-neutral-700' },
  { pattern: /bg-\[rgb\(var\(--neutral-900\)\)\]/g, replace: 'bg-neutral-900' },
  { pattern: /border-\[rgb\(var\(--neutral-200\)\)\]/g, replace: 'border-neutral-200' },

  // Metric colors (backgrounds)
  { pattern: /bg-\[rgb\(var\(--metric-blue-main\)\)\]/g, replace: 'bg-metric-blue-main' },
  { pattern: /bg-\[rgb\(var\(--metric-orange-main\)\)\]/g, replace: 'bg-metric-orange-main' },
  { pattern: /bg-\[rgb\(var\(--metric-cyan-main\)\)\]/g, replace: 'bg-metric-cyan-main' },
  { pattern: /bg-\[rgb\(var\(--metric-rose-main\)\)\]/g, replace: 'bg-metric-rose-main' },
  { pattern: /bg-\[rgb\(var\(--metric-mint-main\)\)\]/g, replace: 'bg-metric-mint-main' },
  { pattern: /bg-\[rgb\(var\(--metric-purple-main\)\)\]/g, replace: 'bg-metric-purple-main' },
  { pattern: /bg-\[rgb\(var\(--metric-yellow-main\)\)\]/g, replace: 'bg-metric-yellow-main' },
  { pattern: /bg-\[rgb\(var\(--metric-teal-main\)\)\]/g, replace: 'bg-metric-teal-main' },

  // Dark mode variants
  { pattern: /dark:bg-\[rgb\(var\(--success\)\)\]\/30/g, replace: 'dark:bg-success/30' },
  { pattern: /dark:text-\[rgb\(var\(--success-light\)\)\]/g, replace: 'dark:text-success-light' },
  { pattern: /dark:text-\[rgb\(var\(--success\)\)\]/g, replace: 'dark:text-success' },
  { pattern: /dark:bg-\[rgb\(var\(--neutral-900\)\)\]\/30/g, replace: 'dark:bg-neutral-900/30' },
  { pattern: /dark:text-\[rgb\(var\(--neutral-400\)\)\]/g, replace: 'dark:text-neutral-400' },
  { pattern: /dark:text-\[rgb\(var\(--neutral-700\)\)\]/g, replace: 'dark:text-neutral-700' },
  { pattern: /dark:bg-\[rgb\(var\(--error\)\)\]/g, replace: 'dark:bg-error' },
  { pattern: /dark:text-\[rgb\(var\(--error\)\)\]/g, replace: 'dark:text-error' },
];

async function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ pattern, replace }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replace);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🎨 Fixing hardcoded colors...\n');

  const patterns = [
    'app/**/*.tsx',
    'components/**/*.tsx',
    'lib/**/*.tsx',
  ];

  let totalFixed = 0;

  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: __dirname + '/..' });

    for (const file of files) {
      const fullPath = path.join(__dirname, '..', file);
      if (await processFile(fullPath)) {
        totalFixed++;
      }
    }
  }

  console.log(`\n✨ Fixed ${totalFixed} files!`);
}

main().catch(console.error);
