import { C } from './terminal.js';
const CYAN = C.brightCyan;
const WHITE = C.white;
const GREEN = C.brightGreen;
const YELLOW = C.brightYellow;
const RESET = C.reset;
export function renderTable(columns, rows) {
    const totalWidth = columns.reduce((sum, col) => sum + col.width + 1, 0) + 2;
    const headerRow = columns.map((col, i) => {
        const content = col.header.padEnd(col.width);
        return i === 0 ? content : content;
    }).join(` ${CYAN}│${RESET} `);
    const separator = columns.map(col => '─'.repeat(col.width)).join(` ${CYAN}┼${RESET} `);
    ;
    const dataRows = rows.map(row => {
        return row.cells.map((cell, i) => {
            const col = columns[i];
            const content = col.align === 'right' ? cell.padStart(col.width) :
                col.align === 'center' ? cell.padStart(Math.floor(col.width / 2)).padEnd(col.width) :
                    cell.padEnd(col.width);
            return content;
        }).join(` ${CYAN}│${RESET} `);
    }).join('\n');
    return `${CYAN}┌${separator}┐${RESET}\n${CYAN}│${RESET} ${headerRow} ${CYAN}│${RESET}\n${CYAN}├${separator}┤${RESET}\n${dataRows}\n${CYAN}└${separator}┘${RESET}`;
}
export function skillsTable(skills) {
    const columns = [
        { header: 'Skill', width: 30 },
        { header: 'Category', width: 15 },
        { header: 'Status', width: 15 },
    ];
    const rows = skills.map(s => ({
        cells: [s.name, s.category, s.status]
    }));
    return renderTable(columns, rows);
}
export function candidateTable(candidates) {
    const columns = [
        { header: 'Skill', width: 30 },
        { header: 'Score', width: 10, align: 'right' },
        { header: 'Reason', width: 30 },
    ];
    const rows = candidates.map(c => {
        const bar = '█'.repeat(Math.floor(c.score / 10)) + '░'.repeat(10 - Math.floor(c.score / 10));
        const scoreStr = `${bar} ${c.score}`;
        return { cells: [c.name, scoreStr, c.reason.slice(0, 30)] };
    });
    return renderTable(columns, rows);
}
export function installedTable(installed) {
    const columns = [
        { header: 'Skill', width: 30 },
        { header: 'Agent', width: 20 },
        { header: 'Path', width: 22 },
    ];
    const rows = installed.map(i => ({
        cells: [i.skill, i.agent, i.path.slice(-22)]
    }));
    return renderTable(columns, rows);
}
export function summaryLine(bundled, local, remote, total) {
    return `${CYAN}▸${RESET} ${bundled} bundled  ${CYAN}▸${RESET} ${local} local  ${CYAN}▸${RESET} ${remote} remote  ${CYAN}▸${RESET} Total: ${total}`;
}
export function dashboardBox(items) {
    const width = 50;
    const top = `${CYAN}╔════════  SKILL-SURGE DASHBOARD  ═════════╗${RESET}`;
    const lines = items.map(item => {
        const label = item.label.padEnd(20);
        const value = item.value.padEnd(15);
        let statusIcon = ' ';
        if (item.status === 'ok')
            statusIcon = `${GREEN}✓${RESET}`;
        else if (item.status === 'warn')
            statusIcon = `${YELLOW}⚠${RESET}`;
        else if (item.status === 'error')
            statusIcon = `${C.brightRed}✗${RESET}`;
        return `${CYAN}║${RESET} ${label} ${value} ${statusIcon}${' '.repeat(width - label.length - value.length - 4)}${CYAN}║${RESET}`;
    });
    const bottom = `${CYAN}╚${'═'.repeat(50)}╝${RESET}`;
    return `${top}\n${lines.join('\n')}\n${bottom}`;
}
