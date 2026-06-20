import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AutomationConfig, Platform } from './contracts.js';

type Environment = Record<string, string | undefined>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string' && item.length > 0);
}

function parseConfig(value: unknown): AutomationConfig {
  if (!isRecord(value) || value.schemaVersion !== 1) throw new Error('Invalid automation configuration: schemaVersion');
  const selfImprove = value.selfImprove;
  const publication = value.publication;
  if (!isRecord(selfImprove) || !isRecord(publication)) throw new Error('Invalid automation configuration: sections');
  const platforms = publication.platforms;
  const limits = publication.maxPostsPerCycle;
  if (!isRecord(platforms) || !isRecord(limits)) throw new Error('Invalid automation configuration: platforms');

  const valid = isBoolean(selfImprove.enabled)
    && isPositiveInteger(selfImprove.maxFixesPerCycle)
    && isPositiveInteger(selfImprove.maxChangedFiles)
    && isPositiveInteger(selfImprove.maxChangedLines)
    && isStringArray(selfImprove.protectedPaths)
    && isBoolean(publication.enabled)
    && isPositiveInteger(publication.maxRetries)
    && isPositiveInteger(publication.retryBackoffMs)
    && (['x', 'reddit', 'substack'] as Platform[]).every(key => isBoolean(platforms[key]) && isPositiveInteger(limits[key]))
    && isStringArray(publication.redditAllowlist);
  if (!valid) throw new Error('Invalid automation configuration: values');

  return value as unknown as AutomationConfig;
}

function envBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(value.toLowerCase())) return true;
  if (['0', 'false', 'no', 'off'].includes(value.toLowerCase())) return false;
  throw new Error(`Invalid automation configuration: boolean override ${value}`);
}

export function loadAutomationConfig(
  configPath = path.resolve('config/automation.json'),
  env: Environment = process.env,
): AutomationConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid automation configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
  const config = parseConfig(parsed);
  return {
    ...config,
    selfImprove: {
      ...config.selfImprove,
      enabled: envBoolean(env.SKILL_SURGE_SELF_IMPROVE_ENABLED, config.selfImprove.enabled),
    },
    publication: {
      ...config.publication,
      enabled: envBoolean(env.SKILL_SURGE_PUBLICATION_ENABLED, config.publication.enabled),
      platforms: {
        x: envBoolean(env.SKILL_SURGE_PUBLISH_X_ENABLED, config.publication.platforms.x),
        reddit: envBoolean(env.SKILL_SURGE_PUBLISH_REDDIT_ENABLED, config.publication.platforms.reddit),
        substack: envBoolean(env.SKILL_SURGE_PUBLISH_SUBSTACK_ENABLED, config.publication.platforms.substack),
      },
    },
  };
}

function matchesPattern(filePath: string, pattern: string): boolean {
  const normalized = filePath.replaceAll('\\', '/').replace(/^\.\//, '');
  const target = pattern.replaceAll('\\', '/').replace(/^\.\//, '');
  if (target.endsWith('/**')) return normalized === target.slice(0, -3) || normalized.startsWith(target.slice(0, -2));
  return normalized === target;
}

export function isProtectedPath(filePath: string, config: AutomationConfig): boolean {
  return config.selfImprove.protectedPaths.some(pattern => matchesPattern(filePath, pattern));
}

export function validateChangeScope(
  changedFiles: number,
  changedLines: number,
  config: AutomationConfig,
): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (changedFiles > config.selfImprove.maxChangedFiles) {
    reasons.push(`changed files ${changedFiles} exceeds ${config.selfImprove.maxChangedFiles}`);
  }
  if (changedLines > config.selfImprove.maxChangedLines) {
    reasons.push(`changed lines ${changedLines} exceeds ${config.selfImprove.maxChangedLines}`);
  }
  return { allowed: reasons.length === 0, reasons };
}

export function redactSecrets(input: string, secrets: string[] = []): string {
  let output = input;
  for (const secret of secrets.filter(Boolean)) output = output.split(secret).join('[REDACTED]');
  output = output.replace(/(Bearer\s+)[A-Za-z0-9._~-]{12,}/gi, '$1[REDACTED]');
  output = output.replace(/((?:token|secret|password|api[_-]?key)\s*[=:]\s*)[^\s]+/gi, '$1[REDACTED]');
  return output;
}

export function isKillSwitchActive(
  job: 'self-improve' | 'publish',
  configDir = path.join(os.homedir(), '.config', 'skill-surge'),
): boolean {
  const jobFile = job === 'self-improve' ? 'PAUSE_SELF_IMPROVE' : 'PAUSE_PUBLISH';
  return fs.existsSync(path.join(configDir, 'PAUSE_ALL')) || fs.existsSync(path.join(configDir, jobFile));
}
