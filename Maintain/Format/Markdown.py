#!/usr/bin/env python3
"""
Markdown.py - Reformat HTML <table> blocks inside Markdown files to consistent
tab indentation while preserving every URL, attribute, picture/source/img, and
inline emoji/text.

Rules (HTML parser, regex match + tree render):

  Match
  -----
  - Find each <table ...>...</table> block in the source text using regex.
  - Parse the block with stdlib html.parser.HTMLParser into a _Node tree.
  - Void / self-closing tags are emitted inline: <img ... />, <source ... />, ...

  Render
  ------
  - Tabs for indentation, one tab per depth level.
  - Singletons (<p>text</p>, <h3>text</h3>) render opening, text on next tab,
    closing.
  - All attributes and attribute values are preserved verbatim.
  - Text nodes are stripped of surrounding whitespace before emission.

Exclusions applied automatically via path heuristics:
  - .git/ node_modules/ target/ dist/ vendor/
  - Dependency/*/Dependency/** (nested dependency tree)
  - .hermes/
  - Land/Documentation/Rust/doc/** (generated HTML docs)
  - Element/SideCar/**

Top-level external/forked repos under Land/Dependency/ such as
Microsoft/, Maintain/, Tauri/, TauriPlugin*/ are still processed.

Usage:
    # Dry-run on target file:
    python Maintain/Format/Markdown.py --DryRun README.md

    # Apply to one file:
    python Maintain/Format/Markdown.py Path/To/README.md

    # Recursively apply to all .md / .markdown files:
    python Maintain/Format/Markdown.py --All

    # Dry-run everything:
    python Maintain/Format/Markdown.py --DryRun --All
"""

from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import TypedDict


# Directory components that are never formatted. Mirrors the exclusion sets in
# Maintain/Format.sh find paths and .prettierignore.
Exclude = frozenset(
    {
        ".git",
        "node_modules",
        "target",
        "dist",
        "vendor",
        "Archive",
        "Generated",
        ".hermes",
        "Documentation",
        "Editor",
        "SideCar",
    }
)

TargetExtension = {".md", ".markdown"}

TablesRegex = re.compile(r"(?s)<table\b.*?</table>")


class Node:
    __slots__ = ("Name", "Attrs", "SelfClosing", "Children", "Text")

    def __init__(
        self,
        Name: str,
        Attrs: list[tuple[str, str | None]],
        SelfClosing: bool = False,
    ) -> None:
        self.Name = Name
        self.SelfClosing = SelfClosing
        self.Children: list[Node] | None = [] if not SelfClosing else None
        self.Text: str | None = None

        Normalized: list[tuple[str, str]] = []
        for Key, Value in Attrs:
            if Value is None:
                Normalized.append((Key, ""))
            else:
                if Value and Value[0] in ('"', "'") and Value[-1] == Value[0]:
                    Value = Value[1:-1]
                Normalized.append((Key, Value))
        self.Attrs = Normalized


VoidTag = frozenset(
    {
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
    }
)


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.Stack: list[Node] = []
        self.Root: Node | None = None

    def handle_starttag(self, tag: str, attrs) -> None:
        Name = tag.lower()
        SelfClosing = Name in VoidTag
        Node_ = Node(Name, attrs, SelfClosing)
        if self.Stack:
            Parent = self.Stack[-1]
            assert Parent.Children is not None
            Parent.Children.append(Node_)
        else:
            self.Root = Node_
        if not SelfClosing:
            self.Stack.append(Node_)

    def handle_endtag(self, tag: str) -> None:
        Name = tag.lower()
        if self.Stack and self.Stack[-1].Name == Name:
            self.Stack.pop()

    def handle_data(self, data: str) -> None:
        if not data:
            return
        Node_ = Node("", [])
        Node_.Text = data
        if self.Stack:
            Parent = self.Stack[-1]
            assert Parent.Children is not None
            Parent.Children.append(Node_)


def AttrsToString(Attrs: list[tuple[str, str]]) -> str:
    if not Attrs:
        return ""
    return " " + " ".join(f'{Key}="{Value}"' for Key, Value in Attrs)


# Em quad (U+2001) is a space separator (Zs) but must NOT be stripped
# from text content as it serves as a semantic spacer between text and emoji.
# In HTML output we use the entity &#x2001; for explicit visibility in source.
EM_QUAD = "\u2001"
EM_QUAD_ENTITY = "&#x2001;"


def SafeStrip(Text: str) -> str:
    """Strip whitespace but preserve em quad characters."""
    if not Text:
        return ""
    # Strip leading/trailing ASCII whitespace only, not em quad
    Start = 0
    End = len(Text)
    while Start < End and Text[Start] in " \t\n\r\v\f":
        Start += 1
    while End > Start and Text[End - 1] in " \t\n\r\v\f":
        End -= 1
    return Text[Start:End]


