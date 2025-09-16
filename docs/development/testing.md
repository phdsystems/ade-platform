# Testing Guide

Comprehensive testing guide for the ADE Platform components.

## Overview

The ADE Platform uses:
- **Vitest** for CLI unit tests
- **Mocha** for VSCode extension tests
- **Coverage reporting** with v8

## CLI Testing

### Running Tests

```bash
cd cli

# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Structure

```
cli/
├── tests/
│   ├── scaffolder.test.ts    # Scaffolding logic tests
│   ├── registry.test.ts      # Registry loader tests
│   └── validator.test.ts     # Structure validator tests
└── vitest.config.ts          # Vitest configuration
```

### Writing CLI Tests

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Component', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Mocking in CLI Tests

```typescript
// Mock file system
vi.mock('fs-extra');

// Mock specific functions
(fs.existsSync as any).mockReturnValue(false);

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## VSCode Extension Testing

### Running Tests

```bash
cd vscode-extension

# Compile TypeScript
pnpm run compile

# Run tests in VSCode
# Press F5 and select "Extension Tests"
```

### Test Structure

```
vscode-extension/
├── tests/
│   ├── extension.test.ts    # Extension activation tests
│   └── preview.test.ts      # Preview panel tests
└── .vscode/
    └── launch.json          # Test launch configuration
```

### Writing Extension Tests

```typescript
import * as vscode from 'vscode';
import * as assert from 'assert';
import { suite, test } from 'mocha';

suite('Extension Test Suite', () => {
  test('Should register commands', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('ade.scaffoldPreview'));
  });
});
```

## Test Coverage

### CLI Coverage

```bash
# Generate coverage report
cd cli
pnpm test:coverage

# View HTML report
open coverage/index.html
```

Coverage thresholds:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### Extension Coverage

VSCode extension testing with coverage requires additional setup:

```bash
# Install dependencies
cd vscode-extension
pnpm add -D @vscode/test-electron nyc

# Run with coverage
nyc --reporter=html --reporter=text pnpm test
```

## Unit Test Examples

### Testing Scaffolder

```typescript
describe('scaffoldService', () => {
  it('should create correct directory structure', async () => {
    const options = {
      language: 'python',
      framework: 'fastapi',
      service: 'test-api',
      domain: 'test-domain',
      output: '/tmp',
      preview: false
    };

    const result = await scaffoldService(options, registry, false);

    expect(result.path).toContain('test-domain/test-api');
    expect(fs.ensureDirSync).toHaveBeenCalled();
  });
});
```

### Testing Validator

```typescript
describe('validateProjectStructure', () => {
  it('should detect forbidden directories', () => {
    (fs.readdirSync as any).mockReturnValue(['src', 'tests']);

    const result = validateProjectStructure('/project', registry);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
```

### Testing Preview Panel

```typescript
suite('Preview Panel Tests', () => {
  test('Should escape HTML content', () => {
    const dangerous = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(dangerous);

    assert.ok(!escaped.includes('<script>'));
    assert.ok(escaped.includes('&lt;script&gt;'));
  });
});
```

## Integration Testing

### CLI Integration Test

```bash
# Build CLI
cd cli
pnpm run build

# Test scaffold command
node dist/index.js scaffold \
  --language python \
  --framework fastapi \
  --service test-api \
  --domain test \
  --preview
```

### Extension Integration Test

1. Open VSCode
2. Press F5 to launch Extension Development Host
3. Run command palette: `ADE: Scaffold Preview`
4. Complete the workflow
5. Verify preview panel displays correctly

## E2E Testing

### Manual E2E Test Checklist

- [ ] Install CLI globally
- [ ] Install VSCode extension
- [ ] Scaffold Python/FastAPI project
- [ ] Scaffold Node/Express project
- [ ] Scaffold Go/Fiber project
- [ ] Validate project structure
- [ ] Generate from preview
- [ ] Verify files are created correctly

### Automated E2E Testing

```typescript
// e2e/scaffold.test.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';

const execAsync = promisify(exec);

describe('E2E: Scaffold Command', () => {
  it('should scaffold a complete project', async () => {
    const output = '/tmp/test-e2e';

    await execAsync(`
      node cli/dist/index.js scaffold \
        --language python \
        --framework fastapi \
        --service api \
        --domain test \
        --output ${output}
    `);

    expect(fs.existsSync(`${output}/test/api/src`)).toBe(true);
    expect(fs.existsSync(`${output}/test/api/tests`)).toBe(true);
  });
});
```

## Continuous Integration

### GitHub Actions Test Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-cli:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
        with:
          version: 8.15.1

      - name: Install dependencies
        run: |
          cd cli
          pnpm install

      - name: Run tests
        run: |
          cd cli
          pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./cli/coverage/coverage-final.json

  test-extension:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
        with:
          version: 8.15.1

      - name: Install dependencies
        run: |
          cd vscode-extension
          pnpm install

      - name: Compile
        run: |
          cd vscode-extension
          pnpm run compile

      - name: Run tests
        uses: GabrielBB/xvfb-action@v1
        with:
          run: cd vscode-extension && pnpm test
```

## Test Best Practices

### 1. Test Organization

- Group related tests in suites
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking

- Mock external dependencies
- Use test doubles for file system operations
- Clear mocks between tests

### 3. Assertions

- Test one thing per test
- Use specific assertions
- Include edge cases

### 4. Performance

- Keep tests fast (< 100ms per unit test)
- Use `test.skip` for slow tests during development
- Run heavy tests separately

### 5. Maintenance

- Update tests when changing functionality
- Remove obsolete tests
- Keep test code clean and readable

## Debugging Tests

### Debug CLI Tests

```bash
# Run tests with debugging
cd cli
node --inspect-brk node_modules/.bin/vitest run

# Then attach VSCode debugger
```

### Debug Extension Tests

1. Set breakpoints in test files
2. Press F5 and select "Extension Tests"
3. Debugger will stop at breakpoints

### Common Issues

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in config |
| Mocks not working | Clear mocks in `beforeEach` |
| Cannot find module | Check import paths and tsconfig |
| Extension tests fail | Ensure compiled JavaScript exists |

## Test Commands Quick Reference

```bash
# CLI Tests
cd cli
pnpm test                  # Run tests
pnpm test:watch           # Watch mode
pnpm test:coverage        # Coverage report
pnpm test -- --ui         # UI mode

# Extension Tests
cd vscode-extension
pnpm run compile          # Compile first
# Then F5 in VSCode

# E2E Tests
./scripts/test-e2e.sh     # Run all E2E tests

# All tests
pnpm test                 # From root directory
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [VSCode Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Mocha Documentation](https://mochajs.org)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)