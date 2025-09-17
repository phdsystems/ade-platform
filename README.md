# ADE Platform

> Fast, modern scaffolding for microservices with best practices built-in

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)

## What is ADE Platform?

A comprehensive development platform that helps you scaffold production-ready microservices in seconds:

- **🚀 CLI Tool** - Scaffold services with `ade-core` command
- **🔧 VSCode Extension** - Visual scaffolding with live preview
- **📦 Smart Templates** - Production-optimized with fastest package managers (uv, pnpm)
- **🏗️ DDD Structure** - Enforced domain-driven design patterns

## Quick Install

```bash
npm install -g ade-core
```

## Quick Start

```bash
# Interactive mode
ade-core scaffold

# Or specify directly
ade-core scaffold --language python --framework fastapi --service api --domain core
```

## Features

- **Languages**: Python, Node.js, Go
- **Frameworks**: FastAPI, Express, Fiber, and more
- **Fast by Default**: uv for Python (10-100x faster), pnpm for Node.js
- **Docker Ready**: Optimized multi-stage builds
- **Best Practices**: Tests, docs, CI/CD configs included

## Documentation

📚 **[Complete Documentation](docs/README.md)**

### Essential Guides

- [Installation Guide](docs/guides/ade-core-installation.md) - All platforms
- [CLI Commands](docs/api/cli-commands.md) - Full reference
- [VSCode Extension](docs/guides/vscode-extension-deployment.md) - Setup guide
- [Windows Users](docs/guides/windows-quick-start.md) - WSL setup

### Development

- [Contributing](CONTRIBUTING.md) - Guidelines
- [Development Setup](docs/development/setup.md) - Environment setup
- [Testing](docs/development/testing.md) - Test guide

## Support

- [Issues](https://github.com/phdsystems/ade-platform/issues)
- [Discussions](https://github.com/phdsystems/ade-platform/discussions)

## License

MIT © PHD Systems