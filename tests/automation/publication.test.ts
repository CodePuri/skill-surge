import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addUtmParameters,
  publishBundle,
  renderSocialCard,
  selectContentFormat,
  validatePublicationBundle,
} from '../../dist/automation/publication.js';
import type { PublicationBundle, PublicationResult } from '../../dist/automation/contracts.js';

const bundle: PublicationBundle = {
  schemaVersion: 1,
  cycleId: '2026-W25',
  createdAt: '2026-06-20T06:00:00.000Z',
  sourceSha: 'abc123',
  contentHash: 'bundle-hash',
  idempotencyKey: 'bundle-key',
  releaseRecordHash: 'release-hash',
  canonicalUrl: 'https://example.substack.com/p/week-25?utm_source=substack&utm_medium=owned&utm_campaign=2026-W25',
  format: 'tutorial',
  hooks: ['A safer skill refresh', 'What changed this week', 'One reproducible CLI improvement'],
  evidence: ['93 tests passed', 'Refresh report hash abc'],
  platforms: {
    x: { title: 'Weekly update', body: 'A safer skill refresh.\n\nhttps://example.com?utm_source=x&utm_medium=social&utm_campaign=2026-W25' },
    reddit: { title: 'How we made skill refresh safer', body: 'Implementation details and evidence.\n\nhttps://example.com?utm_source=reddit&utm_medium=community&utm_campaign=2026-W25' },
    substack: { title: 'A safer weekly skill refresh', body: 'Evidence: 93 tests passed. Here is the implementation.' },
  },
};

describe('publication bundle policy', () => {
  it('accepts an evidence-backed platform bundle', () => {
    assert.deepEqual(validatePublicationBundle(bundle), bundle);
  });

  it('rejects unsupported viral promises', () => {
    assert.throws(
      () => validatePublicationBundle({ ...bundle, platforms: { ...bundle.platforms, x: { title: 'Guaranteed virality', body: 'Best ever.' } } }),
      /prohibited growth language/i,
    );
  });

  it('requires three distinct hooks and evidence', () => {
    assert.throws(() => validatePublicationBundle({ ...bundle, hooks: ['one'], evidence: [] }), /three distinct hooks/i);
  });

  it('adds stable platform UTM parameters', () => {
    assert.equal(
      addUtmParameters('https://github.com/CodePuri/skill-surge', 'x', '2026-W25'),
      'https://github.com/CodePuri/skill-surge?utm_source=x&utm_medium=social&utm_campaign=2026-W25',
    );
  });

  it('renders a deterministic escaped social card', () => {
    const unsafe = { ...bundle, platforms: { ...bundle.platforms, substack: { ...bundle.platforms.substack, title: '<script>Weekly & safe</script>' } } };
    const first = renderSocialCard(unsafe);
    const second = renderSocialCard(unsafe);
    assert.equal(first, second);
    assert.equal(first.includes('<script>'), false);
    assert.match(first, /&lt;script&gt;Weekly &amp; safe/);
    assert.match(first, /2026-W25/);
  });

  it('rotates four formats for the first four cycles', () => {
    assert.deepEqual([1, 2, 3, 4].map(cycle => selectContentFormat(cycle, {}, () => 0)), [
      'tutorial', 'before-after', 'benchmark', 'release-story',
    ]);
  });

  it('uses the strongest format for the 70 percent path after cycle four', () => {
    const format = selectContentFormat(5, { tutorial: 2, benchmark: 8, 'before-after': 4, 'release-story': 1 }, () => 0.69);
    assert.equal(format, 'benchmark');
  });

  it('explores a non-winning format for the 30 percent path', () => {
    const format = selectContentFormat(5, { tutorial: 2, benchmark: 8, 'before-after': 4, 'release-story': 1 }, () => 0.9);
    assert.notEqual(format, 'benchmark');
  });
});

describe('publishBundle', () => {
  it('skips an already recorded platform and publishes remaining adapters', async () => {
    const called: string[] = [];
    const recorded: PublicationResult[] = [];
    const existing: PublicationResult[] = [{
      schemaVersion: 1, cycleId: bundle.cycleId, createdAt: bundle.createdAt, sourceSha: bundle.sourceSha,
      contentHash: 'old', idempotencyKey: `${bundle.idempotencyKey}:x`, platform: 'x', status: 'published',
    }];
    const results = await publishBundle({
      bundle,
      enabledPlatforms: ['x', 'reddit'],
      existingResults: existing,
      maxRetries: 2,
      retryBackoffMs: 0,
      adapters: {
        x: async () => { called.push('x'); return { externalId: 'x1', url: 'https://x.com/x1' }; },
        reddit: async () => { called.push('reddit'); return { externalId: 'r1', url: 'https://reddit.com/r1' }; },
      },
      recordResult: async result => { recorded.push(result); },
    });
    assert.deepEqual(called, ['reddit']);
    assert.equal(results.find(result => result.platform === 'x')?.status, 'skipped');
    assert.equal(recorded.length, 2);
  });

  it('retries one failing adapter without repeating successful platforms', async () => {
    let xAttempts = 0;
    let redditAttempts = 0;
    const recorded: PublicationResult[] = [];
    const results = await publishBundle({
      bundle,
      enabledPlatforms: ['x', 'reddit'],
      existingResults: [],
      maxRetries: 2,
      retryBackoffMs: 0,
      adapters: {
        x: async () => { xAttempts++; return { externalId: 'x1', url: 'https://x.com/x1' }; },
        reddit: async () => {
          redditAttempts++;
          if (redditAttempts < 3) throw new Error('rate limited');
          return { externalId: 'r1', url: 'https://reddit.com/r1' };
        },
      },
      recordResult: async result => { recorded.push(result); },
    });
    assert.equal(xAttempts, 1);
    assert.equal(redditAttempts, 3);
    assert.equal(results.every(result => result.status === 'published'), true);
    assert.equal(recorded.length, 2);
  });

  it('dry-run performs no adapter calls', async () => {
    let calls = 0;
    const results = await publishBundle({
      bundle,
      enabledPlatforms: ['x'],
      existingResults: [],
      maxRetries: 2,
      retryBackoffMs: 0,
      dryRun: true,
      adapters: { x: async () => { calls++; return {}; } },
      recordResult: async () => {},
    });
    assert.equal(calls, 0);
    assert.equal(results[0].status, 'skipped');
  });
});
