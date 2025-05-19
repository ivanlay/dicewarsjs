module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['plugin:jest/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['jest', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': ['error'],

    // ES6+ features
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],

    // Additional modern JavaScript rules
    'no-var': 'error',
    'object-shorthand': ['error', 'always'],
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-duplicate-imports': 'error',

    // Allow console for game development
    'no-console': 'off',

    // Encourage descriptive and consistent comments
    'multiline-comment-style': ['error', 'starred-block'],
    'spaced-comment': ['error', 'always'],

    // Relaxed rules for game development
    'max-len': [
      'error',
      { code: 100, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true },
    ],

    // Allow file extensions in import statements

    // Allow non-camelcase identifiers (due to existing AI implementation)
    camelcase: ['off'],

    // Allow ++ operator for game logic (common in game loops/increments)
    'no-plusplus': ['off'],

    // Allow continue statements (common in game loops)
    'no-continue': ['off'],

    // Allow underscore prefixes for private members (common ES6 pattern before private fields)
    'no-underscore-dangle': ['off'],

    // Allow iterators (for...of) for game logic
    'no-restricted-syntax': ['off'],
    // Allow use-before-define for complex game logic
    'no-use-before-define': ['off'],
    // Relax unused vars for game development
    'no-unused-vars': ['warn'],
    // Allow no-param-reassign for game logic
    'no-param-reassign': ['off'],
    // Allow else after return in game logic
    'no-else-return': ['off'],
    // Allow no-shadow for complex game logic
    'no-shadow': ['warn'],
    // Allow no-prototype-builtins in test code
    'no-prototype-builtins': ['warn'],
    // Disable class-methods-use-this for game development
    'class-methods-use-this': ['off'],
    // Disable default-case for switch statements in game logic
    'default-case': ['off'],
    // Allow array-callback-return for array methods
    'array-callback-return': ['off'],
    // Allow global-require in tests
    'global-require': ['off'],
    // Allow prefer-destructuring in Game code
    'prefer-destructuring': ['off'],
    // Disable jest/valid-title for benchmark titles
    'jest/valid-title': ['off'],
    // Allow return-assign in test code
    'no-return-assign': ['off'],
    // Disable jest/expect-expect in tests
    'jest/expect-expect': ['off'],
    // Allow func-names in test files
    'func-names': ['off'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
  globals: {
    // CreateJS library globals
    createjs: 'readonly',
    // Global functions available in newer Node.js versions
    structuredClone: 'readonly',
  },
  // Ignore legacy files that will be removed later
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'areadice.js',
    'mc.js',
    'game.js',
    'config.js',
    'main.js',
  ],
};
