import * as vscode from 'vscode';

export interface PreviewData {
  path: string;
  structure: string[];
  files: Record<string, string>;
}

export class PreviewPanel {
  private static currentPanel: PreviewPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;

    // Listen for when the panel is disposed
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'copy':
            vscode.env.clipboard.writeText(message.text);
            vscode.window.showInformationMessage('Copied to clipboard!');
            break;
          case 'generate':
            vscode.commands.executeCommand('ade.scaffoldGenerate', message.data);
            break;
        }
      },
      null,
      this.disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri, domain: string, service: string, data: PreviewData) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel.panel.reveal(column);
      PreviewPanel.currentPanel.update(domain, service, data);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      'adePreview',
      `Preview: ${domain}/${service}`,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    PreviewPanel.currentPanel.update(domain, service, data);
  }

  public update(domain: string, service: string, data: PreviewData) {
    this.panel.title = `Preview: ${domain}/${service}`;
    this.panel.webview.html = this.getHtmlContent(domain, service, data);
  }

  private getHtmlContent(domain: string, service: string, data: PreviewData): string {
    const fileTree = this.buildFileTree(data.structure);
    const fileContents = this.renderFileContents(data.files);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ADE Preview</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: var(--vscode-editor-background, #1e1e1e);
          color: var(--vscode-editor-foreground, #d4d4d4);
          padding: 20px;
          line-height: 1.6;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          background: var(--vscode-titleBar-activeBackground, #2d2d30);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h1 {
          font-size: 24px;
          color: var(--vscode-titleBar-activeForeground, #cccccc);
        }

        .header .metadata {
          display: flex;
          gap: 15px;
          font-size: 14px;
          color: var(--vscode-descriptionForeground, #aaa);
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn {
          background: var(--vscode-button-background, #0e639c);
          color: var(--vscode-button-foreground, white);
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: opacity 0.2s;
        }

        .btn:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: var(--vscode-button-secondaryBackground, #3a3d41);
          color: var(--vscode-button-secondaryForeground, #cccccc);
        }

        .content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          min-height: 500px;
        }

        .sidebar {
          background: var(--vscode-sideBar-background, #252526);
          border-radius: 8px;
          padding: 15px;
          overflow-y: auto;
          max-height: 70vh;
        }

        .sidebar h2 {
          font-size: 14px;
          text-transform: uppercase;
          color: var(--vscode-sideBarTitle-foreground, #bbbbbb);
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .file-tree {
          font-family: 'Cascadia Code', 'Courier New', monospace;
          font-size: 13px;
        }

        .tree-item {
          padding: 2px 0;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .tree-item:hover {
          background: var(--vscode-list-hoverBackground, #2a2d2e);
        }

        .tree-item.folder::before {
          content: '📁';
        }

        .tree-item.file::before {
          content: '📄';
        }

        .tree-item.python::before { content: '🐍'; }
        .tree-item.javascript::before { content: '📜'; }
        .tree-item.typescript::before { content: '📘'; }
        .tree-item.go::before { content: '🔵'; }
        .tree-item.json::before { content: '📊'; }
        .tree-item.docker::before { content: '🐋'; }
        .tree-item.markdown::before { content: '📝'; }

        .main {
          background: var(--vscode-editor-background, #1e1e1e);
          border-radius: 8px;
          overflow: hidden;
        }

        .tabs {
          background: var(--vscode-editorGroupHeader-tabsBackground, #2d2d30);
          display: flex;
          border-bottom: 1px solid var(--vscode-editorGroupHeader-tabsBorder, #252526);
          overflow-x: auto;
        }

        .tab {
          padding: 10px 20px;
          cursor: pointer;
          border-right: 1px solid var(--vscode-editorGroupHeader-tabsBorder, #252526);
          font-size: 13px;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .tab:hover {
          background: var(--vscode-tab-hoverBackground, #2a2a2a);
        }

        .tab.active {
          background: var(--vscode-tab-activeBackground, #1e1e1e);
          color: var(--vscode-tab-activeForeground, white);
        }

        .tab-content {
          padding: 20px;
          overflow-y: auto;
          max-height: 60vh;
        }

        .code-block {
          background: var(--vscode-textCodeBlock-background, #0a0a0a);
          border: 1px solid var(--vscode-widget-border, #464647);
          border-radius: 4px;
          padding: 15px;
          overflow-x: auto;
          position: relative;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--vscode-widget-border, #464647);
        }

        .code-title {
          font-weight: 600;
          color: var(--vscode-textLink-foreground, #3794ff);
        }

        .copy-btn {
          background: transparent;
          border: 1px solid var(--vscode-button-border, #464647);
          color: var(--vscode-button-foreground, #cccccc);
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }

        .copy-btn:hover {
          background: var(--vscode-button-hoverBackground, #2a2a2a);
        }

        pre {
          margin: 0;
          font-family: 'Cascadia Code', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          color: var(--vscode-editor-foreground, #d4d4d4);
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--vscode-descriptionForeground, #aaa);
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          background: var(--vscode-badge-background, #007acc);
          color: var(--vscode-badge-foreground, white);
        }

        @media (max-width: 768px) {
          .content {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>🚀 ${service}</h1>
            <div style="margin-top: 5px; color: var(--vscode-descriptionForeground, #aaa);">
              Domain: <strong>${domain}</strong> | Path: <code>${data.path}</code>
            </div>
          </div>
          <div class="metadata">
            <span class="status">Preview Mode</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn" onclick="generateProject()">✨ Generate Project</button>
          <button class="btn btn-secondary" onclick="copyStructure()">📋 Copy Structure</button>
        </div>

        <div class="content">
          <div class="sidebar">
            <h2>Project Structure</h2>
            <div class="file-tree">
              ${fileTree}
            </div>
          </div>

          <div class="main">
            <div class="tabs" id="tabs">
              ${Object.keys(data.files).map((file, index) =>
                `<div class="tab ${index === 0 ? 'active' : ''}" onclick="showTab('${file}', this)">${file.split('/').pop()}</div>`
              ).join('')}
            </div>
            <div class="tab-content" id="tab-content">
              ${fileContents}
            </div>
          </div>
        </div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        const files = ${JSON.stringify(data.files)};

        function showTab(fileName, tabElement) {
          // Update active tab
          document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
          tabElement.classList.add('active');

          // Show corresponding content
          document.querySelectorAll('.file-content').forEach(content => {
            content.style.display = 'none';
          });
          const content = document.getElementById('file-' + fileName.replace(/[^a-zA-Z0-9]/g, '_'));
          if (content) {
            content.style.display = 'block';
          }
        }

        function copyCode(fileName) {
          const code = files[fileName];
          vscode.postMessage({ command: 'copy', text: code });
        }

        function copyStructure() {
          const structure = ${JSON.stringify(data.structure.join('\\n'))};
          vscode.postMessage({ command: 'copy', text: structure });
        }

        function generateProject() {
          if (confirm('Generate this project structure?')) {
            vscode.postMessage({
              command: 'generate',
              data: ${JSON.stringify({ domain, service, path: data.path })}
            });
          }
        }

        // Initialize first tab
        const firstContent = document.querySelector('.file-content');
        if (firstContent) {
          firstContent.style.display = 'block';
        }
      </script>
    </body>
    </html>`;
  }

  private buildFileTree(structure: string[]): string {
    const tree: string[] = [];
    const processedPaths = new Set<string>();

    structure.forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!processedPaths.has(currentPath)) {
          processedPaths.add(currentPath);
          const indent = '  '.repeat(index);
          const isFile = index === parts.length - 1 && part.includes('.');
          const fileClass = this.getFileClass(part);

          tree.push(`<div class="tree-item ${isFile ? `file ${fileClass}` : 'folder'}" style="padding-left: ${index * 20}px">
            ${part}
          </div>`);
        }
      });
    });

    return tree.join('\n');
  }

  private getFileClass(fileName: string): string {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) return 'javascript';
    if (fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.go')) return 'go';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.toLowerCase().includes('dockerfile')) return 'docker';
    if (fileName.endsWith('.md')) return 'markdown';
    return '';
  }

  private renderFileContents(files: Record<string, string>): string {
    return Object.entries(files).map(([fileName, content]) => {
      const fileId = 'file-' + fileName.replace(/[^a-zA-Z0-9]/g, '_');
      const language = this.getLanguage(fileName);

      return `
        <div id="${fileId}" class="file-content" style="display: none;">
          <div class="code-block">
            <div class="code-header">
              <span class="code-title">${fileName}</span>
              <button class="copy-btn" onclick="copyCode('${fileName}')">Copy</button>
            </div>
            <pre><code class="language-${language}">${this.escapeHtml(content)}</code></pre>
          </div>
        </div>
      `;
    }).join('\n');
  }

  private getLanguage(fileName: string): string {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) return 'javascript';
    if (fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.go')) return 'go';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    if (fileName.toLowerCase().includes('dockerfile')) return 'dockerfile';
    return 'plaintext';
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  public dispose() {
    PreviewPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}