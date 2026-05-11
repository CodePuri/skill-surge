#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ora from 'ora';
import gradient from 'gradient-string';
import type { Candidate } from './types.js';
import { loadConfig, getBundlePath } from './core/config.js';
import { loadCache, writeCache, clearCache } from './core/cache.js';
import { scanBundleSkills, scanLocalCandidates } from './core/scanner.js';
import {
  scoreCandidate, dedupeByName, mergeCandidates,
  rerankWithExternalCommand, isTrivialTask,
} from './core/ranker.js';
import { runSkillsFind } from './core/registrar.js';
import { installCandidate } from './core/installer.js';
import { renderSplash, renderHelp, printCandidates } from './ui/splash.js';
import { infoBox, successBox, warningBox, errorBox, dashboardBox } from './ui/box.js';
import { renderCandidateTable } from './ui/table.js';

const VERSION = '1.0.0';

interface Flags {
  [key: string]: boolean | string | string[] | undefined;
  json?: boolean;
  'dry-run'?: boolean;
  network?: boolean;
  offline?: boolean;
  llm?: boolean;
  help?: boolean;
  version?: boolean;
  task?: string;
  source?: string[];
  yes?: boolean;
  always?: boolean;
}

interface ParseResult {
  command: string | undefined;
  positionals: string[];
  flags: Flags;
}

function parseArgv(argv: string[]): ParseResult {
  const flags: Flags = {};
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (['json', 'dry-run', 'network', 'offline', 'llm', 'help', 'version', 'yes', 'always'].includes(key)) {
      (flags as Record<string, boolean | undefined>)[key] = true;
      continue;
    }
    if (key === 'y') {
      flags.yes = true;
      continue;
    }
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    if (key === 'source') {
      flags.source = [...(flags.source || []), value];
    } else {
      flags[key] = value;
    }
    i++;
  }

  return { command: positionals[0], positionals: positionals.slice(1), flags };
}

async function commandInit(): Promise<number> {
  console.log('\n' + infoBox(
    ' INITIALIZING ',
    gradient(['#00FFFF', '#FF00FF', '#FF6EC7'])(
      '\n  Welcome to Auto Skills — your agent intelligence layer.\n' +
      '  Setting up your environment...',
    ),
  ) + '\n');

  const spinner = ora({ text: 'Scanning bundled skills...', color: 'magenta' }).start();
  const config = loadConfig();
  const bundled = scanBundleSkills(config);
  spinner.succeed(`Found ${bundled.length} pre-bundled core skills`);

  const envSpinner = ora({ text: 'Detecting local agent environment...', color: 'magenta' }).start();
  const envInfo: { label: string; value: string }[] = [];

  const home = os.homedir();
  const codexSkills = fs.existsSync(path.join(home, '.codex', 'skills'));
  const agentsSkills = fs.existsSync(path.join(home, '.agents', 'skills'));
  envSpinner.succeed('Environment detected');

  envInfo.push({ label: 'Node', value: process.version });
  envInfo.push({ label: 'Codex Agent', value: codexSkills ? '✓ detected' : '— not found' });
  envInfo.push({ label: 'Agent Skills', value: agentsSkills ? '✓ detected' : '— not found' });
  envInfo.push({ label: 'Bundled Skills', value: String(bundled.length) });

  const remoteSpinner = ora({ text: 'Checking connectivity...', color: 'magenta' }).start();
  let skillsCliOk = false;
  try {
    const test = spawnSync('npx', ['skills', '--help'], {
      encoding: 'utf8', timeout: 10_000, shell: false,
    });
    skillsCliOk = test.status === 0;
  } catch {
    // ignore
  }

  if (skillsCliOk) {
    remoteSpinner.succeed('npx skills CLI available');
    envInfo.push({ label: 'Skills CLI', value: '✓ reachable' });
  } else {
    remoteSpinner.warn('npx skills CLI not detected');
    envInfo.push({ label: 'Skills CLI', value: '— not found' });
  }

  const cache = loadCache();
  envInfo.push({ label: 'Cached Skills', value: String(cache.candidates.length) });

  console.log('\n' + dashboardBox(envInfo) + '\n');

  const readyMsg = gradient(['#39FF14', '#00FFFF'])(
    '\n  ✓ AUTO SKILLS READY\n' +
    '  \n' +
    '  Run:  autoskills suggest --task "your task"\n' +
    '  Or:   Start any prompt with: auto skills: <your request>\n',
  );
  console.log(successBox(' READY ', readyMsg));
  console.log('');

  // Write init marker
  const initPath = path.join(home, '.config', 'autoskills');
  fs.mkdirSync(initPath, { recursive: true });
  fs.writeFileSync(
    path.join(initPath, '.init'),
    JSON.stringify({ initializedAt: new Date().toISOString(), version: VERSION }, null, 2) + '\n',
  );

  return 0;
}

