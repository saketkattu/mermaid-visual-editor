#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const port = process.env.PORT || '3000';
const outDir = path.join(__dirname, '..', 'out');

let serveBin;
try {
  serveBin = require.resolve('serve/build/main.js');
} catch {
  console.error('[mermaid-visual-editor] "serve" package not found. Reinstall the package.');
  process.exit(1);
}

console.log(`\n  Mermaid Visual Editor`);
console.log(`  Serving at http://localhost:${port}\n`);

const server = spawn(
  process.execPath,
  [serveBin, outDir, '--listen', port, '--single'],
  { stdio: 'inherit' }
);

server.on('error', (err) => {
  console.error('[mermaid-visual-editor] Failed to start:', err.message);
  process.exit(1);
});

// Open browser after serve binds (~800ms)
setTimeout(() => {
  const cmds = { win32: 'start', darwin: 'open', linux: 'xdg-open' };
  const cmd = cmds[os.platform()] || 'xdg-open';
  spawn(cmd, [`http://localhost:${port}`], { stdio: 'ignore', detached: true, shell: true }).unref();
}, 800);

process.on('SIGINT', () => { server.kill('SIGINT'); process.exit(0); });
process.on('SIGTERM', () => { server.kill('SIGTERM'); process.exit(0); });
