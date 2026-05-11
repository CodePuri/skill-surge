import { spawnSync } from 'node:child_process';
import { ALL_SKILLS } from './catalog.js';
import { tokenize } from './ranker.js';
function stripAnsi(s) {
    return s.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}
function parseCount(s) {
    if (!s)
        return null;
    const m = s.match(/([\d.]+)\s*([KMB])?/i);
    if (!m)
        return null;
    const base = Number(m[1]);
    const mult = m[2]?.toUpperCase() === 'M' ? 1e6 : m[2]?.toUpperCase() === 'K' ? 1e3 : 1;
    return Math.round(base * mult);
}
export function runSkillsFind(task) {
    const terms = [...tokenize(task)].slice(0, 6);
    if (terms.length === 0)
        return [];
    const result = spawnSync('npx', ['skills', 'find', ...terms], {
        encoding: 'utf8', timeout: 25_000, shell: false,
    });
    if (result.status !== 0)
        return [];
    const lines = stripAnsi(result.stdout).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const skills = [];
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@([A-Za-z0-9_.-]+)\s+(.+?installs?)$/i);
        if (!m)
            continue;
        const [_, repo, skillName, countStr] = m;
        skills.push({
            name: skillName.trim(),
            description: `${skillName} from ${repo}`,
            category: 'discovered',
            source: 'top-repo',
            repo: repo,
            installs: parseCount(countStr),
            tags: terms,
        });
    }
    return skills;
}
export function rankSkillsForTask(task, installedNames) {
    const terms = tokenize(task);
    const results = [];
    for (const skill of ALL_SKILLS) {
        const skillText = tokenize(`${skill.name} ${skill.description} ${skill.tags.join(' ')}`);
        let overlap = 0;
        for (const t of terms) {
            if (skillText.has(t))
                overlap++;
        }
        if (overlap === 0 && terms.size > 0)
            continue;
        let score = 0;
        const sourceScore = skill.source === 'top-repo' ? 30 : 40;
        score += sourceScore + overlap * 20;
        if (installedNames.has(skill.name))
            score += 15;
        if (skill.installs && skill.installs >= 100_000)
            score += 25;
        else if (skill.installs && skill.installs >= 10_000)
            score += 10;
        const reasonParts = [`${overlap} keyword match${overlap === 1 ? '' : 'es'}`];
        if (installedNames.has(skill.name))
            reasonParts.push('installed locally');
        if (skill.installs)
            reasonParts.push(`${skill.installs.toLocaleString()} installs`);
        results.push({
            name: skill.name,
            description: skill.description,
            category: skill.category,
            score: Math.min(100, score),
            source: skill.repo || 'skill-surge',
            installed: installedNames.has(skill.name),
            reason: reasonParts.join('; '),
        });
    }
    return results.sort((a, b) => b.score - a.score);
}
