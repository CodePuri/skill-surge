#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { GithubLedger, validateReleaseRecord } from '../../dist/automation/github-ledger.js';

const file = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!file) {
  console.error('Usage: record-release.mjs <release.json> [--dry-run]');
  process.exit(1);
}

try {
  const release = validateReleaseRecord(JSON.parse(fs.readFileSync(file, 'utf8')));
  if (dryRun) {
    console.log(JSON.stringify({ cycleId: release.cycleId, valid: true, dryRun: true }));
  } else {
    const repo = process.env.GITHUB_REPOSITORY || 'CodePuri/skill-surge';
    const ledger = new GithubLedger({ repo });
    await ledger.ensureLabels();
    const issue = await ledger.getOrCreateCycleIssue(release.cycleId, release.sourceSha);
    const appended = await ledger.appendTypedComment(issue, 'release-record', release);
    const label = spawnSync('gh', ['issue', 'edit', String(issue), '--repo', repo, '--add-label', 'automation:release'], {
      encoding: 'utf8', timeout: 30_000, shell: false,
    });
    if (label.status !== 0) throw new Error(`Unable to label release cycle: ${label.stderr.trim()}`);
    console.log(JSON.stringify({ cycleId: release.cycleId, issue, appended, valid: true }));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
