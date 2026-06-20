#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadAutomationConfig } from '../../dist/automation/policy.js';

const offline = process.argv.includes('--offline');
const allowMissing = process.argv.includes('--allow-missing-credentials');
const errors = [];

function check(label, condition, detail = '') {
  if (condition) console.log(`${label}: ok`);
  else {
    console.error(`${label}: failed${detail ? ` (${detail})` : ''}`);
    errors.push(label);
  }
}

try {
  const config = loadAutomationConfig();
  check('Policy configuration', config.schemaVersion === 1 && config.selfImprove.enabled && config.publication.enabled);
} catch (error) {
  check('Policy configuration', false, error instanceof Error ? error.message : String(error));
}

check('Node runtime', Number(process.versions.node.split('.')[0]) >= 20, process.versions.node);
for (const command of ['git', 'gh', 'npm']) {
  const result = spawnSync(command, ['--version'], { encoding: 'utf8', shell: false });
  check(`${command} command`, result.status === 0);
}

const required = [
  'X_CLIENT_ID', 'X_CLIENT_SECRET', 'X_REFRESH_TOKEN', 'X_USER_ID',
  'REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_REFRESH_TOKEN', 'REDDIT_USER_AGENT',
  'SUBSTACK_PUBLICATION_URL', 'SUBSTACK_STORAGE_STATE', 'SUBSTACK_STATE_KEY',
];
const missing = required.filter(name => !process.env[name]);
if (allowMissing) console.log('Credentials: skipped');
else check('Credentials', missing.length === 0, missing.join(', '));

if (!allowMissing && missing.length === 0) {
  const statePath = path.resolve(process.env.SUBSTACK_STORAGE_STATE.replace(/^~(?=\/)/, os.homedir()));
  let stateValid = false;
  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    stateValid = state.version === 1 && state.algorithm === 'aes-256-gcm';
  } catch { /* reported below */ }
  check('Encrypted Substack state', stateValid, statePath);
}

if (!offline) {
  const github = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8', shell: false });
  check('GitHub authentication', github.status === 0);
  const npm = spawnSync('npm', ['view', 'skill-surge', 'version'], { encoding: 'utf8', timeout: 30_000, shell: false });
  check('npm registry', npm.status === 0);
} else {
  console.log('Network checks: skipped');
}

if (errors.length > 0) process.exitCode = 1;
