import figlet from 'figlet';
import boxen from 'boxen';
import gradient from 'gradient-string';
const VAPORWAVE = gradient(['#00FFFF', '#FF00FF', '#FF6EC7']);
export function renderSplash(version) {
    const logo = figlet.textSync('SKILL SURGE', { font: 'Standard' });
    console.log(VAPORWAVE(logo));
    console.log(gradient(['#7B68EE', '#FF6EC7'])(`  Plug-and-play agent intelligence  v${version}`));
    console.log('');
}
export function renderHelp(version) {
    return boxen([
        '',
        `${gradient(['#00FFFF', '#FF6EC7'])('skill-surge')}  ${gradient(['#7B68EE', '#FF6EC7'])('v' + version)}`,
        '',
        '  Commands:',
        `    ${gradient(['#00FFFF', '#39FF14'])('suggest')}   --task "<task>"     Discover & rank skills for a task`,
        `    ${gradient(['#00FFFF', '#39FF14'])('refresh')}  [--network]          Scan all sources into cache`,
        `    ${gradient(['#00FFFF', '#39FF14'])('install')}  <id> [-y]            Install a skill (gated by trust)`,
        `    ${gradient(['#00FFFF', '#39FF14'])('hook')}     --task "<task>"      Agent trigger check`,
        `    ${gradient(['#00FFFF', '#39FF14'])('init')}                          First-run setup wizard`,
        `    ${gradient(['#00FFFF', '#39FF14'])('doctor')}                        Health check`,
        `    ${gradient(['#00FFFF', '#39FF14'])('list')}                          List cached skills`,
        `    ${gradient(['#00FFFF', '#39FF14'])('seed')}                          Install bundled skills`,
        `    ${gradient(['#00FFFF', '#39FF14'])('clean')}                         Clear cache`,
        `    ${gradient(['#00FFFF', '#39FF14'])('config')}                        Show configuration`,
        '',
        '  Options:',
        '    --json             Machine-readable JSON output',
        '    --dry-run          Preview without making changes',
        '    --offline          Skip remote queries',
        '    --network          Allow network access during refresh',
        '    -y, --yes          Auto-confirm install (if score is sufficient)',
        '',
        '  Examples:',
        '    skill-surge suggest --task "build a React dashboard"',
        '    skill-surge install <id> -y',
        '    skill-surge doctor',
        '',
        '  Docs:  https://github.com/CodePuri/skill-surge',
        '',
    ].join('\n'), {
        padding: { left: 2, right: 2, top: 0, bottom: 0 },
        margin: 0,
        borderStyle: 'double',
        borderColor: 'magenta',
        title: 'SKILL SURGE',
        titleAlignment: 'center',
    });
}
export function printCandidates(payload) {
    if (payload.candidates.length === 0) {
        console.log(boxen(gradient(['#FF073A', '#FF6EC7'])(`\n  No strong skill candidates found for:\n  "${payload.task}"\n`) +
            '\n  Try a more descriptive task description.', { padding: 1, borderColor: 'red', borderStyle: 'round' }));
        return;
    }
    const header = boxen(gradient(['#00FFFF', '#FF00FF', '#FF6EC7'])(`  Skills Found for: "${shorten(payload.task, 60)}"`) +
        `\n  ${gradient(['#7B68EE', '#00FFFF'])(payload.candidates.length + ' candidates')}` +
        (payload.notes.length > 0 ? `\n  ${payload.notes.map(n => 'ⓘ ' + n).join('\n  ')}` : ''), { padding: { left: 1, right: 1, top: 0, bottom: 0 }, borderColor: 'cyan', borderStyle: 'round' });
    console.log('\n' + header + '\n');
    for (const c of payload.candidates) {
        const isBundled = c.sourceKind === 'bundled';
        const isLocal = c.sourceKind === 'local';
        let badge;
        if (isBundled)
            badge = gradient(['#FF6EC7', '#00FFFF'])(' █ PRE-LOADED ');
        else if (isLocal)
            badge = gradient(['#7B68EE', '#00FFFF'])(' █ INSTALLED ');
        else if (c.canAutoInstall)
            badge = gradient(['#39FF14', '#00FFFF'])(' █ AUTO-INSTALL ');
        else
            badge = gradient(['#FFD700', '#FF6EC7'])(' █ RECOMMEND ');
        const scoreBar = renderScoreBar(c.score);
        const id = c.id.slice(0, 8);
        const name = isBundled ? gradient(['#FF6EC7', '#00FFFF'])(c.name) : c.name;
        const lines = [
            `  ${name}  ${scoreBar}  ${badge}`,
            `  ${gradient(['#7B68EE', '#7B68EE'])('│')}  ${c.description}`,
            `  ${gradient(['#7B68EE', '#7B68EE'])('│')}  ${gradient(['#00FFFF', '#00FFFF'])('reason:')} ${c.reason}`,
        ];
        if (c.url) {
            lines.push(`  ${gradient(['#7B68EE', '#7B68EE'])('│')}  ${gradient(['#00FFFF', '#00FFFF'])('source:')} ${c.url}`);
        }
        else if (isBundled || isLocal) {
            lines.push(`  ${gradient(['#7B68EE', '#7B68EE'])('│')}  ${gradient(['#00FFFF', '#00FFFF'])('path:')} ${c.source}`);
        }
        if (c.installCommand && !isBundled && !isLocal) {
            lines.push(`  ${gradient(['#7B68EE', '#7B68EE'])('│')}  ${gradient(['#FFD700', '#FFD700'])('cmd:')} ${c.installCommand.join(' ')}`);
        }
        lines.push('');
        console.log(boxen(lines.join('\n'), {
            padding: { left: 1, right: 1, top: 0, bottom: 0 },
            margin: { top: 0, bottom: 1, left: 0, right: 0 },
            borderStyle: 'round',
            borderColor: '#7B68EE',
        }));
    }
}
function renderScoreBar(score) {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const color = score >= 90 ? '#39FF14' : score >= 70 ? '#00FFFF' : score >= 50 ? '#FFD700' : '#FF073A';
    return gradient([color, color])(`${bar} ${score}`);
}
function shorten(s, max) {
    if (s.length <= max)
        return s;
    return s.slice(0, max - 3) + '...';
}
