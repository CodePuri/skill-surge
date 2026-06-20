import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  collectGrowthSnapshot,
  engagementScore,
  scoreFormats,
} from '../../dist/automation/metrics.js';
import type { GrowthSnapshot, PublicationResult } from '../../dist/automation/contracts.js';

const results: PublicationResult[] = [{
  schemaVersion: 1,
  cycleId: '2026-W25',
  createdAt: '2026-06-20T06:00:00.000Z',
  sourceSha: 'abc123',
  contentHash: 'xhash',
  idempotencyKey: 'xkey',
  platform: 'x',
  status: 'published',
  externalId: '123',
  url: 'https://x.com/user/status/123',
}];

describe('growth metrics', () => {
  it('computes engagement as observed interactions per exposure', () => {
    assert.equal(engagementScore({ impressions: 1000, likes: 50, shares: 10, comments: 5, clicks: 35 }), 10);
    assert.equal(engagementScore({}), 0);
  });

  it('collects available platform, GitHub, and npm metrics', async () => {
    const fetchImpl = async (url: string | URL | Request) => {
      const target = String(url);
      if (target.includes('api.github.com')) return new Response(JSON.stringify({ stargazers_count: 120, forks_count: 15 }), { status: 200 });
      if (target.includes('api.npmjs.org')) return new Response(JSON.stringify({ downloads: 900 }), { status: 200 });
      return new Response('{}', { status: 404 });
    };
    const snapshot = await collectGrowthSnapshot({
      cycleId: '2026-W25',
      sourceSha: 'abc123',
      format: 'tutorial',
      publicationResults: results,
      platformCollectors: { x: async () => ({ impressions: 1000, likes: 50, shares: 10 }) },
      repo: 'CodePuri/skill-surge',
      packageName: 'skill-surge',
      fetchImpl: fetchImpl as typeof fetch,
      now: new Date('2026-06-21T00:00:00Z'),
    });
    assert.deepEqual(snapshot.results.x, { impressions: 1000, likes: 50, shares: 10 });
    assert.deepEqual(snapshot.github, { stars: 120, forks: 15 });
    assert.deepEqual(snapshot.npm, { weeklyDownloads: 900 });
    assert.equal(snapshot.engagementScore, 6);
  });

  it('does not invent unavailable platform metrics', async () => {
    const snapshot = await collectGrowthSnapshot({
      cycleId: '2026-W25', sourceSha: 'abc123', format: 'tutorial', publicationResults: results,
      platformCollectors: {}, repo: 'CodePuri/skill-surge', packageName: 'skill-surge',
      fetchImpl: (async () => new Response('{}', { status: 503 })) as typeof fetch,
    });
    assert.deepEqual(snapshot.results, {});
    assert.deepEqual(snapshot.github, {});
    assert.deepEqual(snapshot.npm, {});
    assert.equal(snapshot.engagementScore, 0);
  });

  it('aggregates observed scores by content format', () => {
    const snapshots = [
      { selectedFormat: 'tutorial', engagementScore: 4 },
      { selectedFormat: 'tutorial', engagementScore: 8 },
      { selectedFormat: 'benchmark', engagementScore: 10 },
    ] as GrowthSnapshot[];
    assert.deepEqual(scoreFormats(snapshots), { tutorial: 6, benchmark: 10 });
  });
});
