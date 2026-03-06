# Patrol AGENTS.md

This file contains crucial context for AI coding agents working on the Patrol monorepo.

## Project Overview

Patrol is a desktop application for Git repositories built with Electron and Go. It is modelled as a file manager, with
seamless support for advanced Git features and a rich UI.

## Architecture

Patrol is built as a decoupled application with a Go engine and an Electron shell.

- The engine is responsible for all Git operations and is built with Go.
- The shell is responsible for the UI and is built with Electron and React.
- The engine and shell communicate via IPC.

Current repository layout (high level):

- `engine/patrold`: main Patrol engine daemon module.
- `engine/pathway`: Pathway graph library module (Git submodule), developed in tandem.
- `shell/patrol`: Electron shell application.
- `shell/webui`: browser-facing UI workspace.
- `shell/reactronx-react-electron`: Reactronx integration package (Git submodule), developed in tandem.

Always consult the [README.md](README.md) for the most up-to-date information about the project architecture and
development workflow. Also make sure to read the architecture documents in the [docs/architecture](docs/architecture)
directory for a complete image of what we build.

The application officially supports Linux, macOS and Windows.

## Build System

Patrol uses [Task](https://taskfile.dev) as its build system. The [Taskfile.yml](Taskfile.yml) file contains all the
build tasks. Always consult the [Taskfile.yml](Taskfile.yml) for the most up-to-date information about the build system.

`Taskfile.yml` is the source of truth for orchestration. Root `package.json` scripts should delegate to Task tasks. If
there is any drift between scripts, Task tasks, and documentation, update all of them together.

For building the shell, the project uses [Parcel](https://parceljs.org).

For building the engine, the project uses [Go](https://golang.org) with a workspace at `engine/go.work`.

Important Go workspace rules:

- `engine/go.work` and `engine/go.work.sum` are tracked and must remain consistent.
- Module membership under `engine/` is managed via `go.work` (do not hardcode module lists in ad-hoc scripts).
- `go work sync` may modify module `go.mod`/`go.sum` files (including submodules). Run it only when intentional, and
  review those changes explicitly.

Whenever the build system needs shell-like filesystem commands inside NPM scripts, prefer the `shx` package for
cross-platform compatibility. Avoid adding extra orchestration layers when Taskfile can already express the workflow.
Introduce alternatives (for example `wireit`) only when there is a concrete limitation and an explicit decision to adopt
them.

When adding script files, prefer TypeScript for maintainability and cross-platform behavior. Use the runtime/tooling
already present in the repository unless there is a clear reason to introduce new tooling.

Always make sure that the build system runs consistently across all operating systems officially supported by the
application.

IMPORTANT: This repository uses Git submodules for certain dependencies. These dependencies are developed in tandem with
the main repository, so submodule changes are allowed when needed. When changing submodules:

- Keep changes intentional and scoped to the task.
- Preserve each submodule as a standalone project (no Patrol-only coupling assumptions).
- Make submodule pointer updates explicit and call them out in summaries/PR notes.

## Code Generation

TypeScript and Go are the primary languages used in the project. When generating code, always make sure to write
idiomatic code in both languages and adhere to strict typing and code quality practices. Also make sure that the linter
and formatter are run on the generated code and that their configurations are updated. To ensure consistency across the
entire repository, prefer shared root-level lint/format configuration for first-party workspaces. Package-specific
overrides are allowed but should be minimal and performed only when strictly necessary.

For Git submodules, treat lint/format/tooling configuration as submodule-owned unless the task explicitly requires
synchronizing it with the main repository.
