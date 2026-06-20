import { spawnSync } from 'node:child_process';
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasIdentity(value) {
    return value.schemaVersion === 1
        && typeof value.cycleId === 'string' && value.cycleId.length > 0
        && typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt))
        && typeof value.sourceSha === 'string' && value.sourceSha.length > 0
        && typeof value.contentHash === 'string' && value.contentHash.length > 0
        && typeof value.idempotencyKey === 'string' && value.idempotencyKey.length > 0;
}
export function validateReleaseRecord(value) {
    if (!isRecord(value) || !hasIdentity(value))
        throw new Error('Invalid release record identity');
    if (!['package', 'ecosystem-digest'].includes(String(value.releaseType)))
        throw new Error('Invalid release type');
    if (typeof value.summary !== 'string' || value.summary.trim().length === 0)
        throw new Error('Invalid release summary');
    if (!Array.isArray(value.evidence) || !value.evidence.every(item => typeof item === 'string'))
        throw new Error('Invalid release evidence');
    if (!Array.isArray(value.novelInsights) || !value.novelInsights.every(item => typeof item === 'string'))
        throw new Error('Invalid release insights');
    if (value.evidence.length === 0 && value.novelInsights.length === 0)
        throw new Error('Release evidence or a novel insight is required');
    if (!Array.isArray(value.pullRequests) || !value.pullRequests.every(Number.isInteger))
        throw new Error('Invalid release pull requests');
    if (!Array.isArray(value.verification))
        throw new Error('Invalid release verification');
    return value;
}
export function encodeLedgerComment(kind, artifact) {
    return `<!-- skill-surge:${kind}:v1:${artifact.idempotencyKey} -->\n\`\`\`json\n${JSON.stringify(artifact, null, 2)}\n\`\`\``;
}
export function decodeLedgerComment(body, kind) {
    const marker = new RegExp(`<!--\\s*skill-surge:${kind}:v1:([^\\s]+)\\s*-->`);
    const markerMatch = body.match(marker);
    const jsonMatch = body.match(/```json\s*([\s\S]*?)\s*```/);
    if (!markerMatch || !jsonMatch)
        return undefined;
    try {
        const value = JSON.parse(jsonMatch[1]);
        if (!isRecord(value) || !hasIdentity(value) || value.idempotencyKey !== markerMatch[1])
            return undefined;
        if (kind === 'release-record')
            return validateReleaseRecord(value);
        return value;
    }
    catch {
        return undefined;
    }
}
async function defaultRunGh(args) {
    const result = spawnSync('gh', args, { encoding: 'utf8', timeout: 30_000, shell: false });
    return { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}
export class GithubLedger {
    repo;
    runGh;
    constructor(options) {
        this.repo = options.repo;
        this.runGh = options.runGh ?? defaultRunGh;
    }
    async ensureLabels() {
        const labels = [
            ['automation:cycle', '0969da', 'Autonomous weekly cycle'],
            ['automation:release', '0e8a16', 'Verified autonomous release'],
            ['automation:blocked', 'b60205', 'Blocked by automation policy'],
            ['automation:rollback', 'd93f0b', 'Automatic rollback'],
        ];
        for (const [name, color, description] of labels) {
            const result = await this.runGh(['label', 'create', name, '--repo', this.repo, '--color', color, '--description', description, '--force']);
            if (result.status !== 0)
                throw new Error(`Unable to ensure GitHub label ${name}: ${result.stderr.trim()}`);
        }
    }
    async findCycleIssue(cycleId) {
        const result = await this.runGh([
            'issue', 'list', '--repo', this.repo, '--state', 'all', '--label', 'automation:cycle',
            '--search', `"[automation-cycle] ${cycleId}" in:title`, '--json', 'number,title', '--limit', '10',
        ]);
        if (result.status !== 0)
            throw new Error(`Unable to list cycle issues: ${result.stderr.trim()}`);
        const issues = JSON.parse(result.stdout || '[]');
        return issues.find(issue => issue.title === `[automation-cycle] ${cycleId}`)?.number;
    }
    async getOrCreateCycleIssue(cycleId, sourceSha) {
        const existing = await this.findCycleIssue(cycleId);
        if (existing !== undefined)
            return existing;
        const body = `# Autonomous cycle ${cycleId}\n\nSource SHA: \`${sourceSha}\`\n\nTyped records are appended as comments.`;
        const result = await this.runGh([
            'issue', 'create', '--repo', this.repo, '--title', `[automation-cycle] ${cycleId}`,
            '--label', 'automation:cycle', '--body', body,
        ]);
        if (result.status !== 0)
            throw new Error(`Unable to create cycle issue: ${result.stderr.trim()}`);
        const match = result.stdout.match(/\/issues\/(\d+)/);
        if (!match)
            throw new Error('Unable to determine created cycle issue number');
        return Number(match[1]);
    }
    async appendTypedComment(issue, kind, artifact) {
        const viewed = await this.runGh(['issue', 'view', String(issue), '--repo', this.repo, '--json', 'comments']);
        if (viewed.status !== 0)
            throw new Error(`Unable to read cycle issue: ${viewed.stderr.trim()}`);
        const payload = JSON.parse(viewed.stdout || '{"comments":[]}');
        const duplicate = (payload.comments ?? [])
            .map(comment => decodeLedgerComment(comment.body, kind))
            .some(record => record?.idempotencyKey === artifact.idempotencyKey);
        if (duplicate)
            return false;
        const result = await this.runGh([
            'issue', 'comment', String(issue), '--repo', this.repo, '--body', encodeLedgerComment(kind, artifact),
        ]);
        if (result.status !== 0)
            throw new Error(`Unable to append cycle record: ${result.stderr.trim()}`);
        return true;
    }
    async readTypedComments(issue, kind) {
        const viewed = await this.runGh(['issue', 'view', String(issue), '--repo', this.repo, '--json', 'comments']);
        if (viewed.status !== 0)
            throw new Error(`Unable to read cycle issue: ${viewed.stderr.trim()}`);
        const payload = JSON.parse(viewed.stdout || '{"comments":[]}');
        return (payload.comments ?? []).flatMap(comment => {
            const record = decodeLedgerComment(comment.body, kind);
            return record ? [record] : [];
        });
    }
}
