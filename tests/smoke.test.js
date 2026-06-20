import { after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = path.join(ROOT, 'dist');
const CLI = path.join(DIST_DIR, 'cli.js');
const TEMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-test-'));
const TEST_HOME = path.join(TEMP_ROOT, 'home');
const TEST_CACHE = path.join(TEMP_ROOT, 'cache', 'index.json');
const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

process.env.HOME = TEST_HOME;
process.env.USERPROFILE = TEST_HOME;
process.env.SKILL_SURGE_CACHE = TEST_CACHE;

const searchModule = await import(new URL('../dist/search.js', import.meta.url).href);
const installModule = await import(new URL('../dist/install.js', import.meta.url).href);
const terminalModule = await import(new URL('../dist/ui/terminal.js', import.meta.url).href);
const promptModule = await import(new URL('../dist/ui/prompt.js', import.meta.url).href);
const typesModule = await import(new URL('../dist/types.js', import.meta.url).href);

const {
  ALL_SKILLS,
  getSkillByName,
  getTopRepoSkills,
  getOriginalSkills,
  tokenize,
  isTrivialTask,
  rankSkillsForTask,
} = searchModule;

const {
  VERSION,
} = typesModule;

const {
  loadCache,
  saveCache,
  clearCache,
  loadConfig,
  detectAgents,
  resolveAgentPath,
  detectProjectType,
  installSkillToAgents,
} = installModule;

const { box, divider, header, T } = terminalModule;
const { clearLine } = promptModule;

const TEST_AGENT = {
  name: 'Codex',
  slug: 'codex',
  globalPath: '~/.codex/skills',
  localPath: './.codex/skills',
  installed: true,
};

const NEW_TOP_REPO_SKILLS = [
  {
    name: 'next-cache-components',
    repo: 'vercel-labs/next-skills',
    category: 'frontend',
    query: 'next cache components ppr use cache',
  },
  {
    name: 'next-upgrade',
    repo: 'vercel-labs/next-skills',
    category: 'frontend',
    query: 'upgrade next app with codemod migration',
  },
  {
    name: 'terminal-ui',
    repo: 'pproenca/dot-skills',
    category: 'design',
    query: 'ink clack terminal ui prompt rendering',
  },
  {
    name: 'vercel-cli-with-tokens',
    repo: 'vercel-labs/agent-skills',
    category: 'devops',
    query: 'deploy vercel cli token environment variables',
  },
  {
    name: 'vercel-composition-patterns',
    repo: 'vercel-labs/agent-skills',
    category: 'frontend',
    query: 'react composition component patterns refactor',
  },
  {
    name: 'vercel-react-native-skills',
    repo: 'vercel-labs/agent-skills',
    category: 'frontend',
    query: 'react native expo mobile performance',
  },
  {
    name: 'vercel-react-view-transitions',
    repo: 'vercel-labs/agent-skills',
    category: 'frontend',
    query: 'react view transition shared element animation',
  },
  {
    name: 'web-design-guidelines',
    repo: 'vercel-labs/agent-skills',
    category: 'design',
    query: 'review ui accessibility ux audit',
  },
];

function resetTestState() {
  fs.rmSync(TEST_HOME, { recursive: true, force: true });
  fs.rmSync(path.dirname(TEST_CACHE), { recursive: true, force: true });
  fs.mkdirSync(path.join(TEST_HOME, '.codex', 'skills'), { recursive: true });
  delete process.env.FAKE_NPX_LOG;
}

function cli(args, options = {}) {
  const result = spawnSync('node', [CLI, ...args], {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    timeout: 30_000,
    input: options.input ?? undefined,
    env: {
      ...process.env,
      HOME: TEST_HOME,
      USERPROFILE: TEST_HOME,
      SKILL_SURGE_CACHE: TEST_CACHE,
      ...options.env,
    },
  });

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

function jsonOutput(stdout) {
  try {
    const trimmed = stdout.trim();
    if (trimmed.startsWith('{')) return JSON.parse(trimmed);
    const match = trimmed.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

function createFakeNpx() {
  const binDir = fs.mkdtempSync(path.join(TEMP_ROOT, 'fake-npx-'));
  const logPath = path.join(binDir, 'npx.log');
  const scriptPath = path.join(binDir, 'npx');
  fs.writeFileSync(
    scriptPath,
    '#!/bin/sh\nprintf "%s\\n" "$@" > "$FAKE_NPX_LOG"\nexit 0\n',
    'utf8',
  );
  fs.chmodSync(scriptPath, 0o755);
  return { binDir, logPath };
}

function withFakeNpx(fn) {
  const { binDir, logPath } = createFakeNpx();
  const prevPath = process.env.PATH ?? '';
  const prevLog = process.env.FAKE_NPX_LOG;
  process.env.PATH = `${binDir}:${prevPath}`;
  process.env.FAKE_NPX_LOG = logPath;
  try {
    return fn(logPath);
  } finally {
    process.env.PATH = prevPath;
    if (prevLog === undefined) delete process.env.FAKE_NPX_LOG;
    else process.env.FAKE_NPX_LOG = prevLog;
  }
}

resetTestState();
beforeEach(resetTestState);

after(() => {
  fs.rmSync(TEMP_ROOT, { recursive: true, force: true });
});

describe('version', () => {
  it('runtime version matches package.json', () => {
    assert.equal(VERSION, PACKAGE_JSON.version);
  });
});

describe('ranker — tokenize', () => {
  it('splits on non-alphanumeric and removes stopwords', () => {
    const result = tokenize('Build a login system with JWT authentication');
    assert.ok(result.has('login'));
    assert.ok(result.has('system'));
    assert.ok(result.has('jwt'));
    assert.ok(!result.has('a'));
    assert.ok(!result.has('with'));
    assert.ok(!result.has('the'));
  });

  it('lowercases all tokens', () => {
    const result = tokenize('Build A Login System');
    assert.ok(result.has('build'));
  });

  it('filters single-char tokens', () => {
    assert.equal(tokenize('a b c d').size, 0);
  });

  it('handles empty string', () => {
    assert.equal(tokenize('').size, 0);
  });
});

describe('ranker — isTrivialTask', () => {
  const cases = [
    ['hi', true],
    ['hello', true],
    ['thanks', true],
    ['ok', true],
    ['date', true],
    ['pwd', true],
    ['build a login system', false],
    ['write tests for the API', false],
  ];

  for (const [task, expected] of cases) {
    it(`"${task}" -> ${expected}`, () => {
      assert.equal(isTrivialTask(task), expected);
    });
  }
});

describe('catalog', () => {
  it('has exactly 37 skills', () => {
    assert.equal(ALL_SKILLS.length, 37);
  });

  it('has exactly 26 top-repo skills', () => {
    assert.equal(getTopRepoSkills().length, 26);
  });

  it('has exactly 11 original skills', () => {
    assert.equal(getOriginalSkills().length, 11);
  });

  it('every skill has required metadata', () => {
    for (const skill of ALL_SKILLS) {
      assert.ok(skill.name, 'missing name');
      assert.ok(skill.description, `missing description for ${skill.name}`);
      assert.ok(skill.category, `missing category for ${skill.name}`);
      assert.ok(skill.source, `missing source for ${skill.name}`);
      assert.ok(Array.isArray(skill.tags) && skill.tags.length > 0, `missing tags for ${skill.name}`);
      if (skill.source === 'top-repo') {
        assert.ok(skill.repo, `${skill.name} missing repo`);
      }
    }
  });

  it('has no duplicate skill names', () => {
    const names = ALL_SKILLS.map(skill => skill.name);
    assert.equal(new Set(names).size, names.length);
  });

  for (const entry of NEW_TOP_REPO_SKILLS) {
    it(`includes ${entry.name} with the expected source metadata`, () => {
      const skill = getSkillByName(entry.name);
      assert.ok(skill);
      assert.equal(skill?.source, 'top-repo');
      assert.equal(skill?.repo, entry.repo);
      assert.equal(skill?.category, entry.category);
    });
  }
});

describe('cache', () => {
  const testCache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    skills: {
      'auth-systems': { installedAt: '2026-01-01T00:00:00Z', agents: ['codex'] },
    },
  };

  it('loadCache returns valid shape when missing', () => {
    const cache = loadCache();
    assert.equal(typeof cache.version, 'number');
    assert.equal(typeof cache.skills, 'object');
  });

  it('saveCache and clearCache use the isolated temp cache path', () => {
    saveCache(testCache);
    assert.ok(fs.existsSync(TEST_CACHE));
    const loaded = loadCache();
    assert.equal(loaded.skills['auth-systems']?.agents?.[0], 'codex');
    assert.equal(clearCache(), true);
    assert.equal(fs.existsSync(TEST_CACHE), false);
  });
});

describe('config', () => {
  it('loadConfig returns bundled defaults without globally trusting pproenca', () => {
    const config = loadConfig();
    assert.ok(Array.isArray(config.preferredAgents));
    assert.ok(config.trustedOwners.includes('vercel-labs'));
    assert.ok(config.trustedOwners.includes('codepuri'));
    assert.ok(!config.trustedOwners.includes('pproenca'));
    assert.ok(Array.isArray(config.customSources));
  });
});

describe('agent', () => {
  it('detectAgents finds the isolated Codex skills directory', () => {
    const agents = detectAgents();
    assert.ok(agents.some(agent => agent.name === 'Codex'));
  });

  it('resolveAgentPath expands the home directory inside the temp test sandbox', () => {
    const resolved = resolveAgentPath(TEST_AGENT, 'global');
    assert.equal(resolved, path.join(TEST_HOME, '.codex', 'skills'));
  });
});

describe('installer', () => {
  it('installs bundled original skills from the packaged skills directory', () => {
    const results = installSkillToAgents('auth-systems', [TEST_AGENT], 'global', { installMode: 'copy' });
    assert.ok(results.every(result => result.success), JSON.stringify(results));

    const installedPath = path.join(TEST_HOME, '.codex', 'skills', 'auth-systems.md');
    assert.ok(fs.existsSync(installedPath));
    assert.match(fs.readFileSync(installedPath, 'utf8'), /name:\s*auth-systems/);

    const cache = loadCache();
    assert.ok(cache.skills['auth-systems']);
    assert.ok(cache.skills['auth-systems'].agents.includes('codex'));
  });

  for (const entry of NEW_TOP_REPO_SKILLS) {
    it(`constructs the expected npx install command for ${entry.name}`, () => {
      withFakeNpx(logPath => {
        const results = installSkillToAgents(entry.name, [TEST_AGENT], 'global');
        assert.ok(results.every(result => result.success), JSON.stringify(results));
        const args = fs.readFileSync(logPath, 'utf8').trim().split('\n');
        assert.deepEqual(args, ['skills', 'add', entry.repo, '--skill', entry.name, '-g']);
      });
    });
  }
});

describe('registrar — rankSkillsForTask', () => {
  it('returns results sorted by descending score', () => {
    const results = rankSkillsForTask('react performance', new Set());
    assert.ok(results.length > 0);
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].score >= results[i].score);
    }
  });

  it('keeps vercel-react-best-practices highest for react performance', () => {
    const results = rankSkillsForTask('react performance', new Set());
    assert.equal(results[0].name, 'vercel-react-best-practices');
  });

  it('keeps auth-systems highest for login system tasks', () => {
    const results = rankSkillsForTask('build a login system with JWT', new Set());
    assert.equal(results[0].name, 'auth-systems');
  });

  for (const entry of NEW_TOP_REPO_SKILLS) {
    it(`surfaces ${entry.name} in the top results for its query`, () => {
      const results = rankSkillsForTask(entry.query, new Set());
      assert.ok(results.slice(0, 3).some(result => result.name === entry.name), JSON.stringify(results.slice(0, 3)));
    });
  }
});

