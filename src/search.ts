import { spawnSync } from 'node:child_process';
import type { Skill, ScoredCandidate } from './types.js';

export const ALL_SKILLS: Skill[] = [
  { name: 'find-skills',          description: 'Discover and install skills from skills.sh directly inside an agent session',  category: 'meta',        source: 'top-repo', repo: 'vercel-labs/skills',              installs: 1_400_000, tags: ['find', 'search', 'discover', 'skills.sh'] },
  { name: 'grill-me',             description: 'Interview me relentlessly about a plan or design until reaching shared understanding',           category: 'workflow',    source: 'top-repo', repo: 'mattpocock/skills',             installs: 113_900,   tags: ['grill', 'interview', 'clarify', 'requirements'] },
  { name: 'tdd',                 description: 'Test-driven development loop: write failing test, implement minimal fix, refactor',           category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 77_800,    tags: ['tdd', 'test', 'red-green', 'refactor'] },
  { name: 'systematic-debugging', description: 'Hypothesis-driven debugging loop: observe, hypothesize, test, verify',                         category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 89_800,    tags: ['debug', 'hypothesis', 'diagnose', 'troubleshoot'] },
  { name: 'writing-plans',       description: 'Write structured implementation plans before starting complex tasks',                        category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 89_100,    tags: ['planning', 'plan', 'structure', 'breakdown'] },
  { name: 'executing-plans',      description: 'Execute a plan step-by-step with checkpoints and verification at each stage',                category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 72_300,    tags: ['execute', 'plan', 'step', 'verification'] },
  { name: 'brainstorming',       description: 'Structured ideation and problem decomposition frameworks',                                    category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 149_200,   tags: ['brainstorm', 'ideate', 'creative', 'decompose'] },
  { name: 'verification-before-completion', description: 'Force a verification pass before any task is marked complete',                        category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 64_400,    tags: ['verify', 'quality', 'check', 'complete'] },
  { name: 'finishing-a-development-branch', description: 'Branch close checklist: tests, commit, PR, review request',                        category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 57_800,    tags: ['branch', 'commit', 'pr', 'merge', 'finish'] },
  { name: 'requesting-code-review', description: 'Prepare code for review: self-review, test coverage, PR description',                      category: 'workflow',    source: 'top-repo', repo: 'obra/superpowers',               installs: 78_200,    tags: ['review', 'pr', 'self-review', 'feedback'] },
  { name: 'frontend-design',      description: 'Universal frontend design guidelines applicable to any project',                             category: 'design',      source: 'top-repo', repo: 'anthropics/skills',             installs: 394_000,   tags: ['frontend', 'design', 'ui', 'ux', 'layout', 'component', 'dashboard'] },
  { name: 'ui-ux-pro-max',       description: 'Expert UI/UX design expertise covering visual hierarchy, design systems, and critique',        category: 'design',      source: 'top-repo', repo: 'nextlevelbuilder/ui-ux-pro-max-skill', installs: 156_900,   tags: ['ui', 'ux', 'design', 'hierarchy', 'systems'] },
  { name: 'vercel-react-best-practices', description: 'React and Next.js performance optimization with 69 rules',                         category: 'frontend',    source: 'top-repo', repo: 'vercel-labs/agent-skills',     installs: 388_200,   tags: ['react', 'next.js', 'performance', 'vercel'] },
  { name: 'next-best-practices', description: 'Next.js App Router conventions, RSC, async APIs, metadata, data fetching',                   category: 'frontend',    source: 'top-repo', repo: 'vercel-labs/next-skills',       installs: 82_900,    tags: ['next.js', 'app-router', 'rsc', 'ssr'] },
  { name: 'supabase-postgres-best-practices', description: 'Schema design, RLS policies, indexing strategy, query performance, migrations',      category: 'database',   source: 'top-repo', repo: 'supabase/agent-skills',         installs: 156_400,   tags: ['supabase', 'postgres', 'database', 'schema'] },
  { name: 'deploy-to-vercel',     description: 'Environment setup, preview URLs, production deploy, alias management',                      category: 'devops',      source: 'top-repo', repo: 'vercel-labs/agent-skills',     installs: 47_700,    tags: ['deploy', 'vercel', 'ci', 'cd', 'preview'] },
  { name: 'skill-creator',        description: 'Create, test, and publish new skills from within your agent',                              category: 'meta',        source: 'top-repo', repo: 'anthropics/skills',             installs: 197_600,   tags: ['create', 'skill', 'publish', 'author'] },
  { name: 'docx',                description: 'Generate Word documents programmatically with rich formatting',                             category: 'docs',       source: 'top-repo', repo: 'anthropics/skills',             installs: 83_300,    tags: ['docx', 'word', 'document', 'office'] },
  { name: 'node-api-design',      description: 'Production-ready REST API patterns with Node.js: routing, middleware, validation, security', category: 'backend',     source: 'original', tags: ['api', 'node.js', 'express', 'rest', 'middleware', 'validation'] },
  { name: 'auth-systems',        description: 'Security-first auth patterns: JWT RS256, OAuth2/PKCE, RBAC, bcrypt, session management',     category: 'backend',     source: 'original', tags: ['auth', 'jwt', 'oauth', 'session', 'rbac', 'password'] },
  { name: 'database-patterns',    description: 'Schema design, indexing, connection pooling, migrations, Redis caching patterns',        category: 'database',   source: 'original', tags: ['sql', 'postgres', 'redis', 'migration', 'index', 'pool'] },
  { name: 'git-workflow',         description: 'Standardized Git practices: branching, conventional commits, PR workflow, hooks',        category: 'workflow',    source: 'original', tags: ['git', 'branch', 'commit', 'pr', 'merge', 'hooks'] },
  { name: 'error-handling',       description: 'Consistent error handling: typed error classes, centralized handlers, logging, Sentry',  category: 'backend',     source: 'original', tags: ['error', 'exception', 'logging', 'sentry', 'debug'] },
  { name: 'security-hardening',   description: 'Production security patterns: Helmet, CORS, rate limiting, input sanitization, CSP',      category: 'security',    source: 'original', tags: ['security', 'helmet', 'cors', 'xss', 'csrf', 'rate-limit'] },
  { name: 'react-patterns',       description: 'React best practices: hooks, TanStack Query, component patterns, performance',         category: 'frontend',    source: 'original', tags: ['react', 'hooks', 'state', 'tanstack', 'performance', 'component', 'build'] },
  { name: 'testing-strategies',  description: 'Comprehensive testing: unit, integration, E2E with Playwright, TDD flow, CI coverage',  category: 'qa',          source: 'original', tags: ['test', 'playwright', 'vitest', 'coverage', 'tdd', 'ci'] },
  { name: 'accessibility-first', description: 'WCAG 2.1 AA accessibility: semantic HTML, ARIA, keyboard nav, screen readers',            category: 'design',      source: 'original', tags: ['a11y', 'wcag', 'aria', 'keyboard', 'semantic', 'screen-reader'] },
  { name: 'system-design',        description: 'Scalable architecture: caching, databases, queues, microservices, observability',        category: 'architecture', source: 'original', tags: ['architecture', 'scalability', 'caching', 'queue', 'microservices'] },
  { name: 'project-planning',     description: 'Agile planning: user stories, story points, sprints, risk matrix, retrospectives',       category: 'planning',    source: 'original', tags: ['planning', 'agile', 'sprint', 'user-story', 'estimation'] },
];

