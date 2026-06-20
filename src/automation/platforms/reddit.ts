import type { PlatformMetrics, PublicationContent, PublicationResult } from '../contracts.js';
import type { AdapterResult } from '../publication.js';

export interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  userAgent: string;
}

export class PolicyBlockedError extends Error {
  override name = 'PolicyBlockedError';
}

async function json(response: Response, label: string): Promise<any> {
  const value = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${label} failed (${response.status})`);
  return value;
}

function prohibitsPromotion(rules: any): boolean {
  const text = Array.isArray(rules?.rules)
    ? rules.rules.map((rule: any) => `${rule.short_name ?? ''} ${rule.description ?? ''}`).join('\n')
    : '';
  return /(no\s+(?:self[- ]?)?promo(?:tion)?|no\s+advertis(?:ing|ements?)|promotional content (?:is )?not allowed)/i.test(text);
}

export async function publishToReddit(
  content: PublicationContent,
  allowlist: string[],
  credentials: RedditCredentials,
  fetchImpl: typeof fetch = fetch,
): Promise<AdapterResult> {
  const tokenResponse = await fetchImpl('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': credentials.userAgent,
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: credentials.refreshToken }).toString(),
  });
  const token = await json(tokenResponse, 'Reddit token refresh');
  if (!token.access_token) throw new Error('Reddit token refresh returned no access token');
  const headers = { authorization: `Bearer ${token.access_token}`, 'user-agent': credentials.userAgent };

  let subreddit: string | undefined;
  for (const candidate of allowlist) {
    const response = await fetchImpl(`https://oauth.reddit.com/r/${encodeURIComponent(candidate)}/about/rules`, { headers });
    if (!response.ok) continue;
    const rules = await response.json().catch(() => ({}));
    if (!prohibitsPromotion(rules)) { subreddit = candidate; break; }
  }
  if (!subreddit) throw new PolicyBlockedError('No allowlisted Reddit community permits this publication');

  const form = new URLSearchParams({
    api_type: 'json', kind: 'self', resubmit: 'false', sendreplies: 'true',
    sr: subreddit, title: content.title, text: content.body,
  });
  const submitted = await fetchImpl('https://oauth.reddit.com/api/submit', {
    method: 'POST', headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' }, body: form.toString(),
  });
  const result = await json(submitted, 'Reddit publication');
  const errors = result.json?.errors ?? [];
  if (errors.length > 0) throw new Error(`Reddit publication rejected: ${JSON.stringify(errors)}`);
  const data = result.json?.data;
  if (!data?.name || !data?.url) throw new Error('Reddit publication returned no post id or URL');
  return { externalId: data.name, url: data.url };
}

export async function collectRedditMetrics(
  result: PublicationResult,
  credentials: Pick<RedditCredentials, 'userAgent'>,
  fetchImpl: typeof fetch = fetch,
): Promise<PlatformMetrics> {
  if (!result.url) return {};
  const response = await fetchImpl(`${result.url.replace(/\/$/, '')}.json?raw_json=1`, {
    headers: { 'user-agent': credentials.userAgent },
  });
  const payload = await json(response, 'Reddit metrics');
  const post = payload?.[0]?.data?.children?.[0]?.data;
  if (!post) return {};
  return { views: post.view_count, likes: post.score, comments: post.num_comments };
}
