#!/usr/bin/env node
/**
 * LAND-PATCH B7.P08: extension manifest pre-bake (rkyv cache).
 *
 * Walks every extension directory that Mountain scans at boot, reads each
 * `package.json`, and writes a single compact JSON blob to
 * `Element/Mountain/Target/debug/extensions.manifest.json`.
 *
 * Mountain's `LoadFromCache.rs` mmaps this blob at startup and returns
 * the pre-parsed extension descriptors. This short-circuits the sequential
 * disk scan that currently costs ~1200 ms on cold boot.
 *
 * Idempotent: regenerates the cache whenever any `package.json` in the
 * extension roots is newer than the manifest file.
 *
 * Usage (called from Maintain/Debug/Build.sh after Brotli step):
 *   node Maintain/Build/Manifest/PreBake.js
 */

import { promises as Fs } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const RepoRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);

// Mirror the scan paths from Mountain's ScanPathConfigure.rs
const Home = homedir();
const ExtensionRoots: string[] = [
	join(RepoRoot, "Element/Sky/Target/Static/Application/extensions"),
	join(Home, ".land/extensions"),
	join(Home, ".fiddee/extensions"),
	join(Home, ".vscode/extensions"),
];

const OutputPath = join(
	RepoRoot,
	"Element/Mountain/Target/debug/extensions.manifest.json",
);

interface ExtManifest {
	name?: string;
	displayName?: string;
	description?: string;
	version?: string;
	publisher?: string;
	main?: string;
	type?: string;
	activationEvents?: string[];
	extensionDependencies?: string[];
	contributes?: unknown;
	engines?: { vscode?: string };
	categories?: string[];
	[key: string]: unknown;
}

interface CachedExtension {
	// Identifier in the form "publisher.name"
	id: string;
	// Filesystem path to the extension root
	path: string;
	// Parsed package.json contents
	manifest: ExtManifest;
}

const LoadNLS = async (ExtPath: string): Promise<Record<string, string>> => {
	try {
		const Raw = await Fs.readFile(join(ExtPath, "package.nls.json"), "utf8");
		const Parsed = JSON.parse(Raw) as Record<string, unknown>;
		const Result: Record<string, string> = {};
		for (const [Key, Val] of Object.entries(Parsed)) {
			if (typeof Val === "string") Result[Key] = Val;
			else if (Val && typeof Val === "object" && "message" in Val && typeof (Val as { message: unknown }).message === "string")
				Result[Key] = (Val as { message: string }).message;
		}
		return Result;
	} catch {
		return {};
	}
};

const ResolveNLS = (Value: unknown, NLS: Record<string, string>): unknown => {
	if (typeof Value === "string") {
		if (Value.startsWith("%") && Value.endsWith("%") && Value.length > 2) {
			const Key = Value.slice(1, -1);
			return NLS[Key] ?? Value;
		}
		return Value;
	}
	if (Array.isArray(Value)) return Value.map((V) => ResolveNLS(V, NLS));
	if (Value && typeof Value === "object") {
		const Out: Record<string, unknown> = {};
		for (const [K, V] of Object.entries(Value as Record<string, unknown>))
			Out[K] = ResolveNLS(V, NLS);
		return Out;
	}
	return Value;
};

const ScanRoot = async (Root: string): Promise<CachedExtension[]> => {
	let Entries: string[] = [];
	try {
		Entries = (await Fs.readdir(Root)).filter((E) => !E.startsWith("."));
	} catch {
		// Root doesn't exist or isn't readable - skip silently.
		return [];
	}

	const Results: CachedExtension[] = [];

	for (const Entry of Entries) {
		const ExtPath = join(Root, Entry);
		const ManifestPath = join(ExtPath, "package.json");
		try {
			const Raw = await Fs.readFile(ManifestPath, "utf8");
			let Manifest = JSON.parse(Raw) as ExtManifest;

			// Resolve NLS placeholders (%key%) against package.nls.json
			const NLS = await LoadNLS(ExtPath);
			if (Object.keys(NLS).length > 0)
				Manifest = ResolveNLS(Manifest, NLS) as ExtManifest;

			const Publisher = Manifest.publisher ?? Entry.split(".")[0] ?? "unknown";
			const Name =
				Manifest.name ?? Entry.split(".").slice(1).join(".") ?? Entry;
			const Id = `${Publisher}.${Name}`;

			Results.push({ id: Id, path: ExtPath, manifest: Manifest });
		} catch {
			// Skip extensions with no / invalid package.json
		}
	}

	return Results;
};

const Run = async (): Promise<void> => {
	const Start = Date.now();

	// Collect from all roots (deduplicate by id, first-seen wins).
	const Seen = new globalThis.Set<string>();
	const All: CachedExtension[] = [];

	for (const Root of ExtensionRoots) {
		const Batch = await ScanRoot(Root);
		for (const Ext of Batch) {
			if (!Seen.has(Ext.id)) {
				Seen.add(Ext.id);
				All.push(Ext);
			}
		}
	}

	if (All.length === 0) {
		process.stdout.write(
			"[Manifest:PreBake] No extensions found - skipping cache write.\n",
		);
		return;
	}

	// Check whether the cache is already fresh (all package.json files older
	// than the manifest) to keep rebuild times minimal.
	let CacheMtime = 0;
	try {
		CacheMtime = (await Fs.stat(OutputPath)).mtimeMs;
	} catch {
		/* no cache yet */
	}

	let AnyNewer = false;
	for (const Ext of All) {
		try {
			const Mtime = (await Fs.stat(join(Ext.path, "package.json"))).mtimeMs;
			if (Mtime > CacheMtime) {
				AnyNewer = true;
				break;
			}
		} catch {
			AnyNewer = true;
			break;
		}
	}

	if (!AnyNewer) {
		process.stdout.write(
			`[Manifest:PreBake] Cache is up-to-date (${All.length} extensions). Skipping.\n`,
		);
		return;
	}

	// Write the blob. Format:
	//   { version: 1, count: N, extensions: [ { id, path, manifest } ] }
	// Mountain reads this with serde_json::from_slice after mmap.
	const Blob = JSON.stringify({
		version: 1,
		count: All.length,
		extensions: All,
	});

	await Fs.mkdir(dirname(OutputPath), { recursive: true });
	await Fs.writeFile(OutputPath, Blob, "utf8");

	const Elapsed = Date.now() - Start;
	process.stdout.write(
		`[Manifest:PreBake] Wrote ${All.length} extensions to ${OutputPath} in ${Elapsed}ms.\n`,
	);
};

void Run().catch((Err: unknown) => {
	const Msg = Err instanceof Error ? Err.message : String(Err);
	process.stderr.write(`[Manifest:PreBake] Fatal: ${Msg}\n`);
	process.exit(1);
});
