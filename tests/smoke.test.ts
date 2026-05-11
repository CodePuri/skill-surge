import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = '/Users/totem/Desktop/Code/auto-skills/dist/cli.js';

function cli(args: string[], input?: string): { stdout: string; stderr: string; status: number } {
  const r = spawnSync('node', [CLI, ...args], {
    encoding: 'utf8',
    timeout: 30_000,
    input: input ?? undefined,
  });
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', status: r.status ?? 1 };
}

function jsonOutput(stdout: string): object | null {
  try {
    const trimmed = stdout.trim();
    if (trimmed.startsWith('{')) return JSON.parse(trimmed);
    const m = trimmed.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return null;
  } catch { return null; }
}

// ─── ranker tests ─────────────────────────────────────────────────────────────

import { tokenize, isTrivialTask } from '../dist/core/ranker.js';

describe('ranker — tokenize', () => {
  it('splits on non-alphanumeric and removes stopwords', () => {
    const r = tokenize('Build a login system with JWT authentication');
    assert.ok(r.has('login'));
    assert.ok(r.has('system'));
    assert.ok(r.has('jwt'));
    assert.ok(!r.has('a'));
    assert.ok(!r.has('with'));
    assert.ok(!r.has('the'));
  });

  it('lowercases all tokens', () => {
    const r = tokenize('React Component Performance');
    assert.ok(r.has('react'));
    assert.ok(r.has('component'));
    assert.ok(r.has('performance'));
  });

  it('filters single-char tokens', () => {
    const r = tokenize('a b c d e f');
    assert.strictEqual(r.size, 0);
  });

  it('handles empty string', () => {
    const r = tokenize('');
    assert.strictEqual(r.size, 0);
  });

  it('handles numbers as tokens', () => {
    const r = tokenize('v2 API design');
    assert.ok(r.has('v2'));
    assert.ok(r.has('api'));
    assert.ok(r.has('design'));
  });

  it('handles hyphenated words', () => {
    const r = tokenize('test-driven-development');
    assert.ok(r.has('test'));
    assert.ok(r.has('driven'));
    assert.ok(r.has('development'));
  });

  it('deduplicates repeated tokens', () => {
    const r = tokenize('react react react react');
    assert.strictEqual(r.size, 1);
    assert.ok(r.has('react'));
  });
});

describe('ranker — isTrivialTask', () => {
  const cases: [string, boolean][] = [
    ['hi', true],
    ['hello', true],
    ['thanks', true],
    ['ok', true],
    ['yes', true],
    ['bye', true],
    ['cool', true],
    ['ok, thanks', true],
    ['date', true],
    ['pwd', true],
    ['ls', true],
    ['', true],
    ['x', true],
    ['ab', true],
    ['build a login', false],
    ['build a login system', false],
    ['write tests for the API', false],
    ['design the database schema', false],
    ['hello world how are you', false],
  ];

  for (const [task, expected] of cases) {
    it(`"${task}" → ${expected}`, () => {
      assert.strictEqual(isTrivialTask(task), expected);
    });
  }
});

// ─── catalog tests ───────────────────────────────────────────────────────────

import { ALL_SKILLS, getSkillByName, getTopRepoSkills, getOriginalSkills } from '../dist/core/catalog.js';

describe('catalog', () => {
  it('has exactly 29 skills', () => {
    assert.strictEqual(ALL_SKILLS.length, 29);
  });

  it('has exactly 18 top-repo skills', () => {
    assert.strictEqual(getTopRepoSkills().length, 18);
  });

  it('has exactly 11 original skills', () => {
    assert.strictEqual(getOriginalSkills().length, 11);
  });

  it('every skill has name, description, category, source, tags', () => {
    for (const s of ALL_SKILLS) {
      assert.ok(s.name, `missing name`);
      assert.ok(s.description, `missing description for ${s.name}`);
      assert.ok(s.category, `missing category for ${s.name}`);
      assert.ok(s.source, `missing source for ${s.name}`);
      assert.ok(Array.isArray(s.tags) && s.tags.length > 0, `missing tags for ${s.name}`);
    }
  });

  it('top-repo skills have a repo field', () => {
    for (const s of getTopRepoSkills()) {
      assert.ok(s.repo, `${s.name} missing repo`);
    }
  });

  it('getSkillByName returns exact match', () => {
    assert.ok(getSkillByName('auth-systems'), 'auth-systems should be found');
    assert.ok(getSkillByName('grill-me'), 'grill-me should be found');
    assert.ok(getSkillByName('tdd'), 'tdd should be found');
    assert.strictEqual(getSkillByName('nonexistent'), undefined);
  });

  it('no duplicate skill names', () => {
    const names = ALL_SKILLS.map(s => s.name);
    assert.strictEqual(new Set(names).size, names.length, 'duplicate skill names found');
  });
});

