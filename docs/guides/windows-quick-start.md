# Windows Quick Start Guide for ADE Platform

Quick guide for Windows users to build, install, and run the ADE VSCode extension.

## Prerequisites

- Windows 10/11 with WSL2 installed
- Node.js 20+ installed (in both Windows and WSL)
- VSCode installed on Windows
- Git installed

## Step 1: Clone and Setup

### In WSL Terminal:

```bash
# Clone repository
git clone https://github.com/phdsystems/ade-platform.git
cd ade-platform

# Install pnpm globally
npm install -g pnpm@8.15.1
```

## Step 2: Build Everything

### In WSL Terminal:

```bash
# Build CLI tool (required for extension)
cd cli
pnpm install
pnpm run build
cd ..

# Build VSCode extension
cd vscode-extension
pnpm install
pnpm run compile
pnpm run package
cd ..
```

This creates `vscode-extension/ade-0.0.1.vsix`

## Step 3: Install Extension in Windows

### Option A: Using Windows Terminal/PowerShell

```powershell
# Navigate to your project directory
cd C:\path\to\ade-platform\vscode-extension

# Install extension
code --install-extension ade-0.0.1.vsix

# Reload VSCode
code
```

### Option B: Manual Installation

1. Open VSCode on Windows
2. Press `Ctrl+Shift+X` (Extensions)
3. Click `...` menu → "Install from VSIX..."
4. Navigate to: `C:\path\to\ade-platform\vscode-extension\`
5. Select `ade-0.0.1.vsix`
6. Click Install
7. Reload VSCode

## Step 4: Test the Extension

1. **Open a test folder** in VSCode

2. **Open Command Palette**: `Ctrl+Shift+P`

3. **Type "ADE"** and select `ADE: Scaffold Preview`

4. **Follow the prompts**:
   - Language: `python`, `node`, or `go`
   - Framework: (auto-populated based on language)
   - Service name: `test-api`
   - Domain: `test`

5. **Preview opens** showing your project structure

6. **Click "Generate Project"** to create the actual files

## Common WSL + Windows Issues

### Issue 1: Extension can't find CLI

**Solution**: Update extension settings

1. In VSCode: `Ctrl+,` (Settings)
2. Search: "ADE"
3. Set `ade.coreBinaryPath` to:
   ```
   \\wsl$\Ubuntu\home\username\ade-platform\cli\dist\index.js
   ```

### Issue 2: Permission errors in WSL

**Solution**: Fix permissions
```bash
chmod +x cli/dist/index.js
```

### Issue 3: Path issues between Windows and WSL

**Solution**: Use Windows paths in VSCode settings
```json
{
  "ade.coreBinaryPath": "C:\\tools\\ade-core\\index.js"
}
```

## Quick Rebuild Commands

### After making changes to extension:

```bash
# In WSL
cd /mnt/c/your/path/ade-platform/vscode-extension
pnpm run compile
pnpm run package
```

```powershell
# In Windows PowerShell
cd C:\your\path\ade-platform\vscode-extension
code --uninstall-extension your-org.ade
code --install-extension ade-0.0.1.vsix
```

## One-Line Commands

### WSL Build Everything:
```bash
cd ~/ade-platform && (cd cli && pnpm install && pnpm run build) && (cd vscode-extension && pnpm install && pnpm run package)
```

### Windows Install:
```powershell
code --install-extension C:\path\to\ade-platform\vscode-extension\ade-0.0.1.vsix
```

## Development Mode (For Testing)

### Fastest way to test changes:

1. **In Windows**: Open VSCode
2. **File** → **Open Folder** → Navigate to `C:\path\to\ade-platform\vscode-extension`
3. **Press F5** - This opens a new VSCode window with extension loaded
4. **Test in the new window** - Your extension is active here
5. **Make changes** to code
6. **Press Ctrl+R** in test window to reload

## Verification Checklist

- [ ] Extension appears in Extensions list
- [ ] "ADE: Scaffold Preview" command available
- [ ] CLI path is correctly configured
- [ ] Preview window opens successfully
- [ ] Generate button creates files

## Tips for Windows Users

1. **Use WSL for building** - It's faster and more reliable
2. **Use Windows VSCode** - Better integration with Windows filesystem
3. **Keep paths short** - Avoid deep nesting to prevent path length issues
4. **Use forward slashes** in configs even on Windows
5. **Restart VSCode** after extension installation

## Quick Troubleshooting

```powershell
# Check if extension is installed
code --list-extensions | Select-String "ade"

# Uninstall if needed
code --uninstall-extension your-org.ade

# Check Node/npm version
node --version
npm --version

# Clear VSCode cache (if having issues)
Remove-Item -Recurse -Force "$env:APPDATA\Code\Cache"
Remove-Item -Recurse -Force "$env:APPDATA\Code\CachedData"
```

## Need Help?

- Check main guide: [VSCode Extension Deployment Guide](./vscode-extension-deployment.md)
- Report issues: https://github.com/phdsystems/ade-platform/issues
- Check logs: VSCode → View → Output → "ADE Platform"