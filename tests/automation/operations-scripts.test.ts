import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('automation operations scripts', () => {
  it('runs an offline preflight without platform credentials', () => {
    const result = spawnSync('node', ['scripts/automation/preflight.mjs', '--offline', '--allow-missing-credentials'], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, HOME: path.join(ROOT, '.test-home') },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /policy configuration: ok/i);
    assert.match(result.stdout, /credentials: skipped/i);
  });

  it('runs an end-to-end publication dry-run with no outbound writes', () => {
    const result = spawnSync('node', ['scripts/automation/dry-run.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, HOME: path.join(ROOT, '.test-home') },
    });
    assert.equal(result.status, 0, result.stderr);
    const marker = result.stdout.indexOf('[');
    const payload = JSON.parse(result.stdout.slice(marker));
    assert.equal(payload.length, 3);
    assert.equal(payload.every((item: any) => item.status === 'skipped' && item.error === 'dry-run'), true);
  });
});
