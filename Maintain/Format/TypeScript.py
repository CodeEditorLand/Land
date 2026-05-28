#!/usr/bin/env python3
"""
TypeScript.py - Insert blank lines after ;  }  ,  and { in TypeScript/JavaScript source files.

Rules (state-machine, line-by-line):

  After ;  }
  ----------
  - Insert a blank line when the next line is non-blank AND does not start
    with a closing delimiter (}  )  ]  ,  ;) or a chain call (.method()).
  - Guards: skip lines inside block comments, inside import/export { ... }
    blocks, and while ParenDepth > 0 (inside function calls or arrow-function
    parameter lists).

  After ,
  -------
  - Same as above, but the paren guard is relaxed: commas inside direct
    function-call arguments DO get a blank line after them.
  - "Direct args" means ParenDepth > 0 AND the net brace depth since the
    enclosing paren opened is 0 - i.e., we have not entered an object
    literal or arrow-function body inside the call.
  - Commas inside object literals or closures within a call (e.g.
    foo({ key: val, }) or .catch((E) => { field = x, })) are left alone
    because RelativeBraceDepth > 0.
  - Template-literal interpolations ${ ... } are tracked so commas inside
    ${} expressions do not trigger blank-line insertion.

  After {
  -------
  - Insert a blank line only for top-level block openings - class, function,
    interface, enum, namespace (brace depth becomes <= OpenBraceMaxDepth).
  - Deeply nested { (if/for/arrow bodies) are intentionally left alone.

  General
  -------
  - Strings (single-quote, double-quote, backtick), block comments, and
    template-literal interpolations are scanned so delimiters inside content
    never corrupt depth tracking or trigger insertion.
  - Never insert a second consecutive blank line (next line already blank -> skip).

Usage:
    # Dry-run on target file:
    python Maintain/Format/TypeScript.py --DryRun Package/Site/Source/Index.ts

    # Apply to one file:
    python Maintain/Format/TypeScript.py Package/Site/Source/Index.ts

    # Recursively apply to all .ts and .js files:
    python Maintain/Format/TypeScript.py --All

    # Dry-run everything:
    python Maintain/Format/TypeScript.py --DryRun --All

    # Allow blank after { up to brace depth 2 (function bodies too):
    python Maintain/Format/TypeScript.py --OpenBraceDepth 2 --All

    # Apply at every nesting depth:
    python Maintain/Format/TypeScript.py --OpenBraceDepth All --All
"""

import re
import sys
from pathlib import Path
from typing import TypedDict


MatchClosingToken = re.compile(r"^\s*[})\];,]")
MatchChainContinue = re.compile(r"^\s*\.")
MatchCommentLine = re.compile(r"^\s*(//|\*)")
MatchImportExportOpen = re.compile(r"^\s*(import|export)\s*(type\s*)?\{")

# Directory components that are never formatted. Mirrors the exclusion sets in
# Maintain/Format.sh find paths and .prettierignore.
Exclude = frozenset(
    {
        "Archive",
        "Dependency",
        "Documentation",
        "Target",
        "target",
        "node_modules",
        ".git",
        "dist",
        "build",
    }
)


class ScanResult(TypedDict):
    ParenDelta: int
    BraceDelta: int
    LastChar: str | None
    EndsInBlock: bool
    EndsInStringSingle: bool
    EndsInStringDouble: bool
    EndsInStringTemplate: bool
    EndsInString: bool


