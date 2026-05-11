import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { resolveAgentPath } from './agent.js';
import { loadCache, saveCache } from './cache.js';
import { ALL_SKILLS } from './catalog.js';
export function installSkillToAgents(skillName, agents, scope, options = {}) {
    const results = [];
    const skill = ALL_SKILLS.find(s => s.name === skillName);
    if (!skill) {
        return [{ skill: skillName, agent: 'all', success: false, error: 'Skill not found in catalog' }];
    }
    const scopes = scope === 'both' ? ['global', 'project'] : [scope];
    for (const agent of agents) {
        for (const s of scopes) {
            const targetDir = resolveAgentPath(agent, s);
            const targetFile = path.join(targetDir, `${skillName}.md`);
            results.push({
                skill: skillName,
                agent: `${agent.name} (${s})`,
                success: true,
            });
            if (options.dryRun)
                continue;
            try {
                fs.mkdirSync(targetDir, { recursive: true });
                if (skill.source === 'top-repo' && skill.repo) {
                    const result = spawnSync('npx', ['skills', 'add', skill.repo, '--skill', skillName, '-g'], { encoding: 'utf8', timeout: 60_000, shell: false });
                    if (result.status !== 0) {
                        results.push({ skill: skillName, agent: `${agent.name} (${s})`, success: false, error: result.stderr || 'npx skills add failed' });
                    }
                }
                else {
                    const src = getOriginalSkillPath(skillName);
                    if (!src) {
                        results.push({ skill: skillName, agent: `${agent.name} (${s})`, success: false, error: 'Original skill source not found' });
                        continue;
                    }
                    if (options.installMode === 'symlink') {
                        fs.symlinkSync(src, targetFile);
                    }
                    else {
                        fs.copyFileSync(src, targetFile);
                    }
                }
                const cache = loadCache();
                if (!cache.skills[skillName]) {
                    cache.skills[skillName] = { installedAt: new Date().toISOString(), agents: [] };
                }
                if (!cache.skills[skillName].agents.includes(agent.slug)) {
                    cache.skills[skillName].agents.push(agent.slug);
                }
                saveCache(cache);
            }
            catch (err) {
                results.push({ skill: skillName, agent: `${agent.name} (${s})`, success: false, error: String(err) });
            }
        }
    }
    return results;
}
export function installTopRepoSkills(agents, scope) {
    const results = [];
    const byRepo = new Map();
    for (const skill of ALL_SKILLS) {
        if (skill.source === 'top-repo' && skill.repo) {
            if (!byRepo.has(skill.repo))
                byRepo.set(skill.repo, []);
            byRepo.get(skill.repo).push(skill.name);
        }
    }
    for (const [repo, skillNames] of byRepo) {
        const repoResults = [];
        const cmd = ['npx', 'skills', 'add', repo, '-g', '-y'];
        const r = spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8', timeout: 120_000, shell: false });
        if (r.status === 0) {
            for (const name of skillNames) {
                for (const agent of agents) {
                    repoResults.push({ skill: name, agent: agent.name, success: true });
                }
            }
        }
        else {
            for (const name of skillNames) {
                repoResults.push({ skill: name, agent: 'all', success: false, error: r.stderr || 'install failed' });
            }
        }
        results.push({ repo, skills: skillNames, results: repoResults });
    }
    return results;
}
function getOriginalSkillPath(skillName) {
    const home = os.homedir();
    const skillSurgeRoot = path.join(home, 'Desktop', 'Code', 'auto-skills');
    const originalDir = path.join(skillSurgeRoot, 'skills', 'original', skillName);
    const skillMd = path.join(originalDir, 'SKILL.md');
    if (fs.existsSync(skillMd))
        return skillMd;
    return null;
}
