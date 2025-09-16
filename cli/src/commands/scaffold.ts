import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import path from 'path';
import { scaffoldService } from '../core/scaffolder.js';
import { loadRegistry } from '../core/registry.js';
import { ScaffoldOptions } from '../types/index.js';

export const scaffoldCommand = new Command('scaffold')
  .description('Scaffold a new service with the specified language and framework')
  .option('-l, --language <language>', 'Programming language (python, node, go)')
  .option('-f, --framework <framework>', 'Framework to use')
  .option('-s, --service <name>', 'Service name')
  .option('-d, --domain <domain>', 'Domain name for DDD structure')
  .option('-r, --registry <path>', 'Path to stack registry JSON', path.join(process.cwd(), 'cli/config/stack-registry.json'))
  .option('-p, --preview', 'Preview the scaffold without creating files')
  .option('-o, --output <path>', 'Output directory', process.cwd())
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .action(async (options) => {
    const spinner = ora();

    try {
      // Load registry
      const registry = await loadRegistry(options.registry);

      // Collect missing options interactively
      const config = await collectOptions(options, registry);

      // Validate framework exists for language
      const language = registry.languages[config.language];
      if (!language) {
        throw new Error(`Language '${config.language}' not found in registry`);
      }

      const framework = language.frameworks[config.framework];
      if (!framework) {
        throw new Error(`Framework '${config.framework}' not available for ${config.language}`);
      }

      // Show preview or scaffold
      if (config.preview) {
        console.log(chalk.cyan('\n📋 Preview Mode - No files will be created\n'));
        const result = await scaffoldService(config, registry, true);
        console.log(JSON.stringify(result, null, 2));
      } else {
        spinner.start('Scaffolding service...');
        const result = await scaffoldService(config, registry, false);
        spinner.succeed(chalk.green('Service scaffolded successfully!'));

        console.log(chalk.cyan('\n📁 Created structure:'));
        console.log(result.structure.map(f => `  ${chalk.gray('•')} ${f}`).join('\n'));

        if (!options.noInstall && config.language === 'node') {
          console.log(chalk.yellow('\n💡 Run npm install in the service directory to install dependencies'));
        }

        console.log(chalk.green(`\n✅ Service created at: ${result.path}`));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to scaffold service'));
      console.error(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

async function collectOptions(options: any, registry: any): Promise<ScaffoldOptions> {
  const questions = [];

  if (!options.language) {
    questions.push({
      type: 'list',
      name: 'language',
      message: 'Select programming language:',
      choices: Object.keys(registry.languages)
    });
  }

  // Get language first to determine available frameworks
  let language = options.language;
  if (!language && questions.length > 0) {
    const answers = await inquirer.prompt(questions.slice(0, 1));
    language = answers.language;
    questions.shift();
  }

  if (!options.framework && language) {
    const frameworks = Object.keys(registry.languages[language]?.frameworks || {});
    questions.push({
      type: 'list',
      name: 'framework',
      message: 'Select framework:',
      choices: frameworks
    });
  }

  if (!options.service) {
    questions.push({
      type: 'input',
      name: 'service',
      message: 'Service name:',
      validate: (input: string) => {
        if (!input) return 'Service name is required';
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Service name must start with a letter and contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    });
  }

  if (!options.domain) {
    questions.push({
      type: 'input',
      name: 'domain',
      message: 'Domain name (for DDD structure):',
      validate: (input: string) => {
        if (!input) return 'Domain name is required';
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Domain name must start with a letter and contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    language: options.language || answers.language || language,
    framework: options.framework || answers.framework,
    service: options.service || answers.service,
    domain: options.domain || answers.domain,
    output: options.output,
    preview: options.preview || false,
    git: !options.noGit,
    install: !options.noInstall,
    registry: options.registry
  };
}