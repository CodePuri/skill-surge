import { spawnSync } from 'node:child_process';
const SIMPLE_TASK_RE = /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|date|time|pwd|ls|whoami)$/i;
const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'for', 'from', 'how', 'i',
    'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please', 'that', 'the', 'this', 'to',
    'use', 'with', 'you', 'we', 'our', 'your', 'will', 'would', 'could', 'should', 'need',
    'want', 'like', 'just', 'make', 'get', 'was', 'were', 'been', 'being', 'have', 'has',
    'had', 'does', 'did', 'done', 'doing', 'some', 'any', 'all', 'each', 'every', 'both',
]);
export function tokenize(value) {
    return new Set(String(value)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(t => t && !STOPWORDS.has(t)));
}
function preferCandidate(candidate) {
    let value = 0;
    if (candidate.sourceKind === 'bundled')
        value += 10;
    if (candidate.sourceKind === 'local' && String(candidate.source || '').includes('/.codex/skills/'))
        value += 8;
    if (candidate.sourceKind === 'local')
        value += 5;
    if (candidate.canAutoInstall)
        value += 4;
    const installs = Number(candidate.installCount || 0);
    value += Math.min(3, Math.floor(installs / 1000));
    return value;
}
function buildReason(candidate, overlap, trusted, installCount, canAutoInstall) {
    const parts = [];
    if (candidate.sourceKind === 'bundled')
        parts.push('pre-bundled core skill');
    if (candidate.sourceKind === 'local')
        parts.push('already installed locally');
    if (overlap > 0)
        parts.push(`${overlap} intent keyword match${overlap === 1 ? '' : 'es'}`);
    if (trusted)
        parts.push('trusted owner');
    if (installCount > 0)
        parts.push(`${installCount.toLocaleString()} installs`);
    if (canAutoInstall)
        parts.push('auto-install eligible');
    if (parts.length === 0)
        parts.push('weak metadata match');
    return parts.join('; ');
}
export function scoreCandidate(candidate, task, config) {
    const terms = tokenize(task);
    const text = tokenize(`${candidate.name} ${candidate.description} ${candidate.source || ''} ${candidate.category || ''}`);
    let overlap = 0;
    for (const term of terms) {
        if (text.has(term))
            overlap += 1;
    }
    const owner = String(candidate.source || '').split('/')[0].toLowerCase();
    const trusted = (config.trustedOwners || []).map(o => o.toLowerCase()).includes(owner);
    const installCount = Number(candidate.installCount || 0);
    let score = 0;
    if (candidate.sourceKind === 'bundled')
        score = 50;
    else if (candidate.sourceKind === 'local')
        score = 42;
    else
        score = 25;
    score += overlap * 16;
    if (trusted)
        score += 20;
    if (installCount >= 1000)
        score += 18;
    else if (installCount >= 100)
        score += 10;
    else if (installCount > 0)
        score += 4;
    if (candidate.name && task.toLowerCase().includes(candidate.name.toLowerCase()))
        score += 12;
    score = Math.min(100, score);
    const minScore = Number(config.autoInstall?.minimumScore || 70);
    const minInstalls = Number(config.autoInstall?.minimumInstallsForPublic || 1000);
    const validInstallCommand = Array.isArray(candidate.installCommand)
        && candidate.installCommand[0] === 'npx'
        && candidate.installCommand[1] === 'skills'
        && candidate.installCommand[2] === 'add'
        && candidate.installCommand.includes('-g')
        && candidate.installCommand.includes('-a')
        && candidate.installCommand.includes('codex')
        && candidate.installCommand.includes('-y');
    const canAutoInstall = candidate.sourceKind !== 'local'
        && validInstallCommand
        && score >= minScore
        && (trusted || installCount >= minInstalls);
    return {
        ...candidate,
        score,
        canAutoInstall,
        reason: buildReason(candidate, overlap, trusted, installCount, canAutoInstall),
    };
}
export function dedupeByName(candidates) {
    const byName = new Map();
    for (const c of candidates) {
        const key = String(c.name || c.id).toLowerCase();
        const current = byName.get(key);
        if (!current || c.score > current.score || (c.score === current.score && preferCandidate(c) > preferCandidate(current))) {
            byName.set(key, c);
        }
    }
    return [...byName.values()];
}
export function mergeCandidates(...lists) {
    const byId = new Map();
    for (const list of lists) {
        for (const c of list || []) {
            byId.set(c.id, { ...(byId.get(c.id) || {}), ...c });
        }
    }
    return [...byId.values()];
}
export function rerankWithExternalCommand(task, candidates) {
    const command = process.env.AUTO_SKILLS_LLM_COMMAND;
    if (!command) {
        return { candidates, note: 'LLM rerank skipped (AUTO_SKILLS_LLM_COMMAND not set).' };
    }
    const result = spawnSync(command, [], {
        input: JSON.stringify({ task, candidates }),
        encoding: 'utf8',
        timeout: 20_000,
        shell: true,
    });
    if (result.status !== 0 || !result.stdout) {
        return { candidates, note: 'LLM rerank failed; using local ranking.' };
    }
    try {
        const parsed = JSON.parse(result.stdout);
        const rankedIds = Array.isArray(parsed) ? parsed : parsed.rankedIds;
        if (!Array.isArray(rankedIds))
            throw new Error('missing rankedIds');
        const order = new Map(rankedIds.map((id, i) => [id, i]));
        return {
            candidates: [...candidates].sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999)),
            note: 'LLM rerank applied.',
        };
    }
    catch {
        return { candidates, note: 'LLM rerank returned invalid JSON; using local ranking.' };
    }
}
export function isTrivialTask(task) {
    const trimmed = task.trim();
    const terms = tokenize(trimmed);
    return terms.size <= 1 || SIMPLE_TASK_RE.test(trimmed);
}
