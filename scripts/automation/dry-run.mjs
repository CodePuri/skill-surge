#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-dry-run-'));
const bundle = {
  schemaVersion: 1,
  cycleId: 'dry-run',
  createdAt: new Date().toISOString(),
  sourceSha: 'dry-run',
  contentHash: crypto.createHash('sha256').update('dry-run-bundle').digest('hex'),
  idempotencyKey: 'dry-run-bundle',
  releaseRecordHash: 'dry-run-release',
  format: 'tutorial',
  hooks: ['A safer refresh', 'What changed this week', 'One reproducible improvement'],
  evidence: ['Dry-run validation only; no claims are published.'],
  platforms: {
    substack: { title: 'Dry-run weekly edition', body: 'This validates the publication pipeline without network writes.' },
    x: { title: 'Dry-run update', body: 'This validates the publication pipeline without network writes.' },
    reddit: { title: 'Dry-run technical update', body: 'This validates the publication pipeline without network writes.' },
  },
};
const file = path.join(temporary, 'bundle.json');
fs.writeFileSync(file, JSON.stringify(bundle));
try {
  const result = spawnSync('node', ['dist/cli.js', 'automation', 'publish', file, '--dry-run'], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    env: { ...process.env, HOME: temporary },
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exitCode = result.status ?? 1;
  } else {
    process.stdout.write(result.stdout);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
