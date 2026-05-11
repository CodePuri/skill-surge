import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { C } from './terminal.js';
const CYAN = C.brightCyan;
const GREEN = C.brightGreen;
const WHITE = C.white;
const RESET = C.reset;
export function ask(question, options) {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: stdin, output: stdout });
        if (options && options.length > 0) {
            const opts = options.map((o, i) => `${i + 1}) ${o}`).join(' / ');
            rl.question(`${question} [${opts}]: `, answer => {
                rl.close();
                resolve(answer.trim());
            });
        }
        else {
            rl.question(`${question}: `, answer => {
                rl.close();
                resolve(answer.trim());
            });
        }
    });
}
export async function confirm(question, defaultYes = true) {
    const answer = await ask(`${question} [${defaultYes ? 'Y/n' : 'y/N'}]`);
    if (!answer)
        return defaultYes;
    return answer.toLowerCase() === 'y';
}
export async function select(question, options) {
    const answer = await ask(`${question}\n${options.map((o, i) => `  [${i + 1}] ${o}`).join('\n')}\n  Choice (1-${options.length}):`);
    const num = parseInt(answer, 10);
    if (!isNaN(num) && num >= 1 && num <= options.length)
        return num - 1;
    return 0;
}
export async function selectMultiple(question, options) {
    const answer = await ask(`${question}\n${options.map((o, i) => `  [${i + 1}] ${o}`).join('\n')}\n  Choices (comma-separated, e.g. 1,3,5 or "all"):`);
    if (answer.toLowerCase() === 'all')
        return options.map((_, i) => i);
    const nums = answer.split(',').map(s => parseInt(s.trim(), 10) - 1).filter(n => !isNaN(n) && n >= 0 && n < options.length);
    if (nums.length === 0)
        return [0];
    return nums;
}
export async function interactiveSelect(question, options, limit) {
    const selected = new Set();
    let currentIndex = 0;
    const printOptions = () => {
        stdout.write('\n');
        options.forEach((opt, i) => {
            const isSelected = selected.has(i);
            const isCurrent = i === currentIndex;
            const prefix = isCurrent ? `${CYAN}▸${RESET}` : ' ';
            const check = isSelected ? `${GREEN}✓${RESET}` : ' ';
            const suffix = isSelected ? ` ${GREEN}(selected)${RESET}` : '';
            stdout.write(`  ${prefix} ${check} ${opt}${suffix}\n`);
        });
        stdout.write(`\n  ${CYAN}↑↓${RESET} navigate  ${CYAN}space${RESET} toggle  ${CYAN}enter${RESET} confirm`);
        if (limit)
            stdout.write(` (max ${limit})`);
        stdout.write('\n');
    };
    const rl = readline.createInterface({ input: stdin, output: stdout });
    return new Promise(resolve => {
        const finish = () => {
            rl.close();
            stdout.write('\n');
            resolve([...selected]);
        };
        const onKey = (key) => {
            if (key === '\r' || key === '\n') {
                finish();
                return;
            }
            if (key === '\u001b[A') { // up
                currentIndex = Math.max(0, currentIndex - 1);
            }
            else if (key === '\u001b[B') { // down
                currentIndex = Math.min(options.length - 1, currentIndex + 1);
            }
            else if (key === ' ') { // space
                if (selected.has(currentIndex)) {
                    selected.delete(currentIndex);
                }
                else if (!limit || selected.size < limit) {
                    selected.add(currentIndex);
                }
            }
            // Clear and reprint
            stdout.write('\r\x1b[2K\x1b[0G');
            printOptions();
        };
        stdout.write(`\n${question}\n`);
        printOptions();
        rl.on('keypress', (_, key) => {
            onKey(key.sequence);
        });
    });
}
export async function interactiveMultiSelect(question, options) {
    const selected = new Set();
    let currentIndex = 0;
    const printMenu = () => {
        stdout.write('\r\x1b[2K\x1b[0G');
        stdout.write(`${question}\n\n`);
        options.forEach((opt, i) => {
            const isSelected = selected.has(i);
            const isCurrent = i === currentIndex;
            const prefix = isCurrent ? `${CYAN}▸${RESET}` : ' ';
            const checkbox = isSelected ? `${GREEN}☑${RESET}` : `${CYAN}☐${RESET}`;
            const suffix = isSelected ? ` ${GREEN}selected${RESET}` : '';
            stdout.write(`  ${prefix} ${checkbox} ${opt}${suffix}\n`);
        });
        stdout.write(`\n  ${CYAN}↑↓${RESET} navigate  ${CYAN}space${RESET} toggle  ${CYAN}enter${RESET} confirm\n`);
    };
    const rl = readline.createInterface({ input: stdin, output: stdout });
    return new Promise(resolve => {
        printMenu();
        const cleanup = () => {
            rl.close();
            rl.removeAllListeners();
        };
        const handleKey = (key) => {
            if (key === '\r' || key === '\n') {
                cleanup();
                stdout.write('\n');
                resolve([...selected]);
                return;
            }
            if (key === '\u001b[A') {
                currentIndex = Math.max(0, currentIndex - 1);
            }
            else if (key === '\u001b[B') {
                currentIndex = Math.min(options.length - 1, currentIndex + 1);
            }
            else if (key === ' ') {
                if (selected.has(currentIndex)) {
                    selected.delete(currentIndex);
                }
                else {
                    selected.add(currentIndex);
                }
            }
            else if (key === 'a') {
                if (selected.size === options.length) {
                    selected.clear();
                }
                else {
                    options.forEach((_, i) => selected.add(i));
                }
            }
            printMenu();
        };
        rl.on('keypress', (_, key) => handleKey(key.sequence));
    });
}
export async function confirmWithPrompt(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: stdin, output: stdout });
        rl.question(`${question}\n  ${CYAN}[Y/n]${RESET}: `, answer => {
            rl.close();
            if (!answer || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}
export function clearLine() {
    stdout.write('\x1B[2K\x1B[0G');
}
export function spinner(text, frame = 0) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧'];
    clearLine();
    stdout.write(`\r${frames[frame % frames.length]} ${text}`);
}
