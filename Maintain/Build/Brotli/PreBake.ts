#!/usr/bin/env node
/**
 * LAND-PATCH B7.P07: brotli pre-bake bundled workbench assets.
 *
 * Walks the Sky bundle output and writes `<file>.br` siblings for
 * compressible files. Idempotent: skips files whose `.br` sibling
 * is newer than the source.
 *
 * The Mountain runtime mmap cache (Patch 01) auto-discovers each
 * sibling and serves it with `Content-Encoding: br` when the
 * scheme handler request offers brotli in `Accept-Encoding`.
 *
 */
import { promises as Filesystem } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants } from "node:zlib";

// Resolve the Land repo root from this script's own location -
// `Land/Maintain/Build/Brotli/PreBake.ts` -> `Land/`. Keeps the
// pre-bake step reproducible across machines, CI runners, and
// worktrees.
const RepoRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);

const BundleRoots = [
	join(RepoRoot, "Element/Sky/Target/Static/Application"),
	join(RepoRoot, "Element/Sky/Target/_astro"),
];

const Compressible = new globalThis.Set([
	".js",
	".mjs",
	".cjs",
	".css",
	".html",
	".htm",
	".svg",
	".wasm",
	".json",
	".map",
	".txt",
	".md",
]);

const MinimumSize = 4 * 1024;

const MinimumSavingsRatio = 0.05;

interface ProcessResult {
	Path: string;

	OriginalBytes: number;

	CompressedBytes: number;

	Skipped: boolean;
}

async function Walk(Root: string): Promise<Array<string>> {
	const Out: Array<string> = [];

	const Stack: Array<string> = [Root];

	while (Stack.length > 0) {
		const Current = Stack.pop() as string;

		let Entries;

		try {
			Entries = await Filesystem.readdir(Current, {
				withFileTypes: true,
			});
		} catch {
			continue;
		}

		for (const Entry of Entries) {
			const Full = join(Current, Entry.name);

			if (Entry.isDirectory()) Stack.push(Full);
			else if (Entry.isFile()) Out.push(Full);
		}
	}

	return Out;
}

async function ProcessFile(Path: string): Promise<ProcessResult> {
	const Extension = Path.slice(Path.lastIndexOf("."));

	if (!Compressible.has(Extension))
		return { Path, OriginalBytes: 0, CompressedBytes: 0, Skipped: true };

	if (Path.endsWith(".br"))
		return { Path, OriginalBytes: 0, CompressedBytes: 0, Skipped: true };

	const Stat = await Filesystem.stat(Path);

	if (Stat.size < MinimumSize)
		return {
			Path,
			OriginalBytes: Stat.size,
			CompressedBytes: 0,
			Skipped: true,
		};

	const Sibling = `${Path}.br`;

	const SiblingStat = await Filesystem.stat(Sibling).catch(() => null);

	if (SiblingStat && SiblingStat.mtimeMs > Stat.mtimeMs) {
		return {
			Path,
			OriginalBytes: Stat.size,
			CompressedBytes: SiblingStat.size,
			Skipped: true,
		};
	}

	const Source = await Filesystem.readFile(Path);

	const Compressed = brotliCompressSync(Source, {
		params: {
			[constants.BROTLI_PARAM_QUALITY]: 11,
			[constants.BROTLI_PARAM_LGWIN]: 24,
			[constants.BROTLI_PARAM_MODE]:
				Extension === ".js" ||
				Extension === ".mjs" ||
				Extension === ".cjs" ||
				Extension === ".css" ||
				Extension === ".html"
					? constants.BROTLI_MODE_TEXT
					: constants.BROTLI_MODE_GENERIC,
		},
	});

	const SavingsRatio = 1 - Compressed.byteLength / Source.byteLength;

	if (SavingsRatio < MinimumSavingsRatio) {
		return {
			Path,
			OriginalBytes: Source.byteLength,
			CompressedBytes: Compressed.byteLength,
			Skipped: true,
		};
	}

	await Filesystem.writeFile(Sibling, Compressed);

	return {
		Path,
		OriginalBytes: Source.byteLength,
		CompressedBytes: Compressed.byteLength,
		Skipped: false,
	};
}

async function Main() {
	let TotalOriginal = 0;

	let TotalCompressed = 0;

	let Wrote = 0;

	let Skipped = 0;

	for (const Root of BundleRoots) {
		try {
			await Filesystem.access(Root);
		} catch {
			continue;
		}

		const Files = await Walk(Root);

		for (const File of Files) {
			const Result = await ProcessFile(File);

			if (Result.Skipped) {
				Skipped++;

				continue;
			}

			Wrote++;

			TotalOriginal += Result.OriginalBytes;

			TotalCompressed += Result.CompressedBytes;
		}
	}

	const Pct =
		TotalOriginal > 0
			? ((1 - TotalCompressed / TotalOriginal) * 100) | 0
			: 0;

	console.log(
		`[Brotli] wrote=${Wrote} skipped=${Skipped} ${TotalOriginal} -> ${TotalCompressed} bytes (${Pct}% reduction)`,
	);
}

Main().catch((Error: unknown) => {
	console.error(Error);

	process.exit(1);
});
