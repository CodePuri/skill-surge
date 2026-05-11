export interface Config {
  localPaths: string[];
  gitSources: string[];
  trustedOwners: string[];
  autoInstall: {
    targetAgent?: string;
    minimumScore?: number;
    minimumInstallsForPublic?: number;
  };
  remoteRegistries?: string[];
  preSeed?: {
    enabled: boolean;
    bundlePath?: string;
  };
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  sourceKind: 'local' | 'skills-cli' | 'bundled' | 'registry';
  source: string;
  url: string | null;
  installCount: number | null;
  installCommand: string[] | null;
  hash: string;
  lastSeenAt: string;
  score: number;
  canAutoInstall: boolean;
  reason: string;
  category?: string;
  packageSpec?: string;
}

export interface Cache {
  version: number;
  generatedAt: string | null;
  candidates: Candidate[];
}

export interface SuggestPayload {
  task: string;
  cachePath: string;
  notes: string[];
  candidates: Candidate[];
}

export interface HookPayload {
  task: string;
  shouldSuggest: boolean;
  message: string;
  candidates?: Candidate[];
}
