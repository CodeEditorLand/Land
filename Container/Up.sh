#!/usr/bin/env sh
# ===========================================================================
# Bring up the Land telemetry stack (Jaeger). Idempotent - safe to run on
# every dev session start.
#
# The telemetry stack is optional: a missing docker binary, a missing
# compose implementation, an absent Compose.yaml or a failed `up` must warn
# clearly and degrade gracefully rather than abort the caller's dev session.
# ===========================================================================
set -e
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Resolve relative to this script first, then allow an env override, then
# fall back to the script-relative path. No machine-specific absolute path.
ComposeFile="${LAND_COMPOSE_FILE:-$SCRIPT_DIR/Compose.yaml}"

Warn() {
	echo "[Land/Container] WARN: $*" >&2
}

if [ ! -f "$ComposeFile" ]; then
	Warn "Compose file not found at $ComposeFile - skipping telemetry stack."
	exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
	Warn "docker binary not found on PATH - skipping telemetry stack."
	exit 0
fi

# `docker compose` (v2 plugin) is preferred; fall back to the standalone
# `docker-compose` (v1) binary when the plugin is not installed.
if docker compose version >/dev/null 2>&1; then
	ComposeKind="plugin"
elif command -v docker-compose >/dev/null 2>&1; then
	ComposeKind="legacy"
	Warn "docker compose plugin unavailable; falling back to docker-compose."
else
	Warn "no docker compose implementation available - skipping telemetry stack."
	exit 0
fi

ComposeUp() {
	if [ "$ComposeKind" = "plugin" ]; then
		docker compose -f "$ComposeFile" up -d
	else
		docker-compose -f "$ComposeFile" up -d
	fi
}

# An unreachable daemon or busy ports is a non-happy path: warn and keep
# going so a dev session that does not need tracing still starts.
if ! ComposeUp; then
	Warn "docker compose up failed (daemon unreachable or ports busy) - continuing without telemetry."
	exit 0
fi

echo ""
echo "Land telemetry stack up:"
echo "  Jaeger UI       http://127.0.0.1:16686"
echo "  OTLP HTTP       http://127.0.0.1:4318"
echo "  OTLP gRPC       http://127.0.0.1:4317"
