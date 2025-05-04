# Code Style Guidelines

This document outlines the code style standards for the DiceWarsJS project. We use ESLint and Prettier to enforce consistent coding practices across the project.

## Table of Contents

- [Setup](#setup)
- [ESLint Configuration](#eslint-configuration)
- [Prettier Configuration](#prettier-configuration)
- [Using the Tools](#using-the-tools)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Editor Integration](#editor-integration)
- [Style Rules Overview](#style-rules-overview)

## Setup

The project uses ESLint and Prettier for code quality and formatting. These tools are automatically installed when you run `npm install`.

```bash
# Install dependencies including ESLint and Prettier
npm install
```

## ESLint Configuration

We use [ESLint](https://eslint.org/) to enforce code quality standards. Our configuration extends the Airbnb base style guide and includes rules optimized for ES6+ features.

Key aspects of our ESLint configuration:

- Based on `airbnb-base` style guide
- Includes plugins for import, Jest, and Prettier
- Optimized for ES6+ features (optional chaining, nullish coalescing, etc.)
- Custom rules to accommodate game development requirements

## Prettier Configuration

[Prettier](https://prettier.io/) is used for consistent code formatting. Our configuration specifies:

- 100 character line width
- 2 space indentation
- Single quotes for strings
- ES5-compatible trailing commas
- No semicolons at the end of statements

## Using the Tools

### Linting

To check for linting issues:

```bash
npm run lint
```

To automatically fix linting issues where possible:

```bash
npm run lint:fix
```

### Formatting

To check if your code is properly formatted:

```bash
npm run format:check
```

To automatically format your code:

```bash
npm run format
```

## Pre-commit Hooks

The project uses [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to automatically run linting and formatting on changed files before each commit.

When you commit your changes, the following will happen automatically:

1. ESLint will check for issues in JavaScript files and fix them if possible
2. Prettier will format all staged files according to our style rules

If there are any issues that can't be automatically fixed, the commit will be prevented until you resolve them.

## Editor Integration

For the best development experience, we recommend configuring your editor to integrate with ESLint and Prettier.

### VS Code

Install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Then add these settings to your VS Code configuration:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"]
}
```

### WebStorm / IntelliJ IDEA

These IDEs have built-in support for ESLint and Prettier:

1. Go to Preferences > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
2. Enable ESLint
3. Go to Preferences > Languages & Frameworks > JavaScript > Prettier
4. Enable Prettier

## Style Rules Overview

### JavaScript

- Use ES6+ features where appropriate
- Prefer arrow functions for callbacks and anonymous functions
- Use `const` for variables that aren't reassigned, and `let` for those that are
- Use object destructuring and spread operators for cleaner code
- Prefer template literals over string concatenation
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Export individual items rather than a default export where possible
- Include JSDoc comments for functions and classes

### Naming Conventions

- Use `camelCase` for variables, functions, and method names
- Use `PascalCase` for class and constructor names
- Use `UPPER_SNAKE_CASE` for constants
- Use meaningful, descriptive names for variables and functions

### File Organization

- One class or logical component per file
- Group related functions and classes in the same directory
- Use index.js files to consolidate exports

### Comments

- Use JSDoc style comments for functions and classes
- Use block comments (`/* */`) for multi-line comments
- Use line comments (`//`) for single-line comments
- Keep comments up-to-date with code changes
