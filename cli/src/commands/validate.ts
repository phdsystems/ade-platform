import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { loadRegistry } from '../core/registry.js';

export const validateCommand = new Command('validate')
  .description('Validate project structure against ADE conventions')
  .option('-p, --path <path>', 'Path to validate', process.cwd())
  .option('-r, --registry <path>', 'Path to stack registry JSON')
  .option('--fix', 'Attempt to fix issues automatically')
  .action(async (options) => {
    const spinner = ora('Validating project structure...').start();

    try {
      const registryPath = options.registry || path.join(process.cwd(), 'cli/config/stack-registry.json');
      const registry = await loadRegistry(registryPath);

      const validationResults = await validateStructure(options.path, registry);

      spinner.stop();

      if (validationResults.valid) {
        console.log(chalk.green('✅ Project structure is valid!'));
      } else {
        console.log(chalk.red('❌ Validation failed:'));
        validationResults.errors.forEach(error => {
          console.log(chalk.red(`  • ${error}`));
        });

        if (options.fix) {
          console.log(chalk.yellow('\n🔧 Attempting to fix issues...'));
          await fixIssues(options.path, validationResults.errors, registry);
          console.log(chalk.green('✅ Issues fixed where possible'));
        }
      }

      if (validationResults.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        validationResults.warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
      }
    } catch (error) {
      spinner.fail(chalk.red('Validation failed'));
      console.error(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateStructure(projectPath: string, registry: any): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if path exists
  if (!await fs.pathExists(projectPath)) {
    errors.push(`Path does not exist: ${projectPath}`);
    return { valid: false, errors, warnings };
  }

  const conventions = registry.conventions;

  if (conventions.domainLayout.enforce) {
    // Check for domain directories
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    const directories = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

    // Check for forbidden directories at root
    const forbidden = conventions.domainLayout.denyAtRoot || [];
    const foundForbidden = directories.filter(d => forbidden.includes(d.name));

    if (foundForbidden.length > 0) {
      errors.push(`Found forbidden directories at root level: ${foundForbidden.map(d => d.name).join(', ')}`);
      warnings.push('Consider moving these into domain-specific directories');
    }

    // Check domain directories for required subdirectories
    const requiredSubdirs = conventions.domainLayout.requiredSubdirs || [];

    for (const dir of directories) {
      if (forbidden.includes(dir.name)) continue;

      const domainPath = path.join(projectPath, dir.name);
      const domainContents = await fs.readdir(domainPath, { withFileTypes: true });
      const serviceDirectories = domainContents.filter(e => e.isDirectory() && !e.name.startsWith('.'));

      for (const serviceDir of serviceDirectories) {
        const servicePath = path.join(domainPath, serviceDir.name);

        for (const required of requiredSubdirs) {
          const requiredPath = path.join(servicePath, required);
          if (!await fs.pathExists(requiredPath)) {
            warnings.push(`Missing required directory: ${path.relative(projectPath, requiredPath)}`);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

async function fixIssues(projectPath: string, errors: string[], _registry: any): Promise<void> {
  // Create missing required directories
  for (const error of errors) {
    if (error.includes('Missing required directory:')) {
      const match = error.match(/Missing required directory: (.+)/);
      if (match) {
        const dirPath = path.join(projectPath, match[1]);
        await fs.ensureDir(dirPath);
        console.log(chalk.green(`  ✅ Created: ${match[1]}`));
      }
    }
  }
}