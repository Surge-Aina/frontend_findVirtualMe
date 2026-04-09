import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const toolingConfigFiles = [
  '**/vite.config.{js,mjs,cjs}',
  '**/tailwind.config.{js,mjs,cjs}',
  '**/postcss.config.{js,mjs,cjs}',
  '**/babel.config.{js,mjs,cjs}',
  '**/jest.config.{js,mjs,cjs}',
  'cypress.config.js',
  'eslint.config.js',
]

export default defineConfig([
  globalIgnores(['dist', 'coverage/**', 'cypress/**', '**/node_modules/**']),

  // Node / tooling configs (require, module, process, etc.)
  {
    files: toolingConfigFiles,
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // App source (browser + React)
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: [
      '**/vite.config.{js,mjs,cjs}',
      '**/tailwind.config.{js,mjs,cjs}',
      '**/postcss.config.{js,mjs,cjs}',
    ],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      // Context files often export providers + hooks/constants; splitting only for Fast Refresh is noisy.
      'react-refresh/only-export-components': 'off',
      // So `<motion.div />` counts as using `motion`, etc.
      'react/jsx-uses-vars': 'error',
    },
  },

  // Jest manual mocks (CommonJS + jest.fn)
  {
    files: ['src/__mocks__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // Jest tests under src (describe, it, expect, jest, global, require in some files)
  {
    files: ['src/**/*.{test,spec}.{js,jsx}', 'src/**/__tests__/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
    },
  },
])
