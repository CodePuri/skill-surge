import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(ROOT, 'scripts', 'automation', 'release.mjs');

describe('release orchestration script', () => {
  it('prints canary commands without executing them in dry-run mode', () => {
    const result = spawnSync('node', [SCRIPT, 'canary', '--dry-run'], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /npm ci/);
    assert.match(result.stdout, /npm test/);
    assert.match(result.stdout, /npm pack --dry-run/);
  });

  it('prints the package tag without creating it in dry-run mode', () => {
    const result = spawnSync('node', [SCRIPT, 'tag', '--version', '2.2.4', '--dry-run'], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /git tag -a v2\.2\.4/);
    assert.match(result.stdout, /git push origin v2\.2\.4/);
  });

  it('rejects a tag version that differs from package.json', () => {
    const result = spawnSync('node', [SCRIPT, 'tag', '--version', '9.9.9', '--dry-run'], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /does not match package version/i);
  });
});
