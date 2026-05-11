import fs from 'node:fs';
import path from 'node:path';
import { loadCache } from './cache.js';
import { ALL_SKILLS } from './catalog.js';
export function detectProjectType() {
    const cwd = process.cwd();
    const types = [];
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
            if (pkg.dependencies?.react || pkg.devDependencies?.react)
                types.push('React');
            if (pkg.dependencies?.next || pkg.devDependencies?.next)
                types.push('Next.js');
            if (pkg.dependencies?.express)
                types.push('Express');
            if (pkg.dependencies?.fastify)
                types.push('Fastify');
            if (pkg.dependencies?.prisma || pkg.devDependencies?.prisma)
                types.push('Prisma');
            if (pkg.dependencies?.supabase)
                types.push('Supabase');
            if (pkg.dependencies?.docker)
                types.push('Docker');
            if (pkg.dependencies?.k8s || pkg.devDependencies?.k8s)
                types.push('Kubernetes');
        }
        catch { /* ignore */ }
    }
    if (fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
        types.push('Python');
    }
    if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
        types.push('Rust');
    }
    if (types.length === 0)
        types.push('Node.js');
    return types;
}
export function auditProject(globalPaths) {
    const installedNames = new Set();
    const installed = [];
    for (const gp of globalPaths) {
        if (!fs.existsSync(gp))
            continue;
        try {
            for (const entry of fs.readdirSync(gp)) {
                if (entry.endsWith('.md') || entry === entry.toLowerCase()) {
                    let name = entry.replace(/\.md$/, '');
                    if (entry.endsWith('.md')) {
                        try {
                            const content = fs.readFileSync(path.join(gp, entry), 'utf8');
                            if (content.startsWith('---')) {
                                const end = content.indexOf('\n---', 3);
                                if (end > 0) {
                                    for (const line of content.slice(3, end).split('\n')) {
                                        const m = line.match(/^name:\s*(.+)$/);
                                        if (m) {
                                            name = m[1].trim();
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        catch { /* use filename */ }
                    }
                    if (!installedNames.has(name)) {
                        installedNames.add(name);
                        installed.push({
                            name,
                            agent: path.dirname(gp),
                            path: path.join(gp, entry),
                            installedAt: new Date().toISOString(),
                        });
                    }
                }
            }
        }
        catch { /* ignore */ }
    }
    const projectTypes = detectProjectType();
    const cache = loadCache();
    const byCategory = {};
    for (const skill of ALL_SKILLS) {
        if (!byCategory[skill.category])
            byCategory[skill.category] = { installed: [], missing: [] };
        if (installedNames.has(skill.name) || cache.skills[skill.name]) {
            byCategory[skill.category].installed.push(skill.name);
        }
        else {
            byCategory[skill.category].missing.push(skill.name);
        }
    }
    const available = ALL_SKILLS;
    const missing = ALL_SKILLS.filter(s => !installedNames.has(s.name) && !cache.skills[s.name]);
    return { projectType: projectTypes, installed, available, missing, byCategory };
}