def ScanLine(
    Line: str,
    MidBlockComment: bool = False,
    MidSingle: bool = False,
    MidDouble: bool = False,
    MidTemplate: bool = False,
) -> ScanResult:
    """
    Scan a single TypeScript/JavaScript source line, skipping string,
    template literal, and block-comment content.

    Parameters
    ----------
    Line             : the source line to scan.
    MidBlockComment  : True if the line starts inside an open /*.
    MidSingle        : True if the line starts mid-single-quoted string.
    MidDouble        : True if the line starts mid-double-quoted string.
    MidTemplate      : True if the line starts mid-template literal.

    Returns
    -------
    ParenDelta            : int  - net parenthesis depth change
    BraceDelta            : int  - net brace depth change
    LastChar              : str|None - last non-whitespace code char
    EndsInBlock           : bool - line ends with unclosed /*
    EndsInStringSingle    : bool - line ends mid-single-quoted string
    EndsInStringDouble    : bool - line ends mid-double-quoted string
    EndsInStringTemplate  : bool - line ends mid-template literal
    EndsInString          : bool - any of the above three
    """
    ParenDelta = 0
    BraceDelta = 0
    LastChar = None
    Position = 0
    Length = len(Line)

    InBlock = MidBlockComment
    InSingle = MidSingle
    InDouble = MidDouble
    InTemplateText = MidTemplate
    InTemplateExpr = 0

    while Position < Length:
        Character = Line[Position]

        if InDouble:
            if Character == "\\":
                Position += 2
                continue
            if Character == '"':
                InDouble = False
            Position += 1
            continue

        if InSingle:
            if Character == "\\":
                Position += 2
                continue
            if Character == "'":
                InSingle = False
            Position += 1
            continue

        if InTemplateText and InTemplateExpr == 0:
            if Character == "`":
                InTemplateText = False
                Position += 1
                continue
            if Character == "$" and Position + 1 < Length and Line[Position + 1] == "{":
                InTemplateExpr = 1
                Position += 2
                continue
            Position += 1
            continue

        if InTemplateExpr > 0:
            if Character == "\\":
                Position += 2
                continue
            if Character == '"':
                InDouble = not InDouble
                Position += 1
                continue
            if Character == "'":
                InSingle = not InSingle
                Position += 1
                continue
            if Character == "`":
                InTemplateText = True
                Position += 1
                continue
            if Character == "{":
                InTemplateExpr += 1
                BraceDelta += 1
                LastChar = Character
                Position += 1
                continue
            if Character == "}":
                InTemplateExpr -= 1
                if InTemplateExpr == 0:
                    InTemplateText = True
                    Position += 1
                    continue
                BraceDelta -= 1
                LastChar = Character
                Position += 1
                continue
            if Character == "(":
                ParenDelta += 1
            elif Character == ")":
                ParenDelta -= 1
            elif Character == "{":
                BraceDelta += 1
                InTemplateExpr += 1
            elif Character == "}":
                BraceDelta -= 1
                InTemplateExpr -= 1
                if InTemplateExpr == 0:
                    InTemplateText = True

            if Character not in (" ", "\t", "\r", "\n"):
                LastChar = Character
            Position += 1
            continue

        if InBlock:
            if Character == "*" and Position + 1 < Length and Line[Position + 1] == "/":
                InBlock = False
                Position += 2
                continue
            Position += 1
            continue

        if Character == "`":
            InTemplateText = not InTemplateText
            Position += 1
            continue

        if Character == '"':
            InDouble = True
            Position += 1
            continue

        if Character == "'":
            InSingle = True
            Position += 1
            continue

        if Character == "/" and Position + 1 < Length and Line[Position + 1] == "/":
            break

        if Character == "/" and Position + 1 < Length and Line[Position + 1] == "*":
            InBlock = True
            Position += 2
            continue

        if Character == "(":
            ParenDelta += 1
        elif Character == ")":
            ParenDelta -= 1
        elif Character == "{":
            BraceDelta += 1
        elif Character == "}":
            BraceDelta -= 1

        if Character not in (" ", "\t", "\r", "\n"):
            LastChar = Character

        Position += 1

    return {
        "ParenDelta": ParenDelta,
        "BraceDelta": BraceDelta,
        "LastChar": LastChar,
        "EndsInBlock": InBlock,
        "EndsInStringSingle": InSingle,
        "EndsInStringDouble": InDouble,
        "EndsInStringTemplate": InTemplateText,
        "EndsInString": InDouble or InSingle or InTemplateText,
    }


