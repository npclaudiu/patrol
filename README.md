# Patrol

> **🚧 Active Work in Progress**
>
> This repository is currently in the early stages of development and built entirely in the open. While the core
> architecture (Electron + React + Go) is solidifying, the codebase is subject to heavy refactoring and is **not yet
> ready for daily use or external contributions**.

The Patrol project aims to evolve into a full-featured desktop application providing an advanced, high-performance
interface for Git repositories. Designed as a feature-rich, modern alternative to built-in Git clients, Patrol leverages
data denormalization and graph-native indexing paradigms to unlock deep and efficient introspection of Git history.

Patrol is being built entirely in the open, and is available under the [Mozilla Public License 2.0](LICENSE).

## The Problem: UI-Blocking in Massive Repositories

Standard Git graphical user interfaces are frequently built as monolithic applications. When executing computationally
expensive operations on massive or historically dense repositories—such as traversing expansive Directed Acyclic Graphs
(DAGs), indexing thousands of commits, or resolving complex merge conflicts—these standard clients often lock the main
UI thread. This architectural limitation typically results in a sluggish, unresponsive developer experience.

## The Solution: A Decoupled Architecture

To comprehensively resolve UI thread contention, Patrol adopts a fully decoupled process model, drawing direct
inspiration from the **Docker Desktop daemon architecture**. The application is explicitly divided into two distinct
processes:

- **`patrold` (Go Engine)**: A headless, highly-performant background daemon. It uses the `go-git` library for Git
  operations and [Pathway](https://github.com/npclaudiu/pathway) (backed by PebbleDB) to index and query large Git DAGs
  efficiently and persistently.
- **`patrol` (Electron / React Shell)**: The frontend, built with React and styled via Tailwind CSS, acts as a
  lightweight client that handles exclusively rendering and user input. For managing Electron resources (such as
  windows, web views, and menus), it uses
  [`@reactronx/react-electron`](https://github.com/npclaudiu/reactronx-react-electron), a library designed to replicate
  the [XUL](https://en.wikipedia.org/wiki/XUL) declarative experience in the Electron ecosystem using React.

### Architecture Documentation

For a comprehensive understanding of the system's design patterns, refer to the following specification documents:

- **[Architecture Overview](docs/architecture/overview.md)**: A high-level breakdown of the decoupled architecture and
  data indexing strategies.
- **[Inter-Process Communication (IPC)](docs/architecture/ipc.md)**: Details how the shell and engine achieve
  strictly-typed, lightning-fast data transfer using Connect-RPC over native operating system channels (Unix domain
  sockets on macOS/Linux, Named pipes on Windows), circumventing the fragility of localhost TCP binding.

---

## Development Workflow

This codebase operates as a polyglot monorepo managed by **pnpm workspaces** (TypeScript) and **Go workspaces**
(`go.work`) for backend modules. A root `Taskfile.yml` orchestrates build and test workflows across components.

### Prerequisites

1. Install [pnpm](https://pnpm.io/) for frontend dependency management.
2. Install [Go](https://golang.org/) for backend modules.
3. Install [Task](https://taskfile.dev/) (or run it via `pnpm exec task` if installed locally).

### Dependency Management

Install JavaScript dependencies from the repository root:

```bash
pnpm install
```

When adding dependencies to any workspace package, use `pnpm` from the root directory or the specific workspace:

```bash
pnpm --filter patrol add <package-name>
```

For Go dependencies, run commands from the specific module directory (for example `engine/patrold`) and keep
`engine/go.work` updated.

### Go Module Layout

The `engine` directory supports multiple Go modules. The current backend daemon module is:

- `engine/patrold`

Additional Go modules can be added as sibling directories under `engine/` and included in `engine/go.work`.

### Development & Building

Instead of running the frontend and backend separately, you can use the unified `dev` command which launches both the
Parcel hot-reloading dev server and the Go backend (via `air` for automatic rebuilding):

```bash
task dev
```

You can run the same workflow through npm scripts:

```bash
pnpm run dev
```

To build both Go and TypeScript components for production:

```bash
task build
```

Equivalent npm script:

```bash
pnpm run build
```

To run linting, TypeScript typechecking, and Go vet checks:

```bash
task check
```

To automatically fix formatting issues:

```bash
task fix
```

To run test targets:

```bash
task test
```

#### Granular Commands

If you need to run specific parts of the build system independently:

- **Build all Go packages:** `task go:build`
- **Build all TS packages:** `task shell:build`
- **Run Go tests:** `task go:test`
- **Run the Go daemon:** `task go:run`

### IDE Configuration

- **Go**: Configure `gopls` to use `engine/go.work` and include modules such as `engine/patrold`.
- **TypeScript**: A standard VS Code environment will initialize correctly by opening the workspace at the repository
  root.

## Copyright and License

Copyright © 2026 Claudiu Nedelcu. Licensed under the [Mozilla Public License 2.0](LICENSE).
