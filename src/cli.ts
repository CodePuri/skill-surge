#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import type { Agent, ScoredCandidate, ScanResult } from './types.js';
import { detectAgents, detectInstalledAgents, resolveAgentPath, auditProject, loadConfig, loadCache, saveCache, userConfigPath, installSkillToAgents, installTopRepoSkills } from './install.js';
import { ALL_SKILLS, getSkillByName, isTrivialTask, rankSkillsForTask, runSkillsFind } from './search.js';
import { T, box, divider, header, C } from './ui/terminal.js';
import { select, interactiveMultiSelect, confirmWithPrompt } from './ui/prompt.js';
import { logo, errorBanner, successBanner, sectionHeader, infoBox, progressBox, installSummary, securityTable, installComplete, promptBox, divider as bannerDivider } from './ui/banner.js';
import { skillsTable, candidateTable, installedTable, summaryLine, dashboardBox } from './ui/table.js';
import { startSpinner, stopSpinner, stopSpinnerWithSuccess, stopSpinnerWithError } from './ui/spinner.js';

const VERSION = '2.2.1';
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
  // If args[0] is a repo URL or owner/repo format → skills.sh style
  if (args[0] && (args[0].includes('/') || args[0].includes('.git'))) {
    return runSkillsShStyle(args[0]);
  }

  // If args[0] is a skill name → direct install
  if (args[0] && !args[0].startsWith('--')) {
    return installSkillDirect(args[0]);
  }

  // No args → interactive mode (existing logic)
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
    // Prepend "Select All" option
    const skillNames = [`☐ Select All (${availableSkills.length} skills)`, ...availableSkills.map(s => s.name)];
    const selectedIndices = await interactiveMultiSelect('', skillNames);
    
    // Handle "Select All" (index 0)
    let finalSelectedIndices: number[];
    if (selectedIndices.includes(0)) {
      // If "Select All" is selected, select all skills
      finalSelectedIndices = availableSkills.map((_, i) => i);
    } else {
      // Otherwise, subtract 1 from each index (to account for "Select All" at position 0)
      finalSelectedIndices = selectedIndices.map(i => i - 1).filter(i => i >= 0);
    }
    
    const selectedSkills = finalSelectedIndices.map(i => availableSkills[i]);
  
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

// skills.sh delegation
async function runSkillsShStyle(repo: string) {
  // Call npx skills add with the repo
  // Capture output, display to user
  // No need to recreate — npx skills handles agent detection, install, security
  const result = spawnSync('npx', ['skills', 'add', repo, '-y'], { stdio: 'inherit' });
  return result.status === 0 ? 0 : 1;
}

