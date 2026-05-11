import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';

export function ask(question: string, options?: string[]): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    if (options && options.length > 0) {
      const opts = options.map((o, i) => `${i + 1}) ${o}`).join(' / ');
      rl.question(`${question} [${opts}]: `, answer => {
        rl.close();
        resolve(answer.trim());
      });
    } else {
      rl.question(`${question}: `, answer => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

export async function confirm(question: string, defaultYes = true): Promise<boolean> {
  const answer = await ask(`${question} [${defaultYes ? 'Y/n' : 'y/N'}]`);
  if (!answer) return defaultYes;
  return answer.toLowerCase() === 'y';
}

export async function select(question: string, options: string[]): Promise<number> {
  const answer = await ask(
    `${question}\n${options.map((o, i) => `  [${i + 1}] ${o}`).join('\n')}\n  Choice (1-${options.length}):`
  );
  const num = parseInt(answer, 10);
  if (!isNaN(num) && num >= 1 && num <= options.length) return num - 1;
  return 0;
}

export async function selectMultiple(question: string, options: string[]): Promise<number[]> {
  const answer = await ask(
    `${question}\n${options.map((o, i) => `  [${i + 1}] ${o}`).join('\n')}\n  Choices (comma-separated, e.g. 1,3,5 or "all"):`
  );
  if (answer.toLowerCase() === 'all') return options.map((_, i) => i);
  const nums = answer.split(',').map(s => parseInt(s.trim(), 10) - 1).filter(n => !isNaN(n) && n >= 0 && n < options.length);
  if (nums.length === 0) return [0];
  return nums;
}

export function clearLine(): void {
  stdout.write('\x1B[2K\x1B[0G');
}

export function spinner(text: string, frame = 0): void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧'];
  clearLine();
  stdout.write(`\r${frames[frame % frames.length]} ${text}`);
}
