#!/usr/bin/env python3
"""
TypeScript.py — Insert blank lines after ;  }  ,  and { in TypeScript/JavaScript source files.

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
    enclosing paren opened is 0 — i.e., we have not entered an object
    literal or arrow-function body inside the call.
  • Commas inside object literals or closures within a call (e.g.
    foo({ key: val, }) or .catch((E) => { field = x, })) are left alone
    because RelativeBraceDepth > 0.
  • Template-literal interpolations ${ ... } are tracked so commas inside
    ${} expressions do not trigger blank-line insertion.

  After {
  ───────
  • Insert a blank line only for top-level block openings — class, function,
    interface, enum, namespace (brace depth becomes <= OpenBraceMaxDepth).
  • Deeply nested { (if/for/arrow bodies) are intentionally left alone.

  General
  ───────
  • Strings (single-quote, double-quote, backtick) are scanned so delimiters
    inside string content never trigger insertion.
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


def ScanLine(Line: str) -> dict:
    """
    Walk Line char-by-char and return a dict with the net depth changes and
    whether the line ends inside a string or template literal.

    Handles:
      • Single-quoted strings  '...'
      • Double-quoted strings  "..."
      • Template literals      `...${...}...`  (nested ${ } tracked separately)
      • Escaped characters     \\ \'  \"  `
      • Block-comment open/close /* and */  (counted by caller via .count())

    Returns:
      ParenDelta         — net change in paren depth
      BraceDelta         — net change in brace depth (excluding template ${})
      ParenOpenBraces    — list of BraceDepth snapshots at each ( opened
      TemplateDelta      — net change in template-interpolation depth
      EndsInString       — True if line ends mid-string (incomplete literal)
    """
    ParenDelta = 0
    BraceDelta = 0
    TemplateDelta = 0
    ParenOpenBraces: list[int] = []
    RunningBrace = 0

    InSingle = False
    InDouble = False
    InTemplate = False
    TemplateDepth = 0
    InTemplateExpr = 0

    Pos = 0
    Length = len(Line)

    while Pos < Length:
        Ch = Line[Pos]

        # Escape sequences — skip next char inside any string
        if Ch == "\\" and (InSingle or InDouble or InTemplate):
            Pos += 2
            continue

        # Single-quote string
        if Ch == "'" and not InDouble and not InTemplate and InTemplateExpr == 0:
            InSingle = not InSingle
            Pos += 1
            continue

        # Double-quote string
        if Ch == '"' and not InSingle and not InTemplate and InTemplateExpr == 0:
            InDouble = not InDouble
            Pos += 1
            continue

        # Template literal backtick
        if Ch == "`" and not InSingle and not InDouble:
            InTemplate = not InTemplate
            Pos += 1
            continue

        # Skip content inside plain strings
        if InSingle or InDouble:
            Pos += 1
            continue

        # Template interpolation ${ — opens expression context
        if InTemplate and Ch == "$" and Pos + 1 < Length and Line[Pos + 1] == "{":
            InTemplateExpr += 1
            TemplateDelta += 1
            Pos += 2
            continue

        # Inside template but outside ${ } — skip (it's string content)
        if InTemplate and InTemplateExpr == 0:
            Pos += 1
            continue

        # From here: real code characters (outside all strings)

        if Ch == "(":
            ParenDelta += 1
            ParenOpenBraces.append(RunningBrace)
            Pos += 1
            continue

        if Ch == ")":
            ParenDelta -= 1
            if ParenOpenBraces:
                ParenOpenBraces.pop()
            Pos += 1
            continue

        if Ch == "{":
            BraceDelta += 1
            RunningBrace += 1
            if InTemplateExpr > 0:
                InTemplateExpr += 1
                TemplateDelta += 1
            Pos += 1
            continue

        if Ch == "}":
            if InTemplateExpr > 0:
                InTemplateExpr -= 1
                TemplateDelta -= 1
                if InTemplateExpr == 0:
                    Pos += 1
                    continue
            BraceDelta -= 1
            RunningBrace = max(0, RunningBrace - 1)
            Pos += 1
            continue

        Pos += 1

    return {
        "ParenDelta": ParenDelta,
        "BraceDelta": BraceDelta,
        "ParenOpenBraces": ParenOpenBraces,
        "TemplateDelta": TemplateDelta,
        "EndsInString": InSingle or InDouble or InTemplate,
    }


def Transform(Source: str, OpenBraceMaxDepth: int = 1) -> str:
    """
    Return Source with blank lines inserted per the Mountain convention.

    OpenBraceMaxDepth:
        Insert a blank line after { only when the resulting brace depth
        is <= this value.  Default 1 = class/function/interface/enum only.
        Set to 2 to also cover method bodies.
        Pass 2**31 (via --OpenBraceDepth All) to apply at every depth.
    """
    LineList = Source.split("\n")
    Output: list[str] = []

    BlockCommentDepth = 0
    ParenDepth = 0
    BraceDepth = 0
    InImportBlock = False
    BraceDepthImport = 0
    InString = False

    # Stack: BraceDepth snapshots at each ( opened, for RelativeBraceDepth logic
    ParenOpenBraceStack: list[int] = []

    for Index, Line in enumerate(LineList):
        # ── block comment tracking ──────────────────────────────────────────
        OpenCount = Line.count("/*")
        CloseCount = Line.count("*/")
        WasInBlock = BlockCommentDepth > 0
        BlockCommentDepth = max(0, BlockCommentDepth + OpenCount - CloseCount)
        InBlockNow = BlockCommentDepth > 0 or WasInBlock

        # ── import/export { ... } block tracking ────────────────────────────
        if MatchImportExportOpen.match(Line):
            InImportBlock = True
        if InImportBlock:
            BraceDepthImport += Line.count("{") - Line.count("}")
            if BraceDepthImport <= 0:
                InImportBlock = False
                BraceDepthImport = 0

        # ── scan line for depth changes ──────────────────────────────────────
        if not InBlockNow and not InString:
            Scan = ScanLine(Line)
            InString = Scan["EndsInString"]

            # Update paren stack: pop existing entries for closed parens,
            # push new entries for opened parens — use per-line deltas
            ClosedCount = max(0, -Scan["ParenDelta"]) if Scan["ParenDelta"] < 0 else 0
            for _ in range(ClosedCount):
                if ParenOpenBraceStack:
                    ParenOpenBraceStack.pop()
            for Snapshot in Scan["ParenOpenBraces"]:
                ParenOpenBraceStack.append(BraceDepth + Snapshot)

            ParenDepth = max(0, ParenDepth + Scan["ParenDelta"])
            BraceDepth = max(0, BraceDepth + Scan["BraceDelta"])
        else:
            if InString:
                # Re-scan to detect end of multi-line string (rare in TS/JS
                # outside template literals, but handle gracefully)
                Scan = ScanLine(Line)
                InString = Scan["EndsInString"]

        # ── emit current line ────────────────────────────────────────────────
        Output.append(Line)

        # ── decide whether to insert blank line ─────────────────────────────
        InComment = InBlockNow or bool(MatchCommentLine.match(Line))

        if InComment or InImportBlock or InString:
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
                Output.append("")
            elif ParenOpenBraceStack:
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
        help=".ts / .js / .tsx / .jsx file paths (shell globs ok if quoted)",
    )
    Parser.add_argument(
        "--All",
        action="store_true",
        help="Recursively process every .ts / .js / .tsx / .jsx file under the current directory",
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
            "Default 1 (class/function/interface/enum). Use 2 to also cover method bodies. "
            "Pass All (or Inf) to apply at every nesting depth."
        ),
    )
    Args = Parser.parse_args()

    Extensions = {".ts", ".js", ".tsx", ".jsx"}
    Target: list[Path] = []

    if Args.All:
        Target = sorted(
            FilePath
            for FilePath in Path(".").rglob("*")
            if FilePath.suffix in Extensions
        )
    else:
        for Pattern in Args.files:
            Candidate = Path(Pattern)
            if Candidate.is_absolute():
                if Candidate.exists():
                    Target.append(Candidate)
                else:
                    print(f"Warning: no match for '{Pattern}'", file=sys.stderr)
            else:
                Expanded = sorted(Path(".").glob(Pattern))
                if Expanded:
                    Target.extend(Expanded)
                elif Candidate.exists():
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
