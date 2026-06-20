import type {
  Platform,
  PublicationBundle,
  PublicationContent,
  PublicationResult,
} from './contracts.js';
import { sha256 } from './identity.js';

export interface AdapterResult {
  externalId?: string;
  url?: string;
}

export type PublicationAdapter = (content: PublicationContent) => Promise<AdapterResult>;

interface PublishOptions {
  bundle: PublicationBundle;
  enabledPlatforms: Platform[];
  existingResults: PublicationResult[];
  maxRetries: number;
  retryBackoffMs: number;
  dryRun?: boolean;
  adapters: Partial<Record<Platform, PublicationAdapter>>;
  recordResult: (result: PublicationResult) => Promise<void>;
}

const FORMATS: PublicationBundle['format'][] = ['tutorial', 'before-after', 'benchmark', 'release-story'];
const PROHIBITED = [
  /guaranteed virality/i,
  /guaranteed (?:reach|growth|results?)/i,
  /best ever/i,
  /will go viral/i,
  /100% guaranteed/i,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validatePublicationBundle(value: unknown): PublicationBundle {
  if (!isRecord(value) || value.schemaVersion !== 1) throw new Error('Invalid publication bundle schema');
  const requiredStrings = ['cycleId', 'createdAt', 'sourceSha', 'contentHash', 'idempotencyKey', 'releaseRecordHash'];
  if (!requiredStrings.every(key => typeof value[key] === 'string' && String(value[key]).length > 0)) {
    throw new Error('Invalid publication bundle identity');
  }
  if (!FORMATS.includes(value.format as PublicationBundle['format'])) throw new Error('Invalid publication format');
  if (!Array.isArray(value.hooks) || value.hooks.length !== 3 || new Set(value.hooks).size !== 3 || !value.hooks.every(hook => typeof hook === 'string' && hook.trim())) {
    throw new Error('Publication bundle requires three distinct hooks');
  }
  if (!Array.isArray(value.evidence) || value.evidence.length === 0 || !value.evidence.every(item => typeof item === 'string' && item.trim())) {
    throw new Error('Publication bundle requires evidence');
  }
  if (!isRecord(value.platforms)) throw new Error('Publication platforms are required');
  for (const platform of ['x', 'reddit', 'substack'] as Platform[]) {
    const content = value.platforms[platform];
    if (!isRecord(content) || typeof content.title !== 'string' || typeof content.body !== 'string' || !content.title.trim() || !content.body.trim()) {
      throw new Error(`Invalid ${platform} publication content`);
    }
    const text = `${content.title}\n${content.body}`;
    if (PROHIBITED.some(pattern => pattern.test(text))) throw new Error(`Prohibited growth language in ${platform} content`);
  }
  const xParts = String((value.platforms as Record<string, Record<string, unknown>>).x.body).split(/\n\s*---\s*\n/);
  if (xParts.some(part => part.length > 280)) throw new Error('X post exceeds 280 characters');
  return value as unknown as PublicationBundle;
}

export function addUtmParameters(url: string, platform: Platform, cycleId: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set('utm_source', platform);
  parsed.searchParams.set('utm_medium', platform === 'reddit' ? 'community' : platform === 'substack' ? 'owned' : 'social');
  parsed.searchParams.set('utm_campaign', cycleId);
  return parsed.toString();
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function renderSocialCard(bundle: PublicationBundle): string {
  const title = escapeXml(bundle.platforms.substack.title.slice(0, 88));
  const cycle = escapeXml(bundle.cycleId);
  const evidence = escapeXml(bundle.evidence[0].slice(0, 110));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">skill-surge verified weekly update ${cycle}</desc>
  <rect width="1200" height="630" fill="#09090b"/>
  <rect x="64" y="64" width="1072" height="502" rx="28" fill="#111827" stroke="#22d3ee" stroke-width="3"/>
  <text x="104" y="145" fill="#22d3ee" font-family="ui-monospace, monospace" font-size="30">skill-surge / ${cycle}</text>
  <text x="104" y="250" fill="#f8fafc" font-family="ui-sans-serif, sans-serif" font-size="50" font-weight="700">${title}</text>
  <text x="104" y="390" fill="#cbd5e1" font-family="ui-sans-serif, sans-serif" font-size="28">${evidence}</text>
  <text x="104" y="510" fill="#94a3b8" font-family="ui-monospace, monospace" font-size="24">github.com/CodePuri/skill-surge</text>
</svg>`;
}

export function selectContentFormat(
  cycleNumber: number,
  scores: Partial<Record<PublicationBundle['format'], number>>,
  random: () => number = Math.random,
): PublicationBundle['format'] {
  if (cycleNumber <= 4) return FORMATS[(Math.max(1, cycleNumber) - 1) % FORMATS.length];
  const ranked = [...FORMATS].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0) || a.localeCompare(b));
  if (random() < 0.7) return ranked[0];
  const alternatives = ranked.slice(1);
  return alternatives[Math.floor(random() * alternatives.length) % alternatives.length];
}

function publicationResult(
  bundle: PublicationBundle,
  platform: Platform,
  status: PublicationResult['status'],
  extra: Partial<PublicationResult> = {},
): PublicationResult {
  const idempotencyKey = `${bundle.idempotencyKey}:${platform}`;
  return {
    schemaVersion: 1,
    cycleId: bundle.cycleId,
    createdAt: new Date().toISOString(),
    sourceSha: bundle.sourceSha,
    contentHash: sha256(`${bundle.contentHash}:${platform}:${status}`),
    idempotencyKey,
    platform,
    format: bundle.format,
    status,
    ...extra,
  };
}

function delay(milliseconds: number): Promise<void> {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function publishBundle(options: PublishOptions): Promise<PublicationResult[]> {
  const bundle = validatePublicationBundle(options.bundle);
  const results: PublicationResult[] = [];
  for (const platform of options.enabledPlatforms) {
    const key = `${bundle.idempotencyKey}:${platform}`;
    const prior = options.existingResults.find(result => result.idempotencyKey === key && ['published', 'policy-blocked'].includes(result.status));
    if (prior) {
      const skipped = publicationResult(bundle, platform, 'skipped', { error: `already recorded as ${prior.status}` });
      results.push(skipped);
      await options.recordResult(skipped);
      continue;
    }
    if (options.dryRun) {
      const skipped = publicationResult(bundle, platform, 'skipped', { error: 'dry-run' });
      results.push(skipped);
      await options.recordResult(skipped);
      continue;
    }
    const adapter = options.adapters[platform];
    if (!adapter) {
      const failed = publicationResult(bundle, platform, 'failed', { error: 'adapter unavailable' });
      results.push(failed);
      await options.recordResult(failed);
      continue;
    }
    let final: PublicationResult | undefined;
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        const published = await adapter(bundle.platforms[platform]);
        final = publicationResult(bundle, platform, 'published', published);
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const policyBlocked = error instanceof Error && error.name === 'PolicyBlockedError';
        if (policyBlocked) {
          final = publicationResult(bundle, platform, 'policy-blocked', { error: message });
          break;
        }
        if (attempt === options.maxRetries) final = publicationResult(bundle, platform, 'failed', { error: message });
        else await delay(options.retryBackoffMs * (2 ** attempt));
      }
    }
    if (!final) throw new Error(`Publication result missing for ${platform}`);
    results.push(final);
    await options.recordResult(final);
  }
  return results;
}
