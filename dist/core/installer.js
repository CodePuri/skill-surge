import { spawnSync } from 'node:child_process';
export function validateInstallCommand(candidate) {
    if (!Array.isArray(candidate.installCommand)) {
        return { valid: false, reason: 'No install command available.' };
    }
    const cmd = candidate.installCommand;
    const validShape = cmd.length >= 9
        && cmd[0] === 'npx'
        && cmd[1] === 'skills'
        && cmd[2] === 'add'
        && cmd.includes('-g')
        && cmd.includes('-a')
        && cmd.includes('codex')
        && cmd.includes('-y');
    if (!validShape) {
        return { valid: false, reason: 'Install command has unexpected shape. Must use npx skills add ... -g -a codex -y' };
    }
    return { valid: true };
}
export function installCandidate(candidate, dryRun) {
    const validation = validateInstallCommand(candidate);
    if (!validation.valid) {
        return { success: false, code: 3, error: validation.reason };
    }
    console.log(`  ${candidate.installCommand.join(' ')}`);
    if (dryRun) {
        return { success: true, code: 0 };
    }
    const result = spawnSync(candidate.installCommand[0], candidate.installCommand.slice(1), {
        stdio: 'inherit',
        shell: false,
    });
    const code = result.status ?? 1;
    return {
        success: code === 0,
        code,
        error: code !== 0 ? 'Install command failed.' : undefined,
    };
}
