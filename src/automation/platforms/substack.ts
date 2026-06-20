import type { PlatformMetrics, PublicationContent, PublicationResult } from '../contracts.js';
import type { AdapterResult } from '../publication.js';
import fs from 'node:fs';
import crypto from 'node:crypto';

export interface EncryptedStorageState {
  version: 1;
  algorithm: 'aes-256-gcm';
  iv: string;
  tag: string;
  data: string;
}

function encryptionKey(encoded: string): Buffer {
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('SUBSTACK_STATE_KEY must be a base64-encoded 32-byte key');
  return key;
}

export function encryptStorageState(state: unknown, encodedKey: string): EncryptedStorageState {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(encodedKey), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(state), 'utf8'), cipher.final()]);
  return {
    version: 1,
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: data.toString('base64'),
  };
}

export function decryptStorageState(envelope: EncryptedStorageState, encodedKey: string): any {
  try {
    if (envelope.version !== 1 || envelope.algorithm !== 'aes-256-gcm') throw new Error('unsupported encrypted state');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(encodedKey), Buffer.from(envelope.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    const value = Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]).toString('utf8');
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Unable to decrypt Substack storage state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function readStorageState(file: string): any {
  const key = process.env.SUBSTACK_STATE_KEY;
  if (!key) throw new Error('SUBSTACK_STATE_KEY is required');
  return decryptStorageState(JSON.parse(fs.readFileSync(file, 'utf8')), key);
}

export interface SubstackConfig {
  publicationUrl: string;
  storageStatePath: string;
}

export type SubstackBrowserTransport = (
  input: { content: PublicationContent; config: SubstackConfig },
) => Promise<AdapterResult>;

async function defaultTransport(input: { content: PublicationContent; config: SubstackConfig }): Promise<AdapterResult> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ storageState: readStorageState(input.config.storageStatePath) });
    const page = await context.newPage();
    await page.goto(`${input.config.publicationUrl.replace(/\/$/, '')}/publish/post`, { waitUntil: 'domcontentloaded' });
    const title = page.locator('textarea[placeholder*="title" i], input[placeholder*="title" i]').first();
    const editor = page.locator('[contenteditable="true"]').first();
    await title.fill(input.content.title);
    await editor.fill(input.content.body);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /^publish/i }).click();
    await page.waitForURL(/\/p\//, { timeout: 30_000 });
    return { externalId: new URL(page.url()).pathname.split('/').filter(Boolean).at(-1), url: page.url() };
  } finally {
    await browser.close();
  }
}

export async function publishToSubstack(
  content: PublicationContent,
  config: SubstackConfig,
  transport: SubstackBrowserTransport = defaultTransport,
): Promise<AdapterResult> {
  if (!config.publicationUrl.startsWith('https://')) throw new Error('Substack publication URL must use HTTPS');
  if (!config.storageStatePath) throw new Error('Substack storage state path is required');
  return transport({ content, config });
}

export type SubstackMetricsTransport = (
  input: { result: PublicationResult; config: SubstackConfig },
) => Promise<PlatformMetrics>;

async function defaultMetricsTransport(input: { result: PublicationResult; config: SubstackConfig }): Promise<PlatformMetrics> {
  if (!input.result.url) return {};
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ storageState: readStorageState(input.config.storageStatePath) });
    const page = await context.newPage();
    await page.goto(input.result.url, { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    const number = (label: string) => {
      const match = text.match(new RegExp(`([\\d,]+)\\s+${label}`, 'i'));
      return match ? Number(match[1].replaceAll(',', '')) : undefined;
    };
    return { views: number('views?'), likes: number('likes?'), comments: number('comments?') };
  } finally { await browser.close(); }
}

export async function collectSubstackMetrics(
  result: PublicationResult,
  config: SubstackConfig,
  transport: SubstackMetricsTransport = defaultMetricsTransport,
): Promise<PlatformMetrics> {
  return transport({ result, config });
}
