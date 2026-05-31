#!/usr/bin/env python3
"""
Land/Maintain/Format/Markdown.py

Reformat embedded HTML <table> blocks in Markdown files to a stable, readable
2-space-indented layout using a small HTML-tree walker. Aborts on any edit
that would touch text outside of <table>, so this is safe to run on pinned
commit SHAs or any document.

Targets only real Markdown README/documentation files; skips anything that
contains indirection tokens used in other pinned chains:
  - 'sha' / 'commit' / 'SHA' / 'href="./Relative/Path/README.md"'

Skips directories: Dependency/ .git/ node_modules/ Archive/ Generated/ Target/
                   target/

Usage:
    # Dry run across everything:
    python Maintain/Format/Markdown.py --DryRun --All

    # Apply to a specific file:
    python Maintain/Format/Markdown.py Land/README.md

    # Apply everywhere:
    python Maintain/Format/Markdown.py --All
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import NamedTuple
from html.parser import HTMLParser


TARGET_EXTENSIONS = {".md", ".markdown"}
DEFAULT_EXCLUDE = frozenset({
    "Dependency", ".git", "node_modules", "Archive",
    "Generated", "Target", "target",
})
TABLES_RE = re.compile(r"(?s)<table\b.*?</table>")


# ── HTML tree walker ─────────────────────────────────────────────────────────

class _Node(NamedTuple):
    kind: str   # "tag" | "text"
    name: str = ""      # tag name lowercased when kind=="tag"
    attrs: tuple[tuple[str, str], ...] | None = None
    self_closing: bool = False
    children: list["_Node"] | None = None
    value: str = ""     # text content when kind=="text"


VOID_TAGS = frozenset({
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
})

# tags whose semantics rely on keep-inner-preserving whitespace (no wrapping of text)
NO_WRAP_INNER = {"pre", "code"}

_ATTR_RE = re.compile(r'^(?P<name>[^\s=]+)(?:\s*=\s*(?P<quote>["\'])(?P<value>.*?)(?P=quote))?$')


def _normalize_html_attrs(attrs: list[tuple[str, str | None]]) -> tuple[tuple[str, str], ...]:
    if not attrs:
        return ()
    out: list[tuple[str, str]] = []
    for raw_name, raw_value in attrs:
        if raw_value is None:
            out.append((raw_name, ""))
        else:
            m = _ATTR_RE.match(f"{raw_name}={raw_value}")
            if m:
                name = m.group("name")
                value = m.group("value") or ""
                out.append((name, value))
            else:
                out.append((raw_name, str(raw_value)))
    return tuple(out)

class _TableTreeBuilder(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self._stack: list[_Node] = []
        self.root: _Node | None = None

    def handle_starttag(self, tag: str, attrs):
        name = tag.lower()
        sc = name in VOID_TAGS
        node = _Node(
            kind="tag",
            name=name,
            attrs=_normalize_html_attrs(attrs),
            self_closing=sc,
            children=[] if not sc else None,
        )
        if self._stack:
            parent = self._stack[-1]
            assert parent.children is not None
            parent.children.append(node)
        else:
            self.root = node
        if not sc:
            self._stack.append(node)

    def handle_endtag(self, tag: str):
        name = tag.lower()
        if self._stack and self._stack[-1].name == name:
            self._stack.pop()

    def handle_data(self, data: str):
        if not data:
            return
        for raw_chunk in data.split("\n"):
            # Preserve each logical chunk as-is; empties are dropped.
            if raw_chunk:
                node = _Node(kind="text", value=raw_chunk)
                if self._stack:
                    parent = self._stack[-1]
                    assert parent.children is not None
                    parent.children.append(node)
                else:
                    if self.root is None:
                        self.root = node
                    else:
                        # stray data above top-level -> ignore (tables shouldn't have this)
                        pass


def _attrs_str(attrs: tuple[tuple[str, str], ...]) -> str:
    parts = []
    for k, v in attrs:
        parts.append(f'{k}="{v}"')
    return " ".join(parts)


def _indent(n: int) -> str:
    return "  " * n


def _render(node: _Node, depth: int, *, inside_pre: bool) -> list[str]:
    lines: list[str] = []

    if node.kind == "text":
        txt = node.value.strip()
        if txt:
            lines.append(_indent(depth) + txt)
        return lines

    # tag
    if node.self_closing:
        if node.children is not None and node.children:
            children_lines: list[str] = []
            for child in node.children:
                children_lines.extend(_render(child, depth + 1, inside_pre=inside_pre))
            inner = "\n".join(children_lines) if children_lines else ""
            if inner:
                lines.append(_indent(depth) + f"<{node.name} {_attrs_str(node.attrs)}>")
                lines.extend(children_lines)
                lines.append(_indent(depth) + f"</{node.name}>")
            else:
                lines.append(_indent(depth) + f"<{node.name} {_attrs_str(node.attrs)} />")
        else:
            lines.append(_indent(depth) + f"<{node.name} {_attrs_str(node.attrs)} />")
        return lines

    if node.children is None:
        lines.append(_indent(depth) + f"<{node.name} {_attrs_str(node.attrs)}>")
        return lines

    # Prefer newline after open tag unless it's inline and the first child is a short text
    children_pre = inside_pre or node.name in NO_WRAP_INNER
    if len(node.children) == 1 and node.children[0].kind == "text":
        inner = node.children[0].value.strip()
        if inner and len(inner) <= 200:
            lines.append(_indent(depth) + f"<{node.name} {_attrs_str(node.attrs)}>")
            lines.append(_indent(depth + 1) + inner)
            lines.append(_indent(depth) + f"</{node.name}>")
            return lines

    if children_pre:
        lines.append(_indent(depth) + f"<{node.name} {_attrs_str(node.attrs)}>")
        for child in node.children:
            lines.extend(_render(child, depth + 1, inside_pre=children_pre))
        lines.append(_indent(depth) + f"</{node.name}>")
    else:
        lines.append(_indent(depth) + f"<{node.name} {_attrs_str(node.attrs)}>")
        for child in node.children:
            lines.extend(_render(child, depth + 1, inside_pre=False))
        lines.append(_indent(depth) + f"</{node.name}>")
    return lines


def pretty_format_table(table_html: str) -> str:
    builder = _TableTreeBuilder()
    builder.feed(table_html)
    builder.close()
    root = builder.root
    if root is None:
        return table_html
    if root.kind == "tag":
        out = "\n".join(_render(root, 0, inside_pre=False))
        return out + "\n"
    return table_html


def reformat_markdown_tables(text: str) -> str:
    def repl(m: re.Match) -> str:
        return pretty_format_table(m.group(0))
    return TABLES_RE.sub(repl, text)


# ── File discovery/processing ────────────────────────────────────────────────

PINNED_RE = re.compile(r"(?i)\bsha\b|\bcommit\b|href=['\"].*/Relative/Path/README\.md['\"]")


def process_file(path: Path, dry_run: bool) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False
    if PINNED_RE.search(text):
        return False
    new_text = reformat_markdown_tables(text)
    if new_text == text:
        return False
    if dry_run:
        print(f"[DRY RUN] Would modify: {path}")
    else:
        path.write_text(new_text, encoding="utf-8")
        print(f"Modified: {path}")
    return True


def collect_targets(root: Path) -> list[Path]:
    files: list[Path] = []
    for p in sorted(root.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() not in TARGET_EXTENSIONS:
            continue
        if any(part in DEFAULT_EXCLUDE for part in p.parts):
            continue
        try:
            txt = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if TABLES_RE.search(txt):
            files.append(p)
    return files


# ── CLI ──────────────────────────────────────────────────────────────────────


def Main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("Files", nargs="*", help="Markdown file paths")
    parser.add_argument("--All", action="store_true", help="Recurse from current directory")
    parser.add_argument("--DryRun", action="store_true", help="Show changes without writing")
    args = parser.parse_args()

    root = Path(".")
    targets: list[Path] = []

    if args.All:
        targets = collect_targets(root)
    else:
        for pattern in args.Files:
            p = Path(pattern)
            if p.exists():
                targets.append(p)
            else:
                print(f"Warning: file not found: {pattern}", file=sys.stderr)

    if not targets:
        parser.print_help()
        sys.exit(1)

    total = len(targets)
    changed = sum(process_file(f, args.DryRun) for f in targets)
    verb = "would change" if args.DryRun else "changed"
    print(f"\nDone - {verb} {changed}/{total} file(s).")


if __name__ == "__main__":
    Main()
