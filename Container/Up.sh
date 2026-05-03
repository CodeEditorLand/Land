#!/usr/bin/env sh
# ===========================================================================
# Bring up the Land telemetry stack (Jaeger). Idempotent - safe to run on
# every dev session start.
# ===========================================================================
set -e
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
docker compose -f "$SCRIPT_DIR/Compose.yaml" up -d
echo ""
echo "Land telemetry stack up:"
echo "  Jaeger UI       http://127.0.0.1:16686"
echo "  OTLP HTTP       http://127.0.0.1:4318"
echo "  OTLP gRPC       http://127.0.0.1:4317"
