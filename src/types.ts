export const VERSION = '2.2.1';

export interface Agent {
  name: string;
  slug: string;
  globalPath: string;
  localPath: string;
  installed: boolean;
}

export interface Skill {
  name: string;
  description: string;
  category: string;
  source: 'top-repo' | 'original';
  repo?: string;
  installs?: number;
  tags: string[];
}

export interface InstalledSkill {
  name: string;
  agent: string;
  path: string;
  installedAt: string;
}

export interface ScanResult {
  projectType: string[];
  installed: InstalledSkill[];
  available: Skill[];
  missing: Skill[];
  byCategory: Record<string, { installed: string[]; missing: string[] }>;
}

export interface HookPayload {
  task: string;
  shouldSuggest: boolean;
  detectedSkills: string[];
  message: string;
  candidates?: ScoredCandidate[];
}

export interface ScoredCandidate {
  name: string;
  description: string;
  category: string;
  score: number;
  source: string;
  installed: boolean;
  reason: string;
}

export interface Config {
  preferredAgents: string[];
  installMode: 'copy' | 'symlink';
  scope: 'global' | 'project' | 'both';
  trustedOwners: string[];
  customSources: string[];
}

export interface InitOptions {
  scope: 'global' | 'project' | 'both';
  agents: string[];
  skills: string[];
  dryRun?: boolean;
}

export interface InstallResult {
  skill: string;
  agent: string;
  success: boolean;
  error?: string;
}

export interface CacheData {
  version: number;
  generatedAt: string | null;
  skills: Record<string, { installedAt: string; agents: string[] }>;
}
