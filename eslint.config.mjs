import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import boundaries from 'eslint-plugin-boundaries';
import i18next from 'eslint-plugin-i18next';
import prettier from 'eslint-config-prettier';
import local from './eslint-rules/index.mjs';

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'coverage/**',
            'node_modules/**',
            '.claude/**',
            'eslint-rules/**',
            'src/routeTree.gen.ts',
            'src/shared/lib/api/schema.d.ts',
            '*.config.mjs',
            '*.config.ts'
        ]
    },
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
        languageOptions: {
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }
        },
        plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y, i18next, local },
        settings: { react: { version: 'detect' } },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.flatConfigs.recommended.rules,
            'i18next/no-literal-string': [
                'error',
                {
                    mode: 'jsx-only',
                    'jsx-attributes': {
                        exclude: [
                            'className',
                            'style',
                            'styleName',
                            'type',
                            'key',
                            'id',
                            'width',
                            'height',
                            'data-.*',
                            'aria-hidden',
                            'to',
                            'href',
                            'role',
                            'name',
                            'htmlFor',
                            'variant',
                            'size',
                            'tone',
                            'field'
                        ]
                    }
                }
            ],
            'react/jsx-key': 'error',
            'react/self-closing-comp': 'error',
            eqeqeq: ['error', 'always'],
            'no-console': 'error',
            'local/no-comments': 'error',
            'local/no-fixed-color': 'error',
            'local/no-else': 'error',
            'local/no-search-in-loop': 'error',
            'no-lonely-if': 'error',
            complexity: ['error', 10],
            'max-lines-per-function': ['error', { max: 40, skipBlankLines: true }],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/typedef': [
                'error',
                {
                    variableDeclaration: true,
                    variableDeclarationIgnoreFunction: true,
                    memberVariableDeclaration: true,
                    propertyDeclaration: true,
                    parameter: true
                }
            ],
            'max-depth': ['error', 3],
            'max-params': ['error', 8],
            'no-restricted-syntax': [
                'error',
                { selector: 'TSEnumDeclaration', message: 'Use `as const` + union (conventions skill).' },
                { selector: 'ExportDefaultDeclaration', message: 'Default exports are forbidden (conventions skill).' },
                {
                    selector: "CallExpression[callee.name='fetch']",
                    message: 'Componentes não chamam fetch — use um hook dedicado sobre o cliente da API.'
                }
            ],
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/shared/lib/api/client'],
                            message: 'Só app/providers e módulos de dados podem importar o cliente da API.'
                        }
                    ]
                }
            ]
        }
    },
    {
        files: ['src/**/*.schema.ts', 'src/**/*.schemas.ts', 'src/**/types.ts', 'src/**/*.types.ts', 'src/shared/config/*.ts', 'src/routes/**/*.tsx', 'src/main.tsx'],
        rules: {
            '@typescript-eslint/typedef': [
                'error',
                {
                    variableDeclaration: false,
                    variableDeclarationIgnoreFunction: true,
                    memberVariableDeclaration: true,
                    propertyDeclaration: true,
                    parameter: true
                }
            ]
        }
    },
    {
        files: ['src/app/providers/**/*.tsx', 'src/features/*/api/**/*.ts', 'src/features/*/*/api/**/*.ts'],
        rules: { 'no-restricted-imports': 'off', 'no-restricted-syntax': 'off' }
    },
    {
        files: ['src/routes/**/*.tsx'],
        rules: { '@typescript-eslint/only-throw-error': 'off' }
    },
    {
        files: ['src/features/dev/**/*.tsx', 'src/routes/_dev/**/*.tsx'],
        rules: { 'i18next/no-literal-string': 'off' }
    },
    {
        files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx', 'test/**/*.ts', 'test/**/*.tsx'],
        rules: {
            'local/no-else': 'off',
            'local/no-search-in-loop': 'off',
            'i18next/no-literal-string': 'off',
            'max-lines-per-function': 'off'
        }
    },
    {
        files: ['src/shared/lib/api/**/*.ts'],
        rules: { 'no-restricted-syntax': 'off', 'no-restricted-imports': 'off' }
    },
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        plugins: { boundaries },
        settings: {
            'import/resolver': { typescript: { alwaysTryTypes: true } },
            'boundaries/include': ['src/**/*.ts', 'src/**/*.tsx'],
            'boundaries/elements': [
                { type: 'shared', pattern: 'src/shared' },
                { type: 'app', pattern: 'src/app' },
                { type: 'routes', pattern: 'src/routes' },
                { type: 'feature', pattern: 'src/features/*', capture: ['feature'] }
            ]
        },
        rules: {
            'boundaries/dependencies': [
                'error',
                {
                    default: 'disallow',
                    message: 'Import cruza fronteira proibida (frontend-architecture skill)',
                    policies: [
                        { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
                        { from: { element: { type: 'app' } }, allow: { to: { element: { type: 'shared' } } } },
                        { from: { element: { type: 'app' } }, allow: { to: { element: { type: 'app' } } } },
                        { from: { element: { type: 'app' } }, allow: { to: { element: { type: 'feature' } } } },
                        { from: { element: { type: 'routes' } }, allow: { to: { element: { type: 'feature' } } } },
                        { from: { element: { type: 'routes' } }, allow: { to: { element: { type: 'app' } } } },
                        { from: { element: { type: 'routes' } }, allow: { to: { element: { type: 'shared' } } } },
                        { from: { element: { type: 'routes' } }, allow: { to: { element: { type: 'routes' } } } },
                        { from: { element: { type: 'feature' } }, allow: { to: { element: { type: 'shared' } } } },
                        { from: { element: { type: 'feature' } }, allow: { to: { element: { type: 'app' } } } },
                        {
                            from: { element: { type: 'feature' } },
                            allow: {
                                to: { element: { type: 'feature', captured: { feature: '{{ from.element.captured.feature }}' } } }
                            }
                        }
                    ]
                }
            ]
        }
    },
    prettier
);
