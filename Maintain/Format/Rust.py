#!/usr/bin/env python3
"""
Rust.py — Insert blank lines after ;  }  ,  and { in Rust source files.

Matches the Mountain project's convention: every statement boundary and block
boundary should be visually separated by a blank line.

Rules (state-machine, line-by-line):

  After ;  }
  ──────────
  • Insert a blank line when the next line is non-blank AND does not start
    with a closing delimiter (}  )  ]  ,  ;) or a chain call (.method()).
  • Guards: skip lines inside /* */ comments, inside `use { ... }` import
    blocks, and while ParenDepth > 0 (inside macro calls like dev_log!(),
    json!(), format!(), or function arguments).

  After ,
  ───────
  • Same as above, but the paren guard is relaxed: commas inside direct
    macro arguments (e.g. dev_log!("ch", "fmt", Arg1, Arg2)) DO get a
    blank line after them.
  • "Direct macro args" means ParenDepth > 0 AND the net brace depth since
    the enclosing paren opened is 0 — i.e., we have not entered a struct
    literal or closure body inside the macro call.
  • Commas inside struct literals or closure bodies within a macro call
    (e.g. json!({ "k": V, }) or .map_err(|E| { Field: x, })) are left alone
    because RelativeBraceDepth > 0.

  After {
  ───────
  • Insert a blank line only for top-level block openings — impl, enum,
    struct, mod (brace depth becomes <= OpenBraceMaxDepth after the line).
  • Deeply nested { (if/for/match arms) are intentionally left alone.

  General
  ───────
  • Strings ("..."), char literals ('.'), raw strings (r#"..."#), and
    block comments (/* ... */) are scanned so delimiters inside them never
    corrupt depth tracking or trigger insertion.
  • Never insert a second consecutive blank line (next line already blank -> skip).

Usage:
    # Dry-run on target file:
    python Rust.py --DryRun Source/Environment/DiagnosticProvider.rs

    # Apply to one file:
    python Rust.py Source/Environment/DiagnosticProvider.rs

    # Recursively apply to all .rs files:
    python Rust.py --All

    # Dry-run everything:
    python Rust.py --DryRun --All

    # Allow blank after { up to brace depth 2 (fn bodies too):
    python Rust.py --OpenBraceDepth 2 --All
"""

import re
import sys
from pathlib import Path


MatchClosingToken = re.compile(r"^\s*[})\];,]")
MatchChainContinue = re.compile(r"^\s*\.")
MatchCommentLine = re.compile(r"^\s*(//|/\*|\*)")


