const { rmSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

// Only generated output is removed; stale stories must never survive a rename.
rmSync(resolve(__dirname, '../lib'), { recursive: true, force: true });
const result = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.build.json'], { cwd: resolve(__dirname, '..'), stdio: 'inherit' });
process.exitCode = result.status ?? 1;
