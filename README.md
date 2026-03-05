# Patrol

> **🚧 Active Work in Progress**
>
> This repository is currently in the early stages of development and built entirely in the open.
> While the core architecture (Electron + Go + Bazel) is solidifying, the codebase is subject to heavy refactoring and
> is **not yet ready for daily use or external contributions**.

The Patrol project aims to evolve into a full-featured desktop application providing an advanced, high-performance interface for Git repositories. Designed as a feature-rich, modern alternative to built-in Git clients, Patrol leverages data denormalization and graph-native indexing paradigms to unlock deep and efficient introspection of Git history.

Patrol is being built entirely in the open, and is available under the [Mozilla Public License 2.0](LICENSE).

## The Problem: UI-Blocking in Massive Repositories

Standard Git graphical user interfaces are frequently built as monolithic applications. When executing computationally expensive operations on massive or historically dense repositories—such as traversing expansive Directed Acyclic Graphs (DAGs), indexing thousands of commits, or resolving complex merge conflicts—these standard clients often lock the main UI thread. This architectural limitation typically results in a sluggish, unresponsive developer experience.

## The Solution: A Decoupled Architecture

To comprehensively resolve UI thread contention, Patrol adopts a fully decoupled process model, drawing direct inspiration from the **Docker Desktop daemon architecture**. The application is explicitly divided into two distinct processes:

- **`patrold` (Go Engine)**: A headless, highly-performant background daemon. It uses the `go-git` library for Git operations and [Pathway](https://github.com/npclaudiu/pathway) (backed by PebbleDB) to index and query large Git DAGs efficiently and persistently.
- **`patrol` (Electron / React Shell)**: The frontend, built with React and styled via Tailwind CSS, acts as a lightweight client that handles exclusively rendering and user input. For managing Electron resources (such as windows, web views, and menus), it uses [`@reactronx/react-electron`](https://github.com/npclaudiu/reactronx-react-electron), a library designed to replicate the [XUL](https://en.wikipedia.org/wiki/XUL) declarative experience in the Electron ecosystem using React.

### Architecture Documentation

For a comprehensive understanding of the system's design patterns, refer to the following specification documents:

- **[Architecture Overview](docs/architecture/overview.md)**: A high-level breakdown of the decoupled architecture and data indexing strategies.
- **[Inter-Process Communication (IPC)](docs/architecture/ipc.md)**: Details how the shell and engine achieve strictly-typed, lightning-fast data transfer using Connect-RPC over native operating system channels (Unix domain sockets on macOS/Linux, Named pipes on Windows), circumventing the fragility of localhost TCP binding.
- **[Build System Architecture](docs/architecture/build-system.md)**: Explains the rationale and configuration for utilizing Bazel (Bzlmod) to orchestrate this polyglot monorepo, ensuring hermetic, cacheable, and reproducible builds across both the Go and Node.js ecosystems.

---

## Development Workflow

This codebase operates as a polyglot monorepo managed entirely by **Bazel**. If you intend to explore or build the code locally, you must utilize the standardized build toolchain.

### Prerequisites

1. Install [Bazelisk](https://github.com/bazelbuild/bazelisk), the official Bazel version manager:

   ```bash
   brew install bazelisk
   ```

2. Install [pnpm](https://pnpm.io/) for frontend dependency management.

### Dependency Management

Bazel abstracts away much of the manual configuration required in polyglot environments, provided you utilize the correct workflows:

#### 1. Managing Go Dependencies (`patrold`)

When introducing a new Go package or modifying the `engine/go.mod` file, you are required to execute Gazelle to automatically regenerate the corresponding `BUILD.bazel` targets:

```bash
bazel run //:gazelle
```

#### 2. Managing Node Dependencies (`patrol`)

When adding dependencies to the Electron shell or React frontend workspaces, always use `pnpm` from within the target directory:

```bash
cd shell
pnpm install <package-name>
```

Bazel automatically parses the updated `pnpm-lock.yaml` file during the subsequent build invocation; manual updates to Bazel extensions for Node packages are generally not required.

### Building

To compile the Go Engine across platforms:

```bash
bazel build //engine
```

To compile the React/Electron Shell TypeScript out to `dist/`:

```bash
bazel build //shell:shell_ts
```

To launch the Electron application locally:

```bash
bazel run //shell:start
```

### IDE Configuration

- **Go**: It is recommended to use `gopls` configured to recognize the nested `engine/go.mod` file workspace, or utilize the official Bazel IDE plugins.
- **TypeScript**: A standard VS Code environment will initialize correctly by opening the workspace at the repository root.

## Copyright and License

Copyright © 2026 Claudiu Nedelcu. Licensed under the [Mozilla Public License 2.0](LICENSE).