def _scan_line(line: str, mid_block_comment: bool = False) -> dict:
    """
    Scan a single Rust source line, skipping string/char/raw-string/content
    and block comments. Return a dict with depth deltas and metadata.

    Parameters
    ----------
    mid_block_comment : True if the line starts inside an open /* */ comment.

    Returns
    -------
    paren_delta   : int  — net parenthesis depth change
    brace_delta   : int  — net brace depth change
    last_char     : str|None — last non-whitespace code character on the line
    ends_in_block : bool — the line ends with an unclosed /*
    ends_in_str   : bool — the line ends mid-string / mid-char / mid-raw-str
    """
    paren_delta = 0
    brace_delta = 0
    last_char = None
    pos = 0
    length = len(line)

    # State
    in_block = mid_block_comment
    in_double = False
    in_char = False
    in_raw = False
    raw_hash_count = 0

    while pos < length:
        ch = line[pos]

        # Inside a double-quoted string
        if in_double:
            if ch == "\\":
                pos += 2
                continue
            if ch == '"':
                in_double = False
            pos += 1
            continue

        # Inside a char literal
        if in_char:
            if ch == "\\":
                pos += 2
                continue
            if ch == "'":
                in_char = False
            pos += 1
            continue

        # Inside a raw string r#"..."# / r##"..."##
        if in_raw:
            if ch == '"':
                hashes = 0
                while True:
                    nh = pos + 1 + hashes
                    if nh >= length or line[nh] != "#":
                        break
                    hashes += 1
                    if hashes == raw_hash_count:
                        in_raw = False
                        pos = nh + 1
                        break
                if in_raw and hashes < raw_hash_count:
                    # Still inside the raw string (no matching close found)
                    pos += 1
                    continue
                else:
                    continue
            pos += 1
            continue

        # Inside a block comment
        if in_block:
            if ch == "*" and pos + 1 < length and line[pos + 1] == "/":
                in_block = False
                pos += 2
                continue
            pos += 1
            continue

        # Raw string open: r" / r#" / r##" / br" / br#" / b" / br"
        if ch in ("r", "b") and not in_double and not in_char:
            start = pos
            if ch == "b" and pos + 1 < length and line[pos + 1] == "r":
                start += 1
            nxt = start + 1
            if nxt < length and line[nxt] == "r":
                nxt += 1
            count = 0
            while nxt < length and line[nxt] == "#":
                count += 1
                nxt += 1
            if nxt < length and line[nxt] == '"':
                in_raw = True
                raw_hash_count = count
                pos = nxt + 1
                continue

        # Double-quote string open
        if ch == '"':
            in_double = True
            pos += 1
            continue

        # Char literal open — in Rust, ' followed by a single char (or escape)
        # and then ' is a char literal. If the next ' is far away it's likely
        # a lifetime annotation (e.g. &'static), which is code, not a string.
        if ch == "'":
            # Peek ahead: is this a valid char literal?
            peek_pos = pos + 1
            if peek_pos < length:
                if line[peek_pos] == '\\':
                    # Escaped char: look for closing ' after the escape
                    peek_pos += 2
                    if peek_pos < length and line[peek_pos] == "'":
                        in_char = True
                        pos += 1
                        continue
                elif line[peek_pos] != "'":
                    # Non-empty, non-quote char
                    next_q = line.find("'", peek_pos + 1)
                    if next_q > 0 and next_q - peek_pos <= 2:
                        # Likely a char literal (1 or 2 chars between quotes)
                        in_char = True
                        pos += 1
                        continue
                # else: single quote followed by quote => byte string or empty
            # Not a char literal — treat ' as a code char
            if ch not in (" ", "\t", "\r", "\n"):
                last_char = ch
            pos += 1
            continue

        # Line comment
        if ch == "/" and pos + 1 < length and line[pos + 1] == "/":
            break

        # Block comment open
        if ch == "/" and pos + 1 < length and line[pos + 1] == "*":
            in_block = True
            pos += 2
            continue

        # Depth characters
        if ch == "(":
            paren_delta += 1
        elif ch == ")":
            paren_delta -= 1
        elif ch == "{":
            brace_delta += 1
        elif ch == "}":
            brace_delta -= 1

        if ch not in (" ", "\t", "\r", "\n"):
            last_char = ch

        pos += 1

    return {
        "paren_delta": paren_delta,
        "brace_delta": brace_delta,
        "last_char": last_char,
        "ends_in_block": in_block,
        "ends_in_str": in_double or in_char or in_raw,
    }


