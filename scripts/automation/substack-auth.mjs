#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { chromium } from 'playwright';
import { encryptStorageState } from '../../dist/automation/platforms/substack.js';

const publicationUrl = process.env.SUBSTACK_PUBLICATION_URL;
const targetValue = process.env.SUBSTACK_STORAGE_STATE;
const key = process.env.SUBSTACK_STATE_KEY;
if (!publicationUrl || !targetValue || !key) {
  console.error('SUBSTACK_PUBLICATION_URL, SUBSTACK_STORAGE_STATE, and SUBSTACK_STATE_KEY are required.');
  process.exit(1);
}
const target = path.resolve(targetValue.replace(/^~(?=\/)/, os.homedir()));
const browser = await chromium.launch({ headless: false });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(publicationUrl, { waitUntil: 'domcontentloaded' });
  const prompt = readline.createInterface({ input: stdin, output: stdout });
  await prompt.question('Sign in to Substack in the browser, then press Enter here to encrypt the session: ');
  prompt.close();
  const state = await context.storageState();
  const encrypted = encryptStorageState(state, key);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(encrypted, null, 2)}\n`, { mode: 0o600 });
  fs.chmodSync(target, 0o600);
  console.log(`Encrypted Substack session written to ${target}`);
} finally {
  await browser.close();
}