describe('CLI: version & help', () => {
  it('--version returns the current version', () => {
    const result = cli(['--version']);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), VERSION);
  });

  it('--help shows the primary commands', () => {
    const result = cli(['--help']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /init/);
    assert.match(result.stdout, /add/);
    assert.match(result.stdout, /suggest/);
    assert.match(result.stdout, /list/);
    assert.match(result.stdout, /hook/);
    assert.match(result.stdout, /scan/);
  });

  it('unknown commands exit with code 1', () => {
    const result = cli(['unknown-cmd']);
    assert.equal(result.status, 1);
    assert.match(result.stdout + result.stderr, /Unknown command/);
  });
});

describe('CLI: hook', () => {
  it('returns shouldSuggest false for trivial tasks', () => {
    const result = cli(['hook', '--task', 'hi']);
    const json = jsonOutput(result.stdout);
    assert.equal(result.status, 0);
    assert.equal(json.shouldSuggest, false);
    assert.deepEqual(json.detectedSkills, []);
  });

  it('returns ranked skill names for substantial tasks', () => {
    const result = cli(['hook', '--task', 'build a login system']);
    const json = jsonOutput(result.stdout);
    assert.equal(result.status, 0);
    assert.equal(json.shouldSuggest, true);
    assert.ok(
      json.detectedSkills.includes('auth-systems')
      || json.detectedSkills.includes('react-patterns')
      || json.detectedSkills.includes('system-design'),
    );
  });
});

