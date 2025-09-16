# CLI Commands Reference

Complete reference for the ADE Platform CLI (`ade-core`).

## Installation

```bash
# Local installation (from repository)
cd cli
npm install
npm run build
npm link  # Optional: make available globally

# Global installation (when published)
npm install -g ade-core
```

## Commands Overview

```bash
ade-core [command] [options]
```

Available commands:
- `scaffold` - Create a new service with specified language and framework
- `validate` - Validate project structure against ADE conventions
- `help` - Display help information

## scaffold

Create a new microservice with the specified language and framework.

### Synopsis

```bash
ade-core scaffold [options]
```

### Options

| Option | Alias | Description | Required |
|--------|-------|-------------|----------|
| `--language <lang>` | `-l` | Programming language (python, node, go) | No* |
| `--framework <fw>` | `-f` | Framework to use | No* |
| `--service <name>` | `-s` | Service name | No* |
| `--domain <domain>` | `-d` | Domain name for DDD structure | No* |
| `--registry <path>` | `-r` | Path to stack registry JSON | No |
| `--preview` | `-p` | Preview without creating files | No |
| `--output <path>` | `-o` | Output directory (default: cwd) | No |
| `--no-git` | | Skip git initialization | No |
| `--no-install` | | Skip dependency installation | No |

*Interactive prompts will collect missing required options

### Examples

#### Basic Usage (Interactive)

```bash
ade-core scaffold
# Prompts for language, framework, service, and domain
```

#### Python FastAPI Service

```bash
ade-core scaffold \
  --language python \
  --framework fastapi \
  --service user-api \
  --domain identity
```

#### Node.js Express Service

```bash
ade-core scaffold \
  --language node \
  --framework express \
  --service payment-api \
  --domain finance
```

#### Go Fiber Service

```bash
ade-core scaffold \
  --language go \
  --framework fiber \
  --service analytics-api \
  --domain data
```

#### Preview Mode

```bash
ade-core scaffold \
  --language python \
  --framework fastapi \
  --service auth-api \
  --domain identity \
  --preview
```

Output:
```json
{
  "path": "/path/to/identity/auth-api",
  "structure": [
    "identity/auth-api/src/app",
    "identity/auth-api/tests",
    "identity/auth-api/docs",
    "identity/auth-api/deploy",
    "..."
  ],
  "files": {
    "src/app/main.py": "...",
    "requirements.txt": "...",
    "..."
  }
}
```

#### Custom Output Directory

```bash
ade-core scaffold \
  --language node \
  --framework express \
  --service api \
  --domain core \
  --output ~/projects/my-app
```

#### Skip Git and Install

```bash
ade-core scaffold \
  --language python \
  --framework fastapi \
  --service api \
  --domain core \
  --no-git \
  --no-install
```

### Generated Structure

```
<domain>/
└── <service>/
    ├── src/           # Source code
    ├── tests/         # Test files
    ├── docs/          # Documentation
    ├── deploy/        # Deployment configs
    ├── .env.example   # Environment template
    ├── .gitignore     # Git ignore file
    ├── Makefile       # Common commands
    └── [language-specific files]
```

### Language-Specific Files

#### Python (FastAPI)
- `src/app/main.py` - FastAPI application with performance optimizations
- `requirements.txt` - Python dependencies
- `pyproject.toml` - Modern Python project configuration
- `Makefile` - Commands using uv (10-100x faster than pip)
- `deploy/Dockerfile` - Multi-stage build with uv

**Quick Start:**
```bash
make install  # Install with uv (ultra-fast)
make run      # Start development server
make docker-build  # Build optimized image
```

#### Node.js (Express)
- `src/index.mjs` - Express application with performance middleware
- `package.json` - Node dependencies with pnpm
- `Makefile` - Commands using pnpm (2x faster than npm)
- `deploy/Dockerfile` - Multi-stage build with pnpm
- `.npmrc` - pnpm configuration

**Quick Start:**
```bash
make install  # Install with pnpm (fast)
make run      # Start development server
make docker-build  # Build optimized image
```

