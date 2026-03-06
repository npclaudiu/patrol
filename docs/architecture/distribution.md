# Patrol Distribution Architecture

This document describes the strategy for packaging, distributing, and updating the Patrol application across officially
supported platforms (macOS, Windows, and Linux). It outlines the current landscape of Electron bundling tools, how we
will embed the `patrold` Git engine binary, and our approach to multi-OS code signing.

## 1. Tooling Landscape: Electron Packaging

To distribute an Electron application, the source code and its dependencies must be bundled into platform-specific
executables (`.app`, `.exe`, `.deb`, `.AppImage`, etc.). The two dominant tools in the Node.js ecosystem for this are
**Electron Forge** and **electron-builder**.

### Electron Forge (Official)

[Electron Forge](https://www.electronforge.io/) is the officially recommended toolchain by the Electron team.

- **Pros:** First-class support from the Electron maintainers; modular architecture via "Makers" and plugins (e.g.,
  Webpack, Vite, Publisher plugins); highly extensible.
- **Cons:** Configuration for injecting external, non-Node binaries (like the Go `patrold` executable) can be
  occasionally verbose, requiring custom hooks or copy scripts during the `package` lifecycle.

### electron-builder (Community Standard)

[electron-builder](https://www.electron.build/) is a hardened, community-driven packaging tool known for its
comprehensive out-of-the-box features.

- **Pros:** Massive feature set with minimal configuration; excellent built-in auto-updating functionality; native,
  declarative support for `extraResources` and `extraFiles` (which makes bundling the `patrold` executable trivial);
  seamless handling of multi-platform targets from a single machine where possible.
- **Cons:** Extremely monolithic; occasionally slower to support bleeding-edge Electron changes.

### Recommendation

Given Patrol's decoupled architecture (where `patrol` relies on `webui` and an external `patrold` Go binary orchestrated
by `Taskfile`), **electron-builder** is recommended. Its declarative `extraResources` property lets us simply point to
the pre-compiled `patrold` executable output by `Taskfile`, mapping it directly into the final application bundle
without needing to write custom packaging hooks.

## 2. Bundling the Shell (`.asar`)

The Electron shell (located in `shell/patrol` and relying on `shell/webui`) needs to be archived into an `app.asar`
file.

- **Why ASAR?** ASAR (Atom Shell Archive Format) acts as a read-only, tar-like archive for JS, HTML, and CSS files. It
  prevents path-length issues on Windows, optimizes file read times during application boot, and lightly obfuscates the
  source code.
- **Workflow:** Using the build system (Task), we will first build the `webui` and `patrol` workspaces (as currently
  implemented via `pnpm run build`). Once compiled in their respective `dist/` folders, the chosen packager
  (`electron-builder`) will traverse the configured `dist/` directories, bundle them together into `app.asar`, and
  exclude unnecessary development files like `node_modules` and source files.

## 3. Embedding the `patrold` Executable

Patrol is distinct from a typical web app because it communicates with a heavy underlying Git engine daemon (`patrold`),
written in Go.

- **The Problem:** The Go binary cannot be placed inside the `app.asar` archive because Node's `child_process.spawn()`
  cannot directly execute a binary trapped inside an ASAR. The OS must be able to read the binary directly from the
  filesystem.
- **The Solution - `extraResources`:** We will instruct the packaging tool to copy the platform-specific `patrold`
  binary into the application bundle's `Resources` directory (on macOS) or alongside the executable (on Windows/Linux).
- **Execution Path:** At runtime, the `shell/patrol` bootstrap process will resolve the `patrold` path dynamically. When
  in development (`app.isPackaged === false`), it will look in `engine/patrold/bin`. When in production (`app.isPackaged
  === true`), it will look inside the `process.resourcesPath`.

## 4. Code Signing and Notarization

To install and run Patrol without users triggering severe security warnings (like macOS Gatekeeper or Windows
SmartScreen), the bundled application must be cryptographically signed.

### macOS (Apple Silicon & Intel)

- **Code Signing:** Requires an Apple Developer ID Application certificate. The packaging tool will invoke `codesign`
  under the hood.
- **Entitlements:** Because Electron requires advanced memory configurations for V8, we must supply a hardened runtime
  entitlements plist (`com.apple.security.cs.allow-jit`, `com.apple.security.cs.allow-unsigned-executable-memory`,
  etc.).
- **Notarization:** After signing, the `.app` bundle / `.dmg` must be uploaded to Apple's Notary Service using
  `@electron/notarize` or `electron-builder`'s built-in notarization hooks. Apple will issue a stapled ticket proving
  the app is malware-free.

### Windows

- **Code Signing:** Requires an Authenticode Code Signing Certificate (preferably EV or backed by Azure Key Vault / AWS
  CloudHSM). The packaging tool will invoke Windows `signtool.exe` to sign both the generated `.exe` installer and the
  unpackaged application executable.

### Linux

- **Code Signing:** Linux distributions rely on different trust mechanisms.
  - For `AppImage` or `.deb`, we will GPG-sign the release checksums or the AppImage file itself.
  - For `Snap` (if targeted), the Snap Store handles signing implicitly when uploading to a protected channel.

## 5. Next Steps

1. Configure GitHub Actions / CI to handle secrets securely for macOS Notarization and Windows Authenticode signing.
