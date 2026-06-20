import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../scripts/automation/secret-scan.mjs');

function fixture(content: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-secret-scan-'));
  fs.writeFileSync(path.join(dir, 'example.env'), content);
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

describe('secret scanner', () => {
  it('allows empty credential templates on adjacent lines', () => {
    const f = fixture([
      'X_CLIENT_SECRET=',
      'X_REFRESH_TOKEN=',
      'REDDIT_CLIENT_SECRET=',
      'REDDIT_REFRESH_TOKEN=',
      'SUBSTACK_PUBLICATION_URL=',
      'SUBSTACK_STORAGE_STATE=~/.config/skill-surge/state.json',
      'const apiKey = process.env.MYAPP_API_KEY;',
    ].join('\n'));
    try {
      const result = spawnSync('node', [SCRIPT], { cwd: f.dir, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    } finally { f.cleanup(); }
  });

  it('rejects populated token-shaped credentials', () => {
    const f = fixture(`CLIENT_SECRET=${'a'.repeat(32)}\n`);
    try {
      const result = spawnSync('node', [SCRIPT], { cwd: f.dir, encoding: 'utf8' });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Potential secrets found/);
    } finally { f.cleanup(); }
  });
});
