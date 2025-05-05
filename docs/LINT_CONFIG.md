# Lint & Style Configuration Guide

## Overview

This document explains the linting and style configuration for the DiceWarsJS project, including the approach to handling warnings and errors.

## ESLint Configuration

The project uses ESLint with the following configuration:

- Base: `airbnb-base`
- Additional plugins: `import`, `jest`, `prettier`
- ECMAScript version: 2022 (to support private class fields with # syntax)

### Warnings vs. Errors

Our linting approach:

1. **Errors** - Must be fixed for CI to pass

   - Syntax errors
   - Import ordering issues
   - Loops with await statements
   - Empty block statements
   - Functions declared in loops

2. **Warnings** - Allowed but discouraged
   - Unused variables
   - Shadowed variables
   - Constant conditions in loops

We've set a maximum warning threshold (100) to prevent accumulation while allowing for ongoing development.

## CI Process

The CI workflow:

1. Checks code style with Prettier
2. Runs ESLint with `--max-warnings=100`
3. Builds the project
4. Runs tests

Pre-commit hooks run the same lint and style checks locally.

## Recommendations

When working on the project:

1. Use `npm run lint:fix` to automatically fix most issues
2. Pay special attention to actual errors (not just warnings)
3. Consider improving code that generates warnings when possible
4. Run `npm run format` to apply Prettier style rules

## Future Improvements

Over time, aim to:

1. Reduce the number of warnings
2. Address common patterns like unused variables
3. Lower the warning threshold as code quality improves
