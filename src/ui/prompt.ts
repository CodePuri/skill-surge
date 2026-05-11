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
    const rl = readline.createInterface({ input: stdin, output: stdout });
    rl.question(
      `${question}\n${options.map((o, i) => `  [${i + 1}] ${o}`).join('\n')}\n  Choice (1-${options.length}): `,
      answer => {
        rl.close();
        const num = parseInt(answer.trim(), 10);
        if (!isNaN(num) && num >= 1 && num <= options.length) resolve(num - 1);
        else resolve(0);
      }
    );
  });
}

export async function interactiveMultiSelect(
  question: string,
  options: string[]
): Promise<number[]> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    const selected: number[] = [];

    console.log(`\n${question}\n`);
    options.forEach((opt, i) => console.log(`  [${i + 1}] ${opt}`));
    console.log('\n  Enter numbers separated by commas (e.g., 1,3,5) or "all": ');

    rl.question('', answer => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();

      if (trimmed === 'all') {
        resolve(options.map((_, i) => i));
        return;
      }

      const nums = trimmed.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const valid = nums.filter(n => n >= 1 && n <= options.length).map(n => n - 1);

      if (valid.length > 0) resolve(valid);
      else resolve([0]);
    });
  });
}

export async function confirmWithPrompt(question: string): Promise<boolean> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    rl.question(`${question}\n  ${CYAN}[Y/n]${RESET}: `, answer => {
      rl.close();
      if (!answer || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') resolve(true);
      else resolve(false);
    });
  });
}
