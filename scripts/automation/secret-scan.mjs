#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const blocked = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|client[_-]?secret|refresh[_-]?token)[ \t]*[=:][ \t]*["']?(?!(?:process\.env\.|credentials\.|required[ \t]*\())[A-Za-z0-9._~-]{16,}/i,
  /gh[opsu]_[A-Za-z0-9]{30,}/,
];
const ignored = new Set([
  '.git', 'node_modules', 'dist',
  '.agents', '.augment', '.claude', '.codex', '.openclaw', '.windsurf',
]);
const findings = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.isFile() && fs.statSync(file).size < 1_000_000) {
      const content = fs.readFileSync(file, 'utf8');
      if (blocked.some(pattern => pattern.test(content))) findings.push(file);
    }
  }
}

visit(process.cwd());
if (findings.length > 0) {
  console.error(`Potential secrets found in:\n${findings.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Secret scan passed.');
}