export function getSkillByName(name: string): Skill | undefined {
  return ALL_SKILLS.find(s => s.name === name);
}

export function getSkillsByCategory(category: string): Skill[] {
  return ALL_SKILLS.filter(s => s.category === category);
}

export function getTopRepoSkills(): Skill[] {
  return ALL_SKILLS.filter(s => s.source === 'top-repo');
}

export function getOriginalSkills(): Skill[] {
  return ALL_SKILLS.filter(s => s.source === 'original');
}

const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'do', 'for', 'from', 'how',
  'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please', 'that', 'the',
  'this', 'to', 'use', 'with', 'you', 'we', 'our', 'your', 'will', 'would',
  'could', 'should', 'need', 'want', 'like', 'just', 'make', 'get', 'was',
  'were', 'been', 'being', 'have', 'has', 'had', 'does', 'did', 'done', 'doing',
  'some', 'any', 'all', 'each', 'every', 'both',
]);

export function tokenize(value: string): Set<string> {
  return new Set(
    String(value).toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1 && !STOP.has(t)),
  );
}

const SIMPLE = /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|date|time|pwd|ls|whoami|bye|goodbye|cool|nice|sure|great)(,?\s*(thanks|ok|please|yeah|yep|nope|you)?)*$/i;

export function isTrivialTask(task: string): boolean {
  const terms = tokenize(task.trim());
  if (terms.size <= 1) return true;
  if (SIMPLE.test(task.trim())) return true;
  return false;
}

function stripAnsi(s: string): string {
  return s.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}

function parseCount(s: string): number | null {
  if (!s) return null;
  const m = s.match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const base = Number(m[1]);
  const mult = m[2]?.toUpperCase() === 'M' ? 1e6 : m[2]?.toUpperCase() === 'K' ? 1e3 : 1;
  return Math.round(base * mult);
}

export function runSkillsFind(task: string): Skill[] {
  const terms = [...tokenize(task)].slice(0, 6);
  if (terms.length === 0) return [];

  const result = spawnSync('npx', ['skills', 'find', ...terms], {
    encoding: 'utf8', timeout: 25_000, shell: false,
  });

  if (result.status !== 0) return [];

  const lines = stripAnsi(result.stdout).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const skills: Skill[] = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@([A-Za-z0-9_.-]+)\s+(.+?installs?)$/i);
    if (!m) continue;
    const [_, repo, skillName, countStr] = m;
    skills.push({
      name: skillName.trim(),
      description: `${skillName} from ${repo}`,
      category: 'discovered',
      source: 'top-repo',
      repo: repo,
      installs: parseCount(countStr),
      tags: terms,
    });
  }
  return skills;
}

export function rankSkillsForTask(task: string, installedNames: Set<string>): ScoredCandidate[] {
  const terms = tokenize(task);
  const results: ScoredCandidate[] = [];

  for (const skill of ALL_SKILLS) {
    const skillText = tokenize(`${skill.name} ${skill.description} ${skill.tags.join(' ')}`);
    let overlap = 0;
    for (const t of terms) {
      if (skillText.has(t)) overlap++;
    }
    if (overlap === 0 && terms.size > 0) continue;

    let score = 0;
    const sourceScore = skill.source === 'top-repo' ? 30 : 40;
    score += sourceScore + overlap * 20;
    if (installedNames.has(skill.name)) score += 15;
    if (skill.installs && skill.installs >= 100_000) score += 25;
    else if (skill.installs && skill.installs >= 10_000) score += 10;

    const reasonParts: string[] = [`${overlap} keyword match${overlap === 1 ? '' : 'es'}`];
    if (installedNames.has(skill.name)) reasonParts.push('installed locally');
    if (skill.installs) reasonParts.push(`${skill.installs.toLocaleString()} installs`);

    results.push({
      name: skill.name,
      description: skill.description,
      category: skill.category,
      score: Math.min(100, score),
      source: skill.repo || 'skill-surge',
      installed: installedNames.has(skill.name),
      reason: reasonParts.join('; '),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
