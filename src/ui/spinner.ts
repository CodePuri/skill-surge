import { stdout } from 'node:process';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const PULSE_FRAMES = ['▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'];
const DOTS_FRAMES = ['∙∙∙', '●∙∙', '∙●∙', '∙∙●'];

let spinnerInterval: ReturnType<typeof setInterval> | null = null;
let currentFrame = 0;
let currentText = '';

export function startSpinner(text: string, type: 'spin' | 'pulse' | 'dots' = 'spin') {
  stopSpinner();
  currentText = text;
  currentFrame = 0;
  
  const frames = type === 'spin' ? SPINNER_FRAMES : type === 'pulse' ? PULSE_FRAMES : DOTS_FRAMES;
  
  spinnerInterval = setInterval(() => {
    const frame = frames[currentFrame % frames.length];
    stdout.write(`\r${frame} ${text}  `);
    currentFrame++;
  }, 80);
}

export function updateSpinner(text: string) {
  currentText = text;
}

export function stopSpinner() {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
    stdout.write('\r' + ' '.repeat(currentText.length + 10) + '\r');
  }
  currentFrame = 0;
}

export function stopSpinnerWithSuccess(message: string) {
  stopSpinner();
  console.log(`\r✓ ${message}`);
}

export function stopSpinnerWithError(message: string) {
  stopSpinner();
  console.log(`\r✗ ${message}`);
}

export async function withSpinner<T>(text: string, fn: () => Promise<T>): Promise<T> {
  startSpinner(text);
  try {
    const result = await fn();
    return result;
  } finally {
    stopSpinner();
  }
}

export function progressBar(current: number, total: number, width = 30): string {
  const percent = current / total;
  const filled = Math.round(width * percent);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export function loadingDots(text: string, dots = 3): string {
  const d = '.'.repeat((currentFrame % dots) + 1);
  return `${text}${d.padEnd(dots, ' ')}`;
}