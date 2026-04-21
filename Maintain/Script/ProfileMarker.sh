#!/usr/bin/env sh

#===============================================================================
# Maintain/Script/ProfileMarker.sh - Output-cache profile-flip cleanup
#===============================================================================
#
# Source this file from Maintain/Debug/Build.sh and Maintain/Release/Build.sh
# AFTER the `case $PROFILE in … esac` block (so the Mountain/Electron/Browser
# env flags are already set) to:
#
#   1. Read the last-built workbench profile from
#      Element/Output/Target/.LastProfile.
#   2. If the current $PROFILE differs, wipe Element/Output/Configuration and
#      Element/Output/Target/Microsoft so the next build regenerates the right
#      entry points (workbench.desktop.main.js for Electron; browser
#      workbench.js for Mountain/Browser).
#   3. Re-create Element/Output/Target and write the new profile marker.
#
# Belt-and-braces: also force a clean if Electron=true but
# workbench.desktop.main.js is missing from the cache (subsumes the previous
# per-script duplicate of this check).
#
# Requires: $PROFILE is set by the caller.
#
# Extracted from Maintain/Debug/Build.sh lines 196-218; behavior identical,
# now shared with Release.
#===============================================================================

ProfileMarker=Element/Output/Target/.LastProfile
LastProfile=""
[ -f "$ProfileMarker" ] && LastProfile=$(cat "$ProfileMarker" 2>/dev/null)
CurrentProfileKey="$PROFILE"

if [ "$LastProfile" != "$CurrentProfileKey" ]; then
	echo "Output profile changed ($LastProfile → $CurrentProfileKey); cleaning Output cache..."
	rm -rf Element/Output/Configuration Element/Output/Target/Microsoft
	mkdir -p Element/Output/Target
	echo "$CurrentProfileKey" >"$ProfileMarker"
fi

# Belt-and-braces: Electron requires workbench.desktop.main.js on disk.
if [ "$Electron" = "true" ]; then
	if [ ! -f "Element/Output/Target/Microsoft/VSCode/vs/workbench/workbench.desktop.main.js" ]; then
		echo "Cleaning Output cache (Electron=true, desktop workbench missing)..."
		rm -rf Element/Output/Configuration Element/Output/Target/Microsoft
	fi
fi
