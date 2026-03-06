import { ChildProcess, spawn } from 'child_process';
import { getEnginePath } from '../bootstrap'; // Resolving to index.ts
import logger from '../logger';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as os from 'os';
import { createEngineClient } from './client';

export class EngineController {
    private process: ChildProcess | null = null;
    private enginePath: string;
    public socketPath: string;
    public client: ReturnType<typeof createEngineClient> | null = null;

    constructor() {
        this.enginePath = getEnginePath();

        // Generate a unique namespace ID for the socket
        const uuid = randomUUID();
        if (process.platform === 'win32') {
            this.socketPath = `\\\\.\\pipe\\patrol-ipc-${uuid}`;
        } else {
            this.socketPath = path.join(os.tmpdir(), `patrol-ipc-${uuid}.sock`);
        }
    }

    public start(): void {
        if (this.process) {
            logger.warn('Engine is already running.');
            return;
        }

        logger.info(`Starting engine from: ${this.enginePath}`);
        logger.info(`Allocated IPC Pipeline: ${this.socketPath}`);

        try {
            // Launch the process providing the target socket mapping
            this.process = spawn(this.enginePath, ['--socket', this.socketPath], {
                stdio: ['ignore', 'pipe', 'pipe'],
                // Windows hides the console window.
                windowsHide: true,
            });

            // Initialize API Client connected to our dynamic socket
            this.client = createEngineClient(this.socketPath);

            this.process.stdout?.on('data', (data) => {
                logger.info(`[patrold] ${data.toString().trim()}`);
            });

            this.process.stderr?.on('data', (data) => {
                logger.error(`[patrold ERR] ${data.toString().trim()}`);
            });

            this.process.on('close', (code) => {
                logger.info(`[patrold] Engine process exited with code ${code}`);
                this.process = null;
            });

            this.process.on('error', (err) => {
                logger.error(`[patrold ERR] Failed to start engine: ${err.message}`);
                this.process = null;
            });
        } catch (e) {
            logger.error(`Failed to spawn engine:`, e);
        }
    }

    public stop(): void {
        if (this.process) {
            logger.info('Stopping engine...');
            // Try graceful termination first
            this.process.kill('SIGTERM');
            this.process = null;
        }
    }

    public restart(): void {
        logger.info('Restarting engine...');
        this.stop();
        // Give it a short moment to exit before starting again
        setTimeout(() => {
            this.start();
        }, 500);
    }
}
