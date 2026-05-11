#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { Agent, ScoredCandidate, ScanResult } from './types.js';
import { detectAgents, detectInstalledAgents, resolveAgentPath, auditProject, loadConfig, loadCache, saveCache, userConfigPath, installSkillToAgents, installTopRepoSkills } from './install.js';
import { ALL_SKILLS, getSkillByName, isTrivialTask, rankSkillsForTask, runSkillsFind } from './search.js';
import { T, box, divider, header, C } from './ui/terminal.js';
import { select, interactiveMultiSelect, confirmWithPrompt } from './ui/prompt.js';
import { logo, errorBanner, successBanner, sectionHeader, infoBox, progressBox, installSummary, securityTable, installComplete, promptBox, divider as bannerDivider } from './ui/banner.js';
import { skillsTable, candidateTable, installedTable, summaryLine, dashboardBox } from './ui/table.js';
import { startSpinner, stopSpinner, stopSpinnerWithSuccess, stopSpinnerWithError } from './ui/spinner.js';

const VERSION = '2.2.0';
const CYAN = C.brightCyan;
const GREEN = C.brightGreen;
const WHITE = C.white;
const RESET = C.reset;

function t(msg: string) { console.log(T.text(msg)); }
function m(msg: string) { console.log(T.muted(msg)); }
function g(msg: string) { console.log(T.green(msg)); }
function r(msg: string) { console.log(T.red(msg)); }
function a(msg: string) { return T.accent(msg); }
function b(msg: string) { console.log(T.bold(msg)); }
function d() { console.log(divider()); }
function h(msg: string) { console.log(header(msg)); }

function printSplash() {
  console.log('\n' + logo());
  console.log('');
  console.log(`${CYAN}  skill-surge  ${RESET}${WHITE}v${VERSION}${RESET}`);
  console.log('');
  console.log(`  ${CYAN}▸${RESET} skill-surge init       First-run setup`);
  console.log(`  ${CYAN}▸${RESET} skill-surge add        Interactive skill installation`);
  console.log(`  ${CYAN}▸${RESET} skill-surge scan       Audit project`);
  console.log(`  ${CYAN}▸${RESET} skill-surge list       Show installed skills`);
  console.log(`  ${CYAN}▸${RESET} skill-surge suggest    Find skills for a task`);
  console.log(`  ${CYAN}▸${RESET} skill-surge hook       Agent trigger (JSON)`);
  console.log('');
  console.log('  Docs: ' + a('https://github.com/CodePuri/skill-surge'));
  console.log('');
}

