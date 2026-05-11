#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { Agent, ScoredCandidate, ScanResult } from './types.js';
import { detectAgents, detectInstalledAgents, resolveAgentPath } from './core/agent.js';
import { loadConfig } from './core/config.js';
import { loadCache, saveCache, configPath } from './core/cache.js';
import { auditProject } from './core/auditor.js';
import { runSkillsFind, rankSkillsForTask } from './core/registrar.js';
import { installSkillToAgents, installTopRepoSkills } from './core/installer.js';
import { isTrivialTask } from './core/ranker.js';
import { ALL_SKILLS, getSkillByName } from './core/catalog.js';
import { T, box, divider, header } from './ui/terminal.js';
import { ask, confirm, select } from './ui/prompt.js';

const VERSION = '2.0.0';

function t(msg: string) { console.log(T.text(msg)); }
function m(msg: string) { console.log(T.muted(msg)); }
function g(msg: string) { console.log(T.green(msg)); }
function r(msg: string) { console.log(T.red(msg)); }
function a(msg: string) { console.log(T.accent(msg)); }
function b(msg: string) { console.log(T.bold(msg)); }
function d() { console.log(divider()); }
function h(msg: string) { console.log(header(msg)); }

async function cmdInit() {
  console.log('');
  h(`skill-surge init  v${VERSION}`);
  d();

  const agents = detectAgents();
  const installed = agents.filter(a => a.installed);
  if (installed.length === 0) {
    t('  No agent environments detected. Install one of: Claude Code, OpenCode, Cline, Cursor, etc.');
    t('  skill-surge will install skills to global directories regardless.');
  } else {
    t('  Detected agents:');
    for (const agent of installed) {
      console.log(`    ${T.accent('▸')} ${T.white(agent.name)}    ${T.muted(agent.globalPath)}`);
    }
  }
  console.log('');

  const scopeChoices = ['Global only  (~/.claude/skills/)', 'Project only  (./.agents/skills/)', 'Both global and project'];
  const scopeIdx = await select('Where should skills be installed?', scopeChoices);
  const scopes = ['global', 'project', 'both'] as const;
  const scope = scopes[scopeIdx];

  const agentsToUse = installed.length > 0 ? installed : agents.filter(a => a.globalPath.includes('agents'));
  if (agentsToUse.length === 0) {
    r('  No agent directories available. Aborting.');
    return 1;
  }

  t(`  ${T.muted('Installing to:')} ${agentsToUse.map(a => a.name).join(', ')}`);
  t(`  ${T.muted('Scope:')} ${scope}`);
  console.log('');
  d();

  t('  Step 1/2 — Top-repo skills (via npx skills add)...');
  const topRepoResults = installTopRepoSkills(agentsToUse, scope);
  for (const result of topRepoResults) {
    if (result.results.every(r => r.success)) {
      g(`    ✓ ${result.repo} (${result.skills.join(', ')})`);
    } else {
      r(`    ✗ ${result.repo}: ${result.results.find(r => !r.success)?.error}`);
    }
  }

  t('  Step 2/2 — Original skills (copying)...');
  const originals = ALL_SKILLS.filter(s => s.source === 'original');
  for (const skill of originals) {
    const installResults = installSkillToAgents(skill.name, agentsToUse, scope);
    const success = installResults.filter(r => r.success).length;
    const total = installResults.length;
    if (success === total) {
      g(`    ✓ ${skill.name}`);
    } else if (success > 0) {
      console.log(`    ${T.yellow('▸')} ${skill.name} (${success}/${total} agents)`);
    } else {
      r(`    ✗ ${skill.name}: ${installResults[0]?.error}`);
    }
  }

  console.log('');
  g(`  Done. ${ALL_SKILLS.length} skills available across ${agentsToUse.length} agent(s).`);
  t(`  Run ${T.accent('skill-surge scan')} to audit your project.`);
  t(`  Run ${T.accent('skill-surge suggest "<task>"')} to find skills for a task.`);
  console.log('');
  return 0;
}

