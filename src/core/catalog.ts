import type { Skill } from '../types.js';

export const ALL_SKILLS: Skill[] = [
  // Top-repo skills (installed via npx skills add)
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

  // Original skills (bundled)
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
