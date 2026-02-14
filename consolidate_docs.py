#!/usr/bin/env python3
"""
Documentation consolidation and improvement script

This script helps:
- Identify duplicate content
- Ensure consistent structure
- Add/update Table of Contents where needed
- Check for missing documentation files per Element
"""

import os
import re
from pathlib import Path
from collections import defaultdict

ROOT_DIR = Path("/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land")

# Required documentation files for each Element
REQUIRED_DOCS = {
    "README.md": "Main project readme",
    "CHANGELOG.md": "Changelog",
    "CODE_OF_CONDUCT.md": "Code of conduct",
    "SECURITY.md": "Security policy",
    "CONTRIBUTING.md": "Contributing guidelines",
}

# Optional documentation files
OPTIONAL_DOCS = {
    "Architecture.md": "Architecture overview",
    "API.md": "API reference",
    "INSTALLATION.md": "Installation guide",
    "DEVELOPMENT.md": "Development guide",
}

# Elements that should have documentation
ELEMENTS = [
    "Air", "Cocoon", "Common", "Echo", "Grove", "Maintain", 
    "Mist", "Mountain", "Output", "Rest", "SideCar", 
    "Sky", "Vine", "Wind", "Worker"
]


def has_toc(content: str) -> bool:
    """Check if markdown file has a Table of Contents."""
    # Common TOC patterns
    patterns = [
        r"## Table of Contents",
        r"## TOC",
        r"- \[Overview\]\(#",
        r"1\. \[Overview\]\(#",
    ]
    return any(re.search(pattern, content, re.IGNORECASE) for pattern in patterns)


def add_toc_if_missing(file_path: Path, headers: list) -> bool:
    """Add TOC to a markdown file if missing."""
    # Implementation would add TOC based on headers found
    return False


def get_headers_from_content(content: str) -> list:
    """Extract all markdown headers from content."""
    header_pattern = r'^(#{1,6})\s+(.+)$'
    return re.findall(header_pattern, content, re.MULTILINE)


def analyze_file_structure(file_path: Path) -> dict:
    """Analyze the structure of a documentation file."""
    try:
        content = file_path.read_text(encoding="utf-8")
        headers = get_headers_from_content(content)
        has_toc_flag = has_toc(content)
        
        return {
            "file": file_path.name,
            "path": str(file_path.relative_to(ROOT_DIR)),
            "headers": [h[1] for h in headers],
            "has_toc": has_toc_flag,
            "header_count": len(headers),
        }
    except Exception as e:
        return {
            "file": file_path.name,
            "path": str(file_path.relative_to(ROOT_DIR)),
            "error": str(e),
        }


def check_element_documentation(element_path: Path) -> dict:
    """Check documentation completeness for an Element."""
    result = {
        "element": element_path.name,
        "has_readme": (element_path / "README.md").exists(),
        "has_changelog": (element_path / "CHANGELOG.md").exists(),
        "missing_docs": [],
        "existing_docs": [],
    }
    
    # Check for existing documentation files
    for md_file in element_path.glob("*.md"):
        if md_file.name == "README.md":
            result["has_readme"] = True
        result["existing_docs"].append(md_file.name)
    
    # Check for missing optional documentation
    if element_path.name != "Common":  # Common is just a library
        optional_paths = [
            element_path / "Documentation" / fname
            for fname in ["Architecture.md", "API.md", "Contributing.md"]
        ]
        for opt_path in optional_paths:
            if not opt_path.exists():
                result["missing_docs"].append(f"Documentation/{opt_path.name}")
    
    return result


def find_duplicate_content(files: list) -> dict:
    """Find potentially duplicate content across files."""
    # Simple heuristic: check for similar first paragraphs
    content_map = defaultdict(list)
    
    for file_path in files:
        try:
            content = file_path.read_text(encoding="utf-8")
            # Get first substantial paragraph (after title)
            lines = content.split('\n')
            first_para = ""
            in_para = False
            for line in lines[10:50]:  # Skip header
                line = line.strip()
                if line and not line.startswith('#'):
                    first_para += line + " "
                    if len(first_para) > 100:
                        break
            if len(first_para) > 50:
                # Use first 100 chars as key
                key = first_para[:100].lower()
                content_map[key].append(str(file_path.relative_to(ROOT_DIR)))
        except Exception:
            pass
    
    # Filter out items with only one file (not duplicates)
    duplicates = {k: v for k, v in content_map.items() if len(v) > 1}
    return duplicates


