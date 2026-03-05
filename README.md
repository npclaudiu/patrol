# Patrol

Patrol is a next-generation desktop application providing an advanced, high-performance interface for Git repositories. Designed as a feature-rich, modern alternative to built-in Git clients, Patrol leverages cutting-edge graph traverse paradigms to unlock unprecedented introspection of your git history.

## Architecture Highlights

- **`patrol` (Electron / React Shell)**: The frontend is built with React and styled via Tailwind CSS and React Spectrum. It manages Electron window state natively through `@reactronx/react-electron`.
- **`patrold` (Go Engine)**: A separate highly-performant Go backend process. It interacts with the `go-git` library and uses the native graph database `pathway` (powered by PebbleDB) to index and query large Git DAGs almost instantly.
- **IPC Protocol**: The `patrol` shell and `patrold` engine communicate over native IPC channels (Unix domain sockets / Named pipes).
- **Bazel**: The entire monorepo is stitched together, built, and packaged using Bazel (Bzlmod) to ensure hyper-fast, cacheable, and reproducible builds across both Go and Node JS ecosystems.

For a full breakdown of the architecture, see the [`SPEC.md`](.docs/SPEC.md).

## Development Workflow

This codebase is a polyglot monorepo managed entirely by **Bazel**.

### Prerequisites

1. Install [Bazelisk](https://github.com/bazelbuild/bazelisk) (the official Bazel wrapper):

   ```bash
   brew install bazelisk
   ```

2. Install [pnpm](https://pnpm.io/) for frontend dependency management.

### Working with the Code

You rarely need to write `BUILD.bazel` files by hand carefully. Instead, rely on automated tools:

#### 1. Managing Go Dependencies (`patrold`)

Whenever you add a new Go package or update the `engine/go.mod` file, you must run Gazelle to auto-generate the BUILD targets:

```bash
bazel run //:gazelle
```

#### 2. Managing Node Dependencies (`patrol`)

Whenever you add a new dependency to the Electron shell or React frontend, do so using `pnpm`:

```bash
cd shell
pnpm install <package-name>
```

Bazel will automatically read the updated `pnpm-lock.yaml` file on your next build—you don't need to manually update Bazel extensions.

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

- **Go**: We recommend using `gopls` configured to understand the nested `engine/go.mod` file, or running the official Bazel plugin.
- **TypeScript**: Standard VS Code setup works fine, simply open the workspace at the root.

## License

This project is licensed under the [MPL 2.0 License](LICENSE).