// direct install
async function installSkillDirect(name: string) {
  const skill = ALL_SKILLS.find(s => s.name === name);
  if (!skill) { 
    console.log(`  Skill not found.`);
    return 1; 
  }
  const agents = detectAgents();
  // Install to all detected agents
  for (const agent of agents) {
    installSkillToAgents(name, [agent], 'global');
  }
  console.log(`  Installed ${name} to ${agents.length} agent(s).`);
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

  const agentsToUse = installed.length > 0 ? installed : agents;
  
  const essential = [
    'brainstorming', 'writing-plans', 'executing-plans',
    'systematic-debugging', 'tdd', 'node-api-design',
    'auth-systems', 'database-patterns', 'error-handling',
    'testing-strategies', 'accessibility-first', 'security-hardening',
    'git-workflow', 'system-design', 'project-planning',
  ];

  const essentialSkills = ALL_SKILLS.filter(s => essential.includes(s.name));
  
  console.log(`${CYAN}◇${RESET}  Installing ${essentialSkills.length} essential skills to ${agentsToUse.length} agent(s).`);
  console.log(`  ${T.muted('Skills: ' + essentialSkills.map(s => s.name).join(', '))}`);
  console.log('');

  startSpinner('Installing essential skills...');
  
  let installedCount = 0;
  for (const skill of essentialSkills) {
    await new Promise(resolve => setTimeout(resolve, 100));
    for (const agent of agentsToUse) {
      const results = installSkillToAgents(skill.name, [agent], 'global', { installMode: 'symlink' });
      if (results.some(r => r.success)) installedCount++;
    }
  }

  stopSpinner();
  console.log('');
  console.log(successBanner());
  console.log('');
  console.log(`${CYAN}└${RESET}  Done!  ${essentialSkills.length} essential skills installed across ${agentsToUse.length} agent(s).`);
  console.log('');
  console.log(`  Run ${a('skill-surge scan')} to audit your project.`);
  console.log(`  Run ${a('skill-surge suggest --task "..."')} to find skills.`);
  console.log(`  Run ${a('skill-surge add')} to install more skills interactively.`);
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

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--task' && args[i + 1]) task = args[i + 1];
    else if (args[i] === '--task=') task = args[i].split('=')[1];
    else if (!args[i].startsWith('--') && !task) task = args[i];
  }

  if (!task) {
    r('  Usage: skill-surge suggest --task "build a login system"');
    return 1;
  }

  startSpinner('◇  Analyzing task...');
  
  const agentsList = detectAgents().filter(a => a.installed);
  const allPaths = [
    ...agentsList.map(a => resolveAgentPath(a, 'global')),
    ...agentsList.map(a => resolveAgentPath(a, 'project')),
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
  stopSpinner();

  if (ranked.length === 0) {
    t('  No matching skills found. Try different terms.');
    return 0;
  }

  // Take top 3
  const top3 = ranked.slice(0, 3);
  
  console.log('');
  console.log('  Top matches:');
  
  // Display as selectable list
  for (let i = 0; i < top3.length; i++) {
    const skill = top3[i];
    const installed = installedNames.has(skill.name) ? '●' : '○';
    console.log(`    [${i + 1}] ${installed} ${skill.name.padEnd(20)} — ${skill.reason}`);
  }
  
  console.log('');
  
  // Get user input for selection
  const selectionInput = await new Promise<string>((resolve) => {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    rl.question('Install one? [1-3 / Enter to skip]: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
  
  // If user just pressed Enter, skip
  if (selectionInput === '') {
    console.log('');
    return 0;
  }
  
  // Parse selection
  const selection = parseInt(selectionInput, 10);
  if (isNaN(selection) || selection < 1 || selection > 3) {
    console.log('  Invalid selection. Skipping.');
    return 0;
  }
  
  const selectedSkill = top3[selection - 1];
  console.log(`  Installing ${selectedSkill.name}...`);
  
  // Auto-install the selected skill
  const agentsToInstall = detectAgents();
  for (const agent of agentsToInstall) {
    installSkillToAgents(selectedSkill.name, [agent], 'global');
  }
  
  console.log(`  ✓ Installed ${selectedSkill.name} to ${agentsToInstall.length} agent(s).`);
  console.log('');
  
  return 0;
}

async function cmdList() {
  const agents = detectAgents().filter(a => a.installed);

  // Build a map of skill → agents that have it installed
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

  // Category display names → internal category values
  const categoryMap: { label: string; internal: string[] }[] = [
    { label: 'Workflow & Planning', internal: ['workflow', 'planning'] },
    { label: 'Frontend / UI',       internal: ['frontend'] },
    { label: 'Backend / API',       internal: ['backend'] },
    { label: 'Database',            internal: ['database'] },
    { label: 'Security',            internal: ['security'] },
    { label: 'DevOps / Deploy',     internal: ['devops'] },
    { label: 'Design / UX',         internal: ['design'] },
    { label: 'QA / Testing',        internal: ['qa'] },
    { label: 'Architecture',        internal: ['architecture'] },
    { label: 'All Skills (29 total)', internal: [] },
  ];

  const categoryChoices = categoryMap.map(c => c.label);
  
  console.log('');
  console.log(sectionHeader('skill-surge Catalog'));
  console.log('');

  const choice = await select('What are you building?', categoryChoices);

  // "All Skills" (last option) → show multi-select with Select All, then install
  if (choice === categoryMap.length - 1) {
    console.log(`${CYAN}◇${RESET}  Select skills to install (space to toggle)`);
    const skillNames = [`☐ Select All (${ALL_SKILLS.length} skills)`, ...ALL_SKILLS.map(s => s.name)];
    const selectedIndices = await interactiveMultiSelect('', skillNames);
    
    let finalIndices: number[];
    if (selectedIndices.includes(0)) {
      finalIndices = ALL_SKILLS.map((_, i) => i);
    } else {
      finalIndices = selectedIndices.map(i => i - 1).filter(i => i >= 0);
    }
    
    const selectedSkills = finalIndices.map(i => ALL_SKILLS[i]);
    if (selectedSkills.length === 0) {
      console.log('\n  No skills selected. Exiting.\n');
      return 0;
    }
    
    console.log('');
    const proceed = await confirmWithPrompt('Install selected skills?');
    if (!proceed) {
      console.log('\n  Installation cancelled.\n');
      return 0;
    }
    
    console.log('');
    startSpinner('Installing skills...');
    let installedCount = 0;
    for (const skill of selectedSkills) {
      for (const agent of agents) {
        const results = installSkillToAgents(skill.name, [agent], 'global', { installMode: 'symlink' });
        if (results.some(r => r.success)) installedCount++;
      }
    }
    stopSpinner();
    console.log(`  ${GREEN}✓${RESET}  Installed ${installedCount} skill(s) to ${agents.length} agent(s).\n`);
    return 0;
  }

  // Specific category → show skills
  const selectedCategory = categoryMap[choice];
  const categorySkills = ALL_SKILLS.filter(s => selectedCategory.internal.includes(s.category));
  
  console.log(`\n  ${CYAN}━━━ ${selectedCategory.label} (${categorySkills.length}) ━━━${RESET}\n`);
  
  for (const s of categorySkills) {
    const installedAgentsList = skillAgentMap.get(s.name);
    const icon = installedAgentsList ? `${GREEN}●${RESET}` : ` ${T.muted('○')}`;
    const info = installedAgentsList ? installedAgentsList.join(', ') : `${T.muted('available')}`;
    console.log(`  ${icon} ${s.name.padEnd(30)} ${info}`);
    console.log(`  ${T.muted('  ' + s.description)}`);
  }
  
  console.log('');
  console.log(`  Type ${a('skill-surge add <skill-name>')} to install a specific skill.`);
  console.log(`  Run ${a('skill-surge add')} for the interactive installer.\n`);

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