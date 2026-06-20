import { sha256 } from './identity.js';
function finite(value) {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}
export function engagementScore(metrics) {
    const exposure = finite(metrics.impressions) || finite(metrics.views);
    if (exposure === 0)
        return 0;
    const interactions = finite(metrics.likes) + finite(metrics.shares) + finite(metrics.comments) + finite(metrics.clicks);
    return Number(((interactions / exposure) * 100).toFixed(4));
}
async function safeJson(fetchImpl, url) {
    try {
        const response = await fetchImpl(url, { headers: { accept: 'application/json', 'user-agent': 'skill-surge-automation' } });
        if (!response.ok)
            return undefined;
        return await response.json();
    }
    catch {
        return undefined;
    }
}
export async function collectGrowthSnapshot(options) {
    const fetchImpl = options.fetchImpl ?? fetch;
    const results = {};
    for (const result of options.publicationResults) {
        if (result.status !== 'published')
            continue;
        const collector = options.platformCollectors[result.platform];
        if (!collector)
            continue;
        try {
            const metrics = await collector(result);
            if (Object.keys(metrics).length > 0)
                results[result.platform] = metrics;
        }
        catch { /* platform metrics remain unavailable */ }
    }
    const githubData = await safeJson(fetchImpl, `https://api.github.com/repos/${options.repo}`);
    const npmData = await safeJson(fetchImpl, `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(options.packageName)}`);
    const github = {};
    const npm = {};
    if (Number.isFinite(githubData?.stargazers_count))
        github.stars = githubData.stargazers_count;
    if (Number.isFinite(githubData?.forks_count))
        github.forks = githubData.forks_count;
    if (Number.isFinite(npmData?.downloads))
        npm.weeklyDownloads = npmData.downloads;
    const scores = Object.values(results).map(engagementScore);
    const score = scores.length === 0 ? 0 : Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(4));
    const createdAt = (options.now ?? new Date()).toISOString();
    const contentHash = sha256(JSON.stringify({ results, github, npm, format: options.format }));
    return {
        schemaVersion: 1,
        cycleId: options.cycleId,
        createdAt,
        sourceSha: options.sourceSha,
        contentHash,
        idempotencyKey: sha256(`${options.cycleId}:growth:${contentHash}`),
        results,
        github,
        npm,
        selectedFormat: options.format,
        engagementScore: score,
    };
}
export function scoreFormats(snapshots) {
    const grouped = new Map();
    for (const snapshot of snapshots) {
        const scores = grouped.get(snapshot.selectedFormat) ?? [];
        scores.push(snapshot.engagementScore);
        grouped.set(snapshot.selectedFormat, scores);
    }
    return Object.fromEntries([...grouped].map(([format, scores]) => [
        format,
        Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(4)),
    ]));
}
