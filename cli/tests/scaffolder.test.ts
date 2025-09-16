import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scaffoldService } from '../src/core/scaffolder';
import { loadRegistry } from '../src/core/registry';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as handlebars from 'handlebars';

// Mock fs-extra
vi.mock('fs-extra');

describe('scaffoldService', () => {
  const mockRegistry = {
    conventions: {
      domainLayout: {
        enforce: true,
        requiredSubdirs: ['src', 'tests', 'docs', 'deploy'],
        forbiddenRootLevel: ['src', 'lib', 'tests', 'test']
      }
    },
    languages: {
      python: {
        frameworks: {
          fastapi: {
            deployment: { defaultPort: 8000 },
            scaffold: {
              folders: ['src/app', 'tests', 'docs', 'deploy'],
              files: {
                'src/app/main.py': 'INLINE::from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef read_root():\n    return {"Hello": "{{ServiceName}}"}'
              }
            }
          }
        }
      },
      node: {
        frameworks: {
          express: {
            deployment: { defaultPort: 3000 },
            scaffold: {
              folders: ['src', 'tests', 'docs', 'deploy'],
              files: {
                'package.json': 'INLINE::{\n  "name": "{{serviceName}}",\n  "version": "1.0.0"\n}'
              }
            }
          }
        }
      }
    }
  };

  const mockOptions = {
    language: 'python',
    framework: 'fastapi',
    service: 'test-api',
    domain: 'test-domain',
    output: '/tmp/test-output',
    preview: false,
    git: false,
    install: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.existsSync as any).mockReturnValue(false);
    (fs.ensureDirSync as any).mockReturnValue(undefined);
    (fs.writeFileSync as any).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('preview mode', () => {
    it('should return preview data without creating files', async () => {
      const options = { ...mockOptions, preview: true };

      const result = await scaffoldService(options, mockRegistry, true);

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('structure');
      expect(result).toHaveProperty('files');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });

    it('should include all required folders in structure', async () => {
      const options = { ...mockOptions, preview: true };

      const result = await scaffoldService(options, mockRegistry, true);

      expect(result.structure).toContain('test-domain/test-api/src/app');
      expect(result.structure).toContain('test-domain/test-api/tests');
      expect(result.structure).toContain('test-domain/test-api/docs');
      expect(result.structure).toContain('test-domain/test-api/deploy');
    });

    it('should process template variables correctly', async () => {
      const options = { ...mockOptions, preview: true };

      const result = await scaffoldService(options, mockRegistry, true);

      const mainPy = result.files['src/app/main.py'];
      expect(mainPy).toContain('"Hello": "Test-api"');
      expect(mainPy).not.toContain('{{ServiceName}}');
    });
  });

  describe('scaffold mode', () => {
    it('should create directory structure', async () => {
      const result = await scaffoldService(mockOptions, mockRegistry, false);

      expect(fs.ensureDirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(result.path).toBe(path.join(mockOptions.output, mockOptions.domain, mockOptions.service));
    });

    it('should throw error if service already exists', async () => {
      (fs.existsSync as any).mockReturnValue(true);

      await expect(scaffoldService(mockOptions, mockRegistry, false))
        .rejects.toThrow('already exists');
    });

    it('should create all required subdirectories', async () => {
      await scaffoldService(mockOptions, mockRegistry, false);

      const ensureDirCalls = (fs.ensureDirSync as any).mock.calls;
      const createdDirs = ensureDirCalls.map((call: any[]) => call[0]);

      expect(createdDirs).toContainEqual(expect.stringContaining('src/app'));
      expect(createdDirs).toContainEqual(expect.stringContaining('tests'));
      expect(createdDirs).toContainEqual(expect.stringContaining('docs'));
      expect(createdDirs).toContainEqual(expect.stringContaining('deploy'));
    });
  });

  describe('template processing', () => {
    it('should replace serviceName variable', async () => {
      const options = { ...mockOptions, service: 'my-service', preview: true };

      const result = await scaffoldService(options, mockRegistry, true);

      const packageJson = result.files['package.json'];
      expect(packageJson).toContain('"name": "my-service"');
    });

    it('should capitalize ServiceName variable', async () => {
      const options = { ...mockOptions, service: 'my-service', preview: true };

      const result = await scaffoldService(options, mockRegistry, true);

      const mainPy = result.files['src/app/main.py'];
      expect(mainPy).toContain('"Hello": "My-service"');
    });

    it('should handle domain variable', async () => {
      const options = { ...mockOptions, domain: 'my-domain', preview: true };

      const result = await scaffoldService(options, mockRegistry, true);

      expect(result.path).toContain('my-domain');
    });
  });

  describe('language and framework validation', () => {
    it('should throw error for unknown language', async () => {
      const options = { ...mockOptions, language: 'unknown' };

      await expect(scaffoldService(options, mockRegistry, false))
        .rejects.toThrow();
    });

    it('should throw error for unknown framework', async () => {
      const options = { ...mockOptions, framework: 'unknown' };

      await expect(scaffoldService(options, mockRegistry, false))
        .rejects.toThrow();
    });
  });

  describe('node framework', () => {
    it('should scaffold express project correctly', async () => {
      const options = {
        ...mockOptions,
        language: 'node',
        framework: 'express',
        preview: true
      };

      const result = await scaffoldService(options, mockRegistry, true);

      expect(result.files).toHaveProperty('package.json');
      expect(result.files['package.json']).toContain('"name": "test-api"');
    });
  });
});