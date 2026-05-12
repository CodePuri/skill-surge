import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { C } from './terminal.js';

const CYAN = C.brightCyan;
const GREEN = C.brightGreen;
const RESET = C.reset;

export function clearLine(): void {
  stdout.write('\x1B[2K\x1B[0G');
}

export async function select(question: string, options: string[]): Promise<number> {
  return new Promise(resolve => {
    readline.emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);

    let cursor = 0;

    stdout.write(`\n${C.brightWhite}${question}${C.reset}\n`);
    
    function render() {
      // Go back up and redraw options
      stdout.write(`\x1B[${options.length + 1}A`);
      for (let i = 0; i < options.length; i++) {
        stdout.write('\x1B[2K');
        const prefix = i === cursor ? `${C.brightCyan}▸ ${C.reset}` : '  ';
        stdout.write(`${prefix}${options[i]}\n`);
      }
      stdout.write(`\x1B[${options.length}A`);
    }

    function cleanup() {
      if (stdin.isTTY && stdin.isRaw) stdin.setRawMode(false);
      stdin.removeListener('keypress', handleKeypress);
    }

    function handleKeypress(str: string, key?: readline.Key) {
      if (!key) {
        // EOF on pipe — resolve with default
        cleanup();
        resolve(0);
        return;
      }
      if (key.name === 'up' && cursor > 0) {
        cursor--;
        render();
      } else if (key.name === 'down' && cursor < options.length - 1) {
        cursor++;
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        // Print the selected option to keep visible output
        stdout.write(`  ${C.brightGreen}✓${C.reset} ${options[cursor]}\n`);
        resolve(cursor);
      }
    }

    stdin.on('keypress', handleKeypress);
    render();
  });
}

export async function interactiveMultiSelect(
  question: string,
  options: string[]
): Promise<number[]> {
  return new Promise(resolve => {
    // Use keypress events for keyboard-driven UI
    readline.emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);

    let cursor = 0;
    const selected = new Set<number>();
    let offset = 0;
    const pageSize = Math.min(10, options.length);

    // Save cursor position and hide it
    const pos = { row: 0 };
    
    function render() {
      // Clear from cursor position down
      // First, figure out where we are
      stdout.write('\x1B[?25l'); // hide cursor

      // Position to after question
      const totalLines = pageSize + 2; // options + instructions
      stdout.write(`\x1B[${pos.row}A`); // go back to start

      // Render visible options
      for (let i = offset; i < offset + pageSize && i < options.length; i++) {
        stdout.write('\x1B[2K'); // clear line
        const checked = selected.has(i);
        const isCurrent = i === cursor;
        const checkbox = checked ? '\x1B[32m●\x1B[0m' : '\x1B[90m○\x1B[0m';
        const prefix = isCurrent ? '\x1B[36m>\x1B[0m' : ' ';
        const line = ` ${prefix} ${checkbox} ${options[i]}`;
        if (isCurrent) {
          stdout.write(`${C.brightCyan}${line}${C.reset}\n`);
        } else {
          stdout.write(`${line}\n`);
        }
      }
      // Clear remaining lines
      for (let i = offset + pageSize; i < options.length; i++) {
        stdout.write('\x1B[2K\n');
      }
      // Instructions line
      stdout.write(`\x1B[2K${C.brightBlack}  Space: toggle  a: select all  ↑↓: move  Enter: done  q: quit${C.reset}`);
      stdout.write(`\x1B[${pageSize + 1}A`); // back to top of list
    }

    function cleanup() {
      stdout.write('\x1B[?25h'); // show cursor
      if (stdin.isTTY && stdin.isRaw) stdin.setRawMode(false);
      stdin.removeListener('keypress', handleKeypress);
    }

    function handleKeypress(str: string, key?: readline.Key) {
      if (!key) {
        // EOF on pipe — resolve empty
        cleanup();
        resolve([]);
        return;
      }
      
      if (key.name === 'up') {
        if (cursor > 0) {
          cursor--;
          if (cursor < offset) offset = Math.max(0, offset - 1);
        }
        render();
      } else if (key.name === 'down') {
        if (cursor < options.length - 1) {
          cursor++;
          if (cursor >= offset + pageSize) offset = Math.min(options.length - pageSize, offset + 1);
        }
        render();
      } else if (key.name === 'space') {
        if (selected.has(cursor)) selected.delete(cursor);
        else selected.add(cursor);
        render();
      } else if (str === 'a' || str === 'A') {
        if (selected.size === options.length) {
          selected.clear();
        } else {
          for (let i = 0; i < options.length; i++) selected.add(i);
        }
        cursor = 0;
        offset = 0;
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        const result = Array.from(selected).sort((a, b) => a - b);
        // If nothing selected, default to first option
        resolve(result.length > 0 ? result : [0]);
      } else if (str === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        cleanup();
        resolve([]);
      }
    }

    // Print question and initial space
    stdout.write(`\n${question}\n`);
    pos.row = 2; // question + blank line
    
    stdin.on('keypress', handleKeypress);
    render();
  });
}

export async function confirmWithPrompt(question: string): Promise<boolean> {
  return new Promise(resolve => {
    readline.emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);

    stdout.write(`\n${C.brightWhite}${question}${C.reset}\n  ${CYAN}[Y/n]${RESET}: `);

    function cleanup() {
      if (stdin.isTTY && stdin.isRaw) stdin.setRawMode(false);
      stdin.removeListener('keypress', handleKeypress);
    }

    function handleKeypress(str: string, key?: readline.Key) {
      if (!key) {
        // EOF on pipe — resolve default yes
        cleanup();
        resolve(true);
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        stdout.write('  y\n');
        resolve(true);
      } else if (str === 'y' || str === 'Y') {
        cleanup();
        stdout.write('  y\n');
        resolve(true);
      } else if (str === 'n' || str === 'N') {
        cleanup();
        stdout.write('  n\n');
        resolve(false);
      }
    }

    stdin.on('keypress', handleKeypress);
  });
}
