import path from 'path';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import { ScaffoldOptions, ScaffoldResult } from '../types/index.js';
import { loadTemplate } from './templates.js';

export async function scaffoldService(
  options: ScaffoldOptions,
  registry: any,
  preview: boolean = false
): Promise<ScaffoldResult> {
  const { language, framework, service, domain, output } = options;

  // Get framework config
  const frameworkConfig = registry.languages[language].frameworks[framework];
  const scaffoldConfig = frameworkConfig.scaffold;

  // Calculate paths
  const domainPath = path.join(output, domain);
  const servicePath = path.join(domainPath, service);

  const result: ScaffoldResult = {
    path: servicePath,
    structure: [],
    files: {}
  };

  // Process folders
  for (const folder of scaffoldConfig.folders || []) {
    const folderPath = folder
      .replace(/\{\{serviceName\}\}/g, service)
      .replace(/\{\{domain\}\}/g, domain)
      .replace(/{serviceName}/g, service)
      .replace(/{domain}/g, domain);

    const fullPath = path.join(servicePath, folderPath);
    result.structure.push(path.relative(output, fullPath));

    if (!preview) {
      await fs.ensureDir(fullPath);
    }
  }

  // Process files
  const context = {
    serviceName: service,
    domain: domain,
    ServiceName: capitalize(service),
    Domain: capitalize(domain),
    port: frameworkConfig.deployment?.defaultPort || 8000
  };

  for (const [filePath, content] of Object.entries(scaffoldConfig.files || {})) {
    const processedPath = filePath
      .replace(/\{\{serviceName\}\}/g, service)
      .replace(/\{\{domain\}\}/g, domain)
      .replace(/{serviceName}/g, service)
      .replace(/{domain}/g, domain);

    const fullPath = path.join(servicePath, processedPath);
    result.structure.push(path.relative(output, fullPath));

    let fileContent: string;

    if (typeof content === 'string' && content.startsWith('TEMPLATE_REF::')) {
      // Load from template file
      const templatePath = content.replace('TEMPLATE_REF::', '');
      const templateContent = await loadTemplate(templatePath);
      const template = Handlebars.compile(templateContent);
      fileContent = template(context);
    } else {
      // Use inline content
      const template = Handlebars.compile(content as string);
      fileContent = template(context);
    }

    result.files[processedPath] = fileContent;

    if (!preview) {
      await fs.ensureFile(fullPath);
      await fs.writeFile(fullPath, fileContent);
    }
  }

  // Initialize git if requested
  if (options.git && !preview) {
    const { execSync } = await import('child_process');
    try {
      execSync('git init', { cwd: servicePath, stdio: 'ignore' });

      // Create initial .gitignore if it doesn't exist
      const gitignorePath = path.join(servicePath, '.gitignore');
      if (!await fs.pathExists(gitignorePath)) {
        await fs.writeFile(gitignorePath, getGitignoreContent(language));
      }
    } catch (error) {
      // Git initialization is optional, so we don't throw
      console.warn('Could not initialize git repository');
    }
  }

  return result;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getGitignoreContent(language: string): string {
  const common = `
# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment
.env
.env.*
!.env.example

# Logs
*.log
logs/

# Testing
coverage/
.coverage
*.cover
  `.trim();

  const languageSpecific: Record<string, string> = {
    python: `
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv/
pip-log.txt
.pytest_cache/
*.egg-info/
dist/
build/
    `,
    node: `
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
dist/
build/
*.tsbuildinfo
    `,
    go: `
# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor/
go.sum
    `
  };

  return common + '\n' + (languageSpecific[language] || '').trim();
}