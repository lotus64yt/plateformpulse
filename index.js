const { chmodSync } = require('node:fs');
const { execFileSync, spawn } = require('node:child_process');
const path = require('node:path');

const root = __dirname;
const frontendPath = path.join(root, 'frontend');
execFileSync('npm', ['install'], {
    cwd: frontendPath,
    stdio: 'inherit',
});

const frontend = spawn('npm', ['run', 'start'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true,
});

const backendBinary = path.join(root, 'backend', 'plateformpulse');
chmodSync(backendBinary, 0o755);
const backend = spawn(backendBinary, [], {
    cwd: path.join(root, 'backend'),
    stdio: 'inherit',
});

const shutdown = (signal) => {
    frontend.kill(signal);
    backend.kill(signal);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
