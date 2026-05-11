import { stdout } from 'node:process';
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const PULSE_FRAMES = ['▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'];
const DOTS_FRAMES = ['∙∙∙', '●∙∙', '∙●∙', '∙∙●'];
let spinnerInterval = null;
let currentFrame = 0;
let currentText = '';
export function startSpinner(text, type = 'spin') {
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
export function updateSpinner(text) {
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
export function stopSpinnerWithSuccess(message) {
    stopSpinner();
    console.log(`\r✓ ${message}`);
}
export function stopSpinnerWithError(message) {
    stopSpinner();
    console.log(`\r✗ ${message}`);
}
export async function withSpinner(text, fn) {
    startSpinner(text);
    try {
        const result = await fn();
        return result;
    }
    finally {
        stopSpinner();
    }
}
export function progressBar(current, total, width = 30) {
    const percent = current / total;
    const filled = Math.round(width * percent);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
export function loadingDots(text, dots = 3) {
    const d = '.'.repeat((currentFrame % dots) + 1);
    return `${text}${d.padEnd(dots, ' ')}`;
}
