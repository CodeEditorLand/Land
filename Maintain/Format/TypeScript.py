#!/usr/bin/env python3
"""
TypeScript.py - Insert blank lines after ;  }  ,  and { in TypeScript/JavaScript source files.

Matches the Mountain project's convention: every statement boundary and block
boundary should be visually separated by a blank line.

Rules (state-machine, line-by-line):

  After ;  }
  ──────────
  • Insert a blank line when the next line is non-blank AND does not start
    with a closing delimiter (}  )  ]  ,  ;) or a chain call (.method()).
  • Guards: skip lines inside block comments, inside import/export { ... }
    blocks, and while ParenDepth > 0 (inside function calls or arrow-function
    parameter lists).

  After ,
  ───────
  • Same as above, but the paren guard is relaxed: commas inside direct
    function-call arguments DO get a blank line after them.
  • "Direct args" means ParenDepth > 0 AND the net brace depth since the
    enclosing paren opened is 0 - i.e., we have not entered an object
    literal or arrow-function body inside the call.
  • Commas inside object literals or closures within a call (e.g.
    foo({ key: val, }) or .catch((E) => { field = x, })) are left alone
    because RelativeBraceDepth > 0.
  • Template-literal interpolations ${ ... } are tracked so commas inside
    ${} expressions do not trigger blank-line insertion.

  After {
  ───────
  • Insert a blank line only for top-level block openings - class, function,
    interface, enum, namespace (brace depth becomes <= OpenBraceMaxDepth).
  • Deeply nested { (if/for/arrow bodies) are intentionally left alone.

  General
  ───────
  • Strings (single-quote, double-quote, backtick), JSX fragments, block
    comments, and template-literal interpolations are scanned so delimiters
    inside content never corrupt depth tracking or trigger insertion.
  • Never insert a second consecutive blank line (next line already blank → skip).

Usage:
    # Dry-run on target file:
    python TypeScript.py --DryRun src/providers/DiagnosticProvider.ts

    # Apply to one file:
    python TypeScript.py src/providers/DiagnosticProvider.ts

    # Recursively apply to all .ts and .js files:
    python TypeScript.py --All

    # Dry-run everything:
    python TypeScript.py --DryRun --All

    # Allow blank after { up to brace depth 2 (function bodies too):
    python TypeScript.py --OpenBraceDepth 2 --All

    # Apply at every nesting depth:
    python TypeScript.py --OpenBraceDepth All --All
"""

import re
import sys
from pathlib import Path


MatchClosingToken = re.compile(r"^\s*[})\];,]")
MatchChainContinue = re.compile(r"^\s*\.")
MatchCommentLine = re.compile(r"^\s*(//|\*)")
MatchImportExportOpen = re.compile(r"^\s*(import|export)\s*(type\s*)?\{")