def EmitText(Text: str) -> str:
    """Replace literal em quad with HTML entity for explicit source visibility."""
    return Text.replace(EM_QUAD, EM_QUAD_ENTITY)


def Render(Node_: Node, Depth: int) -> list[str]:
    Lines: list[str] = []
    Indent = "\t" * Depth

    if Node_.Text is not None:
        Text_ = SafeStrip(Node_.Text)
        if Text_:
            Lines.append(Indent + EmitText(Text_))
        return Lines

    if Node_.SelfClosing or Node_.Children is None:
        Tag = f"<{Node_.Name}{AttrsToString(Node_.Attrs)}"
        if Node_.SelfClosing:
            Lines.append(Indent + Tag + " />")
        else:
            Lines.append(Indent + Tag + ">")
        return Lines

    SingleText = len(Node_.Children) == 1 and Node_.Children[0].Text is not None
    if SingleText:
        Text_ = SafeStrip(Node_.Children[0].Text)  # type: ignore[union-attr]
        if Text_:
            Lines.append(Indent + f"<{Node_.Name}{AttrsToString(Node_.Attrs)}>")
            Lines.append(Indent + "\t" + EmitText(Text_))
            Lines.append(Indent + f"</{Node_.Name}>")
        else:
            Lines.append(Indent + f"<{Node_.Name}{AttrsToString(Node_.Attrs)}>")
        return Lines

    Lines.append(Indent + f"<{Node_.Name}{AttrsToString(Node_.Attrs)}>")
    for Child in Node_.Children:
        Lines.extend(Render(Child, Depth + 1))
    Lines.append(Indent + f"</{Node_.Name}>")
    return Lines


def FormatTable(Html: str) -> str:
    Parser = TableParser()
    Parser.feed(Html)
    Parser.close()
    if Parser.Root is None:
        return Html
    return "\n".join(Render(Parser.Root, 0))


def TransformMarkdownTables(Text: str) -> str:
    def Replacer(Match: re.Match) -> str:
        return FormatTable(Match.group(0))

    return TablesRegex.sub(Replacer, Text)


def ShouldProcess(Path_: Path) -> bool:
    if Path_.suffix.lower() not in TargetExtension:
        return False
    Parts = tuple(Path_.parts)
    if ".hermes" in Parts:
        return False
    if any(Part in Exclude for Part in Parts):
        return False
    if "SideCar" in Parts:
        return False
    if "Documentation" in Parts and "Rust" in Parts:
        return False
    return True


def ProcessFile(FilePath: Path, DryRun: bool) -> bool:
    try:
        Text = FilePath.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False

    NewText = TransformMarkdownTables(Text)
    if NewText == Text:
        return False

    if DryRun:
        print(f"[DRY RUN] Would modify: {FilePath}")
    else:
        FilePath.write_text(NewText, encoding="utf-8")
        print(f"Modified: {FilePath}")
    return True


def CollectTargets(Root: Path) -> list[Path]:
    Files: list[Path] = []
    for Path_ in sorted(Root.rglob("*")):
        if not Path_.is_file():
            continue
        if not ShouldProcess(Path_):
            continue
        try:
            Content = Path_.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if TablesRegex.search(Content):
            Files.append(Path_)
    return Files


def Main() -> None:
    Parser = argparse.ArgumentParser(description=__doc__)
    Parser.add_argument(
        "Files",
        nargs="*",
        help="Markdown file paths",
    )
    Parser.add_argument(
        "--All",
        action="store_true",
        help="Recursively process every .md / .markdown file under current directory",
    )
    Parser.add_argument(
        "--DryRun",
        action="store_true",
        help="Show what would change without writing",
    )
    Arguments = Parser.parse_args()

    Root = Path(".")
    Targets: list[Path] = []

    if Arguments.All:
        Targets = CollectTargets(Root)
    else:
        for Pattern in Arguments.Files:
            Candidate = Path(Pattern)
            if Candidate.exists():
                Targets.append(Candidate)
            else:
                print(f"Warning: file not found: {Pattern}", file=sys.stderr)

    if not Targets:
        Parser.print_help()
        sys.exit(1)

    Total = len(Targets)
    Changed = sum(ProcessFile(Target, Arguments.DryRun) for Target in Targets)
    Verb = "would change" if Arguments.DryRun else "changed"
    print(f"\nDone - {Verb} {Changed}/{Total} file(s).")


if __name__ == "__main__":
    Main()
