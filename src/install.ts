import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { Agent, Skill, ScanResult, InstallResult, Config, CacheData } from './types.js';
import { ALL_SKILLS } from './search.js';

function expandHome(p: string): string {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  if (p.startsWith('./')) return path.join(process.cwd(), p.slice(2));
  return p;
}



export function detectAgents(): Agent[] {
  const home = os.homedir();
  const cwd = process.cwd();
  const visited = new Set<string>();
  const found: Agent[] = [];

  // Phase 1: Known config paths (fast path)
  const knownPaths: Array<{name: string; slug: string; globalPath: string; localPath: string}> = [
    { name: 'Claude Code',    slug: 'claude-code',    globalPath: path.join(home, '.claude', 'skills'), localPath: path.join('./.claude', 'skills') },
    { name: 'OpenCode',       slug: 'opencode',       globalPath: path.join(home, '.config', 'opencode', 'skills'), localPath: path.join('./.opencode', 'skills') },
    { name: 'Codex',          slug: 'codex',          globalPath: path.join(home, '.codex', 'skills'), localPath: path.join('./.codex', 'skills') },
    { name: 'Cline',         slug: 'cline',          globalPath: path.join(home, '.agents', 'skills'), localPath: path.join('./.agents', 'skills') },
    { name: 'Cursor',         slug: 'cursor',         globalPath: path.join(home, '.cursor', 'skills'), localPath: path.join('./.cursor', 'skills') },
    { name: 'Windsurf',       slug: 'windsurf',       globalPath: path.join(home, '.codeium', 'windsurf', 'skills'), localPath: path.join('./.windsurf', 'skills') },
    { name: 'GitHub Copilot', slug: 'github-copilot', globalPath: path.join(home, '.copilot', 'skills'), localPath: path.join('./.copilot', 'skills') },
    { name: 'Goose',         slug: 'goose',          globalPath: path.join(home, '.config', 'goose', 'skills'), localPath: path.join('./.goose', 'skills') },
    { name: 'Roo Code',       slug: 'roo',            globalPath: path.join(home, '.roo', 'skills'), localPath: path.join('./.roo', 'skills') },
    { name: 'Augment',        slug: 'augment',        globalPath: path.join(home, '.augment', 'skills'), localPath: path.join('./.augment', 'skills') },
    { name: 'Continue',       slug: 'continue',       globalPath: path.join(home, '.continue', 'skills'), localPath: path.join('./.continue', 'skills') },
  ];

  for (const agent of knownPaths) {
    if (fs.existsSync(agent.globalPath) && !visited.has(agent.globalPath)) {
      visited.add(agent.globalPath);
      found.push({ ...agent, installed: true });
    }
  }

  // Phase 2: Globbing for skills/ dirs under common config paths
  const configBase = path.join(home, '.config');
  if (fs.existsSync(configBase)) {
    try {
      for (const entry of fs.readdirSync(configBase)) {
        const globalPath = path.join(configBase, entry, 'skills');
        const localPath = path.join('./' + entry, 'skills');
        if (fs.existsSync(globalPath) && !visited.has(globalPath)) {
          visited.add(globalPath);
          found.push({ 
            name: entry, 
            slug: entry, 
            globalPath,
            localPath,
            installed: true 
          });
        }
      }
    } catch (err) {
      // Ignore errors reading .config directory
    }
  }

  // Phase 2b: Any ~/.{something}/skills pattern
  try {
    const dotDirs = fs.readdirSync(home).filter(d => d.startsWith('.') && d.length > 1);
    for (const dir of dotDirs) {
      const globalPath = path.join(home, dir, 'skills');
      const localPath = path.join('./' + dir, 'skills');
      if (fs.existsSync(globalPath) && !visited.has(globalPath)) {
        visited.add(globalPath);
        found.push({ 
          name: dir.replace('.', ''), 
          slug: dir, 
          globalPath,
          localPath,
          installed: true 
        });
      }
    }
  } catch (err) {
    // Ignore errors reading home directory
  }

  // Phase 3: Fallback — create ~/.agents/skills if nothing found
  if (found.length === 0) {
    const globalPath = path.join(home, '.agents', 'skills');
    const localPath = path.join('./.agents', 'skills');
    fs.mkdirSync(globalPath, { recursive: true });
    found.push({ name: 'Default', slug: 'default', globalPath, localPath, installed: true });
  }

  // Also check for project-specific skills directory
  const projectGlobalPath = path.join(cwd, '.agents', 'skills');
  const projectLocalPath = path.join('./.agents', 'skills');
  if (fs.existsSync(projectGlobalPath) && !visited.has(projectGlobalPath)) {
    found.push({ name: 'Project', slug: 'project', globalPath: projectGlobalPath, localPath: projectLocalPath, installed: true });
  }

  return found;
}

