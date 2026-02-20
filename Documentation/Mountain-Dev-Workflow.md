# Mountain Tauri Development Workflow with Sky Hot-Reload

## Overview

This document describes how to run the Mountain Tauri desktop application in development mode with hot-reload from the Sky (Astro/Vite) dev server. This setup enables real-time editing and debugging of the web content served by Sky.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           pnpm tauri dev (in Element/Mountain)       │   │
│  │                                                       │   │
│  │  ┌──────────────┐         ┌──────────────┐           │   │
│  │  │ beforeDev    │         │ Mountain     │           │   │
│  │  │ Command      │ ──────► │ Tauri App    │           │   │
│  │  │ (auto-starts │  HTTP   │ (Desktop)    │           │   │
│  │  │ Sky server)  │         │              │           │   │
│  │  │              │         │ Loads:       │           │   │
│  │  │ Sky Dev      │         │ http://      │           │   │
│  │  │ Server       │         │ localhost:   │           │   │
│  │  │ (Astro/Vite) │         │ 9999         │           │   │
│  │  └──────────────┘         └──────────────┘           │   │
│  │         │                      ▲                      │   │
│  │         │                      │                      │   │
│  │         ▼                      │                      │   │
│  │  ┌──────────────┐              │                      │   │
│  │  │ Hot-Reload   │──────────────┘                      │   │
│  │  │ (HMR)        │  Auto-update on                     │   │
│  │  │              │  source changes                     │   │
│  │  └──────────────┘                                     │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Recommended: Use the Dev Script

```bash
# Start Mountain with Sky hot-reload (Mountain workbench)
pnpm run Dev:Mountain

# Or use wind workbench
pnpm run Dev:Mountain:Wind

# Or use electron workbench
pnpm run Dev:Mountain:Electron
```

### Simple Manual Start

```bash
# That's it - Tauri handles everything via beforeDevCommand
cd Element/Mountain
pnpm tauri dev
```

### Manual Start with Workbench Selection

```bash
# Mountain workbench
cd Element/Mountain
Mountain=true pnpm tauri dev

# Wind workbench
cd Element/Mountain
Wind=true pnpm tauri dev

# Electron workbench
cd Element/Mountain
Electron=true pnpm tauri dev
```

## How It Works

### Automatic Sky Server Start

The [`tauri.conf.json`](Element/Mountain/tauri.conf.json:60) configuration includes:

```json
{
  "build": {
    "beforeDevCommand": "pnpm run Run --filter=@codeeditorland/sky --force",
    "devUrl": null,
    "frontendDist": "../Sky/Target"
  }
}
```

When you run `pnpm tauri dev`:

1. Tauri executes `beforeDevCommand` which starts the Sky dev server
2. Sky runs on `http://localhost:9999` (configured in [`astro.config.ts`](Element/Sky/astro.config.ts:52))
3. Tauri loads the web content from the Sky dev server
4. Hot Module Replacement (HMR) is automatically enabled

### No Need to Run Sky Separately

**You do NOT need to start Sky manually!** The `beforeDevCommand` handles it automatically. This is the standard Tauri development workflow.

## Configuration Files

### Tauri Configuration ([`tauri.conf.json`](Element/Mountain/tauri.conf.json))

Key settings for development:

```json
{
  "build": {
    "beforeDevCommand": "pnpm run Run --filter=@codeeditorland/sky --force",
    "beforeBuildCommand": "pnpm run prepublishOnly --filter=@codeeditorland/sky --force",
    "devUrl": null,
    "frontendDist": "../Sky/Target"
  },
  "app": {
    "security": {
      "devCsp": {
        "connect-src": "'self' http://localhost:* https://tauri.localhost wss://tauri.localhost https:"
      }
    }
  }
}
```

### Sky Configuration ([`astro.config.ts`](Element/Sky/astro.config.ts))

```typescript
export default defineConfig({
  server: {
    host: Host,  // Resolved from TAURI_DEV_HOST or defaults to localhost
    port: 9999,
    https: {
      cert: await readFile("./dev-server.pem"),
      key: await readFile("./dev-server-key.pem")
    },
    hmr: {
      protocol: "wss",
      host: "...",
      port: 10000
    }
  }
})
```

### Debug Configuration ([`Debug.ts`](Element/Sky/Source/Function/Debug.ts))

The `Host` variable is resolved as follows:

```typescript
export const Host = process.env["TAURI_DEV_HOST"]
  ? `https://${process.env["TAURI_DEV_HOST"]}`
  : On
  ? "http://localhost"
  : Tauri
  ? "https://tauri.localhost"
  : "https://editor.land";
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `Mountain` | Enable Mountain workbench | `true` |
| `Wind` | Enable Wind workbench | `true` |
| `Electron` | Enable Electron workbench | `true` |
| `Browser` | Enable Browser workbench | `true` |
| `Bundle` | Enable bundling | `false` (dev mode) |
| `TAURI_DEV_HOST` | Override dev server host:port (optional) | `localhost:9999` |
| `NODE_ENV` | Node environment | `development` (auto-set) |

