import { spawnSync } from 'node:child_process';
import type { Finding, FindingSeverity, RefreshReport } from './contracts.js';
import { redactSecrets } from './policy.js';
import { sha256 } from './identity.js';

interface CommandResult {
  status: number;
  stdout: string;
  stderr: string;
}

interface CommandSpec {
  name: 'build' | 'test' | 'audit' | 'ci';
  command: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
}

interface ProposedFinding {
  title: string;
  evidence: string;
  reproductionCommand?: string;
  severity?: FindingSeverity;
}

export interface DiagnosticOptions {
  refreshReport: RefreshReport;
  commands: CommandSpec[];
  runCommand?: (command: string) => Promise<CommandResult>;
  githubIssues: GitHubIssue[];
  modelFindings: ProposedFinding[];
}

async function defaultRunCommand(command: string): Promise<CommandResult> {
  const result = spawnSync('/bin/sh', ['-lc', command], {
    encoding: 'utf8',
    timeout: 120_000,
    shell: false,
    env: process.env,
  });
  return { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function findingId(source: Finding['source'], title: string, evidence: string): string {
  return sha256(`${source}:${title}:${evidence}`).slice(0, 16);
}

function makeFinding(input: Omit<Finding, 'id'>): Finding {
  return { id: findingId(input.source, input.title, input.evidence), ...input };
}

function hasReproduction(body: string): boolean {
  return /(steps? to reproduce|reproduction|repro\b|npm (?:test|run)|node dist\/)/i.test(body);
}

export async function collectDiagnostics(options: DiagnosticOptions): Promise<Finding[]> {
  const run = options.runCommand ?? defaultRunCommand;
  const findings: Finding[] = [];

  for (const check of options.commands) {
    const result = await run(check.command);
    if (result.status === 0) continue;
    const evidence = redactSecrets(`${result.stdout}\n${result.stderr}`.trim()).slice(0, 4000);
    const source = check.name === 'audit' ? 'audit' : check.name === 'test' ? 'test' : 'ci';
    findings.push(makeFinding({
      source,
      severity: check.name === 'audit' ? 'high' : 'medium',
      title: `${check.name} verification failed`,
      evidence: evidence || `command exited ${result.status}`,
      reproductionCommand: check.command,
      eligible: true,
    }));
  }

  const drift = [
    ...options.refreshReport.added.map(skill => `added:${skill.source}:${skill.name}`),
    ...options.refreshReport.changed.map(skill => `changed:${skill.source}:${skill.name}`),
    ...options.refreshReport.removed.map(skill => `removed:${skill.source}:${skill.name}`),
  ];
  if (drift.length > 0) {
    findings.push(makeFinding({
      source: 'catalog',
      severity: 'medium',
      title: 'Skill catalog metadata drift detected',
      evidence: drift.join('\n'),
      reproductionCommand: 'node dist/cli.js refresh --network --json',
      eligible: true,
    }));
  }

  for (const issue of options.githubIssues.filter(issue => issue.labels.some(label => ['bug', 'security', 'regression'].includes(label)))) {
    const reproducible = hasReproduction(issue.body);
    findings.push(makeFinding({
      source: 'github',
      severity: issue.labels.includes('security') ? 'high' : 'medium',
      title: `#${issue.number} ${issue.title}`,
      evidence: redactSecrets(issue.body).slice(0, 4000),
      reproductionCommand: reproducible ? `gh issue view ${issue.number}` : undefined,
      eligible: reproducible,
      blockedReason: reproducible ? undefined : 'missing reproduction evidence',
    }));
  }

  for (const proposed of options.modelFindings) {
    const reproducible = Boolean(proposed.reproductionCommand);
    findings.push(makeFinding({
      source: 'model',
      severity: proposed.severity ?? 'low',
      title: proposed.title,
      evidence: redactSecrets(proposed.evidence).slice(0, 4000),
      reproductionCommand: proposed.reproductionCommand,
      eligible: reproducible,
      blockedReason: reproducible ? undefined : 'missing deterministic reproduction command',
    }));
  }

  const priority: Record<FindingSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return findings.sort((a, b) => priority[a.severity] - priority[b.severity] || a.id.localeCompare(b.id));
}
