#!/usr/bin/env sh
# Tear down the Land telemetry stack. Mirrors Up.sh: every non-happy path
# (no docker, no compose implementation, absent Compose.yaml or a failed
# `down`) warns and exits cleanly rather than aborting a dev session.
set -e
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Resolve relative to this script first, then allow an env override, then
# fall back to the script-relative path. No machine-specific absolute path.
ComposeFile="${LAND_COMPOSE_FILE:-$SCRIPT_DIR/Compose.yaml}"

Warn() {
	echo "[Land/Container] WARN: $*" >&2
}

if [ ! -f "$ComposeFile" ]; then
	Warn "Compose file not found at $ComposeFile - skipping telemetry teardown."
	exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
	Warn "docker binary not found on PATH - skipping telemetry teardown."
	exit 0
fi

if docker compose version >/dev/null 2>&1; then
	ComposeDown() { docker compose -f "$ComposeFile" down; }
elif command -v docker-compose >/dev/null 2>&1; then
	Warn "docker compose plugin unavailable; falling back to docker-compose."
	ComposeDown() { docker-compose -f "$ComposeFile" down; }
else
	Warn "no docker compose implementation available - skipping telemetry teardown."
	exit 0
fi

if ! ComposeDown; then
	Warn "docker compose down failed (daemon unreachable) - continuing."
fi
