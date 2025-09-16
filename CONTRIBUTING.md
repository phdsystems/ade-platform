# Contributing to ADE Platform

Thank you for your interest in contributing to ADE Platform! We welcome contributions from the community.

## Code of Conduct

Please be respectful and professional in all interactions. We're building a welcoming community for developers of all backgrounds.

## How to Contribute

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use issue templates when available
3. Provide detailed reproduction steps
4. Include system information (OS, Node version, etc.)

### Pull Requests

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes
4. Write/update tests as needed
5. Update documentation
6. Submit a pull request to `develop`

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ade-platform.git
cd ade-platform

# Install dependencies
npm install
cd cli && npm install && cd ..
cd vscode-extension && npm install && cd ..

# Build everything
npm run build:cli
npm run compile:vsce
```

### Coding Standards

- **TypeScript**: Use strict mode
- **Formatting**: Prettier with default settings
- **Linting**: ESLint with provided configuration
- **Commits**: Follow conventional commits
- **Testing**: Aim for >80% coverage

### Commit Messages

We use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(cli): add support for Ruby templates
fix(extension): resolve preview rendering issue
docs: update installation instructions
```

### Testing

#### CLI Tests
```bash
cd cli
npm test
npm run test:coverage
```

#### Extension Tests
```bash
cd vscode-extension
npm test
```

### Project Structure

```
ade-platform/
├── cli/                 # Core CLI tool
│   ├── src/            # Source code
│   │   ├── commands/   # CLI commands
│   │   ├── core/       # Core functionality
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utilities
│   └── tests/          # Test files
├── vscode-extension/    # VSCode extension
│   └── src/            # Extension source
└── docs/               # Documentation
```

### Adding New Languages/Frameworks

1. Update `cli/config/stack-registry.json`
2. Add template files in `cli/templates/`
3. Update documentation
4. Add tests for new templates

Example registry entry:
```json
{
  "languages": {
    "ruby": {
      "frameworks": {
        "rails": {
          "deployment": { "defaultPort": 3000 },
          "scaffold": {
            "folders": ["app", "config", "db"],
            "files": {
              "Gemfile": "TEMPLATE_REF::rails/Gemfile",
              "config.ru": "TEMPLATE_REF::rails/config.ru"
            }
          }
        }
      }
    }
  }
}
```

### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md following Keep a Changelog format

### Review Process

1. Automated CI checks must pass
2. Code review by maintainers
3. Testing in multiple environments
4. Documentation review
5. Merge to develop, then main for releases

### Release Process

Maintainers handle releases:

1. Update version in package.json files
2. Update CHANGELOG.md
3. Create git tag `v*.*.*`
4. Push tag to trigger release workflow
5. GitHub Actions creates release artifacts

## Questions?

- Open a discussion for general questions
- Join our community chat (if available)
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.