def generate_consolidation_report():
    """Generate a comprehensive consolidation report."""
    print("=" * 70)
    print("PHASE 4: Documentation Consolidation Analysis")
    print("=" * 70)
    
    # 1. Analyze Element documentation completeness
    print("\n1. ELEMENT DOCUMENTATION STATUS")
    print("-" * 70)
    
    element_reports = []
    for element_name in ELEMENTS:
        element_path = ROOT_DIR / "Element" / element_name
        if element_path.exists():
            report = check_element_documentation(element_path)
            element_reports.append(report)
            
            status = "✓" if report["has_readme"] else "✗"
            print(f"{status} {element_name:15s} - README: {report['has_readme']}, "
                  f"CHANGELOG: {report['has_changelog']}, "
                  f"Docs: {len(report['existing_docs'])}")
            if report["missing_docs"]:
                for missing in report["missing_docs"]:
                    print(f"    ⚠ Missing: {missing}")
    
    # 2. Check for TOC in main documentation files
    print("\n2. TABLE OF CONTENTS STATUS")
    print("-" * 70)
    
    main_docs = [
        ROOT_DIR / "Documentation" / "Architecture" / "README.md",
        ROOT_DIR / "Documentation" / "GitHub" / "Workflow.md",
    ]
    
    for element in ELEMENTS:
        readme_path = ROOT_DIR / "Element" / element / "README.md"
        if readme_path.exists():
            main_docs.append(readme_path)
    
    toc_stats = {"with_toc": 0, "without_toc": 0}
    for doc_path in main_docs:
        if not doc_path.exists():
            continue
        analysis = analyze_file_structure(doc_path)
        if analysis.get("has_toc"):
            toc_stats["with_toc"] += 1
            print(f"✓ {doc_path.relative_to(ROOT_DIR)}")
        else:
            toc_stats["without_toc"] += 1
            print(f"✗ {doc_path.relative_to(ROOT_DIR)}")
    
    print(f"\n   With TOC: {toc_stats['with_toc']}, Without TOC: {toc_stats['without_toc']}")
    
    # 3. Find potential duplicate content
    print("\n3. POTENTIAL DUPLICATE CONTENT")
    print("-" * 70)
    
    # Collect all markdown files
    md_files = list(ROOT_DIR.glob("Documentation/**/*.md")) + \
               list(ROOT_DIR.glob("Element/**/*.md"))
    
    # Filter out ignored files
    ignore_patterns = ["node_modules", "Rust/doc", "rust/doc", "target", ".git"]
    md_files = [
        f for f in md_files
        if not any(pattern in str(f) for pattern in ignore_patterns)
    ]
    
    duplicates = find_duplicate_content(md_files)
    if duplicates:
        print(f"Found {len(duplicates)} potential duplicate content sections:")
        for i, (snippet, files) in enumerate(list(duplicates.items())[:10], 1):
            print(f"\n  {i}. Snippet: {snippet[:60]}...")
            for f in files[:3]:  # Show first 3 files
                print(f"     - {f}")
            if len(files) > 3:
                print(f"     ... and {len(files) - 3} more")
    else:
        print("✓ No obvious duplicate content detected")
    
    # 4. Summary and recommendations
    print("\n4. CONSOLIDATION RECOMMENDATIONS")
    print("-" * 70)
    
    elements_without_readme = [r["element"] for r in element_reports if not r["has_readme"]]
    if elements_without_readme:
        print(f"⚠ {len(elements_without_readme)} Elements missing README.md:")
        for elem in elements_without_readme:
            print(f"   - Element/{elem}/README.md")
    
    print("\n✓ Consider adding Architecture.md to major Elements:")
    major_elements = ["Air", "Cocoon", "Mountain", "Wind", "Sky", "Vine"]
    for elem in major_elements:
        arch_path = ROOT_DIR / "Element" / elem / "Documentation" / "Architecture.md"
        if not arch_path.exists():
            print(f"   - Element/{elem}/Documentation/Architecture.md")
    
    print("\n✓ Ensure all workflow documents have consistent formatting")
    print("✓ Consider consolidating similar implementation plans in Cocoon")
    
    return {
        "elements_without_readme": len(elements_without_readme),
        "main_docs_without_toc": toc_stats["without_toc"],
        "potential_duplicates": len(duplicates),
    }


if __name__ == "__main__":
    generate_consolidation_report()
