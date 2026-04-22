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

# Defaults mirror .env.Land.Sample so standalone invocations still work.
ProductVersion="${ProductVersion:-1.118.0}"
ProductCommit="${ProductCommit:-dev}"
ProductQuality="${ProductQuality:-development}"
ProductNameShort="${ProductNameShort:-Land}"
ProductNameLong="${ProductNameLong:-Land Editor}"
ProductApplicationName="${ProductApplicationName:-land}"
ProductDataFolderName="${ProductDataFolderName:-.land}"
ProductUrlProtocol="${ProductUrlProtocol:-land}"
ProductServerApplicationName="${ProductServerApplicationName:-land-server}"
ProductEmbedderIdentifier="${ProductEmbedderIdentifier:-land-desktop}"

export ProductVersion ProductCommit ProductQuality ProductNameShort \
	ProductNameLong ProductApplicationName ProductDataFolderName \
	ProductUrlProtocol ProductServerApplicationName ProductEmbedderIdentifier

Target="$LandRoot/Element/Sky/Public/product.json"
export Target

mkdir -p "$(dirname "$Target")"

if ! command -v node >/dev/null 2>&1; then
	echo "[ResolveProductConfig] node unavailable - skipping." >&2
	exit 0
fi

node -e '
const fs = require("node:fs");
const Target = process.env.Target;
let Existing = {};
try {
	Existing = JSON.parse(fs.readFileSync(Target, "utf8"));
} catch {
	// Missing or malformed - overlay becomes the whole file.
}
const Overlay = {
	nameShort: process.env.ProductNameShort,
	nameLong: process.env.ProductNameLong,
	applicationName: process.env.ProductApplicationName,
	dataFolderName: process.env.ProductDataFolderName,
	version: process.env.ProductVersion,
	commit: process.env.ProductCommit,
	date: new Date().toISOString(),
	quality: process.env.ProductQuality,
	urlProtocol: process.env.ProductUrlProtocol,
	embedderIdentifier: process.env.ProductEmbedderIdentifier,
	serverApplicationName: process.env.ProductServerApplicationName,
};
// Drop any undefined fields so they do not wipe existing values on merge.
for (const Key of Object.keys(Overlay)) {
	if (Overlay[Key] === undefined) delete Overlay[Key];
}
const Merged = { ...Existing, ...Overlay };
fs.writeFileSync(Target, JSON.stringify(Merged, null, "\t") + "\n");
console.log("[ResolveProductConfig] merged " + Target + " version=" + Merged.version + " name=" + Merged.nameShort);
'
