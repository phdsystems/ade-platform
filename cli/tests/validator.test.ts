import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateProjectStructure } from '../src/core/validator';
import * as fs from 'fs-extra';
import * as path from 'path';

vi.mock('fs-extra');

describe('validateProjectStructure', () => {
  const mockRegistry = {
    conventions: {
      domainLayout: {
        enforce: true,
        requiredSubdirs: ['src', 'tests', 'docs', 'deploy'],
        forbiddenRootLevel: ['src', 'lib', 'tests', 'test']
      }
    },
    languages: {}
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('valid project structure', () => {
    it('should return valid for correct domain structure', () => {
      const mockFiles = [
        'identity/user-api/src/index.js',
        'identity/user-api/tests/test.js',
        'identity/user-api/docs/README.md',
        'identity/user-api/deploy/Dockerfile',
        'finance/payment-api/src/main.py'
      ];

      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockImplementation((dir: string) => {
        if (dir === '/project') {
          return ['identity', 'finance'];
        }
        if (dir === '/project/identity') {
          return ['user-api'];
        }
        if (dir === '/project/finance') {
          return ['payment-api'];
        }
        return ['src', 'tests', 'docs', 'deploy'];
      });
      (fs.statSync as any).mockReturnValue({ isDirectory: () => true });

      const result = validateProjectStructure('/project', mockRegistry);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow common root-level files', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue([
        'README.md',
        '.gitignore',
        'package.json',
        'identity'
      ]);
      (fs.statSync as any).mockImplementation((path: string) => ({
        isDirectory: () => !path.includes('.')
      }));

      const result = validateProjectStructure('/project', mockRegistry);

      expect(result.errors).not.toContain(expect.objectContaining({
        message: expect.stringContaining('README.md')
      }));
    });
  });

  describe('invalid project structure', () => {
    it('should detect forbidden directories at root level', () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['src', 'tests', 'identity']);
      (fs.statSync as any).mockReturnValue({ isDirectory: () => true });

      const result = validateProjectStructure('/project', mockRegistry);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('forbidden directories')
        })
      );
    });

    it('should detect missing required subdirectories', () => {
      (fs.existsSync as any).mockImplementation((path: string) => {
        return !path.includes('docs');
      });
      (fs.readdirSync as any).mockImplementation((dir: string) => {
        if (dir === '/project') {
          return ['identity'];
        }
        if (dir === '/project/identity') {
          return ['user-api'];
        }
        return ['src', 'tests', 'deploy']; // Missing 'docs'
      });
      (fs.statSync as any).mockReturnValue({ isDirectory: () => true });

      const result = validateProjectStructure('/project', mockRegistry);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('docs')
        })
      );
    });

    it('should handle non-existent project path', () => {
      (fs.existsSync as any).mockReturnValue(false);

      const result = validateProjectStructure('/non-existent', mockRegistry);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('does not exist')
        })
      );
    });
  });

  describe('warning scenarios', () => {
    it('should warn about missing optional directories', () => {
      (fs.existsSync as any).mockImplementation((path: string) => {
        return !path.includes('deploy');
      });
      (fs.readdirSync as any).mockImplementation((dir: string) => {
        if (dir === '/project') {
          return ['identity'];
        }
        if (dir === '/project/identity') {
          return ['user-api'];
        }
        return ['src', 'tests', 'docs'];
      });
      (fs.statSync as any).mockReturnValue({ isDirectory: () => true });

      const result = validateProjectStructure('/project', mockRegistry);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('deploy')
        })
      );
    });
  });

  describe('without enforcement', () => {
    it('should skip validation when enforcement is disabled', () => {
      const noEnforceRegistry = {
        conventions: {
          domainLayout: {
            enforce: false,
            requiredSubdirs: ['src', 'tests'],
            forbiddenRootLevel: ['src']
          }
        },
        languages: {}
      };

      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['src', 'tests']);
      (fs.statSync as any).mockReturnValue({ isDirectory: () => true });

      const result = validateProjectStructure('/project', noEnforceRegistry);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('fix option', () => {
    it('should attempt to create missing directories when fix is true', () => {
      const options = { fix: true };

      (fs.existsSync as any).mockImplementation((path: string) => {
        return !path.includes('docs');
      });
      (fs.readdirSync as any).mockImplementation((dir: string) => {
        if (dir === '/project') {
          return ['identity'];
        }
        if (dir === '/project/identity') {
          return ['user-api'];
        }
        return ['src', 'tests', 'deploy'];
      });
      (fs.statSync as any).mockReturnValue({ isDirectory: () => true });
      (fs.ensureDirSync as any).mockReturnValue(undefined);

      const result = validateProjectStructure('/project', mockRegistry, options);

      expect(fs.ensureDirSync).toHaveBeenCalledWith(
        expect.stringContaining('docs')
      );
    });
  });
});