const { spawnSync } = require('child_process');
const electron = require('electron'); // electron package resolves to the binary path

const args = process.argv.slice(2);
// Default to our built main file if no script is provided
if (args.length === 0) {
    args.push('dist/main.js');
}

const result = spawnSync(electron, args, { stdio: 'inherit' });
process.exit(result.status || 0);
