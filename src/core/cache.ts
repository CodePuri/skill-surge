import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Cache } from '../types.js';

const DEFAULT_CACHE_PATH = path.join(os.homedir(), '.cache', 'autoskills', 'index.json');
const FALLBACK_CACHE_PATH = path.join(os.tmpdir(), 'autoskills', 'index.json');

function cachePath(): string {
  return process.env.AUTO_SKILLS_CACHE || DEFAULT_CACHE_PATH;
}

function emptyCache(): Cache {
  return { version: 1, generatedAt: null, candidates: [] };
}

export function loadCache(): Cache {
  const targets = [cachePath(), FALLBACK_CACHE_PATH];
  for (const target of targets) {
    try {
      const data = JSON.parse(fs.readFileSync(target, 'utf8'));
      if (data && typeof data === 'object') {
        return {
          version: data.version || 1,
          generatedAt: data.generatedAt || null,
          candidates: Array.isArray(data.candidates) ? data.candidates : [],
        };
      }
    } catch {
      continue;
    }
  }
  return emptyCache();
}

export function writeCache(cache: Cache): string {
  const targets = [cachePath(), FALLBACK_CACHE_PATH];
  let lastError: unknown = null;
  for (const target of targets) {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, JSON.stringify(cache, null, 2) + '\n');
      return target;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export function clearCache(): boolean {
  const targets = [cachePath(), FALLBACK_CACHE_PATH];
  let any = false;
  for (const target of targets) {
    try {
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
        any = true;
      }
    } catch {
      // ignore
    }
  }
  return any;
}
