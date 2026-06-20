import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist/cli.js');

function releaseFile(value: unknown): { file: string; cleanup: () => void } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-release-'));
  const file = path.join(dir, 'release.json');
  fs.writeFileSync(file, JSON.stringify(value));
  return { file, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

const validRelease = {
  schemaVersion: 1,
  cycleId: '2026-W25',
  createdAt: '2026-06-20T00:00:00.000Z',
  sourceSha: 'abc123',
  contentHash: 'hash',
  idempotencyKey: 'key',
  releaseType: 'ecosystem-digest',
  summary: 'Weekly digest',
  evidence: ['verified refresh'],
  pullRequests: [],
  verification: [],
  novelInsights: ['A trusted skill changed.'],
};

const validBundle = {
  schemaVersion: 1,
  cycleId: '2026-W25',
  createdAt: '2026-06-20T06:00:00.000Z',
  sourceSha: 'abc123',
  contentHash: 'bundle-hash',
  idempotencyKey: 'bundle-key',
  releaseRecordHash: 'release-hash',
  format: 'tutorial',
  hooks: ['A safer refresh', 'What changed this week', 'One reproducible improvement'],
  evidence: ['106 tests passed'],
  platforms: {
    x: { title: 'Update', body: 'Evidence-backed update.' },
    reddit: { title: 'Technical update', body: 'Evidence and implementation.' },
    substack: { title: 'Weekly edition', body: 'Evidence and implementation.' },
  },
};

describe('automation CLI', () => {
  it('validates a release artifact', () => {
    const fixture = releaseFile(validRelease);
    try {
      const result = spawnSync('node', [CLI, 'automation', 'validate-release', fixture.file], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /valid/i);
    } finally { fixture.cleanup(); }
  });

  it('rejects an invalid release artifact', () => {
    const fixture = releaseFile({ ...validRelease, evidence: [], novelInsights: [] });
    try {
      const result = spawnSync('node', [CLI, 'automation', 'validate-release', fixture.file], { encoding: 'utf8' });
      assert.equal(result.status, 1);
      assert.match(`${result.stdout}${result.stderr}`, /release evidence/i);
    } finally { fixture.cleanup(); }
  });

  it('validates a publication dry-run without credentials or network', () => {
    const fixture = releaseFile(validBundle);
    try {
      const result = spawnSync('node', [CLI, 'automation', 'publish', fixture.file, '--dry-run'], {
        encoding: 'utf8',
        env: { ...process.env, HOME: path.dirname(fixture.file) },
      });
      assert.equal(result.status, 0, result.stderr);
      const payload = JSON.parse(result.stdout);
      assert.equal(payload.every((item: any) => item.status === 'skipped' && item.error === 'dry-run'), true);
    } finally { fixture.cleanup(); }
  });
});
