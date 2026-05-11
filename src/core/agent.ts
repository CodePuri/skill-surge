import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { Agent } from '../types.js';

const AGENT_REGISTRY: Omit<Agent, 'installed'>[] = [
  { name: 'Claude Code',    slug: 'claude-code', globalPath: '~/.claude/skills/',                  localPath: './.claude/skills/' },
  { name: 'OpenCode',       slug: 'opencode',    globalPath: '~/.config/opencode/skills/',          localPath: './.opencode/skills/' },
  { name: 'Codex',          slug: 'codex',       globalPath: '~/.codex/skills/',                   localPath: './.codex/skills/' },
  { name: 'Cline',         slug: 'cline',       globalPath: '~/.agents/skills/',                   localPath: './.agents/skills/' },
  { name: 'Cursor',         slug: 'cursor',      globalPath: '~/.cursor/skills/',                   localPath: './.cursor/skills/' },
  { name: 'Windsurf',       slug: 'windsurf',    globalPath: '~/.codeium/windsurf/skills/',          localPath: './.windsurf/skills/' },
  { name: 'GitHub Copilot', slug: 'github-copilot', globalPath: '~/.copilot/skills/',              localPath: './.copilot/skills/' },
  { name: 'Goose',         slug: 'goose',       globalPath: '~/.config/goose/skills/',             localPath: './.goose/skills/' },
  { name: 'Roo Code',       slug: 'roo',        globalPath: '~/.roo/skills/',                       localPath: './.roo/skills/' },
  { name: 'Augment',        slug: 'augment',     globalPath: '~/.augment/skills/',                  localPath: './.augment/skills/' },
  { name: 'Continue',       slug: 'continue',    globalPath: '~/.continue/skills/',                 localPath: './.continue/skills/' },
];

function expandHome(p: string): string {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  if (p.startsWith('./')) return path.join(process.cwd(), p.slice(2));
  return p;
}

export function detectAgents(): Agent[] {
  return AGENT_REGISTRY.map(agent => ({
    ...agent,
    installed: fs.existsSync(expandHome(agent.globalPath)),
  }));
}

export function detectInstalledAgents(): Agent[] {
  return detectAgents().filter(a => a.installed);
}

export function resolveAgentPath(agent: Agent, scope: 'global' | 'project'): string {
  return expandHome(scope === 'global' ? agent.globalPath : agent.localPath);
}

export function listInstalledSkills(agent: Agent, scope: 'global' | 'project'): string[] {
  const dir = resolveAgentPath(agent, scope);
  if (!fs.existsSync(dir)) return [];
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith('.md') || fs.statSync(path.join(dir, f)).isDirectory());
  } catch {
    return [];
  }
}

export function getAgentBySlug(slug: string): Omit<Agent, 'installed'> | undefined {
  return AGENT_REGISTRY.find(a => a.slug === slug);
}

export const ALL_AGENTS = AGENT_REGISTRY.map(a => a.slug);
