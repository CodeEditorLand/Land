#!/usr/bin/env sh

#===============================================================================
# Maintain/Script/PostHogCapture.sh - Build/Maintain PostHog event capture
#===============================================================================
#
# Atom PH5: Posts a single PostHog event via curl. Build.sh / Release.sh /
# CI scripts source this or invoke it directly to mark milestones like
# `build:start`, `build:ok`, `build:failed`, `rebuild:request`. Stays out
# of the main Build.sh happy-path: any curl failure is silent so a flaky
# PostHog upstream never breaks a build.
#
# Usage:
#   . Maintain/Script/PostHogCapture.sh
#   PostHogCapture "build:start" "profile" "debug-electron"
#
# Honours `.env.Land.PostHog` env:
#   Authorize        - project key (default: shipped)
#   Beam       - endpoint (default: eu.i.posthog.com)
#   Report - set "false" to disable entirely
#   Brand - override the derived distinct id
#
# Depends on: curl (posix), date (-Iseconds on GNU/BSD), printf.
#===============================================================================

PostHogCapture() {
	# shellcheck disable=SC3043
	local Event PropertyName PropertyValue
	Event="$1"
	PropertyName="${2:-}"
	PropertyValue="${3:-}"

	if [ -z "$Event" ]; then
		return 0
	fi

	if [ "${Report:-true}" = "false" ]; then
		return 0
	fi

	# Default shipped key matches the one the consumers fall back on
	# when the env lookup is empty.
	Key="${Authorize:-}"
	Host="${Beam:-https://eu.i.posthog.com}"

	# Distinct-id: respect explicit seed, else user+host for CI correlation.
	if [ -n "${Brand:-}" ]; then
		DistinctId="$Brand"
	else
		DistinctId="land-dev-${USER:-unknown}-$(uname -n 2>/dev/null || echo host)"
	fi

	# ISO8601 timestamp - `date -Iseconds` on GNU, `date +%FT%T%z` on BSD.
	Timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date +%FT%T%z)"

	ExtraProperty=""
	if [ -n "$PropertyName" ]; then
		# Build one "key":"value" pair. Shell-escape rudimentary - events
		# come from our own build scripts, not arbitrary input.
		ExtraProperty=", \"$PropertyName\": \"$PropertyValue\""
	fi

	Payload="{\"api_key\":\"$Key\",\"event\":\"$Event\",\"timestamp\":\"$Timestamp\",\"distinct_id\":\"$DistinctId\",\"properties\":{\"\$app\":\"land-editor\",\"\$component\":\"build\",\"\$tier\":\"build\",\"\$lib\":\"maintain-posthog-capture\"$ExtraProperty}}"

	# Silent curl with a 3s cap - telemetry must never stall a build.
	curl --silent --show-error --max-time 3 \
		-H "Content-Type: application/json" \
		-d "$Payload" \
		"$Host/capture/" \
		>/dev/null 2>&1 &
}

# Export so sourcing scripts inherit the function.
# shellcheck disable=SC3045
if [ -n "${ZSH_VERSION:-}" ]; then
	# zsh doesn't export functions - re-aliased below when sourced.
	:
elif [ -n "${BASH_VERSION:-}" ]; then
	export -f PostHogCapture 2>/dev/null || true
fi
