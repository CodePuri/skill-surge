export const AUTOMATION_SCHEMA_VERSION = 1 as const;

export type Platform = 'x' | 'reddit' | 'substack';
export type FindingSource = 'ci' | 'test' | 'audit' | 'github' | 'catalog' | 'model';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ArtifactIdentity {
  schemaVersion: typeof AUTOMATION_SCHEMA_VERSION;
  cycleId: string;
  createdAt: string;
  sourceSha: string;
  contentHash: string;
  idempotencyKey: string;
}

export interface AutomationConfig {
  schemaVersion: typeof AUTOMATION_SCHEMA_VERSION;
  selfImprove: {
    enabled: boolean;
    maxFixesPerCycle: number;
    maxChangedFiles: number;
    maxChangedLines: number;
    protectedPaths: string[];
  };
  publication: {
    enabled: boolean;
    maxRetries: number;
    retryBackoffMs: number;
    platforms: Record<Platform, boolean>;
    maxPostsPerCycle: Record<Platform, number>;
    redditAllowlist: string[];
  };
}

export interface SkillMetadata {
  name: string;
  source: string;
  hash: string;
  modifiedAt?: string;
}

export interface RefreshReport extends ArtifactIdentity {
  network: boolean;
  cachePath: string;
  localSkills: SkillMetadata[];
  remoteSources: Array<{ repo: string; head?: string; inspected: boolean; error?: string }>;
  added: SkillMetadata[];
  changed: SkillMetadata[];
  removed: SkillMetadata[];
}

export interface Finding {
  id: string;
  source: FindingSource;
  severity: FindingSeverity;
  title: string;
  evidence: string;
  reproductionCommand?: string;
  eligible: boolean;
  blockedReason?: string;
}

export interface VerificationReport extends ArtifactIdentity {
  findingId: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  changedFiles: string[];
  changedLines: number;
  eligibleToMerge: boolean;
}

export interface ReleaseRecord extends ArtifactIdentity {
  version?: string;
  releaseType: 'package' | 'ecosystem-digest';
  summary: string;
  evidence: string[];
  pullRequests: number[];
  verification: VerificationReport[];
  novelInsights: string[];
}

export interface PublicationContent {
  title: string;
  body: string;
  url?: string;
}

export interface PublicationBundle extends ArtifactIdentity {
  releaseRecordHash: string;
  canonicalUrl?: string;
  format: 'tutorial' | 'before-after' | 'benchmark' | 'release-story';
  hooks: string[];
  evidence: string[];
  platforms: Record<Platform, PublicationContent>;
}

export interface PublicationResult extends ArtifactIdentity {
  platform: Platform;
  status: 'published' | 'skipped' | 'policy-blocked' | 'failed';
  externalId?: string;
  url?: string;
  error?: string;
}

export interface PlatformMetrics {
  views?: number;
  impressions?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  clicks?: number;
  subscribers?: number;
}

export interface GrowthSnapshot extends ArtifactIdentity {
  results: Partial<Record<Platform, PlatformMetrics>>;
  github: { stars?: number; forks?: number };
  npm: { weeklyDownloads?: number };
  selectedFormat: PublicationBundle['format'];
  engagementScore: number;
}
