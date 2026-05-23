#!/usr/bin/env sh

#===============================================================================
# Maintain/Script/PostHogCapture.sh - Build/Maintain telemetry emit helpers
#===============================================================================
#
# Two fire-and-forget functions used by Build.sh / Release.sh / CI to mark
# milestones in PostHog and OpenTelemetry / Jaeger:
#
#   PostHogCapture <event> [k1] [v1] [k2] [v2] ...
#       Posts a `/capture/` event to the PostHog endpoint at `$Beam`.
#       Up to ~8 key/value pairs supported (positional). Backwards-compat
#       with the original single-property signature.
#
#   OTLPCapture <span_name> <start_unix_nano> <end_unix_nano> [k1] [v1] ...
#       Posts a single-span `/v1/traces` payload to the OTLP HTTP collector
#       at `$OTLPEndpoint`. The same `$Trace_Id` is reused across every
#       call within one shell invocation so build phases roll up into a
#       single trace in Jaeger.
#
# Honors `.env.Land.PostHog`:
#   Authorize        PostHog project key
#   Beam             PostHog endpoint (default: https://eu.i.posthog.com)
#   Report           false → skip PostHog
#   OTLPEndpoint     OTLP HTTP collector (default: http://127.0.0.1:4318)
#   OTLPEnabled      false → skip Jaeger
#   Capture          false → skip BOTH (master telemetry kill switch -
#                            distinct from .env.Land.Diagnostics's `Disable`,
#                            which kills polyfills/shims, not telemetry)
#   Brand            override derived distinct_id
#   Record           1     → also append NDJSON to Target/debug/Telemetry/
#
# Event-name convention: `land:<element>:<action>`. The build pipeline
# emits `land:build:phase:start`, `land:build:phase:complete`,
# `land:build:start`, `land:build:complete`, `land:build:error`.
#
# Depends on: curl, date, printf, awk (POSIX).
#===============================================================================

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

# Capture-allowed gate. Returns 0 (yes) / 1 (no). `Capture=false` is the
# master telemetry kill switch; distinct from `Disable` which controls
# polyfill activation in `.env.Land.Diagnostics`.
_LandCaptureAllowed() {
	if [ "${Capture:-true}" = "false" ] || [ "${Capture:-true}" = "0" ] || [ "${Capture:-true}" = "off" ]; then
		return 1
	fi
	return 0
}

# Distinct-id resolution. Used by both pipes.
_LandDistinctId() {
	if [ -n "${Brand:-}" ]; then
		printf "%s" "$Brand"
	else
		printf "land-dev-%s-%s" "${USER:-unknown}" "$(uname -n 2> /dev/null || echo host)"
	fi
}

# Per-shell trace_id. Stable across every span emitted from one Build.sh run
# so the whole build rolls up under one Jaeger trace.
_LandTraceId() {
	if [ -z "${_LandTraceIdCached:-}" ]; then
		# 16 random bytes (32 hex). /dev/urandom is POSIX-portable enough.
		_LandTraceIdCached=$(od -An -N16 -tx1 /dev/urandom 2> /dev/null | tr -d ' \n' | head -c32)
		if [ -z "$_LandTraceIdCached" ]; then
			_LandTraceIdCached=$(printf "%s%s" "$$" "$(date +%s%N 2> /dev/null || date +%s)" | awk '{printf "%032x", $0}' | head -c32)
		fi
		export _LandTraceIdCached
	fi
	printf "%s" "$_LandTraceIdCached"
}

# Random 8-byte span_id (16 hex). Per call, never cached.
_LandSpanId() {
	od -An -N8 -tx1 /dev/urandom 2> /dev/null | tr -d ' \n' | head -c16
}

