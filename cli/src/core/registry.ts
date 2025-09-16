import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';

// Schema for registry validation
const RegistrySchema = z.object({
  conventions: z.object({
    domainLayout: z.object({
      enforce: z.boolean(),
      basePattern: z.string().optional(),
      requiredSubdirs: z.array(z.string()),
      denyAtRoot: z.array(z.string()).optional()
    })
  }),
  languages: z.record(
    z.object({
      frameworks: z.record(
        z.object({
          deployment: z.object({
            defaultPort: z.number()
          }).optional(),
          scaffold: z.object({
            folders: z.array(z.string()),
            files: z.record(z.string())
          })
        })
      )
    })
  )
});

export type Registry = z.infer<typeof RegistrySchema>;

export async function loadRegistry(registryPath?: string): Promise<Registry> {
  // Default paths to check
  const pathsToCheck = [
    registryPath,
    path.join(process.cwd(), 'cli/config/stack-registry.json'),
    path.join(process.cwd(), 'config/stack-registry.json'),
    path.join(import.meta.dirname || process.cwd(), '../config/stack-registry.json')
  ].filter(Boolean) as string[];

  let registry: any = null;
  let foundPath: string | null = null;

  for (const checkPath of pathsToCheck) {
    if (await fs.pathExists(checkPath)) {
      foundPath = checkPath;
      break;
    }
  }

  if (!foundPath) {
    throw new Error(`Registry file not found. Tried: ${pathsToCheck.join(', ')}`);
  }

  try {
    const content = await fs.readFile(foundPath, 'utf-8');
    registry = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse registry file at ${foundPath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Validate schema
  try {
    return RegistrySchema.parse(registry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid registry schema: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

export async function saveRegistry(registry: Registry, outputPath: string): Promise<void> {
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeJSON(outputPath, registry, { spaces: 2 });
}