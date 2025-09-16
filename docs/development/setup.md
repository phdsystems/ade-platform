# Development Setup Guide

Complete guide for setting up the ADE Platform development environment.

## System Requirements

- **Node.js**: 20.0.0 or higher
- **pnpm**: 8.15.0 or higher (faster alternative to npm)
- **Git**: 2.25.0 or higher
- **VSCode**: 1.90.0 or higher (for extension development)
- **Operating System**: Windows, macOS, or Linux

### Recommended Package Managers (for scaffolded projects)

- **Python**: [uv](https://github.com/astral-sh/uv) - 10-100x faster than pip
- **Node.js**: [pnpm](https://pnpm.io) - 2x faster than npm, efficient disk usage
- **Go**: Native go modules

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/phdsystems/ade-platform.git
cd ade-platform
```

### 2. Install Dependencies

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Root dependencies
pnpm install

# CLI dependencies
cd cli
pnpm install
cd ..

# VSCode extension dependencies
cd vscode-extension
pnpm install
cd ..
```

### 3. Build Everything

```bash
# Build CLI
pnpm run build:cli

# Build VSCode extension
pnpm run compile:vsce
```

### 4. Verify Installation

```bash
# Test CLI
node cli/dist/index.js --help

# Test validation
node cli/dist/index.js validate --path .
```

## Detailed Setup

### Environment Structure

```
ade-platform/
├── cli/                    # Core CLI tool
│   ├── src/               # TypeScript source
│   ├── dist/              # Compiled JavaScript
│   ├── templates/         # Project templates
│   └── config/            # Configuration files
├── vscode-extension/      # VSCode extension
│   ├── src/              # Extension source
│   └── out/              # Compiled output
├── docs/                  # Documentation
├── example-project/       # Example scaffolded project
└── scripts/              # Utility scripts
```

### Setting Up CLI Development

1. **Navigate to CLI directory**:
   ```bash
   cd cli
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Build the CLI**:
   ```bash
   pnpm run build
   ```

4. **Watch for changes** (development mode):
   ```bash
   pnpm run dev
   ```

5. **Run tests**:
   ```bash
   pnpm test
   ```

6. **Create global link** (optional):
   ```bash
   pnpm link
   # Now you can use 'ade-core' command globally
   ```

### Setting Up VSCode Extension Development

1. **Navigate to extension directory**:
   ```bash
   cd vscode-extension
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Compile TypeScript**:
   ```bash
   pnpm run compile
   ```

4. **Watch for changes**:
   ```bash
   pnpm run watch
   ```

5. **Open in VSCode**:
   ```bash
   code .
   ```

6. **Launch Extension Host**:
   - Press `F5` in VSCode
   - New window opens with extension loaded

### Setting Up Templates

Templates are stored in `cli/templates/` with this structure:

```
templates/
├── fastapi/
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── express/
│   ├── src/
│   │   └── index.mjs
│   └── package.json
└── go-fiber/
    └── cmd/
        └── serviceName/
            └── main.go
```

To add new templates:

1. Create directory for language/framework
2. Add template files with Handlebars syntax
3. Update `stack-registry.json` to reference templates

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ...

# Test changes
pnpm test

# Commit
git add .
git commit -m "feat: add new feature"

# Push
git push origin feature/my-feature
```

### 2. Testing Workflow

```bash
# Run all tests
pnpm test

# Run CLI tests
cd cli && pnpm test

# Run extension tests
cd vscode-extension && pnpm test

# Test scaffolding
node cli/dist/index.js scaffold \
  --language python \
  --framework fastapi \
  --service test-api \
  --domain test \
  --preview
```

### 3. Debugging

#### CLI Debugging

1. **Add breakpoints** in VSCode
2. **Create launch configuration**:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug CLI",
     "program": "${workspaceFolder}/cli/dist/index.js",
     "args": ["scaffold", "--preview"],
     "cwd": "${workspaceFolder}"
   }
   ```
3. **Press F5** to start debugging

#### Extension Debugging

1. **Open** `vscode-extension` in VSCode
2. **Set breakpoints** in TypeScript files
3. **Press F5** to launch Extension Host
4. **Trigger commands** in the new window

## Common Tasks

### Adding a New Language/Framework

1. **Create template files**:
   ```bash
   mkdir -p cli/templates/my-framework
   # Add template files
   ```

2. **Update registry**:
   ```json
   // cli/config/stack-registry.json
   {
     "languages": {
       "mylang": {
         "frameworks": {
           "myframework": {
             "scaffold": { /* ... */ }
           }
         }
       }
     }
   }
   ```

3. **Test scaffolding**:
   ```bash
   pnpm run build:cli
   node cli/dist/index.js scaffold \
     --language mylang \
     --framework myframework \
     --preview
   ```

### Running Linters

```bash
# ESLint
pnpm run lint

# Fix lint issues
pnpm run lint:fix

# Format with Prettier
pnpm run format

# Check formatting
pnpm run format:check
```

### Building for Production

```bash
# Build everything
pnpm run build

# Package VSCode extension
cd vscode-extension
pnpm run package

# Creates .vsix file for distribution
```

## Environment Variables

Create `.env` file for local development:

```bash
# .env
NODE_ENV=development
LOG_LEVEL=debug
```

## Troubleshooting

### Node Version Issues

Use nvm to manage Node versions:
```bash
nvm install 20
nvm use 20
```

### Permission Issues

On Unix systems:
```bash
chmod +x cli/dist/index.js
```

### Build Failures

Clean and rebuild:
```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json
rm -rf cli/node_modules cli/package-lock.json
rm -rf vscode-extension/node_modules vscode-extension/package-lock.json

# Reinstall
pnpm install
cd cli && pnpm install && cd ..
cd vscode-extension && pnpm install && cd ..

# Rebuild
pnpm run build
```

### TypeScript Issues

Check TypeScript version:
```bash
npx tsc --version
# Should be 5.4.0 or higher
```

## IDE Setup

### VSCode Settings

Recommended `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": ["javascript", "typescript"],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/out": true
  }
}
```

### Recommended Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens
- Todo Tree

## Next Steps

- Read [CLI Development Guide](cli.md)
- Read [VSCode Extension Guide](vscode-extension.md)
- Check [API Documentation](../api/cli-commands.md)
- Review [Contributing Guidelines](../../CONTRIBUTING.md)