#!/usr/bin/env sh
# Tear down the Land telemetry stack.
set -e
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
docker compose -f "$SCRIPT_DIR/Compose.yaml" down
