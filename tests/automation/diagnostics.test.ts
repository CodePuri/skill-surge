import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectDiagnostics } from '../../dist/automation/diagnostics.js';
import type { RefreshReport } from '../../dist/automation/contracts.js';

const refreshReport: RefreshReport = {
  schemaVersion: 1,
  cycleId: '2026-W25',
  createdAt: '2026-06-20T00:00:00.000Z',
  sourceSha: 'abc123',
  contentHash: 'hash',
  idempotencyKey: 'key',
  network: true,
  cachePath: '/tmp/cache.json',
  localSkills: [],
  remoteSources: [],
  added: [{ name: 'new-skill', source: 'trusted/repo', hash: 'new' }],
  changed: [],
  removed: [],
};

describe('collectDiagnostics', () => {
  it('turns failed verification commands into eligible findings', async () => {
    const findings = await collectDiagnostics({
      refreshReport,
      commands: [{ name: 'test', command: 'npm test' }],
      runCommand: async () => ({ status: 1, stdout: '', stderr: 'one test failed' }),
      githubIssues: [],
      modelFindings: [],
    });
    const failedTest = findings.find(finding => finding.source === 'test');
    assert.equal(failedTest?.eligible, true);
    assert.equal(failedTest?.reproductionCommand, 'npm test');
    assert.match(failedTest?.evidence ?? '', /one test failed/);
  });

  it('reports catalog drift as a reproducible finding', async () => {
    const findings = await collectDiagnostics({
      refreshReport,
      commands: [],
      runCommand: async () => ({ status: 0, stdout: '', stderr: '' }),
      githubIssues: [],
      modelFindings: [],
    });
    const catalog = findings.find(finding => finding.source === 'catalog');
    assert.equal(catalog?.eligible, true);
    assert.match(catalog?.evidence ?? '', /new-skill/);
  });

  it('blocks model findings without a reproduction command', async () => {
    const findings = await collectDiagnostics({
      refreshReport: { ...refreshReport, added: [] },
      commands: [],
      runCommand: async () => ({ status: 0, stdout: '', stderr: '' }),
      githubIssues: [],
      modelFindings: [{ title: 'Possible bug', evidence: 'Static suspicion' }],
    });
    assert.equal(findings[0].source, 'model');
    assert.equal(findings[0].eligible, false);
    assert.equal(findings[0].blockedReason, 'missing deterministic reproduction command');
  });

  it('requires GitHub bug issues to include reproduction evidence', async () => {
    const findings = await collectDiagnostics({
      refreshReport: { ...refreshReport, added: [] },
      commands: [],
      runCommand: async () => ({ status: 0, stdout: '', stderr: '' }),
      githubIssues: [{ number: 7, title: 'CLI crashes', body: 'No steps yet', labels: ['bug'] }],
      modelFindings: [],
    });
    assert.equal(findings[0].source, 'github');
    assert.equal(findings[0].eligible, false);
    assert.match(findings[0].blockedReason ?? '', /reproduction/i);
  });
});
