import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { refreshSkills } from '../../dist/automation/refresh.js';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-refresh-'));
  const skills = path.join(root, 'skills');
  const skill = path.join(skills, 'example');
  const cachePath = path.join(root, 'cache', 'refresh.json');
  fs.mkdirSync(skill, { recursive: true });
  fs.writeFileSync(path.join(skill, 'SKILL.md'), '---\nname: example\ndescription: Example skill\n---\nBody\n');
  return { root, skills, skill, cachePath };
}

describe('refreshSkills', () => {
  it('indexes local SKILL.md files and reports additions', async () => {
    const f = fixture();
    try {
      const report = await refreshSkills({
        network: false,
        cachePath: f.cachePath,
        localRoots: [f.skills],
        remoteRepos: [],
        sourceSha: 'abc123',
        now: new Date('2026-06-20T00:00:00Z'),
      });
      assert.equal(report.localSkills.length, 1);
      assert.equal(report.localSkills[0].name, 'example');
      assert.equal(report.added.length, 1);
      assert.equal(report.changed.length, 0);
      assert.equal(fs.existsSync(f.cachePath), true);
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  });

  it('reports changed skills on a subsequent refresh', async () => {
    const f = fixture();
    try {
      const options = {
        network: false,
        cachePath: f.cachePath,
        localRoots: [f.skills],
        remoteRepos: [],
        sourceSha: 'abc123',
        now: new Date('2026-06-20T00:00:00Z'),
      };
      await refreshSkills(options);
      fs.appendFileSync(path.join(f.skill, 'SKILL.md'), 'Changed\n');
      const report = await refreshSkills({ ...options, now: new Date('2026-06-21T00:00:00Z') });
      assert.equal(report.added.length, 0);
      assert.equal(report.changed.length, 1);
      assert.equal(report.changed[0].name, 'example');
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  });

  it('recovers from a corrupt cache without throwing', async () => {
    const f = fixture();
    try {
      fs.mkdirSync(path.dirname(f.cachePath), { recursive: true });
      fs.writeFileSync(f.cachePath, '{broken');
      const report = await refreshSkills({
        network: false,
        cachePath: f.cachePath,
        localRoots: [f.skills],
        remoteRepos: [],
        sourceSha: 'abc123',
      });
      assert.equal(report.added.length, 1);
      assert.doesNotThrow(() => JSON.parse(fs.readFileSync(f.cachePath, 'utf8')));
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  });

  it('records remote inspection failures without losing local results', async () => {
    const f = fixture();
    try {
      const report = await refreshSkills({
        network: true,
        cachePath: f.cachePath,
        localRoots: [f.skills],
        remoteRepos: ['trusted/example'],
        sourceSha: 'abc123',
        inspectRemote: async () => { throw new Error('network unavailable'); },
      });
      assert.equal(report.localSkills.length, 1);
      assert.deepEqual(report.remoteSources, [{
        repo: 'trusted/example',
        inspected: false,
        error: 'network unavailable',
      }]);
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  });
});
