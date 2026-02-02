// ESLint 9 flat config for Next.js 16
// https://nextjs.org/docs/app/api-reference/config/eslint
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    // Explicit ignores - safety net (main protection is scoped lint command)
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'android/**',
      'public/**',
      'worker/**',
      'web/**',
      'tests/**',
      'scripts/**',
      'tools/**',
      'docs/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'next-env.d.ts',
    ],
  },
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
]

// Downgrade set-state-in-effect to warn for incremental adoption
for (const config of eslintConfig) {
  if (config.rules && config.rules['react-hooks/set-state-in-effect']) {
    config.rules['react-hooks/set-state-in-effect'] = 'warn'
  }
}

export default eslintConfig