## Available Scripts

### Root Package Scripts ([`package.json`](package.json))

```bash
# Mountain workbench (default)
pnpm run Dev:Mountain

# Wind workbench
pnpm run Dev:Mountain:Wind

# Electron workbench
pnpm run Dev:Mountain:Electron
```

### Manual Commands

```bash
# Simple dev (uses beforeDevCommand)
cd Element/Mountain && pnpm tauri dev

# With workbench selection
cd Element/Mountain && Mountain=true pnpm tauri dev
cd Element/Mountain && Wind=true pnpm tauri dev

# With custom features
cd Element/Mountain && Mountain=true pnpm tauri dev -- --features MistNative

# Sky dev server only (for standalone web testing)
cd Element/Sky && pnpm run Run
```

## Workbench Profiles

| Profile | Description | Feature Coverage | Recommended For |
|---------|-------------|------------------|-----------------|
| `mountain` | Mountain Tauri workbench | 80-90% | Primary development |
| `wind` | Wind workbench | 60-70% | Lightweight testing |
| `electron` | Electron workbench | 95%+ | Full feature testing |
| `browser` | Browser workbench | 70-80% | Web compatibility |

## Hot-Reload Behavior

### What Triggers Hot-Reload

- ✅ Changes to `.ts`/`.js` files in `Element/Sky/Source/`
- ✅ Changes to `.astro` files in `Element/Sky/`
- ✅ Changes to CSS files
- ✅ Changes to static assets in `Element/Sky/Public/`

### What Requires Restart

- ❌ Changes to `astro.config.ts` (restart Tauri dev)
- ❌ Changes to `tauri.conf.json` (restart Tauri dev)
- ❌ Changes to Rust code (rebuild Mountain)

## Troubleshooting

### Sky Server Not Starting

The `beforeDevCommand` should handle this automatically. If issues occur:

```bash
# Check if port is in use
lsof -i :9999

# Kill process on port
kill -9 $(lsof -t -i:9999)

# Start Sky manually first, then run Tauri
cd Element/Sky && pnpm run Run &
cd Element/Mountain && pnpm tauri dev
```

### Mountain Not Loading Content

1. Check terminal output for Sky startup errors
2. Verify `beforeDevCommand` completed successfully
3. Check browser console for CSP errors
4. Try running Sky manually first: `cd Element/Sky && pnpm run Run`

### Hot-Reload Not Working

1. Verify HMR WebSocket connection in browser devtools
2. Ensure `NODE_ENV=development` (should be auto-set by Tauri)
3. Clear browser cache and restart
4. Check that Sky dev server is running

## Debug Tips

### Enable Verbose Logging

```bash
# In Mountain (Rust logging)
cd Element/Mountain
RUST_LOG=debug pnpm tauri dev

# Increase Sky verbosity
cd Element/Sky
DEBUG=* pnpm run Run
```

### Inspect Network Requests

Open Mountain DevTools (Ctrl+Shift+I or Cmd+Opt+I) and check:

- Network tab for failed requests
- Console for CSP errors
- Application tab for HMR WebSocket status

### Check Environment Variables

In your shell before running:

```bash
export Mountain=true
export NODE_ENV=development
```

## Development Flow

1. **Start Development**: Run `pnpm run Dev:Mountain` or `cd Element/Mountain && pnpm tauri dev`
2. **Edit Source**: Make changes in `Element/Sky/Source/`
3. **Auto-Reload**: Sky HMR pushes changes to Mountain window
4. **Debug**: Use Mountain DevTools for inspection
5. **Test**: Verify functionality in native window context
6. **Build**: When ready, run `pnpm run build:debug` or `pnpm run build:production`

## Related Files

- [`Element/Mountain/tauri.conf.json`](Element/Mountain/tauri.conf.json) - Tauri configuration
- [`Element/Mountain/Cargo.toml`](Element/Mountain/Cargo.toml) - Rust dependencies
- [`Element/Sky/astro.config.ts`](Element/Sky/astro.config.ts) - Astro/Vite configuration
- [`Element/Sky/package.json`](Element/Sky/package.json) - Node dependencies
- [`Element/Sky/Source/Function/Debug.ts`](Element/Sky/Source/Function/Debug.ts) - Environment resolution
- [`Maintain/Dev-Mountain.sh`](Maintain/Dev-Mountain.sh) - Dev startup script
- [`Maintain/Debug.sh`](Maintain/Debug.sh) - Debug build script
- [`package.json`](package.json) - Root package with dev scripts