export function detectInstalledAgents(): Agent[] {
  return detectAgents().filter(a => a.installed);
}

// Detect which agent/IDE invoked this CLI by checking env vars
export function detectCurrentAgent(): Agent | null {
  const envMap: [string, string, string, string][] = [
    ['CLAUDE_CODE', 'Claude Code', 'claude-code', '~/.claude/skills/'],
    ['CLINE', 'Cline', 'cline', '~/.agents/skills/'],
    ['OPENCODE', 'OpenCode', 'opencode', '~/.config/opencode/skills/'],
    ['CURSOR', 'Cursor', 'cursor', '~/.cursor/skills/'],
    ['WINDSURF', 'Windsurf', 'windsurf', '~/.codeium/windsurf/skills/'],
    ['GITHUB_COPILOT', 'GitHub Copilot', 'github-copilot', '~/.copilot/skills/'],
    ['GOOSE', 'Goose', 'goose', '~/.config/goose/skills/'],
    ['ROO', 'Roo Code', 'roo', '~/.roo/skills/'],
    ['AUGMENT', 'Augment', 'augment', '~/.augment/skills/'],
    ['CONTINUE', 'Continue', 'continue', '~/.continue/skills/'],
  ];

  for (const [envVar, name, slug, globalPath] of envMap) {
    if (process.env[envVar] === 'true' || process.env[envVar] === '1') {
      return { name, slug, globalPath, localPath: `./${slug}/skills/`, installed: true };
    }
  }
  
  // Also check for IDE-specific env vars (cursor, vscode, etc.)
  if (process.env.TERM_PROGRAM === 'vscode') {
    // Running inside VS Code — could be any extension
    // Don't guess, return null
    return null;
  }
  
  return null;
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
  // Return a mock agent for compatibility - in practice this should search through known agents
  const agentMap: Record<string, Omit<Agent, 'installed'>> = {
    'claude-code': { name: 'Claude Code', slug: 'claude-code', globalPath: '~/.claude/skills/', localPath: './.claude/skills/' },
    'opencode': { name: 'OpenCode', slug: 'opencode', globalPath: '~/.config/opencode/skills/', localPath: './.opencode/skills/' },
    'codex': { name: 'Codex', slug: 'codex', globalPath: '~/.codex/skills/', localPath: './.codex/skills/' },
    'cline': { name: 'Cline', slug: 'cline', globalPath: '~/.agents/skills/', localPath: './.agents/skills/' },
    'cursor': { name: 'Cursor', slug: 'cursor', globalPath: '~/.cursor/skills/', localPath: './.cursor/skills/' },
    'windsurf': { name: 'Windsurf', slug: 'windsurf', globalPath: '~/.codeium/windsurf/skills/', localPath: './.windsurf/skills/' },
    'github-copilot': { name: 'GitHub Copilot', slug: 'github-copilot', globalPath: '~/.copilot/skills/', localPath: './.copilot/skills/' },
    'goose': { name: 'Goose', slug: 'goose', globalPath: '~/.config/goose/skills/', localPath: './.goose/skills/' },
    'roo': { name: 'Roo Code', slug: 'roo', globalPath: '~/.roo/skills/', localPath: './.roo/skills/' },
    'augment': { name: 'Augment', slug: 'augment', globalPath: '~/.augment/skills/', localPath: './.augent/skills/' },
    'continue': { name: 'Continue', slug: 'continue', globalPath: '~/.continue/skills/', localPath: './.continue/skills/' },
  };
  return agentMap[slug] || null;
}

