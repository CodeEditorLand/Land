#!/usr/bin/env python3
"""
Convert all relative links in documentation to absolute GitHub links
"""

import os
import re
from pathlib import Path
from urllib.parse import quote

# Configuration
ROOT_DIR = Path("/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land")
GITHUB_BASE = "https://github.com/CodeEditorLand"

# Repository mapping for submodules
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
}

# Renamed files mapping for updating references
RENAMED_FILES = {
    # Architecture
    "air.md": "Air.md",
    "build-process.md": "BuildProcess.md",
    "cocoon.md": "Cocoon.md",
    "mountain.md": "Mountain.md",
    "sky.md": "Sky.md",
    "vine.md": "Vine.md",
    "wind.md": "Wind.md",
    "elements.md": "Elements.md",
    "cocoon-service-implementation.md": "CocoonServiceImplementation.md",
    "communication-flows.md": "CommunicationFlows.md",
    "spine-contract.md": "SpineContract.md",
    "wind-distribution-fix.md": "WindDistributionFix.md",
    "workbench-testing-report.md": "WorkbenchTestingReport.md",
    "cocoon-health-monitoring-implementation.md": "CocoonHealthMonitoringImplementation.md",
    "refactoring-priorities.md": "RefactoringPriorities.md",
    # Workflow
    "Application Startup & Handshake.md": "ApplicationStartupAndHandshake.md",
    "Creating and Interacting with a Webview Panel.md": "CreatingAndInteractingWithAWebviewPanel.md",
    "Creating and Interacting with an Integrated Terminal.md": "CreatingAndInteractingWithAnIntegratedTerminal.md",
    "Executing a Command from the Command Palette.md": "ExecutingACommandFromTheCommandPalette.md",
    "Invoking a Language Feature (Hover Provider).md": "InvokingALanguageFeatureHoverProvider.md",
    "Opening a File from the UI.md": "OpeningAFileFromTheUI.md",
    "Running Extension Tests.md": "RunningExtensionTests.md",
    "Saving a File with Save Participants.md": "SavingAFileWithSaveParticipants.md",
    "Source Control Management (SCM).md": "SourceControlManagementSCM.md",
    "User Data Synchronization.md": "UserDataSynchronization.md",
    # Element/Cocoon
    "Cocoon-Implementation-Plan.md": "CocoonImplementationPlan.md",
    "Cocoon-Implementation-Summary.md": "CocoonImplementationSummary.md",
    "Deep Dive.md": "DeepDive.md",
    "Refactoring-Batch-Plan.md": "RefactoringBatchPlan.md",
    "Refactoring-Strategy.md": "RefactoringStrategy.md",
    "Source-Refactoring-Plan.md": "SourceRefactoringPlan.md",
    "Synchronization-TODOs.md": "SynchronizationTodos.md",
    "VS-Code-Validation-Checklist.md": "VsCodeValidationChecklist.md",
    "EXTENSION-HOST-ANALYSIS.md": "ExtensionHostAnalysis.md",
    "NEXT-SESSION-PLAN.md": "NextSessionPlan.md",
    # Element/Common
    "Deep Dive.md": "DeepDive.md",
    # Element/Echo
    "TODO.md": "Todo.md",
    # Element/Mountain
    "Naming Conventions.md": "NamingConventions.md",
    # Element/Mountain/Source/IPC
    "REFACTORING_SUMMARY.md": "RefactoringSummary.md",
    # Element/Mountain
    "TODO.md": "Todo.md",
    # Element/Wind
    "Deep Dive.md": "DeepDive.md",
    "VSCode-Integration.md": "VscodeIntegration.md",
}


def determine_repo_for_path(target_path: Path) -> str:
    """Determine which GitHub repository a file path belongs to."""
    path_str = str(target_path)
    
    # Check if path is in Element subdirectory
    if "/Element/" in path_str:
        parts = path_str.split("/Element/")
        if len(parts) > 1:
            element_part = parts[1]
            element_name = element_part.split("/")[0]
            if element_name in REPO_MAP:
                return REPO_MAP[element_name]
    
    # Default to Land repo
    return f"{GITHUB_BASE}/Land"


