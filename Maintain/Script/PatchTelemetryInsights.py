#!/usr/bin/env python3
"""
Patch PostHog insights so every event reference uses the unified
`land:<element>:<action>` prefix. Old names (`mountain:*`, `cocoon:*`,
`sky:*`, `output:*`, `wind:*`) are kept inline as OR-clauses so the
14 d trailing window doesn't lose history while the new emits warm up.

Usage:
    PostHogToken=phx_... python3 Land/Maintain/Script/PatchTelemetryInsights.py [--dry-run]

Idempotent: re-runs detect already-patched insights and skip.
"""
from __future__ import annotations
import json, os, sys, urllib.request, urllib.error

PROJECT_ID = "151871"
HOST = "https://eu.posthog.com"
TOKEN = os.environ.get("PostHogToken") or os.environ.get("POSTHOG_TOKEN")
if not TOKEN:
    sys.stderr.write("PostHogToken env var required\n")
    sys.exit(2)

DRY_RUN = "--dry-run" in sys.argv

# Old → new event name map. Anything not listed is left untouched.
RENAME = {
    "mountain:session:start":   "land:mountain:session:start",
    "mountain:error":           "land:mountain:error",
    "mountain:ipc:invoke":      "land:mountain:ipc:invoke",
    "mountain:handler:complete":"land:mountain:handler:complete",
    "cocoon:session:start":     "land:cocoon:session:start",
    "cocoon:entry:load":        "land:cocoon:entry:load",
    "cocoon:entry:loaded":      "land:cocoon:entry:loaded",
    "cocoon:stub:active":       "land:cocoon:stub:active",
    "cocoon:handler:complete":  "land:cocoon:handler:complete",
    "cocoon:error":             "land:cocoon:error",
    "cocoon:vscode_api_gap":    "land:cocoon:vscode_api_gap",
    "sky:build:complete":       "land:sky:build:complete",
    "output:build:complete":    "land:output:build:complete",
    "wind:session:start":       "land:wind:session:start",
    "wind:error":               "land:wind:error",
}

def request(method: str, path: str, payload=None):
    url = f"{HOST}/api/projects/{PROJECT_ID}{path}"
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    body = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"{method} {path} -> {e.code}: {e.read().decode()[:200]}\n")
        raise

def patch_trends_event(event_value: str) -> str | None:
    """Return new event name OR None if unchanged."""
    return RENAME.get(event_value)

def patch_hogql_query(text: str) -> tuple[str, bool]:
    """Replace `event = 'old:foo'` → `event IN ('old:foo','land:old:foo')` and
    `event LIKE 'old:%'` → `event LIKE 'old:%' OR event LIKE 'land:old:%'`."""
    changed = False
    for old, new in RENAME.items():
        # exact equality
        for quote in ("'", "\""):
            needle_a = f"= {quote}{old}{quote}"
            replacement_a = f"IN ({quote}{old}{quote}, {quote}{new}{quote})"
            if needle_a in text:
                text = text.replace(needle_a, replacement_a)
                changed = True
            needle_b = f"={quote}{old}{quote}"
            if needle_b in text:
                text = text.replace(needle_b, f"IN ({quote}{old}{quote},{quote}{new}{quote})")
                changed = True
    # prefix LIKE
    for prefix_old, prefix_new in [
        ("mountain:%", "land:mountain:%"),
        ("cocoon:%", "land:cocoon:%"),
        ("sky:%", "land:sky:%"),
        ("output:%", "land:output:%"),
        ("wind:%", "land:wind:%"),
    ]:
        for quote in ("'", "\""):
            needle = f"{quote}{prefix_old}{quote}"
            if needle in text and f"{quote}{prefix_new}{quote}" not in text:
                # Wrap the LIKE clause: `LIKE 'old:%'` → `(LIKE 'old:%' OR LIKE 'land:old:%')`
                # Simpler: append OR-LIKE next to existing.
                text = text.replace(
                    f"LIKE {needle}",
                    f"LIKE {needle} OR event LIKE {quote}{prefix_new}{quote}",
                )
                changed = True
    return text, changed

def process_insight(insight: dict) -> dict | None:
    """Return a patch payload (or None if no change needed)."""
    short = insight["short_id"]
    name = insight["name"]
    query = insight.get("query") or {}
    src = query.get("source") or {}
    kind = src.get("kind")

    if kind == "TrendsQuery":
        new_series = []
        changed = False
        for s in src.get("series", []):
            ev = s.get("event", "")
            new_ev = patch_trends_event(ev)
            if new_ev:
                # Skip if already patched (i.e. event already starts with land:)
                if ev.startswith("land:"):
                    new_series.append(s)
                    continue
                new_s = dict(s)
                new_s["event"] = new_ev
                new_series.append(new_s)
                changed = True
            else:
                new_series.append(s)
        if not changed:
            return None
        new_src = dict(src)
        new_src["series"] = new_series
        new_query = dict(query)
        new_query["source"] = new_src
        return {"short": short, "name": name, "payload": {"query": new_query}}

    if kind == "HogQLQuery":
        text = src.get("query", "")
        new_text, changed = patch_hogql_query(text)
        if not changed:
            return None
        new_src = dict(src)
        new_src["query"] = new_text
        new_query = dict(query)
        new_query["source"] = new_src
        return {"short": short, "name": name, "payload": {"query": new_query}}

    if kind == "DataTableNode":
        inner = src.get("source") or {}
        if inner.get("kind") == "HogQLQuery":
            text = inner.get("query", "")
            new_text, changed = patch_hogql_query(text)
            if not changed:
                return None
            new_inner = dict(inner)
            new_inner["query"] = new_text
            new_src = dict(src)
            new_src["source"] = new_inner
            new_query = dict(query)
            new_query["source"] = new_src
            return {"short": short, "name": name, "payload": {"query": new_query}}

    if kind == "InsightVizNode":
        inner = src.get("source") or {}
        if inner.get("kind") == "TrendsQuery":
            new_series = []
            changed = False
            for s in inner.get("series", []):
                ev = s.get("event", "")
                new_ev = patch_trends_event(ev)
                if new_ev and not ev.startswith("land:"):
                    new_s = dict(s)
                    new_s["event"] = new_ev
                    new_series.append(new_s)
                    changed = True
                else:
                    new_series.append(s)
            if not changed:
                return None
            new_inner = dict(inner)
            new_inner["series"] = new_series
            new_src = dict(src)
            new_src["source"] = new_inner
            new_query = dict(query)
            new_query["source"] = new_src
            return {"short": short, "name": name, "payload": {"query": new_query}}

    return None

def main():
    print(f"Fetching insights from project {PROJECT_ID}...")
    res = request("GET", "/insights/?limit=300")
    insights = res.get("results", [])
    print(f"Got {len(insights)} insights")

    patched = 0
    skipped = 0
    failed = 0
    for ins in insights:
        change = process_insight(ins)
        if not change:
            skipped += 1
            continue
        marker = "[DRY-RUN]" if DRY_RUN else "[PATCH]"
        print(f"{marker} {change['short']:10} | {change['name'][:60]}")
        if DRY_RUN:
            patched += 1
            continue
        try:
            request("PATCH", f"/insights/{ins['id']}/", change["payload"])
            patched += 1
        except Exception as e:
            sys.stderr.write(f"  failed: {e}\n")
            failed += 1

    print(f"\nPatched: {patched}  Skipped: {skipped}  Failed: {failed}")

if __name__ == "__main__":
    main()
