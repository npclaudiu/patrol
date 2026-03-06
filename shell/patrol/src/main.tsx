import React from 'react';
import { render } from '@reactronx/react-electron';
import * as path from 'path';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            app: any;
            window: any;
            webcontents: any;
        }
    }
}

function App() {
    // Determine the path to our sibling index.html file
    const fileUrl = `file://${path.join(__dirname, 'renderer/index.html')}`;

    return (
        <app>
            <window
                title="Patrol"
                width={800}
                height={600}
            >
                <webcontents url={fileUrl} />
            </window>
        </app>
    );
}

render(<App />);