def Transform(Source: str, OpenBraceMaxDepth: int = 1) -> str:
    LineList = Source.split("\n")
    Output: list[str] = []

    BlockCommentOpen = False
    ParenDepth = 0
    BraceDepth = 0
    BraceDepthImport = 0
    InImportBlock = False
    InSingleQuote = False
    InDoubleQuote = False
    InTemplateText = False

    ParenOpenBraceStack: list[int] = []

    for Index, Line in enumerate(LineList):
        Scan = ScanLine(
            Line,
            MidBlockComment=BlockCommentOpen,
            MidSingle=InSingleQuote,
            MidDouble=InDoubleQuote,
            MidTemplate=InTemplateText,
        )
        BlockCommentOpen = Scan["EndsInBlock"]
        InSingleQuote = Scan["EndsInStringSingle"]
        InDoubleQuote = Scan["EndsInStringDouble"]
        InTemplateText = Scan["EndsInStringTemplate"]

        if not BlockCommentOpen and not Scan["EndsInString"]:
            if MatchImportExportOpen.match(Line):
                InImportBlock = True
            if InImportBlock:
                BraceDepthImport += Line.count("{") - Line.count("}")
                if BraceDepthImport <= 0:
                    InImportBlock = False
                    BraceDepthImport = 0

            CloseCount = max(0, -Scan["ParenDelta"])
            for _ in range(CloseCount):
                if ParenOpenBraceStack:
                    ParenOpenBraceStack.pop()
            for _ in range(max(0, Scan["ParenDelta"])):
                ParenOpenBraceStack.append(BraceDepth)

            ParenDepth = max(0, ParenDepth + Scan["ParenDelta"])
            BraceDepth = max(0, BraceDepth + Scan["BraceDelta"])

        Output.append(Line)

        InComment = BlockCommentOpen or bool(MatchCommentLine.match(Line))

        if InComment or InImportBlock or Scan["EndsInString"]:
            continue

        Stripped = Line.rstrip()
        if not Stripped:
            continue

        Last = Scan["LastChar"]
        if Last is None:
            continue

        if Index + 1 >= len(LineList):
            continue

        NextLine = LineList[Index + 1]
        NextBlank = NextLine.strip() == ""
        NextClosing = bool(MatchClosingToken.match(NextLine))
        NextChain = bool(MatchChainContinue.match(NextLine))

        if NextBlank or NextClosing or NextChain:
            continue

        if Last in (";", "}", ")"):
            if ParenDepth == 0:
                Output.append("")
            elif ParenOpenBraceStack:
                RelativeBraceDepth = BraceDepth - ParenOpenBraceStack[-1]
                if RelativeBraceDepth > 0:
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


# ── CLI ───────────────────────────────────────────────────────────────────────


def ProcessFile(FilePath: Path, DryRun: bool, OpenBraceMaxDepth: int) -> bool:
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
        "Files",
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
            "Default 1 (class/function/interface/enum). Use 2 to also cover fn bodies. "
            "Pass All (or Inf) to apply at every nesting depth."
        ),
    )
    Args = Parser.parse_args()

    Extensions = {".ts", ".js", ".tsx", ".jsx"}
    Target: list[Path] = []

    if Args.All:
        Target = sorted(
            File
            for File in Path(".").rglob("*")
            if File.suffix in Extensions
            and not any(Part in Exclude for Part in File.parts)
        )
    else:
        for Pattern in Args.Files:
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
        ProcessFile(File, Args.DryRun, Args.OpenBraceDepth) for File in Target
    )
    Total = len(Target)
    Verb = "would change" if Args.DryRun else "changed"
    print(f"\nDone - {Verb} {Changed}/{Total} file(s).")


if __name__ == "__main__":
    Main()
