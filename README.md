# ADE Platform

> Application Development Environment - A modern scaffolding and code generation platform for microservices

## Overview

ADE Platform is a comprehensive development environment that provides:
- **CLI Tool**: Scaffold microservices in multiple languages (Python, Node.js, Go)
- **VSCode Extension**: Visual scaffolding and preview capabilities
- **Template System**: Customizable project templates with best practices
- **Convention Enforcement**: Domain-driven design patterns and consistent project structure

## Features

- 🚀 **Multi-Language Support**: Python (FastAPI), Node.js (Express), Go (Fiber)
- ⚡ **Ultra-Fast Package Managers**: uv for Python (10-100x faster), pnpm for Node.js (2x faster)
- 📁 **Domain-Driven Structure**: Enforced conventions for scalable architecture
- 🔧 **VSCode Integration**: Scaffold and preview directly from your editor
- 📦 **Production-Ready Templates**: Optimized for performance from day one
- 🐳 **Optimized Docker**: Multi-stage builds, distroless images, minimal sizes
- ✅ **Quality Tools**: Built-in linting, formatting, and git hooks
- 📊 **Performance Monitoring**: Prometheus metrics, health checks, logging

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- VSCode (for extension features)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/phdsystems/ade-platform.git
cd ade-platform

# Install dependencies
npm install

# Build the CLI tool
npm run build:cli

# Install globally (optional)
npm link
```

### VSCode Extension Setup

```bash
# Compile the extension
npm run compile:vsce

# Open VSCode in the extension directory
cd vscode-extension
code .

# Press F5 to launch a new VSCode window with the extension loaded
```

## Usage

### CLI Tool

```bash
# Scaffold a new Python FastAPI service
ade-core scaffold --language python --framework fastapi --service user-api --domain identity

# Scaffold a Node.js Express service
ade-core scaffold --language node --framework express --service payment-api --domain finance

# Preview without creating files
ade-core scaffold --language go --framework fiber --service analytics --domain data --preview
```

### VSCode Extension

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `ADE: Scaffold Preview`
3. Follow the prompts to configure your service
4. Review the preview and confirm generation

## Project Structure

```
ade-platform/
├── cli/                    # Core CLI tool
│   ├── src/               # Source code
│   ├── config/            # Configuration and registry
│   └── templates/         # Service templates
├── vscode-extension/      # VSCode extension
│   ├── src/              # Extension source
│   └── package.json      # Extension manifest
├── tools/                 # Build and development tools
└── scripts/              # Utility scripts
```

## Domain-Driven Design

The platform enforces a domain-based structure:

```
your-project/
├── identity/              # Domain boundary
│   ├── user-service/     # Microservice
│   │   ├── src/         # Source code
│   │   ├── tests/       # Test files
│   │   ├── docs/        # Documentation
│   │   └── deploy/      # Deployment configs
│   └── auth-service/
└── finance/
    └── payment-service/
```

## Configuration

### Stack Registry

Customize templates and conventions in `cli/config/stack-registry.json`:

```json
{
  "conventions": {
    "domainLayout": {
      "enforce": true,
      "requiredSubdirs": ["src", "tests", "docs", "deploy"]
    }
  },
  "languages": {
    "python": {
      "frameworks": {
        "fastapi": { /* template config */ }
      }
    }
  }
}
```

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build all components
npm run build

# Watch mode for development
npm run dev
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT - see [LICENSE](LICENSE) for details

## Documentation

- 📚 [Full Documentation](docs/README.md) - Complete documentation index
- 🚀 [Development Setup](docs/development/setup.md) - Get started with development
- ⚡ [Performance Guide](docs/performance.md) - Optimization details and benchmarks
- 🧪 [VSCode Extension Testing](docs/development/vscode-extension.md) - Test the extension
- 📝 [CLI Commands Reference](docs/api/cli-commands.md) - Detailed CLI usage

## Support

- 🐛 [Issue Tracker](https://github.com/phdsystems/ade-platform/issues)
- 💬 [Discussions](https://github.com/phdsystems/ade-platform/discussions)

## Roadmap

- [ ] Web UI for template management
- [ ] Plugin system for custom generators
- [ ] Integration with CI/CD pipelines
- [ ] Cloud deployment automation
- [ ] Service mesh configuration
- [ ] API gateway integration

---

Built with ❤️ by PHD Systems