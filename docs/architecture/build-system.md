# Build System Architecture

Patrol is structured as a polyglot monorepo containing a high-performance Go backend engine (`patrold`) and a rich React/Electron frontend shell (`patrol`). Managing the build lifecycle of these distinct software stacks requires a robust, scalable, and fully deterministic build system.

To achieve this, Patrol utilizes **Bazel** (specifically, using the modern **Bzlmod** dependency management model) as its unified build orchestrator.

## The Challenge of a Polyglot Monorepo

Packaging a modern desktop application with this architecture involves a complex matrix of tasks:

1. **Cross-Compilation**: The Go engine must be compiled into native binaries for macOS, Linux, and Windows.
2. **Frontend Asset Bundling**: The React interface needs to transpile TypeScript, bundle assets via Vite/ESBuild, and resolve NPM dependencies.
3. **Application Assembly**: The final Electron application bundle must seamlessly include the appropriate, architecture-matched Go executable as a sidecar resource.

Traditional build automation tools (such as Makefiles) struggle with this level of cross-platform complexity, often devolving into brittle shell scripts that fail to accurately cache intermediate outputs across different languages. Specialized Node.js monorepo tools (like Turborepo) excel at JavaScript dependency graphs but offer limited native support for complex Go compilation pipelines and native binary assembly.

## The Bazel Solution

Bazel is fundamentally designed for massive, multi-language codebases. It provides strict correctness, reproducibility, and a sophisticated caching strategy that perfectly aligns with Patrol's architectural needs.

### 1. Hermetic and Deterministic Builds

Bazel ensures that builds are hermetic—meaning they are completely isolated from the host machine's environment. By explicitly downloading and managing the exact versions of the Go SDK and the Node.js toolchain, Bazel guarantees that if a build succeeds on one machine, it will succeed on a continuous integration (CI) server or a contributor's machine with identical results, mitigating "it works on my machine" issues.

### 2. Intelligent, Granular Caching

Bazel builds an exhaustive dependency graph of all source files in the monorepo. It caches the results of every build action (compilation, linked binaries, TS transpilation, minified CSS).

If a change is made strictly to the React frontend, Bazel instantly uses the cached output of the Go engine binaries. Conversely, modifying the Go database layer will not trigger a rebuild of the Electron UI. This mechanism ensures hyper-fast iteration speeds during local development.

## Implementation Details

The integration of Bazel into the Patrol monorepo relies on several core, officially maintained extension stacks:

### Go Orchestration (`patrold`)

* **`rules_go`**: The core Bazel ruleset for compiling Go code. It handles compiling, testing, and cross-compiling the engine daemon across different OS and architecture targets.
* **`gazelle`**: To avoid the overhead of manually writing `BUILD.bazel` files for every Go module, Gazelle acts as an automated build file generator. It parses standard `go.mod` files and source code to intelligently construct Bazel targets on the fly.

### Node.js and TypeScript Orchestration (`patrol`)

* **`aspect_rules_js` & `aspect_rules_ts`**: These rulesets integrate tightly with `pnpm` workspace functionality.
* **Seamless Package Management**: Developers define JavaScript dependencies using standard `package.json` and `pnpm install` commands. Bazel hooks into the `pnpm-lock.yaml` file to dynamically translate Node module trees into Bazel-aware targets, allowing frontend developers to use familiar workflows while gaining Bazel's caching capabilities.
* **`aspect_rules_esbuild`**: Used for rapid transpilation and bundling of the TypeScript frontend code and the Electron main process logic.

### Assembly and Packaging

Once the individual components are built, Bazel's `rules_pkg` handles the final orchestration. It constructs the required filesystem layout: placing the transpiled JavaScript resources next to the cross-compiled `patrold` Go binaries in the designated `.asar` archive or `resources` directory, ready to be packaged by `electron-builder` into distributable `.app`, `.exe`, or `.AppImage` files.
