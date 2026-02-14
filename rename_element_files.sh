#!/bin/bash
cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land

# Element/Cocoon/
cd Element/Cocoon/Documentation/GitHub
mv "Cocoon-Implementation-Plan.md" "CocoonImplementationPlan.md"
mv "Cocoon-Implementation-Summary.md" "CocoonImplementationSummary.md"
mv "Deep Dive.md" "DeepDive.md"
mv "Refactoring-Batch-Plan.md" "RefactoringBatchPlan.md"
mv "Refactoring-Strategy.md" "RefactoringStrategy.md"
mv "Source-Refactoring-Plan.md" "SourceRefactoringPlan.md"
mv "Synchronization-TODOs.md" "SynchronizationTodos.md"
mv "VS-Code-Validation-Checklist.md" "VsCodeValidationChecklist.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Cocoon/Source/Bootstrap/Documentation
mv "EXTENSION-HOST-ANALYSIS.md" "ExtensionHostAnalysis.md"
mv "NEXT-SESSION-PLAN.md" "NextSessionPlan.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land

# Element/Common/
cd Element/Common/Documentation/GitHub
mv "Deep Dive.md" "DeepDive.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land

# Element/Echo/
cd Element/Echo/Documentation/GitHub
mv "Deep Dive.md" "DeepDive.md"
mv "TODO.md" "Todo.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land

# Element/Mountain/
cd Element/Mountain/Documentation/GitHub
mv "Deep Dive.md" "DeepDive.md"
mv "Naming Conventions.md" "NamingConventions.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Mountain/Source/IPC
mv "REFACTORING_SUMMARY.md" "RefactoringSummary.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Mountain
mv "TODO.md" "Todo.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land

# Element/Wind/
cd Element/Wind/Documentation
mv "GitHub/Deep Dive.md" "GitHub/DeepDive.md" 2>/dev/null || mv GitHub/Deep\ Dive.md GitHub/DeepDive.md
mv "VSCode-Integration.md" "VscodeIntegration.md"

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land

# Element/Grove/
cd Element/Grove
if [ -f "README.md" ]; then echo "Grove README.md already exists"; fi

# Element/Mist/
cd Element/Mist
if [ -f "SECURITY.md" ]; then echo "Mist SECURITY.md already exists"; fi

cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land

# Element/Worker/
cd Element/Worker/Documentation/GitHub
if [ -f "Deep Dive.md" ]; then mv "Deep Dive.md" "DeepDive.md"; fi

echo "Element documentation files renamed successfully"