# Build a JSON property bag from positional k1 v1 k2 v2 ... pairs.
# Output: `,"k1":"v1","k2":"v2"` (leading comma; empty if no pairs).
_LandJsonProperties() {
	Output=""
	while [ $# -ge 2 ]; do
		Key="$1"
		Val="$2"
		shift 2
		# Minimal JSON-escape: backslash, double-quote, control chars.
		Val=$(printf "%s" "$Val" | awk 'BEGIN{ORS=""} {gsub(/\\/, "\\\\"); gsub(/"/, "\\\""); gsub(/	/, "\	"); gsub(/\r/, "\\r"); gsub(/\n/, "\\n"); print}')
		Output="$Output,\"$Key\":\"$Val\""
	done
	printf "%s" "$Output"
}

# OTLP attribute array: `{"key":"k","value":{"stringValue":"v"}}, ...`
_LandOTLPAttributes() {
	First=1
	Output=""
	while [ $# -ge 2 ]; do
		Key="$1"
		Val="$2"
		shift 2
		Val=$(printf "%s" "$Val" | awk 'BEGIN{ORS=""} {gsub(/\\/, "\\\\"); gsub(/"/, "\\\""); gsub(/	/, "\	"); gsub(/\r/, "\\r"); gsub(/\n/, "\\n"); print}')
		if [ $First -eq 1 ]; then
			Output="{\"key\":\"$Key\",\"value\":{\"stringValue\":\"$Val\"}}"
			First=0
		else
			Output="$Output,{\"key\":\"$Key\",\"value\":{\"stringValue\":\"$Val\"}}"
		fi
	done
	printf "%s" "$Output"
}

# Append a JSON line to a per-session NDJSON log (when Record=1).
_LandRecord() {
	if [ "${Record:-0}" != "1" ]; then return 0; fi
	BuildLogDirectory="${MAINTAIN_TELEMETRY_LOG_DIRECTORY:-Element/Maintain/Target/debug/Telemetry}"
	mkdir -p "$BuildLogDirectory" 2> /dev/null || return 0
	if [ -z "${_LandRecordSession:-}" ]; then
		_LandRecordSession="$(date -u +%Y%m%dT%H%M%SZ 2> /dev/null || date +%s)-$$"
		export _LandRecordSession
	fi
	printf "%s\n" "$1" >> "$BuildLogDirectory/$_LandRecordSession.ndjson"
}

# ---------------------------------------------------------------------------
# Public: PostHog capture
# ---------------------------------------------------------------------------
PostHogCapture() {
	Event="$1"
	[ -z "$Event" ] && return 0
	_LandCaptureAllowed || return 0
	[ "${Report:-true}" = "false" ] && return 0
	shift

	Key="${Authorize:-}"
	Host="${Beam:-https://eu.i.posthog.com}"
	DistinctId=$(_LandDistinctId)
	Timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ 2> /dev/null || date +%FT%T%z)"
	TraceId=$(_LandTraceId)

	ExtraProperties=$(_LandJsonProperties "$@")

	Payload="{\"api_key\":\"$Key\",\"event\":\"$Event\",\"timestamp\":\"$Timestamp\",\"distinct_id\":\"$DistinctId\",\"properties\":{\"\$app\":\"land-editor\",\"\$component\":\"build\",\"\$tier\":\"build\",\"\$lib\":\"maintain-telemetry\",\"\$trace_id\":\"$TraceId\"$ExtraProperties}}"

	_LandRecord "$Payload"

	curl --silent --show-error --max-time 3 \
		-H "Content-Type: application/json" \
		-d "$Payload" \
		"$Host/capture/" \
		> /dev/null 2>&1 &
}

# ---------------------------------------------------------------------------
# Public: OTLP single-span capture
# ---------------------------------------------------------------------------
OTLPCapture() {
	SpanName="$1"
	StartNano="$2"
	EndNano="$3"
	[ -z "$SpanName" ] && return 0
	_LandCaptureAllowed || return 0
	[ "${OTLPEnabled:-true}" = "false" ] && return 0
	shift 3

	OTLPHost="${OTLPEndpoint:-http://127.0.0.1:4318}"
	TraceId=$(_LandTraceId)
	SpanId=$(_LandSpanId)
	Attributes=$(_LandOTLPAttributes "$@")

	# Status code 1 = OK, 2 = ERROR. Heuristic on span name.
	StatusCode=1
	case "$SpanName" in *error* | *failed*) StatusCode=2 ;; esac

	Payload="{\"resourceSpans\":[{\"resource\":{\"attributes\":[{\"key\":\"service.name\",\"value\":{\"stringValue\":\"land-editor-build\"}},{\"key\":\"service.version\",\"value\":{\"stringValue\":\"0.0.1\"}}]},\"scopeSpans\":[{\"scope\":{\"name\":\"land.build\",\"version\":\"1.0.0\"},\"spans\":[{\"traceId\":\"$TraceId\",\"spanId\":\"$SpanId\",\"name\":\"$SpanName\",\"kind\":1,\"startTimeUnixNano\":\"$StartNano\",\"endTimeUnixNano\":\"$EndNano\",\"attributes\":[$Attributes],\"status\":{\"code\":$StatusCode}}]}]}]}"

	_LandRecord "$Payload"

	curl --silent --show-error --max-time 2 \
		-H "Content-Type: application/json" \
		-d "$Payload" \
		"$OTLPHost/v1/traces" \
		> /dev/null 2>&1 &
}

