import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { isoWeekId, sha256 } from './identity.js';
function parseSkillName(content, fallback) {
    if (!content.startsWith('---'))
        return fallback;
    const end = content.indexOf('\n---', 3);
    if (end < 0)
        return fallback;
    const match = content.slice(3, end).match(/^name:\s*(.+)$/m);
    const value = match?.[1]?.trim();
    if (!value)
        return fallback;
    const quoted = value.match(/^(["'])(.*)\1$/);
    return quoted ? quoted[2] : value;
}
function findSkillFiles(root) {
    if (!fs.existsSync(root))
        return [];
    const result = [];
    const visit = (current) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const absolute = path.join(current, entry.name);
            if (entry.isDirectory())
                visit(absolute);
            else if (entry.isFile() && entry.name === 'SKILL.md')
                result.push(absolute);
        }
    };
    visit(root);
    return result.sort();
}
export function scanSkills(root, source = root) {
    return findSkillFiles(root).map(file => {
        const content = fs.readFileSync(file);
        return {
            name: parseSkillName(content.toString('utf8'), path.basename(path.dirname(file))),
            source,
            hash: sha256(content),
            modifiedAt: fs.statSync(file).mtime.toISOString(),
        };
    });
}
function readCache(cachePath) {
    try {
        const value = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        if (value.schemaVersion === 1 && Array.isArray(value.skills))
            return value;
    }
    catch { /* recover with an empty cache */ }
    return { schemaVersion: 1, generatedAt: new Date(0).toISOString(), skills: [] };
}
function writeCache(cachePath, cache) {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    const temporary = `${cachePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(cache, null, 2)}\n`, { mode: 0o600 });
    fs.renameSync(temporary, cachePath);
}
function metadataKey(skill) {
    return `${skill.source}\0${skill.name}`;
}
function diffSkills(previous, current) {
    const before = new Map(previous.map(skill => [metadataKey(skill), skill]));
    const after = new Map(current.map(skill => [metadataKey(skill), skill]));
    const added = current.filter(skill => !before.has(metadataKey(skill)));
    const changed = current.filter(skill => {
        const old = before.get(metadataKey(skill));
        return old !== undefined && old.hash !== skill.hash;
    });
    const removed = previous.filter(skill => !after.has(metadataKey(skill)));
    return { added, changed, removed };
}
export async function inspectGitSource(repo) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
        throw new Error(`invalid repository ${repo}`);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-surge-source-'));
    try {
        const clone = spawnSync('git', ['clone', '--depth', '1', '--filter=blob:none', `https://github.com/${repo}.git`, directory], {
            encoding: 'utf8',
            timeout: 60_000,
            shell: false,
        });
        if (clone.status !== 0)
            throw new Error((clone.stderr || clone.stdout || 'git clone failed').trim());
        const revision = spawnSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8', shell: false });
        if (revision.status !== 0)
            throw new Error((revision.stderr || 'git rev-parse failed').trim());
        return { head: revision.stdout.trim(), skills: scanSkills(directory, repo) };
    }
    finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}
export async function refreshSkills(options) {
    const now = options.now ?? new Date();
    const previous = readCache(options.cachePath);
    const localSkills = options.localRoots.flatMap(root => typeof root === 'string'
        ? scanSkills(root)
        : scanSkills(root.path, root.source));
    const remoteSources = [];
    const remoteSkills = [];
    const inspect = options.inspectRemote ?? inspectGitSource;
    if (options.network) {
        for (const repo of [...new Set(options.remoteRepos)].sort()) {
            try {
                const result = await inspect(repo);
                remoteSources.push({ repo, head: result.head, inspected: true });
                remoteSkills.push(...result.skills);
            }
            catch (error) {
                remoteSources.push({
                    repo,
                    inspected: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
    const current = [...localSkills, ...remoteSkills].sort((a, b) => metadataKey(a).localeCompare(metadataKey(b)));
    const differences = diffSkills(previous.skills, current);
    const createdAt = now.toISOString();
    const contentHash = sha256(JSON.stringify({
        sourceSha: options.sourceSha,
        network: options.network,
        current: current.map(({ modifiedAt: _modifiedAt, ...skill }) => skill),
        remoteSources,
        differences,
    }));
    const cycleId = isoWeekId(now);
    const report = {
        schemaVersion: 1,
        cycleId,
        createdAt,
        sourceSha: options.sourceSha,
        contentHash,
        idempotencyKey: sha256(`${cycleId}:refresh:${options.sourceSha}:${contentHash}`),
        network: options.network,
        cachePath: options.cachePath,
        localSkills,
        remoteSources,
        ...differences,
    };
    writeCache(options.cachePath, { schemaVersion: 1, generatedAt: createdAt, skills: current });
    return report;
}
