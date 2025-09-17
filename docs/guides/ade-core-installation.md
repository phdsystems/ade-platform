# ADE Core CLI Installation Guide

Complete installation guide for the `ade-core` command-line tool across all platforms.

## Prerequisites

### Required Software

- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: For cloning the repository (optional)

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v20.0.0 or higher

# Check npm version
npm --version
# Should output: 9.0.0 or higher
```

## Installation Methods

### Method 1: Global Installation via npm (Recommended)

```bash
# Install globally using npm
npm install -g ade-core

# Or using pnpm (faster)
npm install -g pnpm
pnpm install -g ade-core

# Verify installation
ade-core --version
```

### Method 2: Global Installation via npx (No Install)

```bash
# Run directly without installation
npx ade-core scaffold

# Specific version
npx ade-core@latest scaffold
```

### Method 3: Install from GitHub Repository

```bash
# Clone repository
git clone https://github.com/phdsystems/ade-platform.git
cd ade-platform/cli

# Install dependencies
npm install  # or pnpm install

# Build the CLI
npm run build

# Link globally
npm link

# Verify installation
ade-core --version
```

### Method 4: Install from Release

```bash
# Download latest release
wget https://github.com/phdsystems/ade-platform/releases/latest/download/ade-core.tgz

# Install globally
npm install -g ade-core.tgz

# Verify installation
ade-core --version
```

## Platform-Specific Instructions

### Windows

#### Option 1: Windows with Node.js

```powershell
# Open PowerShell as Administrator

# Install Node.js via Chocolatey (if not installed)
choco install nodejs

# Install ade-core globally
npm install -g ade-core

# Verify installation
ade-core --version
```

#### Option 2: Windows with WSL2

```bash
# In WSL2 terminal

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm (optional, faster)
npm install -g pnpm

# Install ade-core
pnpm install -g ade-core

# Verify installation
ade-core --version
```

#### Windows Path Configuration

If `ade-core` is not recognized after installation:

1. Find npm global directory:
```powershell
npm config get prefix
```

2. Add to PATH:
   - Open System Properties → Environment Variables
   - Add `C:\Users\[username]\AppData\Roaming\npm` to PATH
   - Restart terminal

### macOS

#### Option 1: Using Homebrew

```bash
# Install Node.js
brew install node

# Install pnpm (optional, faster)
brew install pnpm

# Install ade-core
npm install -g ade-core
# or
pnpm install -g ade-core

# Verify installation
ade-core --version
```

#### Option 2: Using Node Version Manager (nvm)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 20
nvm use 20

# Install ade-core
npm install -g ade-core

# Verify installation
ade-core --version
```

### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build essentials (if needed)
sudo apt-get install -y build-essential

# Install pnpm (optional, faster)
npm install -g pnpm

# Install ade-core
sudo npm install -g ade-core
# or
pnpm install -g ade-core

# Verify installation
ade-core --version
```

### Linux (RHEL/CentOS/Fedora)

```bash
# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Install Node.js
sudo yum install nodejs
# or
sudo dnf install nodejs

# Install ade-core
sudo npm install -g ade-core

# Verify installation
ade-core --version
```

### Docker Installation

```dockerfile
# Dockerfile
FROM node:20-alpine

# Install ade-core globally
RUN npm install -g ade-core

# Set working directory
WORKDIR /app

# Default command
CMD ["ade-core", "--help"]
```

Build and run:
```bash
# Build image
docker build -t ade-core .

# Run ade-core in container
docker run -it -v $(pwd):/app ade-core scaffold
```

## Post-Installation Setup

### 1. Verify Installation

```bash
# Check version
ade-core --version

# View help
ade-core --help

# Test with preview
ade-core scaffold --preview
```

### 2. Configure Shell Completion (Optional)

#### Bash

```bash
# Add to ~/.bashrc
echo 'source <(ade-core completion bash)' >> ~/.bashrc
source ~/.bashrc
```

#### Zsh

```bash
# Add to ~/.zshrc
echo 'source <(ade-core completion zsh)' >> ~/.zshrc
source ~/.zshrc
```

#### PowerShell

```powershell
# Add to profile
ade-core completion powershell | Out-String | Invoke-Expression
```

### 3. Set Default Registry (Optional)

```bash
# Set custom registry path
export ADE_REGISTRY_PATH="$HOME/.ade/registry.json"

