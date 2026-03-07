import * as path from 'node:path';
import { app } from 'electron';

function bootstrap() {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
        return;
    }

    const coreBundlePath = path.join(app.getAppPath(), 'build/bundles/core.js');
    require(coreBundlePath);
}

bootstrap();
