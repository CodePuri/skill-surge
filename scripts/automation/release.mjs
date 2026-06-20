#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const [, , action, ...args] = process.argv;
const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const dryRun = args.includes('--dry-run') || !args.includes('--execute');

function quote(value) {
  return /^[A-Za-z0-9_./:@=-]+$/.test(value) ? value : JSON.stringify(value);
}

function run(command, commandArgs, options = {}) {
  const rendered = [command, ...commandArgs].map(quote).join(' ');
  if (dryRun) {
    console.log(rendered);
    return;
  }
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: false, ...options });
  if (result.status !== 0) throw new Error(`${rendered} exited ${result.status ?? 1}`);
}

function argument(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

try {
  if (action === 'canary') {
    const cache = process.env.SKILL_SURGE_CACHE || '/tmp/skill-surge-canary-cache.json';
    run('npm', ['ci']);
    run('npm', ['run', 'build']);
    run('npm', ['test'], { env: { ...process.env, SKILL_SURGE_CACHE: cache } });
    run('npm', ['audit', '--omit=dev', '--audit-level=high']);
    run('npm', ['pack', '--dry-run']);
    run('node', ['dist/cli.js', '--version']);
  } else if (action === 'tag') {
    const version = argument('--version');
    if (!version) throw new Error('tag requires --version');
    if (version !== packageJson.version) {
      throw new Error(`Requested version ${version} does not match package version ${packageJson.version}`);
    }
    run('git', ['tag', '-a', `v${version}`, '-m', `skill-surge v${version}`]);
    run('git', ['push', 'origin', `v${version}`]);
  } else {
    throw new Error('Usage: release.mjs <canary|tag> [--version X.Y.Z] [--dry-run|--execute]');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
