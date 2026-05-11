import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { Skill } from '../types.js';

function expandHome(p: string): string {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  if (p.startsWith('./')) return path.join(process.cwd(), p.slice(2));
  return p;
}

function findSkillDirs(root: string, maxDepth = 3): string[] {
  const resolved = expandHome(root);
  if (!fs.existsSync(resolved)) return [];
  const found: string[] = [];
  function visit(dir: string, depth: number) {
    if (depth > maxDepth) return;
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (e.isDirectory() && !['node_modules', '.git', 'dist', '.cache'].includes(e.name)) {
        const full = path.join(dir, e.name);
        const skillMd = path.join(full, 'SKILL.md');
        if (fs.existsSync(skillMd)) found.push(full);
        else visit(full, depth + 1);
      }
    }
  }
  visit(resolved, 0);
  return found;
}

function parseSkillDir(dirPath: string): { name: string; skillMd: string } {
  const dirName = path.basename(dirPath);
  const skillMd = path.join(dirPath, 'SKILL.md');
  let name = dirName;
  try {
    const content = fs.readFileSync(skillMd, 'utf8');
    if (content.startsWith('---')) {
      const end = content.indexOf('\n---', 3);
      if (end > 0) {
        for (const line of content.slice(3, end).split('\n')) {
          const m = line.match(/^name:\s*(.+)$/);
          if (m) { name = m[1].trim(); break; }
        }
      }
    }
  } catch { /* use dirName */ }
  return { name, skillMd };
}

export function scanLocalSkills(agentPaths: string[]): { name: string; path: string; agentPath: string }[] {
  const results: { name: string; path: string; agentPath: string }[] = [];
  for (const ap of agentPaths) {
    const resolved = expandHome(ap);
    if (!fs.existsSync(resolved)) continue;
    for (const skillDir of findSkillDirs(resolved, 3)) {
      const { name, skillMd } = parseSkillDir(skillDir);
      results.push({ name, path: skillMd, agentPath: ap });
    }
  }
  return results;
}

export function getSkillContent(skillMdPath: string): string {
  try {
    return fs.readFileSync(skillMdPath, 'utf8');
  } catch {
    return '';
  }
}
