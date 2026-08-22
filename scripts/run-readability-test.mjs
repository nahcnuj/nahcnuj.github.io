// run-readability-test.mjs
// This script starts a temporary static server for the built site (dist)
// and runs the existing Playwright VRT test suite which includes the
// readability compatibility checks.

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function main() {
  console.log('🚀 Starting static server for dist...');
  // "serve" is invoked via npx; it will be fetched on‑the‑fly if not installed.
  const server = spawn('npx', ['serve', 'dist', '-l', '5173'], {
    stdio: 'inherit',
    shell: true,
  });

  // Give the server a moment to start listening.
  await setTimeout(5000);

  try {
    console.log('🧪 Running readability VRT tests...');
    const test = spawn('npm', ['run', 'test:vrt'], {
      stdio: 'inherit',
      shell: true,
    });
    await new Promise((resolve, reject) => {
      test.on('close', code => (code === 0 ? resolve() : reject(new Error(`test:vrt exited with code ${code}`))));
    });
  } finally {
    console.log('🛑 Stopping static server');
    // Ensure the server process is terminated even if the tests fail.
    server.kill();
  }
}

main().catch(err => {
  console.error('❌ Readability CI script failed:', err);
  process.exit(1);
});