function commandDoctor(): number {
  console.log('\n' + infoBox(
    ' HEALTH CHECK ',
    gradient(['#00FFFF', '#FF6EC7'])('\n  Auto Skills — system diagnostics\n'),
  ) + '\n');

  const entries: { label: string; value: string }[] = [];
  entries.push({ label: 'Version', value: VERSION });
  entries.push({ label: 'Node', value: process.version });
  entries.push({ label: 'Platform', value: process.platform });
  entries.push({ label: 'Arch', value: process.arch });

  const config = loadConfig();
  const home = os.homedir();
  const bundlePath = getBundlePath();
  const bundleExists = fs.existsSync(bundlePath);
  entries.push({ label: 'Bundled Skills', value: bundleExists ? '✓ ' + fs.readdirSync(bundlePath).filter(f => f !== 'catalog.json').length + ' categories' : '✗ not found' });

  const cache = loadCache();
  entries.push({ label: 'Cache Entries', value: String(cache.candidates.length) });
  entries.push({ label: 'Cache Generated', value: cache.generatedAt || 'never' });

  const codexSkills = fs.existsSync(path.join(home, '.codex', 'skills'));
  const agentsSkills = fs.existsSync(path.join(home, '.agents', 'skills'));
  entries.push({ label: 'Codex Skills Dir', value: codexSkills ? '✓ exists' : '— missing' });
  entries.push({ label: 'Agent Skills Dir', value: agentsSkills ? '✓ exists' : '— missing' });

  const initDone = fs.existsSync(path.join(home, '.config', 'autoskills', '.init'));
  entries.push({ label: 'First-Run Complete', value: initDone ? '✓ yes' : '— not yet' });

  console.log(dashboardBox(entries) + '\n');

  const localPaths = config.localPaths || [];
  const pathStatus = localPaths.map(p => {
    const exists = fs.existsSync(p.replace(/^~/, home));
    return `  ${exists ? '✓' : '✗'} ${p}`;
  });
  if (pathStatus.length > 0) {
    console.log(infoBox(' SCAN PATHS ', pathStatus.join('\n')) + '\n');
  }

  const allGood = bundleExists;
  if (allGood) {
    console.log(successBox(' PASS ', '\n  All systems operational.\n') + '\n');
  } else {
    console.log(warningBox(' WARN ', '\n  Some checks did not pass. Run: autoskills init\n') + '\n');
  }

  return allGood ? 0 : 1;
}

function commandRefresh(flags: Flags): number {
  const spinner = ora({ text: 'Loading configuration...', color: 'magenta' }).start();
  const config = loadConfig();

  spinner.text = 'Scanning bundled skills...';
  const bundled = scanBundleSkills(config);

  spinner.text = 'Scanning local skills...';
  const local = scanLocalCandidates(config);

  const previous = loadCache();
  const external = previous.candidates.filter(c => c.sourceKind !== 'local' && c.sourceKind !== 'bundled');
  const notes: string[] = [`${bundled.length} bundled, ${local.length} local`];

  if (flags.network) {
    spinner.text = 'Querying network sources...';
    const sourceList = [...(config.gitSources || []), ...(flags.source || [])];

    for (const source of sourceList) {
      const result = spawnSync('npx', ['skills', 'add', source, '--list'], {
        encoding: 'utf8', timeout: 30_000, shell: false,
      });
      if (result.status === 0) {
        notes.push(`Inspected ${source}.`);
      } else {
        const msg = result.stderr || result.stdout || 'unknown error';
        notes.push(`Could not inspect ${source}: ${msg.trim()}`);
      }
    }
  }

  spinner.text = 'Writing cache...';
  const cache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    candidates: mergeCandidates(bundled, local, external),
  };

  const actualPath = writeCache(cache);
  spinner.succeed(`Cache written to ${actualPath}`);

  if (!flags.json) {
    console.log('\n' + dashboardBox([
      { label: 'Bundled', value: String(bundled.length) },
      { label: 'Local', value: String(local.length) },
      { label: 'External', value: String(external.length) },
      { label: 'Total Cached', value: String(cache.candidates.length) },
    ]) + '\n');
  } else {
    console.log(JSON.stringify(cache, null, 2));
  }

  return 0;
}