describe('CLI: config', () => {
  it('returns valid JSON', () => {
    const result = cli(['config']);
    const json = jsonOutput(result.stdout);
    assert.equal(result.status, 0);
    assert.ok(Array.isArray(json.preferredAgents));
    assert.ok(Array.isArray(json.trustedOwners));
    assert.ok(!json.trustedOwners.includes('pproenca'));
  });
});

describe('CLI: suggest', () => {
  it('requires a task', () => {
    const result = cli(['suggest']);
    assert.equal(result.status, 1);
    assert.match(result.stdout + result.stderr, /Usage/);
  });

  it('shows ranked matches for react performance', () => {
    const result = cli(['suggest', '--task', 'react performance']);
    assert.match(result.stdout, /Top matches:/);
    assert.match(result.stdout, /vercel-react-best-practices|react-patterns/);
  });

  it('supports offline ranking without requiring npx', () => {
    const result = cli(['suggest', '--task', 'frontend design', '--offline']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Top matches:/);
  });
});

describe('CLI: list', () => {
  it('shows the catalog and the new total count', () => {
    const result = cli(['list']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /skill-surge Catalog/);
    assert.match(result.stdout, /All Skills \(37 total\)/);
  });
});

describe('CLI: scan', () => {
  it('shows the dashboard and current catalog size', () => {
    const result = cli(['scan']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /DASHBOARD/);
    assert.match(result.stdout, /Skills Available/);
    assert.match(result.stdout, /\b37\b/);
  });
});

describe('auditor — detectProjectType', () => {
  it('detects Node.js from this repository', () => {
    const types = detectProjectType();
    assert.ok(Array.isArray(types));
    assert.ok(types.includes('Node.js'));
  });
});

describe('terminal', () => {
  it('box renders borders and content', () => {
    const result = box('Test', ['line1', 'line2']);
    assert.match(result, /┌/);
    assert.match(result, /│/);
    assert.match(result, /└/);
    assert.match(result, /Test/);
  });

  it('divider and header render terminal separators', () => {
    assert.match(divider(), /─/);
    assert.match(header('My Header'), /My Header/);
  });

  it('text helpers return strings containing the original content', () => {
    assert.match(T.text('hello'), /hello/);
    assert.match(T.green('ok'), /ok/);
    assert.match(T.red('error'), /error/);
    assert.match(T.accent('cmd'), /cmd/);
  });
});

describe('prompt', () => {
  it('clearLine does not throw', () => {
    assert.doesNotThrow(() => clearLine());
  });
});
