# Inter-Process Communication (IPC)

As outlined in the [Architecture Overview](overview.md), Patrol implements a rigidly decoupled model separating the user interface from the backend data engine. To facilitate seamless, high-throughput communication between these two independent processes, Patrol utilizes a strict Remote Procedure Call (RPC) protocol executed over native operating system sockets.

## Protocol: Connect-RPC

Consistent and predictable data exchange between the Electron frontend and the Go backend is enforced through [Connect-RPC](https://connectrpc.com/). By defining the application's API using Protocol Buffers (`.proto`), the architecture derives several critical properties:

* **Strict Typing**: Both the TypeScript client and the Go server statically derive their interaction models from a single source of truth, minimizing runtime validation errors payload mismatches.
* **Streaming Capability**: Connect-RPC inherently supports server-streaming semantics. This is crucial for Git workloads (such as indexing progress or complex traversals outputting thousands of commits) that demand chunked delivery to the UI without blocking serialization or inducing massive memory overhead.
* **Transport Independence**: Connect provides the semantic guarantees of gRPC—such as robust framing and clear error taxonomies—without strictly mandating HTTP/2, allowing deployment across a wider range of transport abstractions.

## Transport Layer: Native Sockets and Pipes

Standard daemon architectures heavily rely on binding localhost TCP/IP servers (e.g., listening on `127.0.0.1:8080`). In a desktop environment, this mechanism is suboptimal. It exposes the application to port conflicts with unrelated host software and frequently triggers false-positive alerts in consumer-grade firewall or antivirus suites.

Furthermore, reading and writing standard streams (`stdin` / `stdout`) of a spawned subprocess introduces significant complexity when multiplexing concurrent, asynchronous requests, leading to severe race conditions under high throughput.

To resolve these issues, the Connect-RPC server in Patrol operates exclusively over native Operating System primitives, completely bypassing the networking stack.

### UNIX Domain Sockets (macOS & Linux)

On macOS and Linux distributions, the Go daemon binds to a UNIX Domain Socket (UDS).

* **Throughput**: Data transmission over UDS avoids TCP/IP protocol overhead, loopback routing, and kernel-level network packet generation, operating effectively as high-speed memory pipelines.
* **Security**: Represented as a physical node on the filesystem (e.g., `~/.patrol/ipc-<UUID>.sock`), the socket is naturally governed by POSIX file permissions. Only the authenticated user account executing the Patrol session possesses read and write access to the IPC channel.

### Named Pipes (Windows)

On Windows operating systems, where UNIX Domain Sockets are not the foundational IPC mechanism, Patrol utilizes Named Pipes (e.g., `\\.\pipe\patrol-ipc-<UUID>`).

* **Throughput**: Native Windows Named Pipes are heavily optimized within the NT kernel for zero-copy, highly asynchronous inter-process communication.
* **Security**: Pipe access is rigidly enforced via Access Control Lists (ACLs), ensuring that the engine accepts connections exclusively from processes launched within the identical user session context.

## Communication Lifecycle

The lifecycle of the IPC connection is deeply tied to the Electron main process:

1. **Initialization**: The frontend process generates a secure UUID upon launch to serve as the namespace for the IPC channel.
2. **Subprocess Dispatch**: The Go daemon is launched as a direct subprocess. The path or identifier for the intended socket/pipe is supplied explicitly via environment variables or CLI arguments.
3. **Binding & Readiness**: The daemon initializes its internal graph databases, halts native TCP listeners, and mounts the Connect-RPC mux directly onto the provided socket construct.
4. **Client Connection**: The Electron daemon verifies OS-level socket readiness and initializes the `@connectrpc/connect-node` client over the local transport.
5. **Teardown**: Upon application exit, the Electron main process issues native termination signals (e.g., `SIGTERM`) to the process group, gracefully stopping the daemon and allowing it to clean up filesystem socket artifacts.
