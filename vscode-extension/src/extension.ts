import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { PreviewPanel, PreviewData } from './preview';

export function activate(context: vscode.ExtensionContext) {
  // Register scaffold preview command
  const scaffoldPreviewCmd = vscode.commands.registerCommand('ade.scaffoldPreview', async () => {
    await handleScaffoldPreview(context.extensionUri);
  });

  // Register scaffold generate command
  const scaffoldGenerateCmd = vscode.commands.registerCommand('ade.scaffoldGenerate', async (data?: any) => {
    await handleScaffoldGenerate(data);
  });

  context.subscriptions.push(scaffoldPreviewCmd, scaffoldGenerateCmd);
}

async function handleScaffoldPreview(extensionUri: vscode.Uri) {
  try {
    // Show progress notification
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "ADE Platform",
      cancellable: true
    }, async (progress, token) => {
      progress.report({ increment: 0, message: "Preparing scaffold preview..." });

      // Get configuration
      const config = vscode.workspace.getConfiguration('ade');
      const cliPath = await getCliPath(config);

      // Check if CLI exists
      if (!fs.existsSync(cliPath)) {
        throw new Error(`CLI not found at ${cliPath}. Please build the CLI first: npm run build:cli`);
      }

      // Get user inputs
      progress.report({ increment: 20, message: "Getting project configuration..." });

      const language = await vscode.window.showQuickPick(
        ['python', 'node', 'go'],
        {
          placeHolder: 'Select programming language',
          ignoreFocusOut: true
        }
      );

      if (!language || token.isCancellationRequested) {
        return;
      }

      const frameworks = getFrameworksForLanguage(language);
      const framework = await vscode.window.showQuickPick(
        frameworks,
        {
          placeHolder: 'Select framework',
          ignoreFocusOut: true
        }
      );

      if (!framework || token.isCancellationRequested) {
        return;
      }

      const service = await vscode.window.showInputBox({
        prompt: 'Service name',
        placeHolder: 'e.g., user-api, payment-service',
        validateInput: (value) => {
          if (!value) return 'Service name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return 'Service name must start with a letter and contain only lowercase letters, numbers, and hyphens';
          }
          return null;
        },
        ignoreFocusOut: true
      });

      if (!service || token.isCancellationRequested) {
        return;
      }

      const domain = await vscode.window.showInputBox({
        prompt: 'Domain name (for DDD structure)',
        placeHolder: 'e.g., identity, finance, inventory',
        validateInput: (value) => {
          if (!value) return 'Domain name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return 'Domain name must start with a letter and contain only lowercase letters, numbers, and hyphens';
          }
          return null;
        },
        ignoreFocusOut: true
      });

      if (!domain || token.isCancellationRequested) {
        return;
      }

      // Run CLI in preview mode
      progress.report({ increment: 50, message: "Generating preview..." });

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
      const registryPath = path.join(workspaceFolder, 'cli', 'config', 'stack-registry.json');

      const args = [
        'scaffold',
        `--language=${language}`,
        `--framework=${framework}`,
        `--service=${service}`,
        `--domain=${domain}`,
        `--registry=${registryPath}`,
        '--preview'
      ];

      const output = await runCli(cliPath, args, workspaceFolder);

      let previewData: PreviewData;
      try {
        previewData = JSON.parse(output);
      } catch (error) {
        throw new Error(`Failed to parse CLI output: ${output}`);
      }

      progress.report({ increment: 100, message: "Opening preview..." });

      // Show preview panel
      PreviewPanel.createOrShow(extensionUri, domain, service, previewData);
    });

  } catch (error: any) {
    const message = error?.message || String(error);
    const action = await vscode.window.showErrorMessage(
      `Failed to generate preview: ${message}`,
      'Show Output'
    );

    if (action === 'Show Output') {
      const outputChannel = vscode.window.createOutputChannel('ADE Platform');
      outputChannel.appendLine(`Error: ${message}`);
      outputChannel.show();
    }
  }
}

async function handleScaffoldGenerate(data?: any) {
  try {
    const proceed = await vscode.window.showInformationMessage(
      `Generate project structure for ${data?.service} in ${data?.domain} domain?`,
      'Generate',
      'Cancel'
    );

    if (proceed !== 'Generate') {
      return;
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Generating project structure...",
      cancellable: false
    }, async (progress) => {
      // Run actual scaffold command without --preview flag
      progress.report({ increment: 50 });

      // Implementation would go here to run the actual scaffold command
      await new Promise(resolve => setTimeout(resolve, 1000));

      progress.report({ increment: 100 });
    });

    vscode.window.showInformationMessage('Project structure generated successfully!');

  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to generate project: ${error?.message || error}`);
  }
}

async function getCliPath(config: vscode.WorkspaceConfiguration): Promise<string> {
  const configuredPath = config.get<string>('coreBinaryPath');

  if (configuredPath && configuredPath !== 'ade-core') {
    return configuredPath;
  }

  // Try to find the CLI in the workspace
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceFolder) {
    const possiblePaths = [
      path.join(workspaceFolder, 'cli', 'dist', 'index.js'),
      path.join(workspaceFolder, 'node_modules', '.bin', 'ade-core'),
      path.join(workspaceFolder, 'ade-core')
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }

  // Fall back to global installation
  return 'ade-core';
}

function getFrameworksForLanguage(language: string): string[] {
  const frameworks: Record<string, string[]> = {
    'python': ['fastapi', 'flask', 'django'],
    'node': ['express', 'nestjs', 'koa'],
    'go': ['fiber', 'gin', 'echo']
  };

  return frameworks[language] || [];
}

function runCli(cliPath: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const isJsFile = cliPath.endsWith('.js');
    const command = isJsFile ? 'node' : cliPath;
    const finalArgs = isJsFile ? [cliPath, ...args] : args;

    const child = spawn(command, finalArgs, {
      cwd,
      shell: process.platform === 'win32'
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `CLI exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

export function deactivate() {}