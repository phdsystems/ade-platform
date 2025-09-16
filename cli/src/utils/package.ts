import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

let packageInfoCache: any = null;

export async function getPackageInfo(): Promise<any> {
  if (packageInfoCache) return packageInfoCache;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const packageJsonPath = path.join(__dirname, '../../package.json');

  try {
    packageInfoCache = await fs.readJSON(packageJsonPath);
    return packageInfoCache;
  } catch (error) {
    return {
      name: 'ade-core',
      version: '1.0.0'
    };
  }
}

export const packageInfo = await getPackageInfo();