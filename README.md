# 🏙️ [Sublet] —

## Installation

Clone the repository:

```sh
git clone ssh://git@github.com/CodeEditorLand/Sublet.git --depth=1 --recurse-submodules --shallow-submodules
```

Install the necessary dependencies using `PNPM`:

```sh
pnpm install
```

Build the Editor:

```sh
cargo tauri build
```

```mermaid
graph TD
    A[Top Repo: Sublet]

    subgraph Project
        subgraph Seed
            D[Astro Website: Seed]
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

        subgraph Tauri App
            E[src-tauri]
        end

        subgraph Water
            F[TypeScript Files: Water]
            subgraph Source
                F3[Source]
            end
        end

        subgraph Produce
            G[Produce Folder]
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

        subgraph Log
            H[Log Folder]
            subgraph GitHub Configs
                H1[GitHub Configs]
            end
        end
    end

    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    D --> D3
    D --> D4
    D4 --> D5
    D4 --> D6
    D4 --> D7
    F --> F3
    G --> G3
    G --> G4
    G --> G5
    H --> H1
```

[Sublet]: https://github.com/CodeEditorLand/Sublet