#### Go (Fiber)
- `cmd/<service>/main.go` - Fiber application with prefork
- `go.mod` - Go module file
- `deploy/Dockerfile` - Distroless image (~8MB)

**Quick Start:**
```bash
go mod download  # Download dependencies
go run cmd/*/main.go  # Start development server
docker build -t service .  # Build minimal image
```

## validate

Validate project structure against ADE conventions.

### Synopsis

```bash
ade-core validate [options]
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--path <path>` | `-p` | Path to validate | Current directory |
| `--registry <path>` | `-r` | Path to stack registry JSON | Auto-detect |
| `--fix` | | Attempt to fix issues | false |

### Examples

#### Validate Current Directory

```bash
ade-core validate
```

#### Validate Specific Path

```bash
ade-core validate --path ./my-project
```

#### Auto-fix Issues

```bash
ade-core validate --path ./my-project --fix
```

### Validation Checks

1. **Domain Structure**
   - Checks for domain directories
   - Validates against forbidden root directories
   - Ensures required subdirectories exist

2. **Service Structure**
   - Verifies required directories (src, tests, docs, deploy)
   - Checks for essential files
   - Validates naming conventions

### Output Examples

#### Valid Project

```
✅ Project structure is valid!
```

#### Validation Errors

```
❌ Validation failed:
  • Found forbidden directories at root level: src, tests
  • Missing required directory: identity/user-api/docs

⚠️ Warnings:
  • Missing required directory: identity/user-api/deploy
```

## Global Options

These options work with all commands:

| Option | Alias | Description |
|--------|-------|-------------|
| `--version` | `-V` | Output version number |
| `--help` | `-h` | Display help |

## Configuration

### Stack Registry

The CLI uses a stack registry file (`stack-registry.json`) to define:
- Available languages and frameworks
- Project structure conventions
- Template configurations
- Deployment settings

Default location: `cli/config/stack-registry.json`

### Custom Registry

Use a custom registry file:

```bash
ade-core scaffold --registry ./my-registry.json
```

Registry schema example:

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
        "fastapi": {
          "deployment": { "defaultPort": 8000 },
          "scaffold": { /* ... */ }
        }
      }
    }
  }
}
```

## Template Variables

Templates use Handlebars syntax with these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{serviceName}}` | Service name (lowercase) | user-api |
| `{{ServiceName}}` | Service name (capitalized) | User-api |
| `{{domain}}` | Domain name (lowercase) | identity |
| `{{Domain}}` | Domain name (capitalized) | Identity |
| `{{port}}` | Default port from registry | 8000 |

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | File system error |
| 4 | Template error |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ADE_REGISTRY_PATH` | Default registry file path |
| `ADE_OUTPUT_PATH` | Default output directory |
| `ADE_NO_COLOR` | Disable colored output |
| `DEBUG` | Enable debug logging |

## Troubleshooting

### Command not found

```bash
# Ensure CLI is built
cd cli
npm run build

# Run directly with node
node cli/dist/index.js [command]

# Or create global link
npm link
```

### Registry file not found

```bash
# Specify registry path explicitly
ade-core scaffold --registry /path/to/registry.json
```

### Permission denied

```bash
# Ensure execution permissions
chmod +x cli/dist/index.js
```

### Template not found

Check that template files exist in `cli/templates/` or are defined as inline templates in the registry.

## Advanced Usage

### Scripting

```bash
#!/bin/bash
# Scaffold multiple services

for service in auth user payment; do
  ade-core scaffold \
    --language python \
    --framework fastapi \
    --service "${service}-api" \
    --domain identity \
    --no-git
done
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Scaffold Service
  run: |
    npx ade-core scaffold \
      --language ${{ matrix.language }} \
      --framework ${{ matrix.framework }} \
      --service ${{ github.event.inputs.service }} \
      --domain ${{ github.event.inputs.domain }} \
      --output ./output
```

### Validation in Pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: validate-structure
        name: Validate ADE Structure
        entry: ade-core validate
        language: system
        pass_filenames: false
```