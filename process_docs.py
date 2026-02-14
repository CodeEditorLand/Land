#!/usr/bin/env python3
"""
Documentation Processing Script for CodeEditorLand/Land

This script helps scan, rename, and convert documentation files according to:
1. Convert all relative links to absolute GitHub links
2. Rename files to follow PascalCase naming convention
3. Improve, deduplicate, and consolidate content
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Set
import shutil

# Configuration
GITHUB_BASE = "https://github.com/CodeEditorLand"
REPO_MAP = {
    "Mountain": "https://github.com/CodeEditorLand/Mountain",
    "Worker": "https://github.com/CodeEditorLand/Worker",
    "Vine": "https://github.com/CodeEditorLand/Vine",
    "Echo": "https://github.com/CodeEditorLand/Echo",
    "Common": "https://github.com/CodeEditorLand/Common",
    "Cocoon": "https://github.com/CodeEditorLand/Cocoon",
    "Wind": "https://github.com/CodeEditorLand/Wind",
    "Sky": "https://github.com/CodeEditorLand/Sky",
    "Air": "https://github.com/CodeEditorLand/Air",
    "SideCar": "https://github.com/CodeEditorLand/SideCar",
    "Maintain": "https://github.com/CodeEditorLand/Maintain",
    "Rest": "https://github.com/CodeEditorLand/Rest",
    "Output": "https://github.com/CodeEditorLand/Output",
    "Land": "https://github.com/CodeEditorLand/Land",
}
ROOT_DIR = Path("/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land")

# Patterns to exclude
EXCLUDE_PATTERNS = [
    "effect/",
    "node_modules/",
    "Rust/doc/",
    "rust/doc/",
    ".git/",
    "target/",
    "SourceSerif4",
]

# Files that should NOT be renamed
KEEP_NAMES = {
    "README.md",
    "CHANGELOG.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "LICENSE",
}


def to_pascal_case(filename: str) -> str:
    """Convert filename to PascalCase."""
    # Remove .md extension
    name = filename.replace(".md", "")
    
    # Skip standard files
    if name in [n.replace(".md", "") for n in KEEP_NAMES]:
        return filename
    
    # Split by common delimiters
    words = re.split(r'[-_\s]+', name)
    
    # Capitalize each word
    pascal = ''.join(word.capitalize() for word in words if word)
    
    return f"{pascal}.md"


def get_file_link_repo(file_path: Path) -> str:
    """Determine the appropriate GitHub repo for a file path."""
    path_str = str(file_path)
    
    # Check if file is in an Element directory
    for element_name, repo_url in REPO_MAP.items():
        if f"/Element/{element_name}/" in path_str or path_str.startswith(f"Element/{element_name}/"):
            return repo_url
    
    # Default to Land repo
    return REPO_MAP["Land"]


def convert_relative_to_absolute(content: str, file_path: Path) -> str:
    """Convert relative links to absolute GitHub links."""
    
    def replace_link(match):
        link_text = match.group(1)  # The text inside []
        url = match.group(2)        # The url inside ()
        
        # Skip if already an absolute URL
        if url.startswith(("http://", "https://", "mailto:", "#", "data:")):
            return match.group(0)
        
        # Handle relative references starting with . or /
        if url.startswith(("./") or url.startswith("../") or url.startswith("/")):
            # Determine target file path relative to current file
            current_dir = file_path.parent
            
            # Parse the relative path
            if url.startswith("./"):
                target_path = current_dir / url[2:]
            elif url.startswith("../"):
                target_path = (current_dir / url).resolve()
            elif url.startswith("/"):
                target_path = ROOT_DIR / url[1:]
            else:
                return match.group(0)
            
            # Get the target file path relative to the repository
            target_repo_url = get_file_link_repo(target_path)
            
            # Convert to absolute GitHub link
            if target_repo_url != REPO_MAP["Land"]:
                # File is in a submodule
                # Get relative path from the Element directory
                try:
                    # Find which Element directory the file is in
                    if "Element/" in str(target_path):
                        element_part = str(target_path).split("Element/")[1]
                        element_name = element_part.split("/")[0]
                        repo_path = element_part.split("/", 1)[1] if "/" in element_part else ""
                        repo_path = repo_path.replace("\\", "/")
                        absolute_url = f"{REPO_MAP[element_name]}/tree/Current/{repo_path}"
                    else:
                        absolute_url = f"{target_repo_url}/tree/Current/{target_path.name}"
                except Exception:
                    # Fallback to current repo
                    rel_path = str(target_path.relative_to(ROOT_DIR)).replace("\\", "/")
                    absolute_url = f"{REPO_MAP['Land']}/tree/Current/{rel_path}"
            else:
                # File is in Land repo
                try:
                    rel_path = str(target_path.relative_to(ROOT_DIR)).replace("\\", "/")
                    absolute_url = f"{REPO_MAP['Land']}/tree/Current/{rel_path}"
                except ValueError:
                    absolute_url = url  # Fallback
            
            return f"[{link_text}]({absolute_url})"
        
        return match.group(0)
    
    # Match markdown links: [text](url)
    link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    return re.sub(link_pattern, replace_link, content)


def scan_documentation_files(root_dir: Path) -> List[Path]:
    """Scan for all documentation files, excluding specified patterns."""
    md_files = []
    
    for md_file in root_dir.rglob("*.md"):
        # Exclude based on patterns
        if any(pattern in str(md_file) for pattern in EXCLUDE_PATTERNS):
            continue
        
        # Only include Documentation/ and Element/*/
        if not ("Documentation/" in str(md_file) or "Element/" in str(md_file)):
            continue
        
        md_files.append(md_file)
    
    return sorted(md_files)


def should_rename_file(file_path: Path) -> bool:
    """Check if a file should be renamed."""
    if file_path.name in KEEP_NAMES:
        return False
    
    # Don't rename files in .github/ or root directories
    if ".github" in str(file_path) or file_path.parent == (ROOT_DIR / "Element"):
        return False
    
    return True


def get_new_filename(file_path: Path) -> Path:
    """Get the new filename in PascalCase."""
    new_name = to_pascal_case(file_path.name)
    return file_path.parent / new_name


def update_internal_references(root_dir: Path, old_name: str, new_name: str, file_path: Path):
    """Update references to renamed files in other documentation files."""
    for md_file in scan_documentation_files(root_dir):
        if md_file == file_path:
            continue
        
        try:
            content = md_file.read_text(encoding="utf-8")
            
            # Check if file references the old name
            if old_name in content or old_name.replace(".md", "") in content:
                updated = content.replace(old_name, new_name)
                if updated != content:
                    print(f"  → Updating reference in {md_file.relative_to(ROOT_DIR)}")
                    md_file.write_text(updated, encoding="utf-8")
        except Exception as e:
            print(f"  ⚠ Warning: Could not update references in {md_file}: {e}")


def process_file(file_path: Path, dry_run: bool = True, convert_links: bool = False) -> Dict:
    """Process a single documentation file."""
    result = {
        "file": str(file_path.relative_to(ROOT_DIR)),
        "renamed": False,
        "links_converted": 0,
        "errors": [],
    }
    
    try:
        content = file_path.read_text(encoding="utf-8")
        original_content = content
        
        # Step 1: Convert links
        if convert_links:
            new_content = convert_relative_to_absolute(content, file_path)
            links_changed = content != new_content
            if links_changed:
                import difflib
                diff = [line for line in difflib.unified_diff(
                    content.splitlines(keepends=True),
                    new_content.splitlines(keepends=True),
                    fromfile="original",
                    tofile="converted",
                    lineterm=""
                )]
                result["links_converted"] = len(diff) // 3  # Approximate
            content = new_content
        
        # Step 2: Check if renaming is needed
        if should_rename_file(file_path):
            new_path = get_new_filename(file_path)
            if new_path.name != file_path.name:
                result["renamed"] = True
                result["new_name"] = new_path.name
        
        # Write changes if not dry run
        if not dry_run:
            if convert_links and content != original_content:
                file_path.write_text(content, encoding="utf-8")
            
            if result["renamed"]:
                new_path = get_new_filename(file_path)
                os.makedirs(new_path.parent, exist_ok=True)
                shutil.move(str(file_path), str(new_path))
                update_internal_references(ROOT_DIR, file_path.name, new_path.name, new_path)
        
    except Exception as e:
        result["errors"].append(str(e))
    
    return result


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Process documentation files")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--rename", action="store_true", help="Rename files to PascalCase")
    parser.add_argument("--convert-links", action="store_true", help="Convert relative links to absolute")
    parser.add_argument("--verbose", action="store_true", help="Show detailed output")
    
    args = parser.parse_args()
    
    # Scan for files
    print("=" * 70)
    print("PHASE 1: Scanning Documentation Files")
    print("=" * 70)
    
    md_files = scan_documentation_files(ROOT_DIR)
    print(f"\nFound {len(md_files)} documentation files:\n")
    
    for i, md_file in enumerate(md_files, 1):
        print(f"  {i:3d}. {md_file.relative_to(ROOT_DIR)}")
    
    # Process files
    print("\n" + "=" * 70)
    print("PHASE 2: Processing Files")
    print("=" * 70)
    
    results = []
    for file_path in md_files:
        result = process_file(file_path, dry_run=args.dry_run, convert_links=args.convert_links)
        if result["renamed"] or result["links_converted"] > 0 or result["errors"]:
            results.append(result)
            
            if args.verbose or result["renamed"]:
                status = "✓" if not result["errors"] else "✗"
                print(f"\n{status} {result['file']}")
                if result.get("renamed"):
                    print(f"    → Rename to: {result['new_name']}")
                if result["links_converted"]:
                    print(f"    → Links converted: {result['links_converted']}")
                for error in result["errors"]:
                    print(f"    ✗ Error: {error}")
    
    # Summary
    print("\n" + "=" * 70)
    print("PHASE 3: Summary")
    print("=" * 70)
    
    renamed_count = sum(1 for r in results if r["renamed"])
    total_links = sum(r["links_converted"] for r in results)
    
    print(f"\nFiles scanned: {len(md_files)}")
    print(f"Files to rename: {renamed_count}")
    print(f"Links to convert: {total_links}")
    print(f"Dry run: {args.dry_run}")
    
    if renamed_count > 0:
        print("\nFiles to be renamed:")
        for r in results:
            if r["renamed"]:
                print(f"  {r['file']} → {r['new_name']}")
    
    if args.dry_run:
        print("\n🔍 This was a dry run. No changes were made.")
        print("   Run with --rename and --convert-links to apply changes.")
    else:
        if args.rename:
            print("\n✓ Renamed files to PascalCase convention")
        if args.convert_links:
            print("✓ Converted relative links to absolute GitHub links")


if __name__ == "__main__":
    main()
