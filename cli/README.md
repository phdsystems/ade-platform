# ADE Core CLI

> Command-line interface for scaffolding microservices with best practices built-in

[![Version](https://img.shields.io/npm/v/ade-core.svg)](https://npmjs.org/package/ade-core)
[![License](https://img.shields.io/npm/l/ade-core.svg)](https://github.com/phdsystems/ade-platform/blob/main/LICENSE)

## Features

- 🚀 **Multi-language support** - Python, Node.js, Go
- ⚡ **Fast package managers** - uv for Python (10-100x faster), pnpm for Node.js
- 📁 **Domain-driven design** - Enforced project structure
- 🎨 **Interactive mode** - Guided project creation
- 🔍 **Project validation** - Ensure consistent structure
- 📋 **Preview mode** - See what will be created before committing

## Installation

### Global Installation

```bash
# Using pnpm (recommended)
pnpm install -g ade-core

# Using npm
npm install -g ade-core
```

### Local Development

```bash
# Clone repository
git clone https://github.com/phdsystems/ade-platform.git
cd ade-platform/cli

# Install dependencies
pnpm install

# Build
pnpm run build

# Create global link
pnpm link
```

## Quick Start

### Interactive Mode

Simply run without options for interactive prompts:

```bash
ade-core scaffold
```

### Command Line Mode

```bash
ade-core scaffold \
  --language python \
  --framework fastapi \
  --service user-api \
  --domain identity
```

### Preview Mode

See what will be created without making changes:

```bash
ade-core scaffold \
  --language node \
  --framework express \
  --service payment-api \
  --domain finance \
  --preview
```

## Commands

### `scaffold`

Create a new microservice with the specified language and framework.

```bash
ade-core scaffold [options]
```

**Options:**

- `-l, --language <lang>` - Programming language (python, node, go)
- `-f, --framework <fw>` - Framework to use (fastapi, express, fiber, etc.)
- `-s, --service <name>` - Service name (e.g., user-api)
- `-d, --domain <domain>` - Domain name for DDD structure (e.g., identity)
- `-r, --registry <path>` - Path to custom stack registry JSON
- `-p, --preview` - Preview without creating files
- `-o, --output <path>` - Output directory (default: current directory)
- `--no-git` - Skip git initialization
- `--no-install` - Skip dependency installation

### `validate`

Validate existing project structure against ADE conventions.

```bash
ade-core validate [options]
```

**Options:**

- `-p, --path <path>` - Path to validate (default: current directory)
- `-r, --registry <path>` - Path to stack registry JSON
- `--fix` - Attempt to fix issues automatically

## Supported Stacks

### Python

| Framework | Port | Features |
|-----------|------|----------|
| FastAPI | 8000 | Async, OpenAPI, high performance |
| Flask | 5000 | Lightweight, flexible |
| Django | 8000 | Full-featured, admin panel |

### Node.js

| Framework | Port | Features |
|-----------|------|----------|
| Express | 3000 | Minimal, flexible, mature |
| NestJS | 3000 | TypeScript, decorators, enterprise |
| Koa | 3000 | Modern, lightweight |

### Go

| Framework | Port | Features |
|-----------|------|----------|
| Fiber | 3000 | Express-inspired, fast |
| Gin | 8080 | High performance, middleware |
| Echo | 8080 | Minimalist, extensible |

## Project Structure

Generated projects follow Domain-Driven Design principles:

```
<domain>/
└── <service>/
    ├── src/           # Source code
    │   └── app/       # Application code
    ├── tests/         # Test files
    ├── docs/          # Documentation
    ├── deploy/        # Deployment configs
    │   └── Dockerfile # Optimized container
    ├── .env.example   # Environment template
    ├── .gitignore     # Git ignore rules
    ├── Makefile       # Common commands
    └── README.md      # Service documentation
```

## Configuration

### Custom Registry

Create a custom `stack-registry.json` to define your own templates:

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
        "custom": {
          "deployment": { "defaultPort": 8000 },
          "scaffold": {
            "folders": ["src"],
            "files": {
              "src/main.py": "INLINE::print('{{serviceName}}')"
            }
          }
        }
      }
    }
  }
}
```

Use with:

```bash
ade-core scaffold --registry ./my-registry.json
```

### Template Variables

Available in templates:

- `{{serviceName}}` - Service name (lowercase)
- `{{ServiceName}}` - Service name (capitalized)
- `{{domain}}` - Domain name (lowercase)
- `{{Domain}}` - Domain name (capitalized)
- `{{port}}` - Default port from registry

## Examples

### Python FastAPI Microservice

```bash
ade-core scaffold \
  --language python \
  --framework fastapi \
  --service auth-api \
  --domain identity

cd identity/auth-api
make install  # Uses uv for ultra-fast installation
make run      # Start development server
```

### Node.js Express API

```bash
ade-core scaffold \
  --language node \
  --framework express \
  --service payment-api \
  --domain finance

cd finance/payment-api
pnpm install  # Fast package installation
pnpm run dev  # Start with hot reload
```

### Go Fiber Service

```bash
ade-core scaffold \
  --language go \
  --framework fiber \
  --service analytics-api \
  --domain data

cd data/analytics-api
go mod download
go run cmd/*/main.go
```

### Validate Existing Project

```bash
# Validate current directory
ade-core validate

# Validate specific path
ade-core validate --path ./my-project

# Auto-fix issues
ade-core validate --fix
```

## Performance Features

### Python Projects

- **uv** package manager (10-100x faster than pip)
- **Gunicorn** with uvloop workers
- **orjson** for fast JSON serialization
- Multi-stage Docker builds

### Node.js Projects

- **pnpm** package manager (2x faster than npm)
- **Compression** middleware
- **Cluster mode** support
- Optimized Docker images

### Go Projects

- **Fiber prefork** mode
- **Distroless** images (~8MB)
- Compiled binaries
- Minimal dependencies

## Development

### Building from Source

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Run tests
pnpm test

# Watch mode
pnpm run dev
```

### Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Project Structure

```
cli/
├── src/
│   ├── commands/      # CLI commands
│   ├── core/          # Core functionality
│   ├── types/         # TypeScript types
│   └── utils/         # Utilities
├── templates/         # Project templates
├── config/           # Stack registry
└── tests/            # Unit tests
```

## Troubleshooting

### Command not found

```bash
# Ensure global installation
npm list -g ade-core

# Or use npx
npx ade-core scaffold
```

### Permission denied

```bash
# Fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Template not found

Check registry file exists:

```bash
ls cli/config/stack-registry.json
```

### Build errors

```bash
# Clean and rebuild
rm -rf dist/ node_modules/
pnpm install
pnpm run build
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development setup and guidelines.

### Adding Templates

1. Edit `config/stack-registry.json`
2. Add template files to `templates/`
3. Update documentation
4. Submit pull request

## API

### Programmatic Usage

```typescript
import { scaffoldService } from 'ade-core';

const options = {
  language: 'python',
  framework: 'fastapi',
  service: 'my-api',
  domain: 'my-domain',
  output: './output',
  preview: false
};

const result = await scaffoldService(options, registry);
console.log(`Created: ${result.path}`);
```

## License

MIT © PHD Systems

## Links

- [Documentation](https://github.com/phdsystems/ade-platform/tree/main/docs)
- [Issues](https://github.com/phdsystems/ade-platform/issues)
- [Changelog](https://github.com/phdsystems/ade-platform/blob/main/CHANGELOG.md)
- [VSCode Extension](https://github.com/phdsystems/ade-platform/tree/main/vscode-extension)