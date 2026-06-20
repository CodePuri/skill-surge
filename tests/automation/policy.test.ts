import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  isKillSwitchActive,
  isProtectedPath,
  loadAutomationConfig,
  redactSecrets,
  validateChangeScope,
} from '../../dist/automation/policy.js';

const validConfig = {
  schemaVersion: 1,
  selfImprove: {
    enabled: true,
    maxFixesPerCycle: 5,
    maxChangedFiles: 20,
    maxChangedLines: 1000,
    protectedPaths: ['.github/workflows/**', 'src/automation/platforms/**'],
  },
  publication: {
    enabled: true,
    maxRetries: 2,
    retryBackoffMs: 1000,
    platforms: { x: true, reddit: true, substack: true },
    maxPostsPerCycle: { x: 1, reddit: 1, substack: 1 },
    redditAllowlist: ['SideProject', 'opensource', 'ChatGPTCoding', 'ClaudeAI'],
  },
};

function withConfig(value: unknown, run: (file: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-policy-'));
  const file = path.join(dir, 'automation.json');
  fs.writeFileSync(file, JSON.stringify(value));
  try { run(file); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

describe('automation policy', () => {
  it('loads a valid versioned configuration', () => {
    withConfig(validConfig, file => {
      const config = loadAutomationConfig(file, {});
      assert.equal(config.schemaVersion, 1);
      assert.equal(config.selfImprove.maxFixesPerCycle, 5);
      assert.deepEqual(config.publication.redditAllowlist, validConfig.publication.redditAllowlist);
    });
  });

  it('fails closed for malformed configuration', () => {
    withConfig({ schemaVersion: 1, selfImprove: { enabled: true } }, file => {
      assert.throws(() => loadAutomationConfig(file, {}), /Invalid automation configuration/);
    });
  });

  it('applies boolean environment overrides', () => {
    withConfig(validConfig, file => {
      const config = loadAutomationConfig(file, {
        SKILL_SURGE_SELF_IMPROVE_ENABLED: 'false',
        SKILL_SURGE_PUBLISH_X_ENABLED: '0',
      });
      assert.equal(config.selfImprove.enabled, false);
      assert.equal(config.publication.platforms.x, false);
      assert.equal(config.publication.platforms.reddit, true);
    });
  });

  it('protects exact files and globbed directories', () => {
    const config = validConfig as any;
    assert.equal(isProtectedPath('.github/workflows/ci.yml', config), true);
    assert.equal(isProtectedPath('src/automation/platforms/x.ts', config), true);
    assert.equal(isProtectedPath('src/search.ts', config), false);
  });

  it('rejects changes beyond file or line limits', () => {
    const config = validConfig as any;
    assert.deepEqual(validateChangeScope(20, 1000, config), { allowed: true, reasons: [] });
    assert.deepEqual(validateChangeScope(21, 1001, config), {
      allowed: false,
      reasons: ['changed files 21 exceeds 20', 'changed lines 1001 exceeds 1000'],
    });
  });

  it('redacts named secrets and token-shaped values', () => {
    const output = redactSecrets(
      'Authorization: Bearer abcdefghijklmnopqrstuvwxyz token=secret-value',
      ['secret-value'],
    );
    assert.equal(output.includes('secret-value'), false);
    assert.match(output, /\[REDACTED\]/);
  });

  it('detects global and job-specific pause files', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-pause-'));
    try {
      assert.equal(isKillSwitchActive('publish', dir), false);
      fs.writeFileSync(path.join(dir, 'PAUSE_PUBLISH'), '');
      assert.equal(isKillSwitchActive('publish', dir), true);
      assert.equal(isKillSwitchActive('self-improve', dir), false);
      fs.writeFileSync(path.join(dir, 'PAUSE_ALL'), '');
      assert.equal(isKillSwitchActive('self-improve', dir), true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
