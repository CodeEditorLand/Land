#!/usr/bin/env python3
"""
Create tier-aware insights now that every Land Element emits through the
unified `land:<tier>:*` namespace and stamps `$tier` on every event.
Idempotent: skips if an insight with the same name already exists.

Adds the new tiles to dashboards 640628 (Full), 640061 (Errors &
Reliability), and 640060 (Boot & Startup Performance) where relevant.
"""
from __future__ import annotations
import json, os, sys, urllib.request, urllib.error

PROJECT_ID = "151871"
HOST = "https://eu.posthog.com"
TOKEN = os.environ.get("PostHogToken") or os.environ.get("POSTHOG_TOKEN")
if not TOKEN:
    sys.stderr.write("PostHogToken env var required\n")
    sys.exit(2)

def request(method: str, path: str, payload=None):
    url = f"{HOST}/api/projects/{PROJECT_ID}{path}"
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    body = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"{method} {path} -> {e.code}: {e.read().decode()[:300]}\n")
        raise

# ------------------------------------------------------------------
# New insights
# ------------------------------------------------------------------
INSIGHTS = [
    {
        "name": "Tier Coverage - Events per Tier (14d)",
        "description": "Total `land:*` events per `$tier`, grouped by day. Shows which Elements are actually emitting - populates as Air / Rest / Grove / SideCar / Worker come online.",
        "tags": ["tier", "coverage", "boot"],
        "query": {
            "kind": "DataTableNode",
            "source": {
                "kind": "HogQLQuery",
                "query": (
                    "SELECT\n"
                    "    coalesce(nullIf(JSONExtractString(properties, '$tier'), ''), '(unset)') AS tier,\n"
                    "    count() AS events,\n"
                    "    uniq(distinct_id) AS distinct_users,\n"
                    "    min(timestamp) AS first_seen,\n"
                    "    max(timestamp) AS last_seen\n"
                    "FROM events\n"
                    "WHERE event LIKE 'land:%' AND timestamp >= now() - INTERVAL 14 DAY\n"
                    "GROUP BY tier\n"
                    "ORDER BY events DESC\n"
                    "LIMIT 30"
                ),
            },
        },
        "dashboards": [640628, 640060],
    },
    {
        "name": "Errors by Tier (rollup)",
        "description": "All `land:*:error` events grouped by `$tier`. Replaces per-tier error charts with one rollup so a new Element auto-shows up.",
        "tags": ["errors", "reliability", "tier"],
        "query": {
            "kind": "InsightVizNode",
            "source": {
                "kind": "TrendsQuery",
                "series": [
                    {
                        "kind": "EventsNode",
                        "math": "total",
                        "name": "Errors",
                        "event": None,
                    }
                ],
                "interval": "day",
                "dateRange": {"date_from": "-14d"},
                "trendsFilter": {"display": "ActionsLineGraph"},
                "filterTestAccounts": False,
                "properties": {
                    "type": "AND",
                    "values": [
                        {
                            "type": "hogql",
                            "key": "event LIKE 'land:%:error'",
                        }
                    ],
                },
                "breakdownFilter": {
                    "breakdown": "$tier",
                    "breakdown_type": "event",
                },
                "version": 2,
            },
        },
        "dashboards": [640628, 640061],
    },
    {
        "name": "Session Starts by Tier",
        "description": "`land:*:session:start` per `$tier`. Confirms each Element process boots and reaches its telemetry init.",
        "tags": ["boot", "tier"],
        "query": {
            "kind": "DataTableNode",
            "source": {
                "kind": "HogQLQuery",
                "query": (
                    "SELECT\n"
                    "    coalesce(nullIf(JSONExtractString(properties, '$tier'), ''), '(unset)') AS tier,\n"
                    "    count() AS sessions,\n"
                    "    uniq(JSONExtractString(properties, 'pid')) AS unique_pids,\n"
                    "    arraySort(groupUniqArray(JSONExtractString(properties, 'os'))) AS os_seen,\n"
                    "    arraySort(groupUniqArray(JSONExtractString(properties, 'arch'))) AS arch_seen\n"
                    "FROM events\n"
                    "WHERE event LIKE 'land:%:session:start' AND timestamp >= now() - INTERVAL 14 DAY\n"
                    "GROUP BY tier\n"
                    "ORDER BY sessions DESC\n"
                    "LIMIT 30"
                ),
            },
        },
        "dashboards": [640628, 640060],
    },
    {
        "name": "Handler Latency by Feature (cross-tier)",
        "description": "Avg handler `duration_ms` for every `feature`, broken into Mountain (Rust) vs Cocoon (Node). Replaces the static Node-vs-Rust pivot with a HogQL roll-up that auto-includes any new tier emitting `land:*:handler:complete`.",
        "tags": ["performance", "parity", "tier"],
        "query": {
            "kind": "DataTableNode",
            "source": {
                "kind": "HogQLQuery",
                "query": (
                    "SELECT\n"
                    "    JSONExtractString(properties, '$tier') AS tier,\n"
                    "    JSONExtractString(properties, 'feature') AS feature,\n"
                    "    round(avg(toFloat64OrNull(properties.duration_ms)), 2) AS avg_ms,\n"
                    "    round(quantile(0.95)(toFloat64OrNull(properties.duration_ms)), 2) AS p95_ms,\n"
                    "    count() AS calls\n"
                    "FROM events\n"
                    "WHERE event LIKE 'land:%:handler:complete' AND timestamp >= now() - INTERVAL 14 DAY\n"
                    "GROUP BY tier, feature\n"
                    "HAVING calls > 5\n"
                    "ORDER BY calls DESC\n"
                    "LIMIT 100"
                ),
            },
        },
        "dashboards": [640628, 640114],
    },
    {
        "name": "OTLP Trace Coverage",
        "description": "Unique `$trace_id` values per tier - verifies the OTLP / PostHog cross-pipe handshake fires from every Element.",
        "tags": ["otlp", "tier"],
        "query": {
            "kind": "DataTableNode",
            "source": {
                "kind": "HogQLQuery",
                "query": (
                    "SELECT\n"
                    "    JSONExtractString(properties, '$tier') AS tier,\n"
                    "    uniq(JSONExtractString(properties, '$trace_id')) AS unique_traces,\n"
                    "    countIf(JSONExtractString(properties, '$trace_id') != '') AS events_with_trace,\n"
                    "    count() AS events_total,\n"
                    "    round(100.0 * countIf(JSONExtractString(properties, '$trace_id') != '') / count(), 1) AS coverage_pct\n"
                    "FROM events\n"
                    "WHERE event LIKE 'land:%' AND timestamp >= now() - INTERVAL 7 DAY\n"
                    "GROUP BY tier\n"
                    "ORDER BY events_total DESC\n"
                    "LIMIT 30"
                ),
            },
        },
        "dashboards": [640628, 640063],
    },
]


def find_existing(name: str):
    """Return insight id if an insight with this name already exists."""
    res = request("GET", f"/insights/?search={urllib.parse.quote(name)}&limit=20")
    for r in res.get("results", []):
        if r.get("name") == name:
            return r["id"]
    return None


import urllib.parse


def main():
    created = 0
    skipped = 0
    failed = 0
    for spec in INSIGHTS:
        existing = find_existing(spec["name"])
        if existing:
            print(f"[skip] {spec['name']} (id={existing})")
            skipped += 1
            continue
        payload = {
            "name": spec["name"],
            "description": spec["description"],
            "query": spec["query"],
            "tags": spec.get("tags", []),
            "dashboards": spec.get("dashboards", []),
            "saved": True,
        }
        try:
            res = request("POST", "/insights/", payload)
            print(f"[create] {spec['name']:60} | id={res.get('id')} short={res.get('short_id')}")
            created += 1
        except Exception as e:
            sys.stderr.write(f"  failed: {e}\n")
            failed += 1
    print(f"\nCreated: {created}  Skipped: {skipped}  Failed: {failed}")


if __name__ == "__main__":
    main()
