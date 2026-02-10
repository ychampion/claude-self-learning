# Contributing to Claude Self-Learning

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/ychampion/claude-self-learning.git
cd claude-self-learning

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
claude-self-learning/
├── src/
│   ├── __tests__/          # Test files
│   │   ├── utils.test.ts
│   │   ├── quality-checker.test.ts
│   │   └── template-engine.test.ts
│   ├── cli.ts              # CLI entry point
│   ├── config.ts           # Configuration management
│   ├── index.ts            # Library entry point
│   ├── quality-checker.ts  # Quality validation
│   ├── skill-manager.ts    # Core skill management
│   ├── template-engine.ts  # Template system
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── agents/                 # Agent specifications
├── commands/              # Command specifications
├── storage/               # Plugin skill storage
│   └── skills/
├── dist/                  # Build output
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Format code
npm run format
```

### 4. Build

```bash
npm run build
```

### 5. Submit a Pull Request

- Write a clear description of your changes
- Reference any related issues
- Ensure all tests pass

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Always define types for function parameters and return values
- Use `const` over `let` when possible
- Prefer async/await over promises
- Use descriptive variable names

### Testing

- Write unit tests for all new functions
- Aim for >70% code coverage
- Use descriptive test names
- Group related tests using `describe` blocks
- Test both success and failure cases

### Commits

- Use conventional commit format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- Keep commits focused and atomic

## Testing

### Running Tests

```bash
# Watch mode (default)
npm test

# Run once
npm test -- --run

# With coverage
npm run test:coverage

# Specific file
npm test utils.test.ts
```

### Writing Tests

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../your-module.js';

describe('YourModule', () => {
  describe('yourFunction', () => {
    it('should handle valid input', () => {
      const result = yourFunction('input');
      expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
      expect(() => yourFunction(null)).toThrow();
    });
  });
});
```

## Adding New Features

### Adding a New Template

1. Edit `src/template-engine.ts`
2. Add template to `getTemplates()` method
3. Add tests in `src/__tests__/template-engine.test.ts`
4. Update README documentation

### Adding a New Quality Check

1. Edit `src/quality-checker.ts`
2. Add check method
3. Call from `check()` method
4. Add tests in `src/__tests__/quality-checker.test.ts`

### Adding a New CLI Command

1. Edit `src/cli.ts`
2. Add command using Commander.js
3. Implement command logic
4. Update README documentation

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run `npm run build`
4. Create git tag: `git tag v2.0.0`
5. Push: `git push && git push --tags`

## Questions?

Open an issue or start a discussion on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
