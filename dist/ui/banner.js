import { C } from './terminal.js';
const CYAN = C.brightCyan;
const MAGENTA = C.brightMagenta;
const WHITE = C.white;
const RESET = C.reset;
export function logo() {
    return `
${CYAN}███████╗██╗  ██╗██╗██╗     ██╗     ███████╗${RESET}
${CYAN}██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝${RESET}
${CYAN}███████╗█████╔╝ ██║██║     ██║     ███████╗${RESET}
${CYAN}╚════██║██╔═██╗ ██║██║     ██║     ╚════██║${RESET}
${CYAN}███████║██║  ██╗██║███████╗███████╗███████║${RESET}
${CYAN}╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝${RESET}`;
}
export function errorBanner() {
    return `
${MAGENTA}███████╗██╗  ██╗██╗██╗     ██╗     ███████╗${RESET}
${MAGENTA}██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝${RESET}
${MAGENTA}███████╗█████╔╝ ██║██║     ██║     ███████╗${RESET}
${MAGENTA}╚════██║██╔═██╗ ██║██║     ██║     ╚════██║${RESET}
${MAGENTA}███████║██║  ██╗██║███████╗███████╗███████║${RESET}
${MAGENTA}╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝${RESET}`;
}
export function successBanner() {
    return `
${CYAN}██████╗ ██╗      ██████╗  ██████╗ ███████╗███████╗███╗   ███╗${RESET}
${CYAN}██╔══██╗██║     ██╔════╝ ██╔═══██╗██╔════╝██╔════╝████╗  ████║${RESET}
${CYAN}██████╔╝██║     ██║  ███╗██║   ██║█████╗  █████╗  ██╔████╔██║${RESET}
${CYAN}██╔═══╝ ██║     ██║   ██║██║   ██║██╔══╝  ██╔══╝  ██║╚██╔╝██║${RESET}
${CYAN}██║     ███████╗╚██████╔╝╚██████╔╝███████╗███████╗██║ ╚═╝ ██║${RESET}
${CYAN}╚═╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝${RESET}`;
}
export function sectionHeader(title) {
    const width = 74;
    const pad = Math.max(0, width - title.length - 4);
    return `${CYAN}██ ${title}${' '.repeat(pad)} ██${RESET}`;
}
export function subsectionHeader(title) {
    return `${CYAN}├─ ${title} ─${'─'.repeat(60)}${RESET}`;
}
export function boxLine(label, value) {
    const width = 74;
    const labelLen = label.length;
    const valueLen = value.length;
    const remaining = width - labelLen - valueLen - 6;
    return `${CYAN}│${RESET} ${label}${' '.repeat(Math.max(1, remaining))}${value}${' '.repeat(1)}${CYAN}│${RESET}`;
}
export function infoBox(title, lines) {
    const width = 74;
    const top = `${CYAN}┌─${title}${'─'.repeat(width - title.length - 3)}─┐${RESET}`;
    const middle = lines.map(line => `${CYAN}│${RESET} ${line}${' '.repeat(width - line.length - 2)}${CYAN}│${RESET}`).join('\n');
    const bottom = `${CYAN}└${'─'.repeat(width + 1)}─┘${RESET}`;
    return `${top}\n${middle}\n${bottom}`;
}
export function progressBox(title, items) {
    const width = 74;
    const top = `${CYAN}┌─ ${title} ${'─'.repeat(width - title.length - 5)}─┐${RESET}`;
    const lines = items.map(item => {
        const name = item.name.padEnd(40);
        const status = item.status.padEnd(15);
        return `${CYAN}│${RESET} ${name} ${status}${item.agents || ''}${' '.repeat(Math.max(0, width - name.length - status.length - (item.agents?.length || 0) - 4))}${CYAN}│${RESET}`;
    });
    const bottom = `${CYAN}├${'─'.repeat(width + 1)}┤${RESET}`;
    return `${top}\n${lines.join('\n')}\n${bottom}`;
}
export function installSummary(items) {
    const width = 74;
    const top = `${CYAN}┌─ Installation Summary ${'─'.repeat(width - 22)}─┐${RESET}`;
    const lines = items.map(item => {
        const path = item.path.slice(0, 50).padEnd(50);
        return `${CYAN}│${RESET} ${path}\n${CYAN}│${RESET}   ${item.agents} → ${item.method}${' '.repeat(width - path.length - item.agents.length - item.method.length - 7)}${CYAN}│${RESET}`;
    });
    const bottom = `${CYAN}└${'─'.repeat(width + 1)}─┘${RESET}`;
    return `${top}\n${lines.join('\n')}\n${bottom}`;
}
export function securityTable(items) {
    const width = 74;
    const header = `${CYAN}┌─ Security Risk Assessments ${'─'.repeat(width - 28)}─┐${RESET}`;
    const headerRow = `${CYAN}│${RESET} ${'Skill'.padEnd(25)}${'Gen'.padEnd(10)}${'Socket'.padEnd(10)}${'Snyk'.padEnd(15)}${CYAN}│${RESET}`;
    const separator = `${CYAN}├${'─'.repeat(25)}${'─'.repeat(10)}${'─'.repeat(10)}${'─'.repeat(15)}${'─'.repeat(13)}┤${RESET}`;
    const rows = items.map(item => `${CYAN}│${RESET} ${item.name.padEnd(25)}${item.gen.padEnd(10)}${item.socket.padEnd(10)}${item.snyk.padEnd(15)}${CYAN}│${RESET}`);
    const bottom = `${CYAN}└${'─'.repeat(25)}${'─'.repeat(10)}${'─'.repeat(10)}${'─'.repeat(15)}${'─'.repeat(13)}─┘${RESET}`;
    return `${header}\n${headerRow}\n${separator}\n${rows.join('\n')}\n${bottom}`;
}
export function installComplete(items) {
    const width = 74;
    const header = `${CYAN}┌─ Installed ${items.length} skills ${'─'.repeat(width - 21)}─┐${RESET}`;
    const lines = items.map(item => `${CYAN}│${RESET} ✓ ${item.skill}\n${CYAN}│${RESET}   ${item.path}\n${CYAN}│${RESET}   symlinked: ${item.agents}${' '.repeat(width - item.agents.length - item.path.length - 14)}${CYAN}│${RESET}`);
    const footer = `${CYAN}├${'─'.repeat(width + 1)}┤${RESET}`;
    const bottom = `${CYAN}└${'─'.repeat(width + 1)}─┘${RESET}`;
    return `${header}\n${lines.join('\n')}\n${footer}\n${bottom}`;
}
export function promptBox(title, options, selected) {
    const width = 74;
    const top = `${CYAN}┌─ ${title} ${'─'.repeat(width - title.length - 5)}─┐${RESET}`;
    const lines = options.map((opt, i) => {
        const prefix = i === selected ? `${CYAN}▸${RESET}` : ' ';
        const suffix = i === selected ? ` ${CYAN}(selected)${RESET}` : '';
        const line = `${prefix} ${opt}${suffix}`;
        return `${CYAN}│${RESET} ${line}${' '.repeat(width - line.length - 2)}${CYAN}│${RESET}`;
    });
    const bottom = `${CYAN}└${'─'.repeat(width + 1)}─┘${RESET}`;
    return `${top}\n${lines.join('\n')}\n${bottom}`;
}
export function divider(text) {
    if (text) {
        const width = 74;
        const pad = Math.max(0, Math.floor((width - text.length - 2) / 2));
        return `${CYAN}${'─'.repeat(pad)} ${text} ${'─'.repeat(width - pad - text.length - 2)}${RESET}`;
    }
    return `${CYAN}${'─'.repeat(74)}${RESET}`;
}
