import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Your additions (good practices)
      'no-console': 'warn',
      'no-debugger': 'warn',
      
      // Keep the important React rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Silence the aggressive React 19 strict rules that are flagging standard patterns
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      
      // Make TypeScript rules less aggressive for deployment
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn', 
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-refresh/only-export-components': 'off',
      'no-useless-assignment': 'off',
    },
  },
])