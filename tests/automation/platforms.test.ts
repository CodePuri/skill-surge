import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { publishToX } from '../../dist/automation/platforms/x.js';
import { publishToReddit } from '../../dist/automation/platforms/reddit.js';
import { publishToSubstack } from '../../dist/automation/platforms/substack.js';

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('X adapter', () => {
  it('refreshes OAuth and publishes a thread in order', async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), init });
      if (String(url).includes('/oauth2/token')) return response({ access_token: 'access' });
      return response({ data: { id: String(requests.length), text: 'ok' } }, 201);
    };
    const result = await publishToX(
      { title: 'Title', body: 'First post\n\n---\n\nSecond post' },
      { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh', userId: 'user' },
      fetchImpl as typeof fetch,
    );
    assert.equal(requests.filter(request => request.url.endsWith('/2/tweets')).length, 2);
    const secondBody = JSON.parse(String(requests.at(-1)?.init?.body));
    assert.ok(secondBody.reply.in_reply_to_tweet_id);
    assert.match(result.url ?? '', /x\.com\/user\/status/);
  });
});

describe('Reddit adapter', () => {
  it('skips prohibited communities and submits to the first allowed community', async () => {
    const urls: string[] = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      const target = String(url);
      urls.push(target);
      if (target.includes('/access_token')) return response({ access_token: 'access' });
      if (target.includes('/r/Blocked/about/rules')) return response({ rules: [{ description: 'No self promotion or advertising' }] });
      if (target.includes('/r/Allowed/about/rules')) return response({ rules: [{ description: 'Share detailed technical work' }] });
      if (target.endsWith('/api/submit')) {
        assert.match(String(init?.body), /sr=Allowed/);
        return response({ json: { errors: [], data: { name: 't3_post', url: 'https://reddit.com/r/Allowed/post' } } });
      }
      return response({}, 404);
    };
    const result = await publishToReddit(
      { title: 'Technical update', body: 'Evidence and implementation.' },
      ['Blocked', 'Allowed'],
      { clientId: 'client', clientSecret: 'secret', refreshToken: 'refresh', userAgent: 'skill-surge:test' },
      fetchImpl as typeof fetch,
    );
    assert.equal(result.externalId, 't3_post');
    assert.equal(urls.some(url => url.includes('/r/Allowed/about/rules')), true);
  });
});

describe('Substack adapter', () => {
  it('delegates to the injected browser transport', async () => {
    const calls: unknown[] = [];
    const result = await publishToSubstack(
      { title: 'Weekly edition', body: 'Evidence-backed edition.' },
      { publicationUrl: 'https://example.substack.com', storageStatePath: '/tmp/state.json' },
      async input => { calls.push(input); return { externalId: 'post', url: 'https://example.substack.com/p/post' }; },
    );
    assert.equal(calls.length, 1);
    assert.equal(result.externalId, 'post');
  });
});
