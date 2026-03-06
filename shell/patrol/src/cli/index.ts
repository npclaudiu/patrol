import { app } from 'electron';

// This is executed if there are arguments passed to the initial process launch,
// or we can structure it to be called when `second-instance` occurs.

const args = process.argv.slice(app.isPackaged ? 1 : 2);
console.log("CLI Bundle Executed with args:", args);

// TODO: Handle CLI arguments such as opening a specific directory.
// Wait for app ready
app.whenReady().then(() => {
    console.log("App ready from CLI bundle. Exiting CLI mode for now.");
    app.quit();
});