export const ALL_AGENTS = [
  'claude-code',
  'opencode',
  'codex',
  'cline',
  'cursor',
  'windsurf',
  'github-copilot',
  'goose',
  'roo',
  'augment',
  'continue',
];

export function cachePath(): string {
  const home = os.homedir();
  const custom = process.env.SKILL_SURGE_CACHE;
  if (custom) return custom;
  return path.join(home, '.cache', 'skill-surge', 'index.json');
}

export function userConfigPath(): string {
  return path.join(os.homedir(), '.config', 'skill-surge', 'sources.json');
}

function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: unknown): void {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'config', 'sources.json');

export function loadConfig(): Config {
  const base = readJson<Partial<Config>>(DEFAULT_CONFIG_PATH, {});
  const user = readJson<Partial<Config>>(userConfigPath(), {});
  return {
    preferredAgents: [...(base.preferredAgents || []), ...(user.preferredAgents || [])],
    installMode: user.installMode || base.installMode || 'copy',
    scope: user.scope || base.scope || 'both',
    trustedOwners: [...new Set([...(base.trustedOwners || []), ...(user.trustedOwners || [])])],
    customSources: [...(base.customSources || []), ...(user.customSources || [])],
  };
}

export function saveConfig(config: Config): void {
  const p = userConfigPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(config, null, 2) + '\n');
}

export function detectProjectType(): string[] {
  const cwd = process.cwd();
  const types: string[] = [];
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      if (pkg.dependencies?.react || pkg.devDependencies?.react) types.push('React');
      if (pkg.dependencies?.next || pkg.devDependencies?.next) types.push('Next.js');
      if (pkg.dependencies?.express) types.push('Express');
      if (pkg.dependencies?.fastify) types.push('Fastify');
      if (pkg.dependencies?.prisma || pkg.devDependencies?.prisma) types.push('Prisma');
      if (pkg.dependencies?.supabase) types.push('Supabase');
      if (pkg.dependencies?.docker) types.push('Docker');
      if (pkg.dependencies?.k8s || pkg.devDependencies?.k8s) types.push('Kubernetes');
    } catch { /* ignore */ }
  }
  if (fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
    types.push('Python');
  }
  if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
    types.push('Rust');
  }
  if (types.length === 0) types.push('Node.js');
  return types;
}

