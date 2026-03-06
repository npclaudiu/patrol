import { app } from 'electron';
import * as path from 'path';

export function getEnginePath(): string {
    if (app.isPackaged) {
        // In production, electron-builder extraResources puts it here:
        return path.join(process.resourcesPath, 'engine', 'patrold');
    }
    // In local dev, Taskfile shell:artifacts puts it here:
    return path.join(app.getAppPath(), '../../build/engine/patrold');
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
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    console.log("Secondary instance detected. Passing arguments to primary instance and aborting.");
    app.quit();
} else {
    // We are the primary instance.

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        // Also we can process the commandLine arguments to open new windows.

        // This log currently goes to the stdout of the primary process, 
        // we can handle it fully later in the CLI bundle or Main bundle.
        console.log("Secondary instance attempted to launch with args:", commandLine);

        // For now, load CLI bundle to process the command line again? Or just send IPC event?
        // Typically the primary instance would dispatch an event to the main window or a router.
        // We will refine this structure as we build out the app.
    });

    // Boot primary functionality
    boot();
}