async function cmdScan() {
  const config = loadConfig();
  const agents = detectAgents();
  const installedAgents = agents.filter(a => a.installed);

  const globalPaths = installedAgents.map(a => resolveAgentPath(a, 'global'));
  const projectPaths = installedAgents.map(a => resolveAgentPath(a, 'project'));
  const allPaths = [...globalPaths, ...projectPaths];

  const result = auditProject(allPaths);
  const installedNames = new Set(result.installed.map(s => s.name));

  console.log('');
  h(`skill-surge scan`);
  d();
  t(`  Project: ${T.accent(process.cwd().split('/').pop() || 'unknown')}`);
  t(`  Detected: ${T.white(result.projectType.join(', '))}`);
  t(`  Skills installed: ${T.green(String(result.installed.length))}`);
  t(`  Skills available: ${T.white(String(result.available.length))}`);
  console.log('');

  function installedLine(s: { name: string; agent: string }): string {
    const agentLabel = s.agent.includes('claude') ? 'Claude Code' : s.agent.includes('config') ? 'OpenCode' : 'Other';
    return T.green('✓') + ' ' + T.white(s.name) + '  ' + T.muted('in ' + agentLabel);
  }

  if (result.installed.length > 0) {
    const installedLines = result.installed.slice(0, 15).map(installedLine);
    if (result.installed.length > 15) installedLines.push('  ...and ' + (result.installed.length - 15) + ' more');
    console.log(box('  Installed', installedLines));
    console.log('');
  }

  if (result.missing.length > 0) {
    const recommendedLines = result.missing.slice(0, 10).map(s => T.muted('○') + ' ' + T.white(s.name) + '  ' + T.muted(s.description.slice(0, 50)));
    if (result.missing.length > 10) recommendedLines.push('  ...and ' + (result.missing.length - 10) + ' more');
    console.log(box('  Recommended', recommendedLines));
    console.log('');
  }

  t(`  ${T.muted('Quick action:')} skill-surge suggest --task "..."  or  skill-surge install <skill>`);
  console.log('');

  if (result.missing.length > 0) {
    const quickInstall = await confirm('Install all recommended skills now?', false);
    if (quickInstall) {
      for (const skill of result.missing) {
        installSkillToAgents(skill.name, installedAgents, 'global');
      }
      g(`  Installed ${result.missing.length} skills.`);
    }
  }

  return 0;
}

async function cmdSuggest(args: string[]) {
  let task = '';
  let offline = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--task' && args[i + 1]) task = args[i + 1];
    else if (args[i] === '--task=') task = args[i].split('=')[1];
    else if (args[i] === '--offline') offline = true;
    else if (!args[i].startsWith('--') && !task) task = args[i];
  }

  if (!task) {
    r('  Usage: skill-surge suggest --task "build a login system"');
    return 1;
  }

  const agents = detectAgents().filter(a => a.installed);
  const allPaths = [
    ...agents.map(a => resolveAgentPath(a, 'global')),
    ...agents.map(a => resolveAgentPath(a, 'project')),
  ];
  const installedNames = new Set<string>();

  for (const gp of allPaths) {
    if (fs.existsSync(gp)) {
      try {
        for (const f of fs.readdirSync(gp)) {
          if (f.endsWith('.md')) {
            let name = f.replace(/\.md$/, '');
            try {
              const c = fs.readFileSync(path.join(gp, f), 'utf8');
              if (c.startsWith('---')) {
                const end = c.indexOf('\n---', 3);
                if (end > 0) {
                  for (const line of c.slice(3, end).split('\n')) {
                    const m2 = line.match(/^name:\s*(.+)$/);
                    if (m2) { name = m2[1].trim(); break; }
                  }
                }
              }
            } catch { /* use filename */ }
            installedNames.add(name);
          }
        }
      } catch { /* ignore */ }
    }
  }

  const ranked = rankSkillsForTask(task, installedNames);
  if (ranked.length === 0) {
    t('  No matching skills found. Try different terms.');
    return 0;
  }

  console.log('');
  h(`skill-surge suggest`);
  d();
  t(`  Task: ${T.accent(task)}`);
  t(`  Found: ${T.white(String(ranked.length))} skills`);
  console.log('');

  for (let i = 0; i < Math.min(ranked.length, 12); i++) {
    const c = ranked[i];
    const installed = c.installed ? T.green('installed ✓') : T.muted('not installed');
    const scoreBar = '█'.repeat(Math.round(c.score / 10)) + '░'.repeat(10 - Math.round(c.score / 10));
    const scoreColor = c.score >= 80 ? T.green : c.score >= 60 ? T.accent : T.muted;
    console.log(`  ${T.white(String(i + 1).padStart(2, ' '))}. ${T.bold(c.name)}`);
    console.log(`      ${scoreColor(scoreBar)} ${String(c.score).padStart(3)}/100  ${T.muted(c.description.slice(0, 55))}`);
    console.log(`      ${installed}  ${T.muted(c.reason)}`);
    console.log('');
  }

  const topCandidate = ranked[0];
  if (!topCandidate.installed) {
    const doInstall = await confirm(`Install ${topCandidate.name}?`, false);
    if (doInstall) {
      installSkillToAgents(topCandidate.name, agents, 'global');
      g(`  Installed ${topCandidate.name}.`);
    }
  }

  return 0;
}

