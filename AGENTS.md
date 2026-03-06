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

Always consult the [README.md](README.md) for the most up-to-date information about the project architecture and
development workflow. Also make sure to read the architecture documents in the [docs/architecture](docs/architecture)
directory for a complete image of what we build.