function commandSuggest(flags: Flags): number {
  const task = flags.task;
  if (!task) {
    console.error(errorBox('ERROR', '\n  suggest requires --task "<description>"\n'));
    return 1;
  }

  const config = loadConfig();
  let cache = loadCache();

  if (cache.candidates.length === 0) {
    const spinner = ora({ text: 'Cache empty — scanning sources...', color: 'magenta' }).start();
    const bundled = scanBundleSkills(config);
    const local = scanLocalCandidates(config);
    cache = {
      version: 1,
      generatedAt: new Date().toISOString(),
      candidates: mergeCandidates(bundled, local),
    };
    writeCache(cache);
    spinner.succeed(`Cached ${cache.candidates.length} skills`);
  }

  const notes: string[] = [];

  let external: Candidate[] = [];
  if (!flags.offline && process.env.AUTO_SKILLS_OFFLINE !== '1') {
    const spinner = ora({ text: 'Querying npx skills find...', color: 'magenta' }).start();
    const result = runSkillsFind(task);
    external = result.candidates;
    if (result.error) {
      spinner.warn(`Remote search: ${result.error}`);
      notes.push(`Remote search unavailable: ${result.error}`);
    } else {
      spinner.succeed(`Found ${external.length} remote candidates`);
    }
  }

  const rankSpinner = ora({ text: 'Scoring and ranking...', color: 'magenta' }).start();
  let candidates = dedupeByName(
    mergeCandidates(cache.candidates, external)
      .map(c => scoreCandidate(c, task, config))
      .filter(c => c.score > 25)
      .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name))),
  ).slice(0, 12);

  if (flags.llm) {
    const reranked = rerankWithExternalCommand(task, candidates);
    candidates = reranked.candidates;
    notes.push(reranked.note);
  }

  rankSpinner.succeed(`${candidates.length} candidates ranked`);

  const updatedCache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    candidates: mergeCandidates(cache.candidates, external).map(c => scoreCandidate(c, task, config)),
  };
  const actualPath = writeCache(updatedCache);

  const payload = { task, cachePath: actualPath, notes, candidates };

  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    printCandidates(payload);

    const autoInstall = candidates.filter(c => c.canAutoInstall);
    if (autoInstall.length > 0) {
      console.log('\n' + successBox(
        ' AUTO-INSTALL READY ',
        `\n  ${autoInstall.length} candidate(s) pass the trust threshold.\n` +
        '  Run: autoskills install <id> [-y] to install.\n',
      ) + '\n');
    }
  }

  return 0;
}

function commandInstall(flags: Flags, positionals: string[]): number {
  const candidateId = positionals[0];
  if (!candidateId) {
    console.error(errorBox('ERROR', '\n  install requires <candidate-id>\n'));
    return 1;
  }

  const cache = loadCache();
  const candidate = cache.candidates.find(c => c.id === candidateId);
  if (!candidate) {
    console.error(errorBox('NOT FOUND', `\n  Candidate not found: ${candidateId}\n`));
    return 2;
  }

  console.log('\n' + infoBox(' INSTALL CHECK ', `\n  Candidate: ${candidate.name}\n  Score: ${candidate.score}\n  Reason: ${candidate.reason}\n`) + '\n');

  if (!candidate.canAutoInstall) {
    console.error(errorBox(' BLOCKED ', `\n  Cannot auto-install "${candidate.name}":\n  ${candidate.reason}\n\n  Does not pass safety threshold.\n`));
    return 3;
  }

  if (!flags.yes && !flags['dry-run']) {
    console.log(warningBox(' CONFIRMATION ', `\n  Ready to install: ${candidate.name}\n\n  Pass --yes or -y to confirm.\n`));
    return 0;
  }

  const result = installCandidate(candidate, Boolean(flags['dry-run']));
  if (result.success) {
    console.log(successBox(' INSTALLED ', `\n  ✓ ${candidate.name} installed successfully.\n`));
  } else {
    console.error(errorBox(' FAILED ', `\n  ✗ Install failed: ${result.error}\n`));
  }
  return result.code;
}

function commandHook(flags: Flags): number {
  const task = flags.task;
  if (!task) {
    console.error(errorBox('ERROR', '\n  hook requires --task "<description>"\n'));
    return 1;
  }

  if (isTrivialTask(task)) {
    const payload = { task, shouldSuggest: false, message: 'No skill suggestion for a trivial request.' };
    if (flags.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log(payload.message);
    }
    return 0;
  }

  const config = loadConfig();
  const cache = loadCache();
  const candidates = dedupeByName(
    cache.candidates
      .map(c => scoreCandidate(c, task, config))
      .filter(c => c.score >= 70)
      .sort((a, b) => b.score - a.score),
  ).slice(0, 3);

  const payload = {
    task,
    shouldSuggest: candidates.length > 0,
    message: candidates.length > 0
      ? `Skill opportunity detected: ${candidates.map(c => c.name).join(', ')}`
      : 'No strong cached skill suggestion for this request.',
    candidates,
  };

  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(payload.message);
  }

  return 0;
}

