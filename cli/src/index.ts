#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { scaffoldCommand } from './commands/scaffold.js';
import { validateCommand } from './commands/validate.js';
import { packageInfo } from './utils/package.js';

const program = new Command();

program
  .name('ade-core')
  .description('ADE Platform - Application Development Environment CLI')
  .version(packageInfo.version)
  .addHelpText('after', `
${chalk.gray('Examples:')}
  $ ade-core scaffold --language python --framework fastapi --service api --domain core
  $ ade-core validate --path ./myproject
  $ ade-core scaffold --preview

${chalk.gray('Documentation:')}
  https://github.com/phdsystems/ade-platform
`);

program.addCommand(scaffoldCommand);
program.addCommand(validateCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}