def convert_relative_link(content: str, link_url: str, file_path: Path) -> str:
    """Convert a relative link URL to absolute GitHub URL."""
    
    # Skip if already absolute
    if link_url.startswith(("http://", "https://", "mailto:", "#", "data:", "ftp://")):
        return link_url
    
    # Handle anchor links
    if link_url.startswith("#"):
        return link_url
    
    # Get the absolute path of the target
    current_dir = file_path.parent
    
    # Resolve relative path
    if link_url.startswith("./"):
        target_path = current_dir / link_url[2:]
    elif link_url.startswith("../"):
        target_path = (current_dir / link_url).resolve()
    elif link_url.startswith("/"):
        target_path = ROOT_DIR / link_url[1:]
    else:
        # Treat as relative to current directory if no prefix
        target_path = current_dir / link_url
    
    # Normalize path
    try:
        # Try to make relative to ROOT_DIR
        rel_path = target_path.relative_to(ROOT_DIR)
        repo_url = determine_repo_for_path(target_path)
        
        # Extract the element directory if in Element
        path_str = str(rel_path)
        element_part = ""
        if path_str.startswith("Element/"):
            parts = path_str.split("/", 3)
            if len(parts) >= 2:
                element_name = parts[1]
                if len(parts) > 3:
                    element_part = "/".join(parts[2:])
                repo_base = REPO_MAP.get(element_name, f"{GITHUB_BASE}/Land")
                # Determine if it's a submodule path
                if element_name in REPO_MAP:
                    # For submodules, the Element/ prefix is not in the repo
                    absolute_url = f"{repo_base}/tree/Current/{element_part}"
                else:
                    absolute_url = f"{repo_base}/tree/Current/{path_str}"
            else:
                absolute_url = f"{repo_base}/tree/Current"
        else:
            absolute_url = f"{GITHUB_BASE}/Land/tree/Current/{path_str}"
        
        return absolute_url
    
    except ValueError:
        # Cannot make relative to ROOT_DIR, return as-is
        return link_url


def convert_links_in_file(file_path: Path, dry_run: bool = False) -> dict:
    """Convert all relative links in a markdown file."""
    result = {
        "file": str(file_path.relative_to(ROOT_DIR)),
        "links_modified": 0,
        "references_updated": 0,
        "changes": [],
    }
    
    try:
        content = file_path.read_text(encoding="utf-8")
        original_content = content
        
        # Pattern to match markdown links
        link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
        
        def replace_link(match):
            nonlocal content
            link_text = match.group(1)
            link_url = match.group(2)
            original_url = link_url
            
            # Convert relative link
            new_url = convert_relative_link(content, link_url, file_path)
            
            if new_url != original_url:
                result["links_modified"] += 1
                result["changes"].append(f"{original_url} -> {new_url}")
                return f"[{link_text}]({new_url})"
            
            return match.group(0)
        
        content = re.sub(link_pattern, replace_link, content)
        
        # Update references to renamed files
        for old_name, new_name in RENAMED_FILES.items():
            # Update plain text references
            if old_name in content:
                content = content.replace(old_name, new_name)
                result["references_updated"] += 1
            # Also update URL-encoded versions
            encoded_old = quote(old_name, safe='')
            if encoded_old in content and encoded_old != old_name:
                content = content.replace(encoded_old, quote(new_name, safe=''))
                result["references_updated"] += 1
        
        # Write if not dry run and changes made
        if not dry_run and content != original_content:
            file_path.write_text(content, encoding="utf-8")
    
    except Exception as e:
        result["error"] = str(e)
    
    return result


def main():
    """Main function to process all documentation files."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert relative links to absolute GitHub links")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--verbose", action="store_true", help="Show detailed output")
    
    args = parser.parse_args()
    
    # Find all markdown files
    md_files = list(ROOT_DIR.rglob("*.md"))
    
    # Filter out excluded patterns
    exclude_patterns = ["effect/", "node_modules/", "Rust/doc/", "rust/doc/", ".git/", "target/"]
    md_files = [
        f for f in md_files 
        if not any(pattern in str(f) for pattern in exclude_patterns)
        and ("Documentation/" in str(f) or "Element/" in str(f))
    ]
    
    md_files = sorted(md_files)
    
    print(f"Processing {len(md_files)} documentation files...")
    print("=" * 70)
    
    results = []
    for md_file in md_files:
        result = convert_links_in_file(md_file, dry_run=args.dry_run)
        if result["links_modified"] > 0 or result["references_updated"] > 0:
            results.append(result)
            if args.verbose or result.get("error"):
                print(f"\n{result['file']}")
                print(f"  Links modified: {result['links_modified']}")
                print(f"  References updated: {result['references_updated']}")
                if result.get("error"):
                    print(f"  Error: {result['error']}")
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    total_links = sum(r["links_modified"] for r in results)
    total_refs = sum(r["references_updated"] for r in results)
    
    print(f"Files processed: {len(md_files)}")
    print(f"Files with changes: {len(results)}")
    print(f"Total links converted: {total_links}")
    print(f"Total references updated: {total_refs}")
    print(f"Dry run: {args.dry_run}")
    
    if args.dry_run:
        print("\n🔍 This was a dry run. No changes were made.")
        print("   Run without --dry-run to apply changes.")
    else:
        print("\n✓ Links converted to absolute GitHub URLs")
        print("✓ References to renamed files updated")


if __name__ == "__main__":
    main()