export function auditProject(globalPaths: string[]): ScanResult {
  const installedNames = new Set<string>();
  const installed: { name: string; agent: string; path: string; installedAt: string }[] = [];

  for (const gp of globalPaths) {
    if (!fs.existsSync(gp)) continue;
    try {
      for (const entry of fs.readdirSync(gp)) {
        if (entry.endsWith('.md') || entry === entry.toLowerCase()) {
          let name = entry.replace(/\.md$/, '');
          if (entry.endsWith('.md')) {
            try {
              const content = fs.readFileSync(path.join(gp, entry), 'utf8');
              if (content.startsWith('---')) {
                const end = content.indexOf('\n---', 3);
                if (end > 0) {
                  for (const line of content.slice(3, end).split('\n')) {
                    const m = line.match(/^name:\s*(.+)$/);
                    if (m) { name = m[1].trim(); break; }
                  }
                }
              }
            } catch { /* use filename */ }
          }
          if (!installedNames.has(name)) {
            installedNames.add(name);
            installed.push({
              name,
              agent: path.dirname(gp),
              path: path.join(gp, entry),
              installedAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch { /* ignore */ }
  }

  const projectTypes = detectProjectType();
  const cache = loadCache();
  const byCategory: ScanResult['byCategory'] = {};

  for (const skill of ALL_SKILLS) {
    if (!byCategory[skill.category]) byCategory[skill.category] = { installed: [], missing: [] };
    if (installedNames.has(skill.name) || cache.skills[skill.name]) {
      byCategory[skill.category].installed.push(skill.name);
    } else {
      byCategory[skill.category].missing.push(skill.name);
    }
  }

  const available = ALL_SKILLS;
  const missing = ALL_SKILLS.filter(s => !installedNames.has(s.name) && !cache.skills[s.name]);

  return { projectType: projectTypes, installed, available, missing, byCategory };
}

function getOriginalSkillPath(skillName: string): string | null {
  const home = os.homedir();
  const skillSurgeRoot = path.join(home, 'Desktop', 'Code', 'auto-skills');
  const originalDir = path.join(skillSurgeRoot, 'skills', 'original', skillName);
  const skillMd = path.join(originalDir, 'SKILL.md');
  if (fs.existsSync(skillMd)) return skillMd;
  return null;
}

export function installSkillToAgents(
  skillName: string,
  agents: Agent[],
  scope: 'global' | 'project' | 'both',
  options: { dryRun?: boolean; installMode?: 'copy' | 'symlink' } = {},
): InstallResult[] {
  const results: InstallResult[] = [];
  const skill = ALL_SKILLS.find(s => s.name === skillName);
  if (!skill) {
    return [{ skill: skillName, agent: 'all', success: false, error: 'Skill not found in catalog' }];
  }

  const scopes: ('global' | 'project')[] = scope === 'both' ? ['global', 'project'] : [scope];

  for (const agent of agents) {
    for (const s of scopes) {
      const targetDir = resolveAgentPath(agent, s);
      results.push({ skill: skillName, agent: `${agent.name} (${s})`, success: true });
      if (options.dryRun) continue;

      try {
        fs.mkdirSync(targetDir, { recursive: true });
        if (skill.source === 'top-repo' && skill.repo) {
          const result = spawnSync(
            'npx', ['skills', 'add', skill.repo, '--skill', skillName, '-g'],
            { encoding: 'utf8', timeout: 60_000, shell: false }
          );
          if (result.status !== 0) {
            results.push({ skill: skillName, agent: `${agent.name} (${s})`, success: false, error: result.stderr || 'npx skills add failed' });
          }
        } else {
          const src = getOriginalSkillPath(skillName);
          if (!src) {
            results.push({ skill: skillName, agent: `${agent.name} (${s})`, success: false, error: 'Original skill source not found' });
            continue;
          }
          if (options.installMode === 'symlink') {
            fs.symlinkSync(src, path.join(targetDir, `${skillName}.md`));
          } else {
            fs.copyFileSync(src, path.join(targetDir, `${skillName}.md`));
          }
        }

        const cache = loadCache();
        if (!cache.skills[skillName]) {
          cache.skills[skillName] = { installedAt: new Date().toISOString(), agents: [] };
        }
        if (!cache.skills[skillName].agents.includes(agent.slug)) {
          cache.skills[skillName].agents.push(agent.slug);
        }
        saveCache(cache);
      } catch (err) {
        results.push({ skill: skillName, agent: `${agent.name} (${s})`, success: false, error: String(err) });
      }
    }
  }
  return results;
}

export function installTopRepoSkills(
  agents: Agent[],
  scope: 'global' | 'project' | 'both',
): { repo: string; skills: string[]; results: InstallResult[] }[] {
  const results: { repo: string; skills: string[]; results: InstallResult[] }[] = [];
  const byRepo = new Map<string, string[]>();

  for (const skill of ALL_SKILLS) {
    if (skill.source === 'top-repo' && skill.repo) {
      if (!byRepo.has(skill.repo)) byRepo.set(skill.repo, []);
      byRepo.get(skill.repo)!.push(skill.name);
    }
  }

  for (const [repo, skillNames] of byRepo) {
    const repoResults: InstallResult[] = [];
    const cmd = ['npx', 'skills', 'add', repo, '-g', '-y'];
    const r = spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8', timeout: 120_000, shell: false });
    if (r.status === 0) {
      for (const name of skillNames) {
        for (const agent of agents) {
          repoResults.push({ skill: name, agent: agent.name, success: true });
        }
      }
    } else {
      for (const name of skillNames) {
        repoResults.push({ skill: name, agent: 'all', success: false, error: r.stderr || 'install failed' });
      }
    }
    results.push({ repo, skills: skillNames, results: repoResults });
  }
  return results;
}

export function scanLocalSkills(agentPaths: string[]): { name: string; path: string; agentPath: string }[] {
  const results: { name: string; path: string; agentPath: string }[] = [];
  for (const ap of agentPaths) {
    const resolved = expandHome(ap);
    if (!fs.existsSync(resolved)) continue;
    const found = findSkillDirs(resolved, 3);
    for (const skillDir of found) {
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
