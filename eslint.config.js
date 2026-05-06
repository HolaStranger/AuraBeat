import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { 
    ignores: [
      'dist/**', 
      'android/**', 
      'public/**', 
      'node_modules/**', 
      '**/assets/*.js'
    ] 
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        Howler: 'readonly',
        Howl: 'readonly',
        HowlerGlobal: 'readonly',
        Sound: 'readonly',
        MediaMetadata: 'readonly',
        __REACT_DEVTOOLS_GLOBAL_HOOK__: 'readonly',
        MSApp: 'readonly',
        webkitAudioContext: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-case-declarations': 'off',
      'no-empty': 'warn',
      'no-func-assign': 'off',
      'no-cond-assign': 'off',
      'no-fallthrough': 'off',
      'no-useless-escape': 'off'
    },
  },
]
