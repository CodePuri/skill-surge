import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_CONFIG_PATH = path.join(REPO_ROOT, 'config', 'sources.json');
const USER_CONFIG_PATH = path.join(os.homedir(), '.config', 'skill-surge', 'sources.json');
function readJson(filePath, fallback) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    catch {
        return fallback;
    }
}
export function loadConfig() {
    const base = readJson(DEFAULT_CONFIG_PATH, {});
    const user = readJson(USER_CONFIG_PATH, {});
    return {
        localPaths: [...(base.localPaths || []), ...(user.localPaths || [])],
        gitSources: [...(base.gitSources || []), ...(user.gitSources || [])],
        trustedOwners: [...new Set([...(base.trustedOwners || []), ...(user.trustedOwners || [])])],
        remoteRegistries: [...(base.remoteRegistries || []), ...(user.remoteRegistries || [])],
        autoInstall: {
            ...(base.autoInstall || {}),
            ...(user.autoInstall || {}),
        },
        preSeed: {
            ...(base.preSeed || { enabled: true }),
            ...(user.preSeed || {}),
        },
    };
}
export function getBundlePath() {
    return path.join(REPO_ROOT, 'skills');
}
export function getReposRoot() {
    return [REPO_ROOT];
}
