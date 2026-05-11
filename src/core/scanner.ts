import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import type { Config, Candidate } from '../types.js';
import { getBundlePath } from './config.js';

function sha(value: string): string {
  return crypto.createHash('sha1').update(value).digest('hex');
}

function expandHome(value: string): string {
  if (value === '~') return os.homedir();
  if (value.startsWith('~/')) return path.join(os.homedir(), value.slice(2));
  return value;
}

function parseFrontmatter(content: string): { name: string; description: string; [key: string]: string } | null {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return null;
  const lines = content.slice(3, end).split(/\r?\n/);
  const result: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[match[1]] = value;
  }
  if (!result.name || !result.description) return null;
  return result as { name: string; description: string; [key: string]: string };
}

function findSkillFiles(root: string, maxDepth = 4): string[] {
  const resolvedRoot = expandHome(root);
  const found: string[] = [];
  if (!fs.existsSync(resolvedRoot)) return found;

  function visit(dir: string, depth: number): void {
    if (depth > maxDepth) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === 'SKILL.md') {
        found.push(full);
      } else if (entry.isDirectory() && !['.git', 'node_modules', 'dist', '.cache', '__pycache__'].includes(entry.name)) {
        visit(full, depth + 1);
      }
    }
  }
  visit(resolvedRoot, 0);
  return found;
}

function candidateFromSkill(filePath: string, sourceKind: Candidate['sourceKind']): Candidate | null {
  const content = fs.readFileSync(filePath, 'utf8');
  const metadata = parseFrontmatter(content);
  if (!metadata) return null;
  const sourceKey = path.dirname(filePath);
  const dirName = path.basename(sourceKey);
  return {
    id: sha(`${sourceKind}:${sourceKey}`).slice(0, 12),
    name: metadata.name || dirName,
    description: metadata.description || 'No description.',
    sourceKind,
    source: sourceKey,
    url: metadata.url || null,
    installCount: null,
    installCommand: null,
    hash: sha(content),
    lastSeenAt: new Date().toISOString(),
    score: 0,
    canAutoInstall: false,
    reason: sourceKind === 'bundled' ? 'Pre-bundled skill shipped with autoskills.' : 'Installed local skill.',
    category: metadata.category || undefined,
  };
}

export function scanBundleSkills(config: Config): Candidate[] {
  const bundlePath = getBundlePath();
  const seen = new Set<string>();
  const candidates: Candidate[] = [];

  if (config.preSeed?.enabled !== false) {
    for (const filePath of findSkillFiles(bundlePath, 5)) {
      const candidate = candidateFromSkill(filePath, 'bundled');
      if (!candidate || seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      candidates.push(candidate);
    }
  }
  return candidates;
}

export function scanLocalCandidates(config: Config): Candidate[] {
  const seen = new Set<string>();
  const candidates: Candidate[] = [];

  for (const root of config.localPaths || []) {
    for (const filePath of findSkillFiles(root)) {
      const candidate = candidateFromSkill(filePath, 'local');
      if (!candidate || seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      candidates.push(candidate);
    }
  }
  return candidates;
}