function commandList(flags: Flags): number {
  const cache = loadCache();

  if (cache.candidates.length === 0) {
    console.log(warningBox(' EMPTY ', '\n  No skills cached. Run: autoskills refresh\n'));
    return 0;
  }

  const bundled = cache.candidates.filter(c => c.sourceKind === 'bundled');
  const local = cache.candidates.filter(c => c.sourceKind === 'local');
  const remote = cache.candidates.filter(c => c.sourceKind !== 'bundled' && c.sourceKind !== 'local');

  if (!flags.json) {
    console.log('\n' + dashboardBox([
      { label: 'Bundled', value: String(bundled.length) },
      { label: 'Local', value: String(local.length) },
      { label: 'Remote', value: String(remote.length) },
      { label: 'Total', value: String(cache.candidates.length) },
      { label: 'Cached At', value: cache.generatedAt || 'unknown' },
    ]) + '\n');

    if (cache.candidates.length > 0) {
      console.log(renderCandidateTable(cache.candidates.slice(0, 25)));
      if (cache.candidates.length > 25) {
        console.log(`\n  ... and ${cache.candidates.length - 25} more\n`);
      }
    }
    console.log('');
  } else {
    console.log(JSON.stringify(cache, null, 2));
  }

  return 0;
}

function commandSeed(): number {
  const config = loadConfig();
  const spinner = ora({ text: 'Scanning bundled skills...', color: 'magenta' }).start();
  const bundled = scanBundleSkills(config);

  if (bundled.length === 0) {
    spinner.fail('No bundled skills found.');
    return 1;
  }

  spinner.succeed(`Found ${bundled.length} bundled skills`);

  const cache = loadCache();
  const existing = cache.candidates.filter(c => c.sourceKind !== 'bundled');
  const updated = mergeCandidates(existing, bundled);
  writeCache({
    version: 1,
    generatedAt: new Date().toISOString(),
    candidates: updated,
  });

  console.log(successBox(' SEEDED ', `\n  ✓ ${bundled.length} bundled skills registered in cache\n`) + '\n');

  for (const skill of bundled) {
    const cat = skill.category || 'general';
    console.log(`  ${gradient(['#FF6EC7', '#00FFFF'])('▸')} ${gradient(['#FF6EC7', '#00FFFF'])(skill.name)}  ${gradient(['#7B68EE', '#7B68EE'])('(' + cat + ')')}`);
  }
  console.log('');

  return 0;
}

function commandClean(): number {
  const cleared = clearCache();
  if (cleared) {
    console.log(successBox(' CLEANED ', '\n  ✓ Cache cleared successfully.\n'));
  } else {
    console.log(warningBox(' NOTHING ', '\n  No cache files found.\n'));
  }
  return 0;
}

function commandConfig(): number {
  const config = loadConfig();
  console.log(JSON.stringify(config, null, 2));
  return 0;
}

// Entry point
(async () => {
  process.exitCode = await (async () => {
    try {
      const { command, positionals, flags } = parseArgv(process.argv.slice(2));

      if (!flags.json && !flags.version && command !== 'version') {
        renderSplash(VERSION);
      }

      if (!command || flags.help || command === 'help') {
        console.log(renderHelp(VERSION));
        return 0;
      }

      if (flags.version || command === 'version') {
        console.log(VERSION);
        return 0;
      }

      switch (command) {
        case 'init':
          return await commandInit();
        case 'doctor':
          return commandDoctor();
        case 'refresh':
          return commandRefresh(flags);
        case 'suggest':
          return commandSuggest(flags);
        case 'install':
          return commandInstall(flags, positionals);
        case 'hook':
          return commandHook(flags);
        case 'list':
          return commandList(flags);
        case 'seed':
          return commandSeed();
        case 'clean':
          return commandClean();
        case 'config':
          return commandConfig();
        default:
          console.error(errorBox(' ERROR ', `\n  Unknown command: ${command}\n`));
          console.log(renderHelp(VERSION));
          return 1;
      }
    } catch (error) {
      console.error(errorBox(' ERROR ', `\n  ${error instanceof Error ? error.message : String(error)}\n`));
      console.log(renderHelp(VERSION));
      return 1;
    }
  })();
})();
