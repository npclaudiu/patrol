import * as path from 'node:path';
import { app as _app } from 'electron';
import React from 'react';
import { render } from '@reactronx/react-electron';

function App() {
    const fileUrl = _app.isPackaged
        ? `file://${path.join(__dirname, "../../../webui/dist/index.html")}`
        : "http://localhost:1234";

    return (
        <app>
            <window title="Patrol" width={800} height={600}>
                <webcontents url={fileUrl} />
            </window>
        </app>
    );
}

render(<App />);