async function cmdInstall(args: string[]) {
  let skillName = '';
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--')) continue;
    if (arg === '-y' || arg === '--yes') dryRun = true;
    else if (!arg.startsWith('--') && !skillName) skillName = arg;
  }

  if (!skillName) {
    r('  Usage: skill-surge install <skill-name>');
    return 1;
  }

  const skill = getSkillByName(skillName);
  if (!skill) {
    r(`  Skill "${skillName}" not found. Run skill-surge list to see available skills.`);
    return 1;
  }

  const agents = detectAgents().filter(a => a.installed);
  if (agents.length === 0) {
    r('  No agent environments detected.');
    return 1;
  }

  console.log('');
  h(`skill-surge install  ${skill.name}`);
  d();
  t(`  ${T.muted(skill.description)}`);
  console.log('');
  t(`  ${T.muted('Install to which agents?')}`);

  const choices = agents.map(a => `${a.name}  ${T.muted(a.globalPath)}`);
  choices.push('All detected agents');

  const choice = await select('Agent:', choices);
  const selected = choice === agents.length ? agents : [agents[choice]];

  const scopeChoice = await select('Scope:', ['Global  (~/.claude/skills/)', 'Project  (./.agents/skills/)', 'Both']);
  const scopes = ['global', 'project', 'both'] as const;
  const scope = scopes[scopeChoice];

  console.log('');
  t(`  Installing to: ${selected.map(a => a.name).join(', ')} (${scope})`);
  if (dryRun) t('  (dry run — no changes made)');
  console.log('');

  const results = installSkillToAgents(skillName, selected, scope, { dryRun });
  for (const res of results) {
    if (res.success) g(`  ✓ ${res.skill} → ${res.agent}`);
    else r(`  ✗ ${res.skill} → ${res.agent}: ${res.error}`);
  }

  return results.every(r => r.success) ? 0 : 1;
}

async function cmdList() {
  const agents = detectAgents().filter(a => a.installed);
  const allPaths = [
    ...agents.map(a => resolveAgentPath(a, 'global')),
    ...agents.map(a => resolveAgentPath(a, 'project')),
  ];
  const installedNames = new Set<string>();

  for (const gp of allPaths) {
    if (fs.existsSync(gp)) {
      try {
        for (const f of fs.readdirSync(gp)) {
          if (f.endsWith('.md')) {
            let name = f.replace(/\.md$/, '');
            try {
              const c = fs.readFileSync(path.join(gp, f), 'utf8');
              if (c.startsWith('---')) {
                const end = c.indexOf('\n---', 3);
                if (end > 0) {
                  for (const line of c.slice(3, end).split('\n')) {
                    const m2 = line.match(/^name:\s*(.+)$/);
                    if (m2) { name = m2[1].trim(); break; }
                  }
                }
              }
            } catch { /* use filename */ }
            installedNames.add(name);
          }
        }
      } catch { /* ignore */ }
    }
  }

  console.log('');
  h(`skill-surge list`);
  d();
  t(`  ${T.white(String(installedNames.size))} skills installed across ${agents.length} agent(s).`);
  console.log('');

  const byCategory: Record<string, string[]> = {};
  for (const skill of ALL_SKILLS) {
    if (!byCategory[skill.category]) byCategory[skill.category] = [];
    if (installedNames.has(skill.name)) byCategory[skill.category].push(skill.name);
  }

  for (const [cat, names] of Object.entries(byCategory)) {
    if (names.length === 0) continue;
    console.log(box(`  ${cat}`, names.map(n => `${T.green('✓')} ${T.white(n)}`)));
    console.log('');
  }

  return 0;
}

