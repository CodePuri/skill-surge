import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import type { Candidate } from '../types.js';
import { tokenize } from './ranker.js';

function sha(value: string): string {
  return crypto.createHash('sha1').update(value).digest('hex');
}

function stripAnsi(value: string): string {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}

function parseInstallCount(raw: string | null): number | null {
  if (!raw) return null;
  const match = raw.match(/([\d.]+)\s*([KMB])?/i);
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;
  const suffix = (match[2] || '').toUpperCase();
  const multiplier = suffix === 'M' ? 1_000_000 : suffix === 'K' ? 1_000 : suffix === 'B' ? 1_000_000_000 : 1;
  return Math.round(base * multiplier);
}

function parseSkillsCliOutput(output: string): Candidate[] {
  const clean = stripAnsi(output);
  const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const candidates: Candidate[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[A-Za-z0-9_. -]+)\s+(.+?installs?)$/i);
    if (!match) continue;
    const spec = match[1].trim();
    const [repo, skillName] = spec.split('@');
    const linkLine = lines[i + 1] || '';
    const urlMatch = linkLine.match(/https?:\/\/\S+/);
    const installCommand = ['npx', 'skills', 'add', repo, '--skill', skillName, '-g', '-a', 'codex', '-y'];

    candidates.push({
      id: sha(`skills-cli:${spec}`).slice(0, 12),
      name: skillName.trim(),
      description: `Skill discovered via npx skills find: ${spec}`,
      sourceKind: 'skills-cli',
      source: repo,
      url: urlMatch ? urlMatch[0] : null,
      installCount: parseInstallCount(match[2]),
      installCommand,
      packageSpec: spec,
      hash: sha(`${spec}:${urlMatch ? urlMatch[0] : ''}`),
      lastSeenAt: new Date().toISOString(),
      score: 0,
      canAutoInstall: false,
      reason: 'Discovered from npx skills find.',
    });
  }
  return candidates;
}

export function runSkillsFind(task: string): { candidates: Candidate[]; error: string | null } {
  const terms = [...tokenize(task)].slice(0, 8);
  if (terms.length === 0) {
    return { candidates: [], error: 'Task did not contain searchable terms.' };
  }

  const result = spawnSync('npx', ['skills', 'find', ...terms], {
    encoding: 'utf8',
    timeout: 25_000,
    shell: false,
  });

  if (result.error) {
    return { candidates: [], error: result.error.message };
  }
  if (result.status !== 0) {
    return { candidates: [], error: result.stderr || result.stdout || `npx exited with ${result.status}` };
  }
  return { candidates: parseSkillsCliOutput(result.stdout), error: null };
}

export function queryRegistry(registryUrl: string): { candidates: Candidate[]; error: string | null } {
  try {
    const result = spawnSync('npx', ['skills', 'find', '--registry', registryUrl], {
      encoding: 'utf8',
      timeout: 15_000,
      shell: false,
    });
    if (result.status === 0 && result.stdout) {
      return { candidates: parseSkillsCliOutput(result.stdout), error: null };
    }
    return { candidates: [], error: result.stderr || 'registry query failed' };
  } catch (err) {
    return { candidates: [], error: String(err) };
  }
}