def Transform(source: str, open_brace_max_depth: int = 1) -> str:
    line_list = source.split("\n")
    output: list[str] = []

    block_comment_open = False
    paren_depth = 0
    brace_depth = 0
    brace_depth_import = 0
    in_use_block = False

    # Stack: brace depth snapshot at each '(' open, for RelativeBraceDepth.
    paren_open_brace_stack: list[int] = []

    for index, line in enumerate(line_list):
        scan = _scan_line(line, mid_block_comment=block_comment_open)
        block_comment_open = scan["ends_in_block"]

        # use { ... } import block tracking
        if not block_comment_open and not scan["ends_in_str"]:
            if re.match(r"\s*use\s+", line):
                in_use_block = True
            if in_use_block:
                brace_depth_import += line.count("{") - line.count("}")
                if brace_depth_import <= 0:
                    in_use_block = False
                    brace_depth_import = 0

            # Update paren stack
            close_count = max(0, -scan["paren_delta"])
            for _ in range(close_count):
                if paren_open_brace_stack:
                    paren_open_brace_stack.pop()
            for _ in range(max(0, scan["paren_delta"])):
                paren_open_brace_stack.append(brace_depth)

            paren_depth = max(0, paren_depth + scan["paren_delta"])
            brace_depth = max(0, brace_depth + scan["brace_delta"])

        # Emit current line
        output.append(line)

        # Decide whether to insert a blank line after
        in_comment = block_comment_open or bool(MatchCommentLine.match(line))

        if in_comment or in_use_block or scan["ends_in_str"]:
            continue

        stripped = line.rstrip()
        if not stripped:
            continue

        last = scan["last_char"]
        if last is None:
            continue

        if index + 1 >= len(line_list):
            continue

        next_line = line_list[index + 1]
        next_blank = next_line.strip() == ""
        next_closing = bool(MatchClosingToken.match(next_line))
        next_chain = bool(MatchChainContinue.match(next_line))

        if next_blank or next_closing or next_chain:
            continue

        if last in (";", "}") and paren_depth == 0:
            output.append("")

        elif last == ",":
            if paren_depth == 0:
                output.append("")
            elif paren_open_brace_stack:
                relative_brace_depth = brace_depth - paren_open_brace_stack[-1]
                if relative_brace_depth == 0:
                    output.append("")

        elif last == "{" and paren_depth == 0:
            if brace_depth <= open_brace_max_depth:
                output.append("")

    return "\n".join(output)


# ── CLI ──────────────────────────────────────────────────────────────────────


def process_file(filepath: Path, dry_run: bool, open_brace_max_depth: int) -> bool:
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception as error:
        print(f"  ERROR reading {filepath}: {error}", file=sys.stderr)
        return False

    new_text = Transform(text, open_brace_max_depth=open_brace_max_depth)
    if new_text == text:
        return False

    if dry_run:
        print(f"[DRY RUN] Would modify: {filepath}")
    else:
        filepath.write_text(new_text, encoding="utf-8")
        print(f"Modified: {filepath}")
    return True


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "files",
        nargs="*",
        help=".rs file paths (shell globs ok if quoted)",
    )
    parser.add_argument(
        "--All",
        action="store_true",
        help="Recursively process every .rs file under the current directory",
    )
    parser.add_argument(
        "--DryRun",
        action="store_true",
        help="Show what would change without writing anything",
    )

    def parse_depth(value: str) -> int:
        if value.lower() in ("all", "inf", "infinite"):
            return 2**31
        try:
            return int(value)
        except ValueError:
            raise argparse.ArgumentTypeError(
                f"Expected an integer or 'All', got: {value!r}"
            )

    parser.add_argument(
        "--OpenBraceDepth",
        type=parse_depth,
        default=1,
        metavar="N|All",
        help=(
            "Insert blank after { only when brace depth after the line is <= N. "
            "Default 1 (impl/enum/struct/mod). Use 2 to also cover fn bodies. "
            "Pass All (or Inf) to apply at every nesting depth."
        ),
    )
    args = parser.parse_args()

    target: list[Path] = []

    if args.All:
        target = sorted(Path(".").rglob("*.rs"))
    else:
        for pattern in args.files:
            expanded = sorted(Path(".").glob(pattern))
            if expanded:
                target.extend(expanded)
            else:
                candidate = Path(pattern)
                if candidate.exists():
                    target.append(candidate)
                else:
                    print(f"Warning: no match for '{pattern}'", file=sys.stderr)

    if not target:
        parser.print_help()
        sys.exit(1)

    changed = sum(
        process_file(fp, args.DryRun, args.OpenBraceDepth) for fp in target
    )
    total = len(target)
    verb = "would change" if args.DryRun else "changed"
    print(f"\nDone - {verb} {changed}/{total} file(s).")


if __name__ == "__main__":
    main()