async function cmdHook(args: string[]) {
  let task = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--task' && args[i + 1]) {
      task = args[i + 1];
      i++;
    } else if (args[i].startsWith('--task=')) {
      task = args[i].slice('--task='.length);
    } else if (!args[i].startsWith('--') && !task) {
      task = args[i];
    }
  }

  if (!task) {
    r('  Usage: skill-surge hook --task "build a dashboard"');
    return 1;
  }

  if (isTrivialTask(task)) {
    const json = JSON.stringify({ task, shouldSuggest: false, detectedSkills: [], message: 'No skills detected for this task.' }, null, 2);
    console.log(json);
    return 0;
  }

  const agents = detectAgents().filter(a => a.installed);
  const allPaths = [
    ...agents.map(a => resolveAgentPath(a, 'global')),
    ...agents.map(a => resolveAgentPath(a, 'project')),
  ];
  const installedNames = new Set<string>();

  for (const gp of allPaths) {
    if (fs.existsSync(gp)) {
      try {
        for (const f of fs.readdirSync(gp)) {
          if (f.endsWith('.md')) {
            let name = f.replace(/\.md$/, '');
            try {
              const c = fs.readFileSync(path.join(gp, f), 'utf8');
              if (c.startsWith('---')) {
                const end = c.indexOf('\n---', 3);
                if (end > 0) {
                  for (const line of c.slice(3, end).split('\n')) {
                    const m2 = line.match(/^name:\s*(.+)$/);
                    if (m2) { name = m2[1].trim(); break; }
                  }
                }
              }
            } catch { /* use filename */ }
            installedNames.add(name);
          }
        }
      } catch { /* ignore */ }
    }
  }

  const ranked = rankSkillsForTask(task, installedNames);
  const topSkills = ranked.slice(0, 5);
  const detectedNames = topSkills.map(s => s.name);

  const payload = {
    task,
    shouldSuggest: detectedNames.length > 0,
    detectedSkills: detectedNames,
    message: detectedNames.length > 0
      ? `${detectedNames.length} skills detected. Run: skill-surge install <skill> --agent '*'`
      : 'No skills detected for this task.',
  };

  console.log(JSON.stringify(payload, null, 2));
  return 0;
}

async function cmdConfig() {
  const config = loadConfig();
  console.log('');
  console.log(T.muted('┌' + '─'.repeat(74) + '─┐'));
  console.log(T.bold('  skill-surge config'));
  console.log(T.muted('└' + '─'.repeat(74) + '─┘'));
  console.log('');
  const stripped = JSON.stringify(config, null, 2).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
  console.log(stripped);
  return 0;
}

function printHelp() {
  console.log('');
  console.log(`  ${T.bold('skill-surge')}  ${T.muted(`v${VERSION}`)}`);
  console.log('');
  console.log(`  ${T.muted('Commands:')}`);
  console.log(`    ${T.accent('init')}                 First-run setup — detect agents, install all skills`);
  console.log(`    ${T.accent('scan')}                 Audit project — show installed vs available skills`);
  console.log(`    ${T.accent('suggest')} --task "..." Find and rank skills for a task`);
  console.log(`    ${T.accent('install')} <skill>       Install a skill to selected agents`);
  console.log(`    ${T.accent('list')}                 List all installed skills`);
  console.log(`    ${T.accent('hook')} --task "..."    Agent trigger — returns JSON for agent integration`);
  console.log(`    ${T.accent('config')}                Show current configuration`);
  console.log('');
  console.log(`  ${T.muted('Examples:')}`);
  console.log(`    skill-surge init`);
  console.log(`    skill-surge scan`);
  console.log(`    skill-surge suggest --task "build a login system with OAuth"`);
  console.log(`    skill-surge install react-patterns`);
  console.log(`    skill-surge hook --task "add user authentication"`);
  console.log('');
  console.log(`  ${T.muted('Docs:')}  ${T.accent('https://github.com/CodePuri/skill-surge')}`);
  console.log('');
}

const COMMANDS: Record<string, (args: string[]) => Promise<number>> = {
  init: cmdInit,
  scan: cmdScan,
  suggest: cmdSuggest,
  install: cmdInstall,
  list: cmdList,
  hook: cmdHook,
  config: cmdConfig,
};

(async () => {
  const [, , command = 'help', ...args] = process.argv;

  if (command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    process.exitCode = 0;
    return;
  }
  if (command === '--version' || command === '-v' || command === 'version') {
    console.log(VERSION);
    process.exitCode = 0;
    return;
  }

  const handler = COMMANDS[command];
  if (!handler) {
    console.error(`\n  ${T.red('Unknown command:')} ${command}\n`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  try {
    const code = await handler(args);
    process.exitCode = code ?? 0;
  } catch (err) {
    console.error(`\n  ${T.red('Error:')} ${err instanceof Error ? err.message : String(err)}\n`);
    process.exitCode = 1;
  }
})();
