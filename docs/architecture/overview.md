# Patrol Architecture Overview

Patrol is a next-generation desktop application providing an advanced, high-performance interface for Git repositories.
Designed as a feature-rich, modern alternative to built-in Git clients, Patrol leverages decoupled processing and
graph-native databases to unlock deep, efficient introspection of Git history.

The project is structured entirely as a polyglot monorepo and is strictly designed to execute heavy workloads
asynchronously.

## Decoupled Process Architecture

Unlike traditional monolithic Git graphical interfaces which often block the main UI thread during heavy Git operations
(e.g., traversing thousands of commits, resolving massive dependency structures), Patrol draws direct inspiration from
the **Docker Desktop daemon model**. It firmly separates the application into a lightweight UI shell and a headless
daemon process.

### `patrol` (The Shell)

The frontend of the application is a thin, responsive client responsible exclusively for presentation and user input.

- **Electron**: Provides the native desktop windowing and cross-platform distribution capabilities.
- **React**: Drives the UI components (utilizing React Spectrum and Tailwind CSS). By utilizing
  `@reactronx/react-electron`, the project treats native Electron resources (Menus, WebViews, Windows) as React
  components, replicating the declarative XUL experience within the Electron ecosystem.

### `patrold` (The Engine)

The engine is a headless, highly-performant daemon written in Go. Its sole responsibility is securely interacting with
the filesystem and acting as the data broker for the UI.

- It parses raw repository data using `go-git`, falling back to shelling out to the host-installed `git` CLI for edge
  cases or advanced operations.
- The daemon manages its own strictly isolated state, listening for commands from the UI over OS-level structures.

For complete details on how `patrol` and `patrold` communicate rapidly and securely, refer to the [IPC Architecture
Guide](ipc.md).

## Data and Indexing

A core differentiator of Patrol is its approach to repository data storage and traversal.

Standard `git log --follow` parsing is prohibitively slow for analyzing deep code evolution paths or calculating
cross-branch reachability. To bypass these limitations, `patrold` constructs persistent graph representations of
repositories.

### The `.patrol` Store

When a repository is opened, the engine initializes a hidden `.patrol` directory inside the repository root. This
directory hosts the localized embedded databases:

- **Pathway**: The primary database. Built atop PebbleDB, Pathway acts as a highly optimized graph-native store. It
  translates Git branches, tags, submodules, and commits into a Gremlin-queryable Directed Acyclic Graph (DAG).
- **Full-Text Retrieval**: Technologies like Bleve may be employed additionally inside the `.patrol` directory to allow
  instantaneous indexing and retrieval of code content and commit messages across history.

*(Note: Users are expected to add the `.patrol` directory to their global or local `.gitignore`).*

For a deep dive into the caching strategies employed by the build system to tie the engine and shell releases together,
refer to the [Build System Architecture Guide](build-system.md).
