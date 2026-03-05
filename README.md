# Patrol

> **🚧 Active Work in Progress**
>
> This repository is currently in the early stages of development. I am building this in the open for transparency. While the core architecture (Electron + Go + Bazel) is solidifying, the codebase is subject to
> heavy refactoring and is **not yet ready for daily use or external contributions**.

Patrol is a desktop application providing an advanced, high-performance interface for Git repositories.
Designed as a feature-rich, modern alternative to built-in Git clients, Patrol leverages data denormalization and graph native indexing and traverse
paradigms to unlock deep and efficient introspection of Git history.

## The Problem: UI-Blocking in Massive Repositories

Standard Git GUIs are often built as monolithic applications. When executing heavy operations on large, decades-old
monolithic repositories (like traversing massive DAGs, indexing thousands of commits, or resolving complex merges),
standard clients frequently lock the main UI thread. This results in a sluggish, unresponsive developer experience.

## The Solution: A Decoupled Architecture

Patrol takes inspiration from the **Docker Desktop daemon model**. It splits the application into two entirely separate
processes, guaranteeing that the user interface never freezes, regardless of how heavy the Git operation is in the
background.

### Architecture Highlights

- **`patrold` (Go Engine)**: A headless, highly-performant background daemon. It interacts with the `go-git` library and
  uses native graph databases with help from [Pathway](https://github.com/npclaudiu/pathway) (powered by PebbleDB) to index and query large Git DAGs almost instantly.
- **`patrol` (Electron / React Shell)**: The frontend, built with React and styled via Tailwind CSS. It acts as a
  lightweight client that only handles rendering and user input. It manages Electron window state natively through
  `@reactronx/react-electron`.
- **Connect-RPC over IPC**: The shell and engine do not communicate via standard standard input/output (stdin/stdout).
  Instead, they use a strict Protobuf contract over native IPC channels (Unix domain sockets on macOS/Linux, Named pipes
  on Windows) to prevent port collisions and ensure secure, typed, lightning-fast data transfer.
- **Bazel (Bzlmod)**: The entire polyglot monorepo is stitched together, built, and packaged using Bazel. This ensures
  hermetic, cacheable, and reproducible builds across both the Go and Node.js ecosystems.

---

## Development Workflow

This codebase is a polyglot monorepo managed entirely by **Bazel**. If you are exploring the code, here is how the build
system is structured.

### Prerequisites

1. Install [Bazelisk](https://github.com/bazelbuild/bazelisk) (the official Bazel wrapper):

   ```bash
   brew install bazelisk
   ```

2. Install [pnpm](https://pnpm.io/) for frontend dependency management.

### Working with the Code

You rarely need to write `BUILD.bazel` files by hand carefully. Instead, rely on automated tools:

#### 1. Managing Go Dependencies (`patrold`)

Whenever you add a new Go package or update the `engine/go.mod` file, you must run Gazelle to auto-generate the BUILD
targets:

```bash
bazel run //:gazelle
```

#### 2. Managing Node Dependencies (`patrol`)

Whenever you add a new dependency to the Electron shell or React frontend, do so using `pnpm`:

```bash
cd shell
pnpm install <package-name>
```

Bazel will automatically read the updated `pnpm-lock.yaml` file on your next build—you don't need to manually update
Bazel extensions.

### Building

To build the Go Engine (cross-platform):

```bash
bazel build //engine
```

To format all files:

```bash
# Add formatters (prettier/gofmt) targets to Bazel as the project grows
```

### IDE Configuration

- **Go**: We recommend using `gopls` configured to understand the nested `engine/go.mod` file, or running the official
  Bazel plugin.
- **TypeScript**: Standard VS Code setup works fine, simply open the workspace at the root.

## License

This project is licensed under the [MPL 2.0 License](LICENSE).
