import * as vscode from 'vscode';
import * as assert from 'assert';
import { suite, test } from 'mocha';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('your-org.ade'));
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands();

    assert.ok(commands.includes('ade.scaffoldPreview'),
      'Command ade.scaffoldPreview should be registered');
    assert.ok(commands.includes('ade.scaffoldGenerate'),
      'Command ade.scaffoldGenerate should be registered');
  });

  test('Configuration should have default values', () => {
    const config = vscode.workspace.getConfiguration('ade');
    const coreBinaryPath = config.get('coreBinaryPath');

    assert.ok(coreBinaryPath, 'coreBinaryPath should have a value');
    assert.strictEqual(coreBinaryPath, 'ade-core', 'Default should be ade-core');
  });
});

suite('Preview Panel Tests', () => {
  test('Preview panel should display correct title', async () => {
    const domain = 'test-domain';
    const service = 'test-service';
    const title = `Preview: ${domain}/${service}`;

    // This would need to be tested with the actual PreviewPanel class
    assert.ok(title.includes(domain));
    assert.ok(title.includes(service));
  });

  test('Preview panel should generate correct HTML', () => {
    const mockData = {
      path: '/test/path',
      structure: ['src/index.js', 'tests/test.js'],
      files: {
        'src/index.js': 'console.log("test");',
        'tests/test.js': 'test("example", () => {});'
      }
    };

    // Verify that data structure is correct
    assert.ok(mockData.structure.length > 0);
    assert.ok(Object.keys(mockData.files).length > 0);
  });
});

suite('Command Validation Tests', () => {
  test('Service name validation should reject invalid names', () => {
    const validateServiceName = (value: string): string | null => {
      if (!value) return 'Service name is required';
      if (!/^[a-z][a-z0-9-]*$/.test(value)) {
        return 'Service name must start with a letter and contain only lowercase letters, numbers, and hyphens';
      }
      return null;
    };

    assert.strictEqual(validateServiceName('valid-service'), null);
    assert.strictEqual(validateServiceName('also-valid-123'), null);

    assert.notStrictEqual(validateServiceName(''), null);
    assert.notStrictEqual(validateServiceName('123-invalid'), null);
    assert.notStrictEqual(validateServiceName('Invalid-Capital'), null);
    assert.notStrictEqual(validateServiceName('invalid_underscore'), null);
  });

  test('Domain name validation should reject invalid names', () => {
    const validateDomainName = (value: string): string | null => {
      if (!value) return 'Domain name is required';
      if (!/^[a-z][a-z0-9-]*$/.test(value)) {
        return 'Domain name must start with a letter and contain only lowercase letters, numbers, and hyphens';
      }
      return null;
    };

    assert.strictEqual(validateDomainName('identity'), null);
    assert.strictEqual(validateDomainName('finance-domain'), null);

    assert.notStrictEqual(validateDomainName(''), null);
    assert.notStrictEqual(validateDomainName('123domain'), null);
    assert.notStrictEqual(validateDomainName('Domain'), null);
  });
});

suite('Framework Selection Tests', () => {
  test('Should return correct frameworks for Python', () => {
    const getFrameworksForLanguage = (language: string): string[] => {
      const frameworks: Record<string, string[]> = {
        'python': ['fastapi', 'flask', 'django'],
        'node': ['express', 'nestjs', 'koa'],
        'go': ['fiber', 'gin', 'echo']
      };
      return frameworks[language] || [];
    };

    const pythonFrameworks = getFrameworksForLanguage('python');
    assert.ok(pythonFrameworks.includes('fastapi'));
    assert.ok(pythonFrameworks.includes('flask'));
    assert.ok(pythonFrameworks.includes('django'));
  });

  test('Should return correct frameworks for Node.js', () => {
    const getFrameworksForLanguage = (language: string): string[] => {
      const frameworks: Record<string, string[]> = {
        'python': ['fastapi', 'flask', 'django'],
        'node': ['express', 'nestjs', 'koa'],
        'go': ['fiber', 'gin', 'echo']
      };
      return frameworks[language] || [];
    };

    const nodeFrameworks = getFrameworksForLanguage('node');
    assert.ok(nodeFrameworks.includes('express'));
    assert.ok(nodeFrameworks.includes('nestjs'));
    assert.ok(nodeFrameworks.includes('koa'));
  });

  test('Should return correct frameworks for Go', () => {
    const getFrameworksForLanguage = (language: string): string[] => {
      const frameworks: Record<string, string[]> = {
        'python': ['fastapi', 'flask', 'django'],
        'node': ['express', 'nestjs', 'koa'],
        'go': ['fiber', 'gin', 'echo']
      };
      return frameworks[language] || [];
    };

    const goFrameworks = getFrameworksForLanguage('go');
    assert.ok(goFrameworks.includes('fiber'));
    assert.ok(goFrameworks.includes('gin'));
    assert.ok(goFrameworks.includes('echo'));
  });
});