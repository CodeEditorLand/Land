#!/usr/bin/env sh

#===============================================================================
# Script/SignBundle.sh - Ad-hoc code-sign the Tauri .app bundle after build.
#===============================================================================
#
# Tauri's `cargo build` and `pnpm tauri build --debug` create an ad-hoc
# signed bundle in Target/<level>/bundle/macos/*.app. The ad-hoc signature
# does NOT embed the entitlements from Entitlements.plist (it has no signing
# identity to bind them to), which means:
#
#   - Hardened-runtime exemptions (JIT, DYLD, library-validation) are absent
#     → Cocoon's V8 crashes, extension helpers fail to spawn
#   - app-sandbox stays at the OS default (off for ad-hoc), but without the
#     explicit entitlement the app cannot request TCC permission dialogs
#     → File pickers silently fail, "Open Folder" does nothing
#
# This script re-signs with the correct entitlements so every debug launch
# behaves identically to a properly-notarised release build, except it still
# uses an ad-hoc (-) identity (no Developer ID required).
#
# Usage (sourced from Debug/Build.sh and Release/Build.sh after the tauri
# build step):
#
#   BundleLevel=debug   sh Maintain/Script/SignBundle.sh
#   BundleLevel=release sh Maintain/Script/SignBundle.sh
#
# Optional - copy signed bundle to Desktop for quick launch:
#
#   CopyToDesktop=1 BundleLevel=debug sh Maintain/Script/SignBundle.sh
#
# Env vars (PascalCase, matching Land convention):
#   BundleLevel      "debug" (default) or "release"
#   CopyToDesktop    set to any non-empty value to copy to ~/Desktop
#   MountainDir      override Mountain element root (default: Element/Mountain)
#===============================================================================

MountainDir="${MountainDir:-Element/Mountain}"
BundleLevel="${BundleLevel:-debug}"
Entitlements="${MountainDir}/Entitlements.plist"
BundleDir="${MountainDir}/Target/${BundleLevel}/bundle/macos"

if [ ! -f "$Entitlements" ]; then
	echo "[SignBundle] ERROR: Entitlements.plist not found at $Entitlements" >&2
	exit 1
fi

if ! plutil -lint "$Entitlements" >/dev/null 2>&1; then
	echo "[SignBundle] ERROR: $Entitlements failed plutil -lint check" >&2
	plutil -lint "$Entitlements" >&2
	exit 1
fi

AppPath="$(find "$BundleDir" -maxdepth 1 -name "*.app" 2>/dev/null | head -1)"

if [ -z "$AppPath" ]; then
	echo "[SignBundle] WARNING: No .app found in $BundleDir - skipping sign step"
	exit 0
fi

AppName="$(basename "$AppPath")"

# Ship the Air daemon inside the bundle so AirStart.rs's
# `resolve("Air", BaseDirectory::Resource)` finds it in packaged builds.
# Copied here (not via tauri.conf.json resources) because Air is optional:
# a missing binary must not fail `tauri build` - AirStart degrades
# gracefully. Must run BEFORE codesign so the signature covers it.
AirBinary="Element/Air/Target/${BundleLevel}/Air"
if [ -f "$AirBinary" ]; then
	echo "[SignBundle] Bundling Air daemon from $AirBinary"
	cp "$AirBinary" "$AppPath/Contents/Resources/Air"
	chmod +x "$AppPath/Contents/Resources/Air"
else
	echo "[SignBundle] Air binary not found at $AirBinary - bundle ships without Air"
fi

echo "[SignBundle] Signing $AppName ($BundleLevel)"

# Strip macOS extended attributes (Finder info, resource forks) that cause
# codesign to fail with "detritus not allowed".
xattr -cr "$AppPath"

if codesign \
	--force \
	--deep \
	--sign - \
	--entitlements "$Entitlements" \
	"$AppPath"; then
	echo "[SignBundle] Signed OK: $AppPath"
else
	echo "[SignBundle] ERROR: codesign failed for $AppPath" >&2
	exit 1
fi

if [ -n "${CopyToDesktop}" ]; then
	Dest="$HOME/Desktop/$AppName"
	echo "[SignBundle] Copying to Desktop: $Dest"
	rm -rf "$Dest"
	cp -R "$AppPath" "$Dest"
	xattr -cr "$Dest"
	codesign --force --deep --sign - --entitlements "$Entitlements" "$Dest" &&
		echo "[SignBundle] Desktop copy signed OK" ||
		echo "[SignBundle] WARNING: Desktop copy re-sign failed (non-fatal)"
fi