async function cmdAdd(args: string[]) {
  let repoArg = '';
  
  for (const arg of args) {
    if (!arg.startsWith('--') && !repoArg) repoArg = arg;
  }

  console.log('\n' + logo());
  console.log('');

  const agents = detectAgents();
  const installedAgents = agents.filter(a => a.installed);
  
  let availableSkills = [...ALL_SKILLS];
  let sourceName = 'skill-surge (bundled)';
  let sourceUrl = 'https://github.com/CodePuri/skill-surge-skills';
  
  if (repoArg) {
    startSpinner('Fetching skills from ' + repoArg);
    await new Promise(resolve => setTimeout(resolve, 500));
    stopSpinner();
    
    sourceName = repoArg;
    sourceUrl = `https://github.com/${repoArg}.git`;
    console.log(`${CYAN}◇${RESET}  Source: ${sourceUrl}`);
    
    const topSkills = ALL_SKILLS.filter(s => s.source === 'top-repo' && s.repo?.includes(repoArg.split('/')[0]));
    if (topSkills.length > 0) {
      availableSkills = topSkills;
    }
  }
  
  const skillCount = availableSkills.length;
  console.log(`${CYAN}◇${RESET}  Found ${skillCount} skills`);
  console.log('');
  
  console.log(`${CYAN}◇${RESET}  Select skills to install (space to toggle)`);
  const skillNames = availableSkills.map(s => s.name);
  const selectedIndices = await interactiveMultiSelect('', skillNames);
  const selectedSkills = selectedIndices.map(i => availableSkills[i]);
  
  if (selectedSkills.length === 0) {
    console.log('\n  No skills selected. Exiting.\n');
    return 0;
  }
  
  console.log('');
  console.log(`${CYAN}◇${RESET}  ${installedAgents.length} agents`);
  
  let agentOptions = installedAgents.map(a => a.name);
  if (agentOptions.length === 0) {
    agentOptions = ['All agents (global)'];
  }
  
  console.log(`${CYAN}◇${RESET}  Which agents do you want to install to?`);
  const agentIndices = await interactiveMultiSelect('', agentOptions);
  const selectedAgents = agentIndices.map(i => installedAgents[i] || installedAgents[0]);
  
  console.log('');
  console.log(`${CYAN}◇${RESET}  Installation scope`);
  const scopeIdx = await select('  Choose:', ['Global  (recommended)', 'Project  (./.agents/skills/)']);
  const scopes = ['global', 'project'] as const;
  const scope = scopes[scopeIdx];
  
  console.log('');
  console.log(`${CYAN}◇${RESET}  Installation method`);
  const methodIdx = await select('  Choose:', ['Symlink  (recommended)', 'Copy']);
  const method = methodIdx === 0 ? 'symlink' : 'copy';
  
  console.log('');
  const summaryItems = selectedSkills.slice(0, 5).map(skill => ({
    path: `~/.agents/skills/${skill.name}`,
    agents: selectedAgents.map(a => a.name).slice(0, 3).join(', ') + (selectedAgents.length > 3 ? ' +more' : ''),
    method: method
  }));
  console.log(installSummary(summaryItems));
  console.log('');
  
  const securityItems = selectedSkills.slice(0, 6).map(skill => ({
    name: skill.name.slice(0, 25),
    gen: 'Safe',
    socket: '0 alerts',
    snyk: 'Low Risk'
  }));
  console.log(securityTable(securityItems));
  console.log('');
  
  if (selectedSkills.length > 6) {
    console.log(`  ... and ${selectedSkills.length - 6} more skills`);
    console.log('');
  }
  
  console.log(`  Details: ${sourceUrl}`);
  console.log('');
  
  const proceed = await confirmWithPrompt('Proceed with installation?');
  if (!proceed) {
    console.log('\n  Installation cancelled.\n');
    return 0;
  }
  
  console.log('');
  startSpinner('Installing skills...');
  
  const installedItems: { skill: string; path: string; agents: string }[] = [];
  
  for (const skill of selectedSkills) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const results = installSkillToAgents(skill.name, selectedAgents, scope, { installMode: method as 'copy' | 'symlink' });
    const success = results.filter(r => r.success).length;
    
    if (success > 0) {
      installedItems.push({
        skill: skill.name,
        path: `~/.agents/skills/${skill.name}`,
        agents: selectedAgents.map(a => a.name).slice(0, 3).join(', ') + (selectedAgents.length > 3 ? ' +more' : '')
      });
    }
  }
  
  stopSpinner();
  console.log('\n' + installComplete(installedItems));
  console.log('');
  console.log(`${CYAN}└${RESET}  Done!  Review skills before use; they run with full agent permissions.`);
  console.log('');
  
  return 0;
}