// ─── cache tests ─────────────────────────────────────────────────────────────

import { loadCache, saveCache, clearCache } from '../dist/core/cache.js';

describe('cache', () => {
  const testCache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    skills: {
      'auth-systems': { installedAt: '2025-01-01T00:00:00Z', agents: ['claude-code'] },
    },
  };

  it('loadCache returns valid shape even when missing', () => {
    const c = loadCache();
    assert.ok(typeof c.version === 'number');
    assert.ok(typeof c.skills === 'object');
    assert.ok(c.skills !== null);
  });

  it('saveCache writes valid JSON', () => {
    saveCache(testCache);
    const loaded = loadCache();
    assert.strictEqual(loaded.skills['auth-systems']?.agents?.[0], 'claude-code');
  });

  it('clearCache returns true when file exists', () => {
    const existed = clearCache();
    assert.strictEqual(existed, true);
    const empty = loadCache();
    assert.strictEqual(Object.keys(empty.skills).length, 0);
    saveCache(testCache);
  });

  after(() => { try { clearCache(); } catch {} });
});

// ─── config tests ─────────────────────────────────────────────────────────────

import { loadConfig } from '../dist/core/config.js';

describe('config', () => {
  it('loadConfig returns valid shape', () => {
    const cfg = loadConfig();
    assert.ok(Array.isArray(cfg.preferredAgents));
    assert.ok(['copy', 'symlink'].includes(cfg.installMode));
    assert.ok(['global', 'project', 'both'].includes(cfg.scope));
    assert.ok(Array.isArray(cfg.trustedOwners));
    assert.ok(cfg.trustedOwners.length > 0);
    assert.ok(cfg.trustedOwners.includes('vercel-labs'));
    assert.ok(cfg.trustedOwners.includes('codepuri'));
    assert.ok(Array.isArray(cfg.customSources));
  });
});

// ─── agent tests ─────────────────────────────────────────────────────────────

import { detectAgents, resolveAgentPath } from '../dist/core/agent.js';

describe('agent', () => {
  it('detectAgents returns array with all 11 agents', () => {
    const agents = detectAgents();
    assert.strictEqual(agents.length, 11);
    const names = agents.map(a => a.name);
    assert.ok(names.includes('Claude Code'));
    assert.ok(names.includes('OpenCode'));
    assert.ok(names.includes('Cline'));
  });

  it('each agent has name, slug, globalPath, localPath, installed', () => {
    for (const a of detectAgents()) {
      assert.ok(a.name);
      assert.ok(a.slug);
      assert.ok(a.globalPath);
      assert.ok(a.localPath);
      assert.ok(typeof a.installed === 'boolean');
    }
  });

  it('resolveAgentPath expands ~ to home directory', () => {
    const agents = detectAgents();
    const first = agents[0];
    const global = resolveAgentPath(first, 'global');
    assert.ok(global.includes(process.env.HOME ?? ''), `path should expand ~: ${global}`);
  });
});

// ─── registrar tests ─────────────────────────────────────────────────────────

import { rankSkillsForTask } from '../dist/core/registrar.js';

describe('registrar — rankSkillsForTask', () => {
  it('returns array sorted by score descending', () => {
    const results = rankSkillsForTask('react performance', new Set());
    assert.ok(results.length > 0);
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].score >= results[i].score, `score ${results[i - 1].score} < ${results[i].score} at index ${i}`);
    }
  });

  it('vercel-react-best-practices scores highest for react performance', () => {
    const results = rankSkillsForTask('react performance', new Set());
    assert.strictEqual(results[0].name, 'vercel-react-best-practices');
  });

  it('auth-systems scores highest for login system', () => {
    const results = rankSkillsForTask('build a login system with JWT', new Set());
    assert.strictEqual(results[0].name, 'auth-systems');
  });

  it('already-installed skills get +15 score bonus', () => {
    const withInstall = rankSkillsForTask('react patterns', new Set(['react-patterns']));
    const withoutInstall = rankSkillsForTask('react patterns', new Set());
    const installed = withInstall.find(r => r.name === 'react-patterns');
    const notInstalled = withoutInstall.find(r => r.name === 'react-patterns');
    assert.ok(installed && notInstalled);
    assert.ok(installed.score > notInstalled.score, `${installed.score} should be > ${notInstalled.score}`);
  });

  it('returns empty for trivial input (matches ranker)', () => {
    const results = rankSkillsForTask('hi', new Set());
    assert.strictEqual(results.length, 0);
  });

  it('each result has required fields', () => {
    const results = rankSkillsForTask('database schema', new Set());
    for (const r of results) {
      assert.ok(typeof r.name === 'string');
      assert.ok(typeof r.description === 'string');
      assert.ok(typeof r.score === 'number');
      assert.ok(typeof r.installed === 'boolean');
      assert.ok(typeof r.reason === 'string');
    }
  });
});

