import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GithubLedger,
  decodeLedgerComment,
  encodeLedgerComment,
  validateReleaseRecord,
} from '../../dist/automation/github-ledger.js';
import type { PublicationResult, ReleaseRecord } from '../../dist/automation/contracts.js';

const release: ReleaseRecord = {
  schemaVersion: 1,
  cycleId: '2026-W25',
  createdAt: '2026-06-20T00:00:00.000Z',
  sourceSha: 'abc123',
  contentHash: 'release-hash',
  idempotencyKey: 'release-key',
  releaseType: 'ecosystem-digest',
  summary: 'Trusted skill metadata changed.',
  evidence: ['refresh report hash: refresh-hash'],
  pullRequests: [],
  verification: [],
  novelInsights: ['One new trusted skill was discovered.'],
};

const publication: PublicationResult = {
  schemaVersion: 1,
  cycleId: '2026-W25',
  createdAt: '2026-06-20T06:00:00.000Z',
  sourceSha: 'abc123',
  contentHash: 'publication-hash',
  idempotencyKey: 'publication-key',
  platform: 'x',
  status: 'published',
  externalId: '123',
  url: 'https://x.com/example/status/123',
};

describe('GitHub cycle ledger', () => {
  it('validates a complete release record', () => {
    assert.deepEqual(validateReleaseRecord(release), release);
  });

  it('rejects release records without novel evidence', () => {
    assert.throws(
      () => validateReleaseRecord({ ...release, evidence: [], novelInsights: [] }),
      /release evidence/i,
    );
  });

  it('round-trips typed ledger comments', () => {
    const encoded = encodeLedgerComment('publication-result', publication);
    assert.match(encoded, /skill-surge:publication-result:v1:publication-key/);
    assert.deepEqual(decodeLedgerComment(encoded, 'publication-result'), publication);
  });

  it('ignores unrelated or malformed comments', () => {
    assert.equal(decodeLedgerComment('ordinary comment', 'release-record'), undefined);
    assert.equal(decodeLedgerComment('<!-- skill-surge:release-record:v1:key -->\n```json\n{bad}\n```', 'release-record'), undefined);
  });

  it('does not append a duplicate idempotency key', async () => {
    const calls: string[][] = [];
    const ledger = new GithubLedger({
      repo: 'CodePuri/skill-surge',
      runGh: async args => {
        calls.push(args);
        if (args.includes('--json')) return { status: 0, stdout: JSON.stringify({ comments: [{ body: encodeLedgerComment('publication-result', publication) }] }), stderr: '' };
        return { status: 0, stdout: '', stderr: '' };
      },
    });
    const appended = await ledger.appendTypedComment(12, 'publication-result', publication);
    assert.equal(appended, false);
    assert.equal(calls.some(args => args.includes('--body')), false);
  });

  it('appends a new typed comment exactly once', async () => {
    const calls: string[][] = [];
    const ledger = new GithubLedger({
      repo: 'CodePuri/skill-surge',
      runGh: async args => {
        calls.push(args);
        if (args.includes('--json')) return { status: 0, stdout: JSON.stringify({ comments: [] }), stderr: '' };
        return { status: 0, stdout: '', stderr: '' };
      },
    });
    const appended = await ledger.appendTypedComment(12, 'release-record', release);
    assert.equal(appended, true);
    const commentCall = calls.find(args => args.includes('--body'));
    assert.ok(commentCall);
    assert.match(commentCall?.at(-1) ?? '', /release-key/);
  });
});