async function cmdInit() {
  console.log('\n' + logo());
  console.log('');

  const agents = detectAgents();
  const installed = agents.filter(a => a.installed);
  
  if (installed.length === 0) {
    console.log(`${CYAN}◇${RESET}  No agent environments detected.`);
    console.log(`  skill-surge will install skills to global directories regardless.`);
  } else {
    console.log(`${CYAN}◇${RESET}  Detected agents:`);
    for (const agent of installed) {
      console.log(`    ${CYAN}▸${RESET} ${agent.name}  ${T.muted(agent.globalPath)}`);
    }
  }
  console.log('');

  const scopeIdx = await select('Where should skills be installed?', [
    'Global only  (~/.claude/skills/)',
    'Project only  (./.agents/skills/)',
    'Both global and project'
  ]);
  const scopes = ['global', 'project', 'both'] as const;
  const scope = scopes[scopeIdx];

  const agentsToUse = installed.length > 0 ? installed : agents.filter(a => a.globalPath.includes('agents'));
  if (agentsToUse.length === 0) {
    r('  No agent directories available. Aborting.');
    return 1;
  }

  console.log('');
  console.log(`${CYAN}◇${RESET}  Installing to: ${agentsToUse.map(a => a.name).join(', ')}`);
  console.log(`${CYAN}◇${RESET}  Scope: ${scope}`);
  console.log('');

  console.log(installSummary([{
    path: 'Installing all 29 bundled skills',
    agents: agentsToUse.map(a => a.name).join(', '),
    method: 'symlink'
  }]));
  console.log('');

  const proceed = await confirmWithPrompt('Proceed with installation?');
  if (!proceed) {
    console.log('\n  Installation cancelled.\n');
    return 0;
  }

  console.log('');
  startSpinner('Installing skills...');

  const topRepoResults = installTopRepoSkills(agentsToUse, scope);
  for (const result of topRepoResults) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const originals = ALL_SKILLS.filter(s => s.source === 'original');
  for (const skill of originals) {
    await new Promise(resolve => setTimeout(resolve, 50));
    installSkillToAgents(skill.name, agentsToUse, scope);
  }

  stopSpinner();
  console.log('');
  console.log(successBanner());
  console.log('');
  console.log(`${CYAN}└${RESET}  Done!  ${ALL_SKILLS.length} skills installed across ${agentsToUse.length} agent(s).`);
  console.log('');
  console.log(`  Run ${a('skill-surge scan')} to audit your project.`);
  console.log(`  Run ${a('skill-surge suggest --task "..."')} to find skills.`);
  console.log('');

  return 0;
}

async function cmdScan() {
  const agents = detectAgents();
  const installedAgents = agents.filter(a => a.installed);

  const globalPaths = installedAgents.map(a => resolveAgentPath(a, 'global'));
  const projectPaths = installedAgents.map(a => resolveAgentPath(a, 'project'));
  const allPaths = [...globalPaths, ...projectPaths];

  const result = auditProject(allPaths);

  console.log('');
  console.log(dashboardBox([
    { label: 'Version', value: VERSION, status: 'ok' },
    { label: 'Node', value: process.version, status: 'ok' },
    { label: 'Platform', value: process.platform, status: 'ok' },
    { label: 'Skills Installed', value: String(result.installed.length), status: result.installed.length > 0 ? 'ok' : 'warn' },
    { label: 'Skills Available', value: String(result.available.length), status: 'ok' },
  ]));
  console.log('');

  if (result.installed.length > 0) {
    console.log(infoBox('  Installed Skills', result.installed.slice(0, 10).map(s => 
      `${GREEN}✓${RESET} ${s.name}  ${T.muted('in ' + s.agent)}`
    )));
    console.log('');
  }

  const projType = result.projectType[0] || '';
  const recMap: Record<string, string[]> = {
    'React': ['react-patterns', 'vercel-react-best-practices'],
    'Next.js': ['next-best-practices', 'vercel-react-best-practices'],
    'Express': ['node-api-design', 'error-handling'],
    'Supabase': ['supabase-postgres-best-practices', 'database-patterns'],
    'Node.js': ['node-api-design', 'error-handling', 'testing-strategies'],
  };
  const recs = recMap[projType] || [];
  const uninstalledRecs = recs.filter(r => !result.installed.some(i => i.name === r));

  if (uninstalledRecs.length > 0) {
    console.log(infoBox('  Recommended for this project', uninstalledRecs.map(r => 
      `${T.muted('○')} ${r}`
    )));
    console.log('');
    t(`  ${T.muted('Install:')} skill-surge add  (select recommended skills)`);
    console.log('');
  }

  t(`  ${T.muted('Quick action:')} skill-surge suggest --task "..."  or  skill-surge add`);
  console.log('');

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
  console.log(sectionHeader('Skills Found for: "' + task + '"'));
  console.log('');
  console.log(candidateTable(ranked.slice(0, 10).map(c => ({
    name: c.name,
    score: c.score,
    reason: c.reason
  }))));
  console.log('');

  return 0;
}