# ---------------------------------------------------------------------------
# Public: Combined emit. Send the same milestone to both pipes.
# Usage: LandCapture <event> [k1 v1 k2 v2 ...]
# OTLP span window is the time elapsed since `LandCaptureStart` (if set);
# otherwise a zero-width span at "now".
# ---------------------------------------------------------------------------
LandCapture() {
	Event="$1"
	[ -z "$Event" ] && return 0
	shift

	NowNano=$(date +%s%N 2> /dev/null)
	if [ -z "$NowNano" ] || [ "$NowNano" = "%s%N" ]; then
		# BSD date has no %N - fall back to seconds * 1e9.
		NowNano=$(date +%s)000000000
	fi

	StartNano="${LandCaptureStart:-$NowNano}"

	PostHogCapture "$Event" "$@"
	OTLPCapture "$Event" "$StartNano" "$NowNano" "$@"
}

# Stamp the start of a phase. Pair with LandCapturePhaseEnd.
LandCapturePhaseBegin() {
	NowNano=$(date +%s%N 2> /dev/null)
	[ -z "$NowNano" ] || [ "$NowNano" = "%s%N" ] && NowNano=$(date +%s)000000000
	LandCaptureStart="$NowNano"
	export LandCaptureStart
	# `shift; "$@"` is the POSIX equivalent of bash's `${@:2}` so shfmt
	# parses this file under `-ln=auto` without dropping into bash mode.
	Phase="$1"
	shift
	PostHogCapture "land:build:phase:start" "phase" "$Phase" "$@"
}

# Stamp the end and emit duration_ms.
LandCapturePhaseEnd() {
	Phase="$1"
	shift
	NowNano=$(date +%s%N 2> /dev/null)
	[ -z "$NowNano" ] || [ "$NowNano" = "%s%N" ] && NowNano=$(date +%s)000000000
	StartNano="${LandCaptureStart:-$NowNano}"
	# duration_ms = (NowNano - StartNano) / 1e6 ; pure shell arithmetic
	# is bounded - use awk for the divide.
	DurationMs=$(awk -v a="$NowNano" -v b="$StartNano" 'BEGIN{print int((a - b) / 1000000)}')
	PostHogCapture "land:build:phase:complete" "phase" "$Phase" "duration_ms" "$DurationMs" "$@"
	OTLPCapture "land:build:phase:$Phase" "$StartNano" "$NowNano" "phase" "$Phase" "duration_ms" "$DurationMs" "$@"
	unset LandCaptureStart
}

# Compatibility shims - older Build.sh / Release.sh callers still use the
# 1-property signature. Keep working unchanged.
# shellcheck disable=SC3045
if [ -n "${BASH_VERSION:-}" ]; then
	export -f PostHogCapture OTLPCapture LandCapture LandCapturePhaseBegin LandCapturePhaseEnd 2> /dev/null || true
fi