# Add to shell profile
echo 'export ADE_REGISTRY_PATH="$HOME/.ade/registry.json"' >> ~/.bashrc
```

## Upgrading

### Upgrade to Latest Version

```bash
# Using npm
npm update -g ade-core

# Using pnpm
pnpm update -g ade-core

# Check new version
ade-core --version
```

### Upgrade to Specific Version

```bash
# Install specific version
npm install -g ade-core@1.2.0

# Verify version
ade-core --version
```

## Uninstallation

### Remove Global Installation

```bash
# Using npm
npm uninstall -g ade-core

# Using pnpm
pnpm uninstall -g ade-core

# Verify removal
which ade-core  # Should return nothing
```

### Clean Cache

```bash
# Clear npm cache
npm cache clean --force

# Clear pnpm cache
pnpm store prune
```

## Troubleshooting

### Issue: Command Not Found

```bash
# Check if installed
npm list -g ade-core

# Check npm global bin directory
npm config get prefix

# Add to PATH (Linux/macOS)
export PATH="$(npm config get prefix)/bin:$PATH"

# Add to PATH (Windows)
# Add %APPDATA%\npm to system PATH
```

### Issue: Permission Denied (Linux/macOS)

```bash
# Option 1: Use sudo
sudo npm install -g ade-core

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g ade-core

# Option 3: Use Node Version Manager
# Install nvm and use it to manage Node/npm
```

### Issue: EACCES Error

```bash
# Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g ade-core
```

### Issue: Behind Corporate Proxy

```bash
# Set npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Install ade-core
npm install -g ade-core
```

### Issue: Slow Installation

```bash
# Use faster registry
npm config set registry https://registry.npmmirror.com

# Or use pnpm (faster)
npm install -g pnpm
pnpm install -g ade-core
```

## Verification Steps

After installation, verify everything works:

```bash
# 1. Check installation
ade-core --version

# 2. View available commands
ade-core --help

# 3. Test scaffold preview
ade-core scaffold \
  --language python \
  --framework fastapi \
  --service test-api \
  --domain test \
  --preview

# 4. Check output
# Should display preview without creating files
```

## Alternative Installation Methods

### Using Yarn

```bash
# Install yarn globally
npm install -g yarn

# Install ade-core
yarn global add ade-core

# Verify
ade-core --version
```

### Using Bun

```bash
# Install bun
curl -fsSL https://bun.sh/install | bash

# Install ade-core
bun install -g ade-core

# Verify
ade-core --version
```

### From Source (Development)

```bash
# Clone and build
git clone https://github.com/phdsystems/ade-platform.git
cd ade-platform/cli
pnpm install
pnpm run build

# Run directly
node dist/index.js --help

# Or link globally
pnpm link
ade-core --help
```

## Environment Variables

Configure behavior with environment variables:

```bash
# Set custom registry path
export ADE_REGISTRY_PATH="/path/to/registry.json"

# Set default output directory
export ADE_OUTPUT_PATH="/path/to/projects"

# Disable colors in output
export ADE_NO_COLOR=1

# Enable debug mode
export DEBUG=ade:*
```

Add to shell profile for persistence:

```bash
# ~/.bashrc or ~/.zshrc
export ADE_REGISTRY_PATH="$HOME/.ade/registry.json"
export ADE_OUTPUT_PATH="$HOME/projects"
```

## Quick Test

After installation, test with this quick command:

```bash
# Create a test project in preview mode
ade-core scaffold \
  --language python \
  --framework fastapi \
  --service hello-api \
  --domain example \
  --preview

# If you see the preview output, installation is successful!
```

## Getting Help

```bash
# View command help
ade-core --help
ade-core scaffold --help
ade-core validate --help

# Report issues
# https://github.com/phdsystems/ade-platform/issues

# Documentation
# https://github.com/phdsystems/ade-platform/tree/main/docs
```

## Next Steps

Once installed, you can:

1. [Create your first project](./first-project.md)
2. [Learn about available commands](../api/cli-commands.md)
3. [Customize templates](./custom-templates.md)
4. [Integrate with VSCode](./vscode-extension-deployment.md)