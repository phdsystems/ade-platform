import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadRegistry, validateRegistry } from '../src/core/registry';
import * as fs from 'fs-extra';
import * as path from 'path';

vi.mock('fs-extra');

describe('Registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadRegistry', () => {
    it('should load registry from valid JSON file', async () => {
      const mockRegistry = {
        conventions: {
          domainLayout: {
            enforce: true,
            requiredSubdirs: ['src', 'tests']
          }
        },
        languages: {
          python: {
            frameworks: {
              fastapi: {
                deployment: { defaultPort: 8000 }
              }
            }
          }
        }
      };

      (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockRegistry));
      (fs.existsSync as any).mockReturnValue(true);

      const result = await loadRegistry('/path/to/registry.json');

      expect(result).toEqual(mockRegistry);
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/registry.json', 'utf-8');
    });

    it('should throw error if registry file does not exist', async () => {
      (fs.existsSync as any).mockReturnValue(false);

      await expect(loadRegistry('/path/to/missing.json'))
        .rejects.toThrow('Registry file not found');
    });

    it('should throw error for invalid JSON', async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('invalid json {');

      await expect(loadRegistry('/path/to/invalid.json'))
        .rejects.toThrow();
    });

    it('should resolve relative paths', async () => {
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('{}');

      await loadRegistry('./config/registry.json');

      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('config/registry.json'),
        'utf-8'
      );
    });
  });

  describe('validateRegistry', () => {
    it('should validate correct registry structure', () => {
      const validRegistry = {
        conventions: {
          domainLayout: {
            enforce: true,
            requiredSubdirs: ['src', 'tests'],
            forbiddenRootLevel: ['src']
          }
        },
        languages: {
          python: {
            frameworks: {
              fastapi: {
                deployment: { defaultPort: 8000 },
                scaffold: {
                  folders: ['src'],
                  files: {}
                }
              }
            }
          }
        }
      };

      expect(() => validateRegistry(validRegistry)).not.toThrow();
    });

    it('should throw error for missing conventions', () => {
      const invalidRegistry = {
        languages: {
          python: {
            frameworks: {}
          }
        }
      };

      expect(() => validateRegistry(invalidRegistry)).toThrow();
    });

    it('should throw error for missing languages', () => {
      const invalidRegistry = {
        conventions: {
          domainLayout: {
            enforce: true,
            requiredSubdirs: []
          }
        }
      };

      expect(() => validateRegistry(invalidRegistry)).toThrow();
    });

    it('should throw error for invalid language structure', () => {
      const invalidRegistry = {
        conventions: {
          domainLayout: {
            enforce: true,
            requiredSubdirs: []
          }
        },
        languages: {
          python: {
            // Missing frameworks
          }
        }
      };

      expect(() => validateRegistry(invalidRegistry as any)).toThrow();
    });

    it('should throw error for invalid port number', () => {
      const invalidRegistry = {
        conventions: {
          domainLayout: {
            enforce: true,
            requiredSubdirs: []
          }
        },
        languages: {
          python: {
            frameworks: {
              fastapi: {
                deployment: { defaultPort: 'invalid' },
                scaffold: {
                  folders: [],
                  files: {}
                }
              }
            }
          }
        }
      };

      expect(() => validateRegistry(invalidRegistry as any)).toThrow();
    });
  });
});