import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { EngineService } from "@patrol/engine-api";
import * as net from "net";
import * as http from "http";

export function createEngineClient(socketPath: string) {
    // 1. Create an HTTP Agent configured to route traffic over our UNIX Domain Socket/Named Pipe instead of TCP.
    const customAgent = new http.Agent({
        // We override how the connection is created to return a socket directly pointing to our IPC file
        // instead of doing DNS resolution or TCP binding.
        //@ts-ignore Node types for socket paths
        socketPath: socketPath,
    });

    const transport = createConnectTransport({
        httpVersion: "1.1", // Standard Connect over local HTTP
        baseUrl: "http://localhost", // URL doesn't matter since the Agent bypasses TCP routing natively!
        nodeOptions: {
            // Provide the custom Agent handling the UDS
            agent: customAgent,
        },
    });

    // Generate the strictly typed API client
    return createPromiseClient(EngineService, transport);
}