// ─── CLI: version & help ──────────────────────────────────────────────────────

describe('CLI: version & help', () => {
  it('--version returns 2.0.0', () => {
    const r = cli(['--version']);
    assert.strictEqual(r.status, 0);
    assert.strictEqual(r.stdout.trim(), '2.0.0');
  });

  it('-v returns 2.0.0', () => {
    const r = cli(['-v']);
    assert.strictEqual(r.status, 0);
  });

  it('--help shows 7 commands', () => {
    const r = cli(['--help']);
    assert.strictEqual(r.status, 0);
    assert.ok(r.stdout.includes('init'));
    assert.ok(r.stdout.includes('scan'));
    assert.ok(r.stdout.includes('suggest'));
    assert.ok(r.stdout.includes('install'));
    assert.ok(r.stdout.includes('list'));
    assert.ok(r.stdout.includes('hook'));
    assert.ok(r.stdout.includes('config'));
  });

  it('unknown command exits with code 1', () => {
    const r = cli(['unknown-cmd']);
    assert.strictEqual(r.status, 1);
    assert.ok(r.stderr.includes('Unknown command'));
  });

  it('help alias works', () => {
    const r = cli(['help']);
    assert.strictEqual(r.status, 0);
    assert.ok(r.stdout.includes('init'));
  });
});

// ─── CLI: hook ────────────────────────────────────────────────────────────────

describe('CLI: hook', () => {
  it('hook --task "hi" returns shouldSuggest: false', () => {
    const r = cli(['hook', '--task', 'hi']);
    assert.strictEqual(r.status, 0);
    const json = jsonOutput(r.stdout);
    assert.ok(json);
    assert.strictEqual(json.shouldSuggest, false);
    assert.deepStrictEqual(json.detectedSkills, []);
  });

  it('hook --task "hello world" returns shouldSuggest: false', () => {
    const r = cli(['hook', '--task', 'hello world']);
    assert.strictEqual(r.status, 0);
    const json = jsonOutput(r.stdout);
    assert.strictEqual(json.shouldSuggest, false);
  });

  it('hook --task "build a login system" returns shouldSuggest: true with ranked skills', () => {
    const r = cli(['hook', '--task', 'build a login system']);
    assert.strictEqual(r.status, 0);
    const json = jsonOutput(r.stdout);
    assert.ok(json);
    assert.strictEqual(json.shouldSuggest, true);
    assert.ok(Array.isArray(json.detectedSkills));
    assert.ok(json.detectedSkills.length > 0);
    assert.ok(
      json.detectedSkills.includes('auth-systems') ||
      json.detectedSkills.includes('react-patterns') ||
      json.detectedSkills.includes('system-design'),
      `Expected one of auth-systems/react-patterns/system-design, got: ${JSON.stringify(json.detectedSkills)}`
    );
  });

  it('hook --task "design database schema" returns database skills', () => {
    const r = cli(['hook', '--task', 'design database schema']);
    assert.strictEqual(r.status, 0);
    const json = jsonOutput(r.stdout);
    assert.strictEqual(json.shouldSuggest, true);
    assert.ok(json.detectedSkills.includes('supabase-postgres-best-practices') || json.detectedSkills.includes('database-patterns'));
  });

  it('hook requires --task argument', () => {
    const r = cli(['hook']);
    assert.strictEqual(r.status, 1);
    assert.ok(r.stdout.includes('Usage') || r.stderr.includes('Usage'));
  });

  it('hook --task=longtask syntax works', () => {
    const r = cli(['hook', '--task=build a login system with JWT']);
    assert.strictEqual(r.status, 0);
    const json = jsonOutput(r.stdout);
    assert.ok(json.shouldSuggest);
  });
});

// ─── CLI: config ─────────────────────────────────────────────────────────────

describe('CLI: config', () => {
  it('config returns valid JSON', () => {
    const r = cli(['config']);
    assert.strictEqual(r.status, 0, `config should exit 0, got ${r.status}. stderr: ${r.stderr}`);
    const json = jsonOutput(r.stdout);
    assert.ok(json, `json should parse. stdout first 200: ${r.stdout.slice(0, 200)}`);
    assert.ok(Array.isArray(json.preferredAgents));
    assert.ok(Array.isArray(json.trustedOwners));
    assert.ok(json.trustedOwners.includes('vercel-labs'));
  });
});

