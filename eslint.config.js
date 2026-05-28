import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    // Files/folders ESLint should never look at.
    ignores: ['dist', 'dev-dist', 'node_modules', 'coverage', '*.config.js', '*.config.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // rules-of-hooks catches genuine, crash-prone bugs — keep it blocking.
      'react-hooks/rules-of-hooks': 'error',

      // The react-hooks v7 plugin ships React-Compiler-oriented rules that are
      // extremely noisy on a codebase that predates them. Keep them visible as
      // warnings (good cleanup backlog) but non-blocking for now.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/exhaustive-deps': 'warn',

      // Pragmatic defaults: the codebase predates linting, so the noisiest
      // rules are warnings (visible, non-blocking) rather than hard errors.
      // Tighten these to "error" incrementally as the code is cleaned up.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'no-useless-assignment': 'warn',
      'no-case-declarations': 'warn',
      'preserve-caught-error': 'warn',
    },
  },
  {
    // Test files run in a Vitest/jsdom context with test globals.
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
  // Keep ESLint out of Prettier's way (formatting is handled by Prettier).
  prettier
);
