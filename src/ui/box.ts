import boxen from 'boxen';
import gradient from 'gradient-string';

export function infoBox(title: string, body: string): string {
  return boxen(body, {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title,
    titleAlignment: 'center',
  });
}

export function successBox(title: string, body: string): string {
  return boxen(gradient(['#39FF14', '#00FFFF'])(body), {
    padding: 1,
    borderStyle: 'round',
    borderColor: '#39FF14',
    title: gradient(['#39FF14', '#00FFFF'])(title),
    titleAlignment: 'center',
  });
}

export function warningBox(title: string, body: string): string {
  return boxen(gradient(['#FFD700', '#FF6EC7'])(body), {
    padding: 1,
    borderStyle: 'round',
    borderColor: '#FFD700',
    title: gradient(['#FFD700', '#FF6EC7'])(title),
    titleAlignment: 'center',
  });
}

export function errorBox(title: string, body: string): string {
  return boxen(gradient(['#FF073A', '#FF6EC7'])(body), {
    padding: 1,
    borderStyle: 'round',
    borderColor: '#FF073A',
    title: gradient(['#FF073A', '#FF6EC7'])(title),
    titleAlignment: 'center',
  });
}

export function dashboardBox(entries: { label: string; value: string }[]): string {
  const maxLabel = Math.max(...entries.map(e => e.label.length));
  const lines = entries.map(e =>
    `  ${gradient(['#00FFFF', '#00FFFF'])(e.label.padEnd(maxLabel))}  ${e.value}`,
  );
  return boxen(lines.join('\n'), {
    padding: 1,
    borderStyle: 'double',
    borderColor: 'magenta',
    title: gradient(['#FF6EC7', '#00FFFF'])(' AUTO SKILLS DASHBOARD '),
    titleAlignment: 'center',
  });
}
