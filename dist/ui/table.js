import Table from 'cli-table3';
import gradient from 'gradient-string';
function renderBar(score) {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
function badge(c) {
    if (c.sourceKind === 'bundled')
        return 'BUNDLED';
    if (c.sourceKind === 'local')
        return 'LOCAL';
    if (c.canAutoInstall)
        return 'AUTO-OK';
    return 'WAIT';
}
export function renderCandidateTable(candidates) {
    const table = new Table({
        head: [
            gradient(['#FF6EC7', '#00FFFF'])('Skill'),
            gradient(['#FF6EC7', '#00FFFF'])('Score'),
            gradient(['#FF6EC7', '#00FFFF'])('Status'),
            gradient(['#FF6EC7', '#00FFFF'])('Trust'),
        ],
        style: {
            head: [],
            border: ['#7B68EE'],
        },
        chars: {
            top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
            'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
            left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
            right: '│', 'right-mid': '┤',
            middle: '│',
        },
        colWidths: [26, 10, 14, 24],
    });
    for (const c of candidates) {
        const scoreStr = `${renderBar(c.score)} ${c.score}`;
        const statusStr = badge(c);
        const trustStr = c.sourceKind === 'bundled'
            ? 'bundled'
            : c.sourceKind === 'local'
                ? 'local install'
                : c.installCount
                    ? `${c.installCount.toLocaleString()} installs`
                    : 'no data';
        const owner = String(c.source || '').split('/')[0].toLowerCase();
        const trusted = ['vercel-labs', 'anthropics', 'microsoft', 'openai', 'codepuri'].includes(owner);
        table.push([
            c.name,
            scoreStr,
            gradient(statusStr === 'BUNDLED' ? ['#FF6EC7', '#00FFFF'] :
                statusStr === 'AUTO-OK' ? ['#39FF14', '#00FFFF'] :
                    ['#FFD700', '#FF6EC7'])(statusStr),
            trusted ? gradient(['#39FF14', '#39FF14'])('✓ trusted') : trustStr,
        ]);
    }
    return table.toString();
}
