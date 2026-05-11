export const C = {
    reset: '\x1B[0m',
    bold: '\x1B[1m',
    dim: '\x1B[2m',
    black: '\x1B[30m',
    red: '\x1B[31m',
    green: '\x1B[32m',
    yellow: '\x1B[33m',
    blue: '\x1B[34m',
    magenta: '\x1B[35m',
    cyan: '\x1B[36m',
    white: '\x1B[37m',
    bgBlack: '\x1B[40m',
    bgRed: '\x1B[41m',
    bgGreen: '\x1B[42m',
    bgYellow: '\x1B[43m',
    brightBlack: '\x1B[90m',
    brightRed: '\x1B[91m',
    brightGreen: '\x1B[32m',
    brightYellow: '\x1B[93m',
    brightBlue: '\x1B[94m',
    brightMagenta: '\x1B[95m',
    brightCyan: '\x1B[96m',
    brightWhite: '\x1B[97m',
};
export const T = {
    reset: (s) => `${C.reset}${s}`,
    bold: (s) => `${C.bold}${s}${C.reset}`,
    dim: (s) => `${C.dim}${s}${C.reset}`,
    text: (s) => `${C.white}${s}${C.reset}`,
    muted: (s) => `${C.brightBlack}${s}${C.reset}`,
    white: (s) => `${C.white}${s}${C.reset}`,
    green: (s) => `${C.brightGreen}${s}${C.reset}`,
    red: (s) => `${C.brightRed}${s}${C.reset}`,
    yellow: (s) => `${C.brightYellow}${s}${C.reset}`,
    blue: (s) => `${C.brightBlue}${s}${C.reset}`,
    cyan: (s) => `${C.brightCyan}${s}${C.reset}`,
    accent: (s) => `${C.brightCyan}${s}${C.reset}`,
    mutedBold: (s) => `${C.brightBlack}${C.bold}${s}${C.reset}`,
    check: (s) => `${C.brightGreen}${C.bold}✓${C.reset} ${s}`,
    cross: (s) => `${C.brightRed}${C.bold}✗${C.reset} ${s}`,
    arrow: (s) => `${C.brightCyan}▸${C.reset} ${s}`,
    bullet: (s) => `${C.brightBlack}•${C.reset} ${s}`,
    pad: (n) => ' '.repeat(n),
};
export function box(title, lines) {
    const width = Math.min(72, Math.max(40, ...lines.map(l => l.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '').length)) + 4);
    const titlePadded = ` ${title} `;
    const top = `${C.brightBlack}┌─${titlePadded}${'─'.repeat(Math.max(0, width - titlePadded.length - 1))}─┐${C.reset}`;
    const bottom = `${C.brightBlack}└${'─'.repeat(width + 2)}─┘${C.reset}`;
    const middle = lines.map(line => {
        const clean = line.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
        const padded = clean.length < width ? line + ' '.repeat(width - clean.length) : line;
        return `${C.brightBlack}│ ${C.reset}${padded}${C.brightBlack} │${C.reset}`;
    }).join('\n');
    return `${top}\n${middle}\n${bottom}`;
}
export function listBox(title, items) {
    const lines = [];
    const leftWidth = Math.max(...items.map(i => i.label.length));
    for (const item of items) {
        const label = item.label.padEnd(leftWidth);
        let prefix;
        if (item.status === 'ok')
            prefix = T.check(item.label);
        else if (item.status === 'miss')
            prefix = T.cross(item.label);
        else if (item.status === 'warn')
            prefix = T.yellow(item.label);
        else
            prefix = T.bullet(item.label);
        lines.push(prefix + ' '.repeat(leftWidth - item.label.length + 1) + T.muted(item.value));
    }
    return box(title, lines);
}
export function twoColBox(title, left, right) {
    const lines = [];
    const maxLen = Math.max(...left.map(l => l.length), ...right.map(l => l.length));
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
        const l = left[i] || '';
        const r = right[i] || '';
        lines.push(T.bullet(l) + ' '.repeat(maxLen - l.length + 2) + T.muted(r));
    }
    return box(title, lines);
}
export function divider() {
    return `${C.brightBlack}${'─'.repeat(74)}${C.reset}`;
}
export function header(text) {
    return `${C.brightBlack}${'─'.repeat(74)}${C.reset}\n${T.bold(text)}\n${C.brightBlack}${'─'.repeat(74)}${C.reset}`;
}
