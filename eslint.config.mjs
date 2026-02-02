import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Downgrade strict rules for incremental adoption
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'prefer-const': 'warn',
      // React Compiler rules - downgrade for incremental adoption
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Additional project ignores:
    'node_modules/**',
    'android/**',
    'public/**',
    'worker/**',
    'web/**',
    'tests/**',
    'scripts/**',
    '*.config.js',
    '*.config.mjs',
    '*.config.ts',
  ]),
])

// Downgrade set-state-in-effect to warn for incremental adoption
for (const config of eslintConfig) {
  if (config.rules && config.rules['react-hooks/set-state-in-effect']) {
    config.rules['react-hooks/set-state-in-effect'] = 'warn'
  }
}

export default eslintConfig
