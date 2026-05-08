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
  • Never insert a second consecutive blank line (next line already blank → skip).

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


def Transform(Source: str, OpenBraceMaxDepth: int = 1) -> str:
    """
    Return Source with blank lines inserted per the Mountain convention.

    OpenBraceMaxDepth:
        Insert a blank line after { only when the resulting brace depth
        is <= this value.  Default 1 = impl/enum/struct/mod only.
        Set to 2 to also cover fn/method bodies.
    """
    LineList = Source.split("\n")
    Output: list[str] = []

    BlockCommentDepth = 0
    ParenDepth = 0
    BraceDepth = 0
    BraceDepthImport = 0
    InUseBlock = False

    # Stack: each entry is the BraceDepth recorded when a '(' was opened.
    # Used to compute RelativeBraceDepth = BraceDepth - BraceDepthAtParenOpen,
    # which distinguishes direct macro args (relative=0) from struct/closure
    # bodies inside a macro call (relative>0).
    ParenOpenBraceStack: list[int] = []

    for Index, Line in enumerate(LineList):
        # ── block comment tracking ──────────────────────────────────────────
        OpenCount = Line.count("/*")
        CloseCount = Line.count("*/")
        WasInBlock = BlockCommentDepth > 0
        BlockCommentDepth = max(0, BlockCommentDepth + OpenCount - CloseCount)
        InBlockNow = BlockCommentDepth > 0 or WasInBlock

        # ── use { ... } import block tracking ───────────────────────────────
        if re.match(r"\s*use\s+", Line):
            InUseBlock = True
        if InUseBlock:
            BraceDepthImport += Line.count("{") - Line.count("}")
            if BraceDepthImport <= 0:
                InUseBlock = False
                BraceDepthImport = 0

        # ── paren + brace depth (walk char-by-char to keep stack correct) ───
        for Char in Line:
            if Char == "(":
                ParenDepth += 1
                ParenOpenBraceStack.append(BraceDepth)
            elif Char == ")":
                if ParenDepth > 0:
                    ParenDepth -= 1
                    if ParenOpenBraceStack:
                        ParenOpenBraceStack.pop()
            elif Char == "{":
                BraceDepth += 1
            elif Char == "}":
                BraceDepth = max(0, BraceDepth - 1)

        # ── emit current line ────────────────────────────────────────────────
        Output.append(Line)

        # ── decide whether to insert blank line ─────────────────────────────
        InComment = InBlockNow or bool(MatchCommentLine.match(Line))

        if InComment or InUseBlock:
            continue

        Stripped = Line.rstrip()
        if not Stripped:
            continue

        Last = Stripped[-1]

        if Index + 1 >= len(LineList):
            continue

        Next = LineList[Index + 1]
        NextBlank = Next.strip() == ""
        NextClosing = bool(MatchClosingToken.match(Next))
        NextChain = bool(MatchChainContinue.match(Next))

        if NextBlank or NextClosing or NextChain:
            continue

        if Last in (";", "}") and ParenDepth == 0:
            Output.append("")

        elif Last == ",":
            if ParenDepth == 0:
                # Top-level comma (match arm, etc.)
                Output.append("")
            elif ParenOpenBraceStack:
                # Inside parens: only add blank when NOT inside a brace
                # block that was opened after the paren (struct/closure body)
                RelativeBraceDepth = BraceDepth - ParenOpenBraceStack[-1]
                if RelativeBraceDepth == 0:
                    Output.append("")

        elif Last == "{" and ParenDepth == 0:
            if BraceDepth <= OpenBraceMaxDepth:
                Output.append("")

    return "\n".join(Output)


# ── CLI ──────────────────────────────────────────────────────────────────────


def ProcessFile(FilePath: Path, DryRun: bool, OpenBraceMaxDepth: int) -> bool:
    """Return True if file was (or would be) changed."""
    try:
        Text = FilePath.read_text(encoding="utf-8")
    except Exception as Error:
        print(f"  ERROR reading {FilePath}: {Error}", file=sys.stderr)
        return False

    NewText = Transform(Text, OpenBraceMaxDepth=OpenBraceMaxDepth)
    if NewText == Text:
        return False

    if DryRun:
        print(f"[DRY RUN] Would modify: {FilePath}")
    else:
        FilePath.write_text(NewText, encoding="utf-8")
        print(f"Modified: {FilePath}")
    return True


def Main() -> None:
    import argparse

    Parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    Parser.add_argument(
        "files",
        nargs="*",
        help=".rs file paths (shell globs ok if quoted)",
    )
    Parser.add_argument(
        "--All",
        action="store_true",
        help="Recursively process every .rs file under the current directory",
    )
    Parser.add_argument(
        "--DryRun",
        action="store_true",
        help="Show what would change without writing anything",
    )

    def ParseDepth(Value: str) -> int:
        if Value.lower() in ("all", "inf", "infinite"):
            return 2**31
        try:
            return int(Value)
        except ValueError:
            raise argparse.ArgumentTypeError(
                f"Expected an integer or 'All', got: {Value!r}"
            )

    Parser.add_argument(
        "--OpenBraceDepth",
        type=ParseDepth,
        default=1,
        metavar="N|All",
        help=(
            "Insert blank after { only when brace depth after the line is <= N. "
            "Default 1 (impl/enum/struct/mod). Use 2 to also cover fn bodies. "
            "Pass All (or Inf) to apply at every nesting depth."
        ),
    )
    Args = Parser.parse_args()

    Target: list[Path] = []

    if Args.All:
        Target = sorted(Path(".").rglob("*.rs"))
    else:
        for Pattern in Args.files:
            Expanded = sorted(Path(".").glob(Pattern))
            if Expanded:
                Target.extend(Expanded)
            else:
                Candidate = Path(Pattern)
                if Candidate.exists():
                    Target.append(Candidate)
                else:
                    print(f"Warning: no match for '{Pattern}'", file=sys.stderr)

    if not Target:
        Parser.print_help()
        sys.exit(1)

    Changed = sum(
        ProcessFile(FilePath, Args.DryRun, Args.OpenBraceDepth) for FilePath in Target
    )
    Total = len(Target)
    Verb = "would change" if Args.DryRun else "changed"
    print(f"\nDone — {Verb} {Changed}/{Total} file(s).")


if __name__ == "__main__":
    Main()