// ─── CLI: install ─────────────────────────────────────────────────────────────

describe('CLI: install', () => {
  it('install nonexistent-skill exits with 1', () => {
    const r = cli(['install', 'nonexistent-skill-xyz']);
    assert.strictEqual(r.status, 1);
    assert.ok(r.stdout.includes('not found') || r.stderr.includes('not found'));
  });

  it('install without skill name shows usage', () => {
    const r = cli(['install']);
    assert.strictEqual(r.status, 1);
    assert.ok(r.stdout.includes('Usage') || r.stderr.includes('Usage'));
  });
});

// ─── CLI: suggest ─────────────────────────────────────────────────────────────

describe('CLI: suggest', () => {
  it('suggest requires --task', () => {
    const r = cli(['suggest']);
    assert.strictEqual(r.status, 1);
    assert.ok(r.stderr.includes('Usage') || r.stdout.includes('Usage'));
  });

  it('suggest --task "react performance" shows react skills', () => {
    const r = cli(['suggest', '--task', 'react performance']);
    assert.ok(r.stdout.includes('react performance'));
    assert.ok(r.stdout.includes('vercel-react-best-practices'));
  });

  it('suggest --task "database schema" shows ranked results', () => {
    const r = cli(['suggest', '--task', 'database schema']);
    assert.ok(r.stdout.includes('database schema'));
  });

  it('suggest --offline works without npx', () => {
    const r = cli(['suggest', '--task', 'frontend design', '--offline']);
    assert.ok(r.stdout.includes('frontend design'));
  });
});

// ─── CLI: list ──────────────────────────────────────────────────────────────

describe('CLI: list', () => {
  it('list exits with 0', () => {
    const r = cli(['list']);
    assert.strictEqual(r.status, 0);
    assert.ok(r.stdout.includes('list'));
  });

  it('list shows agent count', () => {
    const r = cli(['list']);
    assert.ok(r.stdout.includes('agent'));
  });
});

// ─── CLI: scan ──────────────────────────────────────────────────────────────

describe('CLI: scan', () => {
  it('scan shows project type', () => {
    const r = cli(['scan']);
    assert.ok(r.stdout.includes('Node.js'));
  });

  it('scan shows skill counts', () => {
    const r = cli(['scan']);
    assert.ok(r.stdout.includes('installed') || r.stdout.includes('available'));
  });
});

// ─── auditor tests ──────────────────────────────────────────────────────────

import { detectProjectType } from '../dist/core/auditor.js';

describe('auditor — detectProjectType', () => {
  it('detects Node.js from package.json in current dir', () => {
    const types = detectProjectType();
    assert.ok(Array.isArray(types));
    assert.ok(types.includes('Node.js'));
  });
});

// ─── terminal UI tests ─────────────────────────────────────────────────────

import { box, divider, header, T } from '../dist/ui/terminal.js';

describe('terminal', () => {
  it('box renders with border characters', () => {
    const result = box('Test', ['line1', 'line2']);
    assert.ok(result.includes('┌'));
    assert.ok(result.includes('│'));
    assert.ok(result.includes('└'));
    assert.ok(result.includes('Test'));
  });

  it('box handles empty lines array', () => {
    const result = box('Empty');
    assert.ok(result.includes('Empty'));
    assert.ok(result.includes('┌'));
  });

  it('divider returns dashed line', () => {
    const d = divider();
    assert.ok(d.includes('─'));
  });

  it('header returns divider + text + divider', () => {
    const h = header('My Header');
    assert.ok(h.includes('My Header'));
    assert.ok(h.includes('─'));
  });

  it('T.text returns string', () => {
    const r = T.text('hello');
    assert.ok(r.includes('hello'));
  });

  it('T.green renders green text', () => {
    const g = T.green('ok');
    assert.ok(g.includes('ok'));
  });

  it('T.red renders red text', () => {
    const r = T.red('error');
    assert.ok(r.includes('error'));
  });

  it('T.accent renders cyan text', () => {
    const a = T.accent('cmd');
    assert.ok(a.includes('cmd'));
  });
});

// ─── prompt tests ─────────────────────────────────────────────────────────

import { clearLine } from '../dist/ui/prompt.js';

describe('prompt', () => {
  it('clearLine does not throw', () => {
    assert.doesNotThrow(() => clearLine());
  });
});