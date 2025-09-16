# VSCode Extension Development Guide

This guide covers development and testing of the ADE Platform VSCode extension.

## Prerequisites

- Node.js 20+
- VSCode 1.90.0+
- TypeScript 5.4.0+
- Git

## Setup

### 1. Install Dependencies

```bash
cd vscode-extension
npm install
```

### 2. Build the Extension

```bash
npm run compile
```

Or watch for changes:
```bash
npm run watch
```

## Testing the Extension

### Method 1: Launch from VSCode (Recommended)

1. Open the extension directory in VSCode:
   ```bash
   cd vscode-extension
   code .
   ```

2. Press **F5** to launch Extension Development Host
   - A new VSCode window will open with "[Extension Development Host]" in the title
   - The extension is automatically loaded in this window

3. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)

4. Type "ADE" to see available commands:
   - `ADE: Scaffold Preview` - Interactive project scaffolding with preview
   - `ADE: Generate Project` - Generate project from preview

### Method 2: Package and Install

1. Package the extension:
   ```bash
   npm run package
   ```
   This creates `ade-*.vsix` file

2. Install in VSCode:
   ```bash
   code --install-extension ade-*.vsix
   ```

3. Reload VSCode window

## Testing Workflow

### Basic Functionality Test

1. **Launch Extension Host** (F5)

2. **Test Scaffold Preview Command**:
   - Open Command Palette
   - Run "ADE: Scaffold Preview"
   - Select language: `python`, `node`, or `go`
   - Select framework based on language
   - Enter service name (e.g., `user-api`)
   - Enter domain name (e.g., `identity`)

3. **Verify Preview Features**:
   - ✅ Progress notification appears
   - ✅ Rich HTML preview opens
   - ✅ File tree shows project structure
   - ✅ Tabs display different files
   - ✅ Code has syntax highlighting
   - ✅ Copy buttons work
   - ✅ Generate Project button is visible

### Error Handling Test

1. **Test Cancellation**:
   - Start scaffold preview
   - Press ESC during input
   - Verify graceful exit

2. **Test Invalid Input**:
   - Enter invalid service name (e.g., `123-invalid`)
   - Verify validation message appears

3. **Test Missing CLI**:
   - Temporarily rename CLI directory
   - Run scaffold preview
   - Verify error message with instructions

### Advanced Testing

1. **Test Different Languages**:
   ```
   Python + FastAPI
   Node.js + Express
   Go + Fiber
   ```

2. **Test Configuration**:
   - Open Settings (`Ctrl+,`)
   - Search for "ADE"
   - Modify `ade.coreBinaryPath`
   - Verify custom path is used

3. **Test Output Channel**:
   - View → Output
   - Select "ADE Platform" from dropdown
   - Verify logs appear during operations

## Debugging

### Enable Developer Tools

1. In Extension Host window: `Help → Toggle Developer Tools`
2. Check Console tab for errors
3. Check Network tab for failed requests

### Common Issues

| Issue | Solution |
|-------|----------|
| CLI not found | Ensure CLI is built: `cd cli && npm run build` |
| Extension not loading | Check `vscode-extension/out/` directory exists |
| Preview blank | Check Developer Console for JavaScript errors |
| Commands not appearing | Verify `package.json` activation events |

### Debug Configuration

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [{
    "name": "Extension",
    "type": "extensionHost",
    "request": "launch",
    "runtimeExecutable": "${execPath}",
    "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
    "outFiles": ["${workspaceFolder}/out/**/*.js"],
    "preLaunchTask": "npm: compile"
  }]
}
```

## Extension Architecture

### File Structure

```
vscode-extension/
├── src/
│   ├── extension.ts      # Main extension entry
│   └── preview.ts         # Preview panel implementation
├── out/                   # Compiled JavaScript (generated)
├── package.json          # Extension manifest
└── tsconfig.json         # TypeScript configuration
```

### Key Components

1. **extension.ts**
   - Activation function
   - Command registration
   - CLI integration
   - Error handling

2. **preview.ts**
   - Webview panel management
   - HTML generation
   - File tree rendering
   - Message passing

### Extension Manifest

Key sections in `package.json`:

```json
{
  "activationEvents": [
    "onCommand:ade.scaffoldPreview",
    "onCommand:ade.scaffoldGenerate"
  ],
  "contributes": {
    "commands": [...],
    "configuration": {
      "properties": {
        "ade.coreBinaryPath": {
          "type": "string",
          "default": "ade-core",
          "description": "Path to ade-core binary"
        }
      }
    }
  }
}
```

## Development Tips

### Hot Reload

1. Keep `npm run watch` running
2. Press `Ctrl+R` in Extension Host to reload
3. Changes apply without restarting

### Logging

```typescript
// Use output channel for logging
const outputChannel = vscode.window.createOutputChannel('ADE Platform');
outputChannel.appendLine(`Debug: ${message}`);
outputChannel.show();
```

### Testing Preview Content

```typescript
// Test data for preview without CLI
const mockData: PreviewData = {
  path: '/test/project',
  structure: ['src/app.py', 'tests/test_app.py'],
  files: {
    'src/app.py': 'print("Hello")',
    'tests/test_app.py': 'def test(): pass'
  }
};
```

## Publishing

### Prepare for Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Test thoroughly
4. Build production package:
   ```bash
   npm run package
   ```

### Publish to Marketplace

```bash
# Install vsce globally
npm install -g @vscode/vsce

# Login to publisher account
vsce login <publisher-name>

# Publish
vsce publish
```

### Local Distribution

Share the `.vsix` file directly:
```bash
# Package
npm run package

# Install locally
code --install-extension ade-*.vsix
```

## Troubleshooting

### Extension Not Activating

1. Check activation events in `package.json`
2. Verify commands are registered
3. Check for errors in Extension Host output

### CLI Integration Issues

1. Verify CLI is built and accessible
2. Check path resolution in `getCliPath()`
3. Test CLI manually: `node cli/dist/index.js --help`

### Preview Not Rendering

1. Check webview CSP settings
2. Verify HTML generation
3. Inspect webview Developer Tools
4. Check for JavaScript errors

## Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Webview API](https://code.visualstudio.com/api/extension-guides/webview)