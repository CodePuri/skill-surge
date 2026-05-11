import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function cachePath(): string {
  const home = os.homedir();
  const custom = process.env.SKILL_SURGE_CACHE;
  if (custom) return custom;
  return path.join(home, '.cache', 'skill-surge', 'index.json');
}

export function configPath(): string {
  return path.join(os.homedir(), '.config', 'skill-surge', 'sources.json');
}

export function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(filePath: string, data: unknown): void {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

export interface CacheData {
  version: number;
  generatedAt: string | null;
  skills: Record<string, { installedAt: string; agents: string[] }>;
}

export function loadCache(): CacheData {
  const p = cachePath();
  if (fs.existsSync(p)) {
    const data = readJson<CacheData | null>(p, null);
    if (data && typeof data === 'object' && data.skills) return data;
  }
  return { version: 1, generatedAt: null, skills: {} };
}

export function saveCache(cache: CacheData): void {
  const p = cachePath();
  ensureDir(p);
  writeJson(p, cache);
}

export function clearCache(): boolean {
  const p = cachePath();
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    return true;
  }
  return false;
}
