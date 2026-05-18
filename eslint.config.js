const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');
const prettierConfig = require('eslint-config-prettier/flat');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      'jest.setup.ts',
      'eslint.config.js',
      'commitlint.config.js',
    ],
  },
  ...expoConfig,
  {
    plugins: {
      boundaries,
      prettier: prettierPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: true,
      },
      'boundaries/include': ['app/**', 'src/**'],
      'boundaries/elements': [
        { type: 'app', pattern: 'app/**' },
        { type: 'core', pattern: 'src/core/**' },
        {
          type: 'module-domain',
          pattern: 'src/modules/*/domain/**',
          capture: ['module'],
        },
        {
          type: 'module-application',
          pattern: 'src/modules/*/application/**',
          capture: ['module'],
        },
        {
          type: 'module-infrastructure',
          pattern: 'src/modules/*/infrastructure/**',
          capture: ['module'],
        },
        {
          type: 'module-presentation',
          pattern: 'src/modules/*/presentation/**',
          capture: ['module'],
        },
        { type: 'shared-domain', pattern: 'src/shared/domain/**' },
        {
          type: 'shared-infrastructure',
          pattern: 'src/shared/infrastructure/**',
        },
        {
          type: 'shared-presentation',
          pattern: 'src/shared/presentation/**',
        },
      ],
    },
    rules: {
      'prettier/prettier': 'error',
      'import/no-named-as-default-member': 'off',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: ['app', 'module-presentation', 'shared-presentation', 'core'],
            },
            {
              from: 'core',
              allow: [
                'core',
                'module-domain',
                'module-application',
                'module-infrastructure',
                'shared-domain',
                'shared-infrastructure',
              ],
            },
            {
              from: 'module-domain',
              allow: ['module-domain', 'shared-domain'],
            },
            {
              from: 'module-application',
              allow: ['module-application', 'module-domain', 'shared-domain'],
            },
            {
              from: 'module-infrastructure',
              allow: [
                'module-infrastructure',
                'module-domain',
                'module-application',
                'shared-domain',
                'shared-infrastructure',
              ],
            },
            {
              from: 'module-presentation',
              allow: [
                'module-presentation',
                'module-domain',
                'module-application',
                'shared-domain',
                'shared-presentation',
                'core',
              ],
            },
            { from: 'shared-domain', allow: ['shared-domain'] },
            {
              from: 'shared-infrastructure',
              allow: ['shared-domain', 'shared-infrastructure'],
            },
            {
              from: 'shared-presentation',
              allow: [
                'shared-domain',
                'shared-presentation',
                'shared-infrastructure',
              ],
            },
          ],
        },
      ],
    },
  },
  prettierConfig,
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      'boundaries/element-types': 'off',
    },
  },
];