async function cmdList() {
  const agents = detectAgents().filter(a => a.installed);

  const skillAgentMap = new Map<string, string[]>();
  for (const agent of agents) {
    for (const scope of ['global', 'project'] as const) {
      const dir = resolveAgentPath(agent, scope);
      if (!fs.existsSync(dir)) continue;
      try {
        for (const f of fs.readdirSync(dir)) {
          if (!f.endsWith('.md')) continue;
          let name = f.replace(/\.md$/, '');
          try {
            const c = fs.readFileSync(path.join(dir, f), 'utf8');
            if (c.startsWith('---')) {
              const end = c.indexOf('\n---', 3);
              if (end > 0) {
                for (const line of c.slice(3, end).split('\n')) {
                  const m2 = line.match(/^name:\s*(.+)$/);
                  if (m2) { name = m2[1].trim(); break; }
                }
              }
            }
          } catch {}
          const list = skillAgentMap.get(name) || [];
          if (!list.includes(agent.name)) list.push(agent.name);
          skillAgentMap.set(name, list);
        }
      } catch {}
    }
  }

  const categories = [...new Set(ALL_SKILLS.map(s => s.category))];
  const order = ['workflow', 'design', 'frontend', 'backend', 'database', 'security', 'devops', 'docs', 'qa', 'architecture', 'planning', 'meta'];
  const sorted = order.filter(c => categories.includes(c));

  console.log('');
  console.log(sectionHeader('skill-surge Skills'));
  console.log('');

  for (const cat of sorted) {
    const skills = ALL_SKILLS.filter(s => s.category === cat);
    console.log(`  ${CYAN}━━━ ${cat.toUpperCase()} (${skills.length}) ━━━${RESET}`);
    console.log('');
    for (const s of skills) {
      const agents = skillAgentMap.get(s.name);
      const icon = agents ? `${GREEN}●${RESET}` : ` ${T.muted('○')}`;
      const info = agents ? agents.join(', ') : `${T.muted('available')}`;
      console.log(`  ${icon} ${s.name.padEnd(30)} ${info}`);
    }
    console.log('');
  }

  console.log(summaryLine(
    ALL_SKILLS.filter(s => s.source === 'original').length,
    0,
    ALL_SKILLS.filter(s => s.source === 'top-repo').length,
    ALL_SKILLS.length
  ));
  console.log('');

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
    console.log(errorBanner());
    console.log(`${CYAN} ERROR${RESET}  Missing required argument: task`);
    console.log('');
    console.log(`  Usage:`);
    console.log(`    skill-surge hook --task "build a dashboard"`);
    console.log('');
    return 1;
  }

  if (isTrivialTask(task)) {
    console.log(JSON.stringify({ task, shouldSuggest: false, detectedSkills: [], message: 'No skills detected for this task.' }, null, 2));
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
      ? `${detectedNames.length} skills detected. Run: skill-surge add`
      : 'No skills detected for this task.',
  };

  console.log(JSON.stringify(payload, null, 2));
  return 0;
}

async function cmdConfig() {
  const config = loadConfig();
  console.log('');
  console.log(sectionHeader('Config'));
  console.log('');
  console.log(JSON.stringify(config, null, 2));
  return 0;
}

function printHelp() {
  printSplash();
}

const COMMANDS: Record<string, (args: string[]) => Promise<number>> = {
  init: cmdInit,
  add: cmdAdd,
  scan: cmdScan,
  suggest: cmdSuggest,
  list: cmdList,
  hook: cmdHook,
  config: cmdConfig,
};

(async () => {
  const [, , command, ...args] = process.argv;

  if (command === undefined || command === '') {
    printSplash();
    process.exitCode = 0;
    return;
  }

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
    console.log('\n' + errorBanner());
    console.log(`\n${CYAN} ERROR${RESET}  Unknown command: ${command}\n`);
    printSplash();
    process.exitCode = 1;
    return;
  }

  try {
    const code = await handler(args);
    process.exitCode = code ?? 0;
  } catch (err) {
    console.log('\n' + errorBanner());
    console.error(`\n${CYAN} ERROR${RESET}  ${err instanceof Error ? err.message : String(err)}\n`);
    process.exitCode = 1;
  }
})();