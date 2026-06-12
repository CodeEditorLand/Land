#!/usr/bin/env sh

#===============================================================================
# Maintain/Script/ResolveProductConfig.sh - Product identity fan-out (Atom I5)
#===============================================================================
#
# Reads Product* env vars (pre-loaded by TierEnvironment.sh from .env.Land)
# and MERGES the resolved values into Sky/Public/product.json, preserving
# every existing field (licenseUrl, extensionsGallery, darwinBundleIdentifier,
# …). Runtime consumers that fetch /product.json then see one coherent set.
#
# IDEMPOTENT + PURE: same env + same starting file → same output.
#===============================================================================

set -e

ScriptDir="$(cd "$(dirname "$0")" && pwd)"
LandRoot="$(cd "$ScriptDir/../.." && pwd)"

# Defaults mirror .env.Land so standalone invocations still work.
ProductVersion="${ProductVersion:-1.118.0}"
ProductCommit="${ProductCommit:-dev}"
ProductQuality="${ProductQuality:-development}"
ProductNameShort="${ProductNameShort:-FIDDEE}"
ProductNameLong="${ProductNameLong:-FIDDEE}"
ProductApplicationName="${ProductApplicationName:-fiddee}"
ProductDataFolderName="${ProductDataFolderName:-.fiddee}"
ProductUrlProtocol="${ProductUrlProtocol:-fiddee}"
ProductServerApplicationName="${ProductServerApplicationName:-fiddee-server}"
ProductEmbedderIdentifier="${ProductEmbedderIdentifier:-fiddee-desktop}"
# ProductFlavor — 10-char build flavor code (≤10 chars after fiddee-).
# Default encodes all tiers as Mountain with Tasks/Auth=Node, WS=Disabled.
# Set ProductFlavorLong=true to use human-readable flavor names instead.
ProductFlavor="${ProductFlavor:-IWTNMMMMMM}"
ProductFlavorLong="${ProductFlavorLong:-false}"

export ProductVersion ProductCommit ProductQuality ProductNameShort \
	ProductNameLong ProductApplicationName ProductDataFolderName \
	ProductUrlProtocol ProductServerApplicationName ProductEmbedderIdentifier \
	ProductFlavor ProductFlavorLong

Target="$LandRoot/Element/Sky/Public/product.json"
export Target

mkdir -p "$(dirname "$Target")"

if ! command -v node > /dev/null 2>&1; then
	echo "[ResolveProductConfig] node unavailable - skipping." >&2
	exit 0
fi

node -e '
const fs = require("node:fs");
const Target = process.env.Target;
let Existing = {};
try {
	Existing = JSON.parse(fs.readFileSync(Target, "utf-8"));
} catch (_) {}

// Build flavor identifier: fiddee-<10char> or fiddee-<long name>
const Flavor = process.env.ProductFlavor || "IWTNMMMMMM";
const UseLong = process.env.ProductFlavorLong === "true";

Existing.nameShort = process.env.ProductNameShort || "FIDDEE";
Existing.nameLong = process.env.ProductNameLong || "FIDDEE";
Existing.applicationName = UseLong
	? `fiddee-${process.env.ProductFlavor || "F8"}`
	: `fiddee-${Flavor}`;
Existing.dataFolderName = UseLong
	? `.fiddee-${process.env.ProductFlavor || "F8"}`
	: `.fiddee-${Flavor}`;
Existing.urlProtocol = UseLong
	? `fiddee-${process.env.ProductFlavor || "F8"}`
	: `fiddee-${Flavor}`;
Existing.serverApplicationName = UseLong
	? `fiddee-${process.env.ProductFlavor || "F8"}-server`
	: `fiddee-${Flavor}-server`;
Existing.embedderIdentifier = UseLong
	? `fiddee-${process.env.ProductFlavor || "F8"}-desktop`
	: `fiddee-${Flavor}-desktop`;
Existing.version = process.env.ProductVersion || "1.118.0";
Existing.commit = process.env.ProductCommit || "dev";
Existing.quality = process.env.ProductQuality || "development";

fs.writeFileSync(Target, JSON.stringify(Existing, null, "\t") + "\n");
console.log(`[ResolveProductConfig] ${Target} — flavor=${Flavor}`);
'
