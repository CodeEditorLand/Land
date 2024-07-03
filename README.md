# 🌿 [EcoSystem] —

## Installation

Clone the repository:

```sh
git clone ssh://git@github.com/CodeEditorLand/EcoSystem.git --depth=1 --recurse-submodules --shallow-submodules
```

Install the necessary dependencies using `pnpm`:

```sh
pnpm install
```

Build the `EcoSystem`:

```sh
pnpm run tauri build
```

Run the `EcoSystem`:

```sh
pnpm run tauri dev
```

```mermaid
graph TD
    A[Top Repo: EcoSystem]

    subgraph Elements
        subgraph Sky
            D[Astro Website: Sky]
            subgraph Public
                D3[Public]
            end
            subgraph Source
                D4[Source]
                subgraph Layout
                    D5[Layout]
                end
                subgraph Pages
                    D6[Pages]
                end
                subgraph Stylesheet
                    D7[Stylesheet]
                end
            end
        end

        subgraph Wind
            F[TypeScript Files: Wind]
            subgraph Source
                F3[Source]
            end
        end

        subgraph Mountain
            G[Tauri]
            subgraph Gen
                G3[Gen]
            end
            subgraph Icons
                G4[Icons]
            end
            subgraph Source
                G5[Source]
            end
        end
    end

    A --> D
    A --> F
    A --> G
    D --> D3
    D --> D4
    D4 --> D5
    D4 --> D6
    D4 --> D7
    F --> F3
    G --> G3
    G --> G4
    G --> G5
```

```mermaid
sequenceDiagram
    participant User
    participant GitHub
    participant PNPM
    participant Cargo

    User->>GitHub: Clone repository
    Note right of GitHub: git clone ssh://git@github.com/CodeEditorLand/EcoSystem.git --depth=1 --recurse-submodules --shallow-submodules

    User->>PNPM: Install dependencies
    Note right of PNPM: pnpm install

    User->>Cargo: Build the Editor
    Note right of Cargo: cargo tauri build

    Note over Cargo: Wind is nested into Sky
    Note over Cargo: Sky is nested into Mountain
    Note over Cargo: Mountain creates the final binary
```

[EcoSystem]: https://github.com/CodeEditorLand/EcoSystem

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes to this integration.
