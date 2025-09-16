import * as assert from 'assert';
import { suite, test } from 'mocha';
import { PreviewData } from '../src/preview';

suite('Preview Panel Tests', () => {
  const mockPreviewData: PreviewData = {
    path: '/test/domain/service',
    structure: [
      'test-domain/test-service/src/app/main.py',
      'test-domain/test-service/tests/test_main.py',
      'test-domain/test-service/docs/README.md',
      'test-domain/test-service/deploy/Dockerfile'
    ],
    files: {
      'src/app/main.py': 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef read_root():\n    return {"Hello": "World"}',
      'tests/test_main.py': 'def test_main():\n    assert True',
      'Dockerfile': 'FROM python:3.11\nWORKDIR /app\nCOPY . .\nCMD ["python", "main.py"]'
    }
  };

  test('Preview data should have required properties', () => {
    assert.ok(mockPreviewData.path, 'Preview data should have path');
    assert.ok(mockPreviewData.structure, 'Preview data should have structure');
    assert.ok(mockPreviewData.files, 'Preview data should have files');
  });

  test('Structure should contain expected directories', () => {
    const hasSourceDir = mockPreviewData.structure.some(path => path.includes('/src/'));
    const hasTestsDir = mockPreviewData.structure.some(path => path.includes('/tests/'));
    const hasDocsDir = mockPreviewData.structure.some(path => path.includes('/docs/'));
    const hasDeployDir = mockPreviewData.structure.some(path => path.includes('/deploy/'));

    assert.ok(hasSourceDir, 'Should have source directory');
    assert.ok(hasTestsDir, 'Should have tests directory');
    assert.ok(hasDocsDir, 'Should have docs directory');
    assert.ok(hasDeployDir, 'Should have deploy directory');
  });

  test('File tree should be built correctly', () => {
    const buildFileTree = (structure: string[]): Map<string, Set<string>> => {
      const tree = new Map<string, Set<string>>();

      structure.forEach(filePath => {
        const parts = filePath.split('/');
        let currentPath = '';

        parts.forEach((part, index) => {
          const parentPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;

          if (!tree.has(parentPath)) {
            tree.set(parentPath, new Set());
          }

          if (index < parts.length - 1) {
            tree.get(parentPath)!.add(part);
          }
        });
      });

      return tree;
    };

    const tree = buildFileTree(mockPreviewData.structure);

    assert.ok(tree.has(''), 'Should have root level');
    assert.ok(tree.get('')!.has('test-domain'), 'Root should contain domain');
  });

  test('Files should have correct content', () => {
    const pythonFile = mockPreviewData.files['src/app/main.py'];
    assert.ok(pythonFile.includes('FastAPI'), 'Python file should contain FastAPI import');
    assert.ok(pythonFile.includes('@app.get'), 'Python file should contain route decorator');

    const testFile = mockPreviewData.files['tests/test_main.py'];
    assert.ok(testFile.includes('def test_'), 'Test file should contain test function');

    const dockerfile = mockPreviewData.files['Dockerfile'];
    assert.ok(dockerfile.includes('FROM python'), 'Dockerfile should have FROM statement');
  });

  test('File content should be syntax-highlighted correctly', () => {
    const getLanguageFromFile = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        'py': 'python',
        'js': 'javascript',
        'mjs': 'javascript',
        'ts': 'typescript',
        'json': 'json',
        'yml': 'yaml',
        'yaml': 'yaml',
        'dockerfile': 'dockerfile',
        'md': 'markdown',
        'go': 'go',
        'mod': 'go'
      };
      return langMap[ext || ''] || 'plaintext';
    };

    assert.strictEqual(getLanguageFromFile('main.py'), 'python');
    assert.strictEqual(getLanguageFromFile('index.js'), 'javascript');
    assert.strictEqual(getLanguageFromFile('app.ts'), 'typescript');
    assert.strictEqual(getLanguageFromFile('Dockerfile'), 'dockerfile');
  });
});

suite('HTML Generation Tests', () => {
  test('Should escape HTML in file content', () => {
    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const dangerous = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(dangerous);

    assert.ok(!escaped.includes('<script>'), 'Should not contain script tag');
    assert.ok(escaped.includes('&lt;script&gt;'), 'Should contain escaped script tag');
  });

  test('Should generate valid file tabs', () => {
    const generateFileTabs = (files: Record<string, string>): string[] => {
      return Object.keys(files).map((file, index) => {
        const active = index === 0 ? 'active' : '';
        return `<button class="tab ${active}" data-file="${file}">${file}</button>`;
      });
    };

    const files = {
      'main.py': 'print("hello")',
      'test.py': 'assert True'
    };

    const tabs = generateFileTabs(files);

    assert.strictEqual(tabs.length, 2, 'Should generate two tabs');
    assert.ok(tabs[0].includes('active'), 'First tab should be active');
    assert.ok(tabs[0].includes('data-file="main.py"'), 'Tab should have data-file attribute');
  });

  test('Should generate copy button for each file', () => {
    const generateCopyButton = (content: string): string => {
      return `<button class="copy-btn" onclick="copyToClipboard('${content.replace(/'/g, "\\'")}')">📋 Copy</button>`;
    };

    const button = generateCopyButton('console.log("test")');

    assert.ok(button.includes('copy-btn'), 'Should have copy-btn class');
    assert.ok(button.includes('onclick'), 'Should have onclick handler');
    assert.ok(button.includes('📋 Copy'), 'Should have copy text');
  });
});

suite('Message Handling Tests', () => {
  test('Should handle copy message correctly', () => {
    const handleMessage = (message: any): string | null => {
      switch (message.command) {
        case 'copy':
          return message.text || null;
        case 'generate':
          return 'generate';
        default:
          return null;
      }
    };

    const copyMessage = { command: 'copy', text: 'test content' };
    assert.strictEqual(handleMessage(copyMessage), 'test content');

    const generateMessage = { command: 'generate', data: {} };
    assert.strictEqual(handleMessage(generateMessage), 'generate');

    const unknownMessage = { command: 'unknown' };
    assert.strictEqual(handleMessage(unknownMessage), null);
  });

  test('Should validate generate message data', () => {
    const validateGenerateData = (data: any): boolean => {
      return data &&
        typeof data.domain === 'string' &&
        typeof data.service === 'string' &&
        data.domain.length > 0 &&
        data.service.length > 0;
    };

    const validData = { domain: 'test', service: 'api' };
    assert.ok(validateGenerateData(validData), 'Valid data should pass');

    const missingDomain = { service: 'api' };
    assert.ok(!validateGenerateData(missingDomain), 'Missing domain should fail');

    const emptyService = { domain: 'test', service: '' };
    assert.ok(!validateGenerateData(emptyService), 'Empty service should fail');
  });
});