def _scan_line(
    line: str,
    mid_block_comment: bool = False,
    mid_single: bool = False,
    mid_double: bool = False,
    mid_template: bool = False,
) -> dict:
    """
    Scan a single TypeScript/JavaScript source line, skipping string,
    template literal, and block-comment content.

    Parameters
    ----------
    mid_block_comment : True if the line starts inside an open /*.
    mid_single        : True if the line starts mid-single-quoted string.
    mid_double        : True if the line starts mid-double-quoted string.
    mid_template      : True if the line starts mid-template literal.

    Returns
    -------
    paren_delta            : int  - net parenthesis depth change
    brace_delta            : int  - net brace depth change
    last_char              : str|None - last non-whitespace code char
    ends_in_block          : bool - line ends with unclosed /*
    ends_in_string_single   : bool - line ends mid-single-quoted string
    ends_in_string_double   : bool - line ends mid-double-quoted string
    ends_in_string_template : bool - line ends mid-template literal
    ends_in_string          : bool - any of the above three
    """
    paren_delta = 0
    brace_delta = 0
    last_char = None
    pos = 0
    length = len(line)

    # State (from caller carry-over)
    in_block = mid_block_comment
    in_single = mid_single
    in_double = mid_double
    in_template_text = mid_template
    in_template_expr = 0  # reset each line; multi-line ${} is tracked

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

        # Inside a single-quoted string
        if in_single:
            if ch == "\\":
                pos += 2
                continue
            if ch == "'":
                in_single = False
            pos += 1
            continue

        # Inside a template literal -- text mode (outside ${})
        if in_template_text and in_template_expr == 0:
            if ch == "`":
                # Closing backtick -- end the template literal
                in_template_text = False
                pos += 1
                continue
            if ch == "$" and pos + 1 < length and line[pos + 1] == "{":
                in_template_expr = 1
                pos += 2
                continue
            pos += 1
            continue

        # Inside a template expression ${ ... }
        if in_template_expr > 0:
            if ch == "\\":
                pos += 2
                continue
            if ch == '"':
                in_double = not in_double
                pos += 1
                continue
            if ch == "'":
                in_single = not in_single
                pos += 1
                continue
            if ch == "`":
                in_template_text = True
                pos += 1
                continue
            if ch == "{":
                in_template_expr += 1
                brace_delta += 1
                if ch not in (" ", "\t", "\r", "\n"):
                    last_char = ch
                pos += 1
                continue
            if ch == "}":
                in_template_expr -= 1
                if in_template_expr == 0:
                    in_template_text = True
                    pos += 1
                    continue
                brace_delta -= 1
                if ch not in (" ", "\t", "\r", "\n"):
                    last_char = ch
                pos += 1
                continue
            # Regular char inside expr
            if ch == "(":
                paren_delta += 1
            elif ch == ")":
                paren_delta -= 1
            elif ch == "{":
                brace_delta += 1
                in_template_expr += 1
            elif ch == "}":
                brace_delta -= 1
                in_template_expr -= 1
                if in_template_expr == 0:
                    in_template_text = True

            if ch not in (" ", "\t", "\r", "\n"):
                last_char = ch
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

        # Backtick: template literal open or close
        if ch == "`":
            in_template_text = not in_template_text
            pos += 1
            continue

        # Double-quote string open
        if ch == '"':
            in_double = True
            pos += 1
            continue

        # Single-quote string open
        if ch == "'":
            in_single = True
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

        # Depth characters (outside all strings and comments)
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
        "ends_in_string_single": in_single,
        "ends_in_string_double": in_double,
        "ends_in_string_template": in_template_text,
        "ends_in_string": in_double or in_single or in_template_text,
    }


def Transform(source: str, open_brace_max_depth: int = 1) -> str:
    line_list = source.split("\n")
    output: list[str] = []

    block_comment_open = False
    paren_depth = 0
    brace_depth = 0
    brace_depth_import = 0
    in_import_block = False
    in_single_quote = False   # carried multi-line single-quoted string
    in_double_quote = False  # carried multi-line double-quoted string
    in_template_text = False # carried multi-line template literal

    # Stack: brace depth snapshot at each '(' open, for RelativeBraceDepth.
    paren_open_brace_stack: list[int] = []

    for index, line in enumerate(line_list):
        scan = _scan_line(
            line,
            mid_block_comment=block_comment_open,
            mid_single=in_single_quote,
            mid_double=in_double_quote,
            mid_template=in_template_text,
        )
        block_comment_open = scan["ends_in_block"]
        in_single_quote = scan["ends_in_string_single"]
        in_double_quote = scan["ends_in_string_double"]
        in_template_text = scan["ends_in_string_template"]

        # import/export { ... } block tracking
        if not block_comment_open and not scan["ends_in_string"]:
            if MatchImportExportOpen.match(line):
                in_import_block = True
            if in_import_block:
                brace_depth_import += line.count("{") - line.count("}")
                if brace_depth_import <= 0:
                    in_import_block = False
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

        if in_comment or in_import_block or scan["ends_in_string"]:
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

        if last in (";", "}", ")") and paren_depth == 0:
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
        help=".ts / .js / .tsx / .jsx file paths (shell globs ok if quoted)",
    )
    parser.add_argument(
        "--All",
        action="store_true",
        help="Recursively process every .ts / .js / .tsx / .jsx file under the current directory",
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
            "Default 1 (class/function/interface/enum). Use 2 to also cover fn bodies. "
            "Pass All (or Inf) to apply at every nesting depth."
        ),
    )
    args = parser.parse_args()

    extensions = {".ts", ".js", ".tsx", ".jsx"}
    target: list[Path] = []

    if args.All:
        target = sorted(
            fp for fp in Path(".").rglob("*") if fp.suffix in extensions
        )
    else:
        for pattern in args.files:
            candidate = Path(pattern)
            if candidate.is_absolute():
                if candidate.exists():
                    target.append(candidate)
                else:
                    print(f"Warning: no match for '{pattern}'", file=sys.stderr)
            else:
                expanded = sorted(Path(".").glob(pattern))
                if expanded:
                    target.extend(expanded)
                elif candidate.exists():
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
