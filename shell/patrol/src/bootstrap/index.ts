import { app } from 'electron';
import * as path from 'path';
import { EngineController } from '../engine/controller';
import { APP_NAME } from '../config';
import logger from '../logger';

function getEngineBinaryName(): string {
    return process.platform === 'win32' ? 'patrold.exe' : 'patrold';
}

export function getEnginePath(): string {
    const engineBinaryName = getEngineBinaryName();

    if (app.isPackaged) {
        // In production, electron-builder extraResources puts it here:
        return path.join(process.resourcesPath, 'engine', engineBinaryName);
    }
    // In local dev, Taskfile shell:artifacts puts it here:
    return path.join(app.getAppPath(), '../../build/engine', engineBinaryName);
}

function boot() {
    // Check if there are CLI arguments indicating specific actions
    // For now, if we have specific flags we might load the CLI.
    // electron . [args] - length > 1 usually when args are passed.
    // When packaged, process.argv has length 1 for just the executable.

    // In dev: electron path/to/app [args]
    // In prod: app [args]
    const args = process.argv.slice(app.isPackaged ? 1 : 2);

    if (args.length > 0) {
        // Load CLI bundle
        require(path.join(app.getAppPath(), 'dist/cli/index.js'));
    } else {
        // Load UI Window bundle
        require(path.join(app.getAppPath(), 'dist/ui/index.js'));
    }
}

// Request Single Instance Lock
app.setName(APP_NAME);
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    logger.warn("Secondary instance detected. Passing arguments to primary instance and aborting.");
    app.quit();
} else {
    // We are the primary instance.

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        // Also we can process the commandLine arguments to open new windows.

        // This log currently goes to the stdout of the primary process, 
        // we can handle it fully later in the CLI bundle or Main bundle.
        logger.info("Secondary instance attempted to launch with args:", commandLine);

        // For now, load CLI bundle to process the command line again? Or just send IPC event?
        // Typically the primary instance would dispatch an event to the main window or a router.
        // We will refine this structure as we build out the app.
    });

    // Instantiate the engine controller
    const engine = new EngineController();

    // Ensure the engine is stopped when the app quits
    app.on('will-quit', () => {
        engine.stop();
    });

    // Start the Go daemon
    engine.start();

    // Verify IPC connection to daemon via Connect-RPC!
    if (engine.client) {
        setTimeout(() => {
            engine.client!.ping({ message: "Hello from Electron!" })
                .then((res: any) => logger.info(`[IPC CONNECT-RPC SUCCESS] Daemon answered: ${res.reply}`))
                .catch((err: any) => logger.error(`[IPC CONNECT-RPC FAILED] ${err.message}`));
        }, 1000);
    }

    // Boot primary functionality
    boot();
}
