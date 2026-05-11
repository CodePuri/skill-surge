import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from '../types.js';
import { configPath, readJson } from './cache.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', '..', 'config', 'sources.json');

export function loadConfig(): Config {
  const base = readJson<Partial<Config>>(DEFAULT_CONFIG_PATH, {});
  const user = readJson<Partial<Config>>(configPath(), {});
  return {
    preferredAgents: [...(base.preferredAgents || []), ...(user.preferredAgents || [])],
    installMode: user.installMode || base.installMode || 'copy',
    scope: user.scope || base.scope || 'both',
    trustedOwners: [...new Set([...(base.trustedOwners || []), ...(user.trustedOwners || [])])],
    customSources: [...(base.customSources || []), ...(user.customSources || [])],
  };
}

export function saveConfig(config: Config): void {
  const p = configPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(config, null, 2) + '\n');
}
