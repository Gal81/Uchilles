import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const jsxUsesVars = {
  rules: {
    'jsx-uses-vars': {
      meta: {
        type: 'problem',
        schema: [],
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            let name = node.name

            while (name.type === 'JSXMemberExpression') {
              name = name.object
            }

            if (
              name.type === 'JSXIdentifier' &&
              /^[A-Z]/.test(name.name)
            ) {
              context.sourceCode.markVariableAsUsed(name.name, node)
            }
          },
        }
      },
    },
  },
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: ['typescript', 'jsx'],
          },
        },
      },
      globals: globals.browser,
    },
    plugins: {
      jsx: jsxUsesVars,
    },
    rules: {
      'no-unused-vars': 'error',
      'jsx/jsx-uses-vars': 'error',
    },
  },
])
