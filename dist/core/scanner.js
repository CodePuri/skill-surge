import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { getBundlePath } from './config.js';
function sha(value) {
    return crypto.createHash('sha1').update(value).digest('hex');
}
function expandHome(value) {
    if (value === '~')
        return os.homedir();
    if (value.startsWith('~/'))
        return path.join(os.homedir(), value.slice(2));
    return value;
}
function parseFrontmatter(content) {
    if (!content.startsWith('---'))
        return null;
    const end = content.indexOf('\n---', 3);
    if (end === -1)
        return null;
    const lines = content.slice(3, end).split(/\r?\n/);
    const result = {};
    for (const line of lines) {
        const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if (!match)
            continue;
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        result[match[1]] = value;
    }
    if (!result.name || !result.description)
        return null;
    return result;
}
function findSkillFiles(root, maxDepth = 4) {
    const resolvedRoot = expandHome(root);
    const found = [];
    if (!fs.existsSync(resolvedRoot))
        return found;
    function visit(dir, depth) {
        if (depth > maxDepth)
            return;
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isFile() && entry.name === 'SKILL.md') {
                found.push(full);
            }
            else if (entry.isDirectory() && !['.git', 'node_modules', 'dist', '.cache', '__pycache__'].includes(entry.name)) {
                visit(full, depth + 1);
            }
        }
    }
    visit(resolvedRoot, 0);
    return found;
}
function candidateFromSkill(filePath, sourceKind) {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = parseFrontmatter(content);
    if (!metadata)
        return null;
    const sourceKey = path.dirname(filePath);
    const dirName = path.basename(sourceKey);
    return {
        id: sha(`${sourceKind}:${sourceKey}`).slice(0, 12),
        name: metadata.name || dirName,
        description: metadata.description || 'No description.',
        sourceKind,
        source: sourceKey,
        url: metadata.url || null,
        installCount: null,
        installCommand: null,
        hash: sha(content),
        lastSeenAt: new Date().toISOString(),
        score: 0,
        canAutoInstall: false,
        reason: sourceKind === 'bundled' ? 'Pre-bundled skill shipped with autoskills.' : 'Installed local skill.',
        category: metadata.category || undefined,
    };
}
export function scanBundleSkills(config) {
    const bundlePath = getBundlePath();
    const seen = new Set();
    const candidates = [];
    if (config.preSeed?.enabled !== false) {
        for (const filePath of findSkillFiles(bundlePath, 5)) {
            const candidate = candidateFromSkill(filePath, 'bundled');
            if (!candidate || seen.has(candidate.id))
                continue;
            seen.add(candidate.id);
            candidates.push(candidate);
        }
    }
    return candidates;
}
export function scanLocalCandidates(config) {
    const seen = new Set();
    const candidates = [];
    for (const root of config.localPaths || []) {
        for (const filePath of findSkillFiles(root)) {
            const candidate = candidateFromSkill(filePath, 'local');
            if (!candidate || seen.has(candidate.id))
                continue;
            seen.add(candidate.id);
            candidates.push(candidate);
        }
    }
    return candidates;
}
