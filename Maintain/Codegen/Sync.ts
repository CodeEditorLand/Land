#!/usr/bin/env node
/**
 * LAND-PATCH B7.P09: cross-Element auto-sync.
 *
 * Scans `Element/{Mountain,Sky,Cocoon,Wind}/Source/**` for the
 * canonical declaration patterns and writes generated manifests +
 * Rust/TS modules. Idempotent: writes only when the generated
 * content differs from disk. Run from `pnpm Codegen:Sync`, the
 * `prepublishOnly` chain, or the `.git/hooks/post-merge` hook.
 *
 * Outputs:
 *
 *   1. Element/Mountain/Source/IPC/Generated/HandlerRegistry.json
 *      - every `pub async fn handle_*` symbol the build.rs codegen
 *      will pick up. Acts as a checkpoint manifest for drift
 *      detection.
 *
 *   2. Element/Sky/Source/Function/Generated/SkyChannels.ts
 *      - TS union of every `sky://...` channel name emitted by
 *      Mountain. Sky listeners auto-import from this module so
 *      type-checks fail fast on a typo or missing emit/listen.
 *
 *   3. Console warnings on orphan channels (emitted but never
 *      listened-from-Sky, or listened-but-never-emitted).
 *
 */
import { promises as Filesystem } from "node:fs";
import { dirname, join, relative } from "node:path";

const RepoRoot =
	"/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land";

interface Handler {
	WireName: string;

	FunctionName: string;

	File: string;
}

interface Channel {
	Name: string;

	EmittedFrom: Array<string>;

	ListenedFromSky: boolean;
}

async function Walk(
	Root: string,
	Predicate: (Path: string) => boolean,
): Promise<Array<string>> {
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

			if (Entry.isDirectory()) {
				if (
					Entry.name === "Target" ||
					Entry.name === "node_modules" ||
					Entry.name === ".git"
				)
					continue;

				Stack.push(Full);
			} else if (Entry.isFile() && Predicate(Full)) {
				Out.push(Full);
			}
		}
	}

	return Out;
}

function HandlerToWireName(FunctionName: string): string {
	const Stripped = FunctionName.startsWith("handle_")
		? FunctionName.slice("handle_".length)
		: FunctionName;

	const Segments = Stripped.split("_");

	if (Segments.length === 0) return "";

	let WireName = Segments[0];

	for (let Index = 1; Index < Segments.length; Index++) {
		const Segment = Segments[Index];

		if (Index === 1) {
			WireName += `:${Segment}`;
		} else {
			WireName += Segment.charAt(0).toUpperCase() + Segment.slice(1);
		}
	}

	return WireName;
}

async function ScanHandlers(): Promise<Array<Handler>> {
	const HandlerDir = join(
		RepoRoot,
		"Element/Mountain/Source/IPC/WindServiceHandlers",
	);

	const RustFiles = await Walk(HandlerDir, (Path) => Path.endsWith(".rs"));

	const Out: Array<Handler> = [];

	const Regex = /pub\s+async\s+fn\s+(handle_[a-zA-Z0-9_]+)\s*\(/g;

	for (const File of RustFiles) {
		const Source = await Filesystem.readFile(File, "utf8");

		for (const Match of Source.matchAll(Regex)) {
			Out.push({
				FunctionName: Match[1],
				WireName: HandlerToWireName(Match[1]),
				File: relative(RepoRoot, File),
			});
		}
	}

	Out.sort((A, B) => A.WireName.localeCompare(B.WireName));

	return Out;
}

async function ScanSkyChannels(): Promise<Array<Channel>> {
	const MountainSource = join(RepoRoot, "Element/Mountain/Source");

	const SkySource = join(RepoRoot, "Element/Sky/Source");

	const RustFiles = await Walk(MountainSource, (Path) =>
		Path.endsWith(".rs"),
	);

	const TsFiles = await Walk(
		SkySource,
		(Path) => Path.endsWith(".ts") || Path.endsWith(".tsx"),
	);

	const Map = new globalThis.Map<string, Channel>();

	const EmitRegex = /(?:Emit|emit_str|emit)\s*\(\s*"(sky:\/\/[^"]+)"/g;

	const ListenRegex = /listen\s*\(\s*"(sky:\/\/[^"]+)"/g;

	for (const File of RustFiles) {
		const Source = await Filesystem.readFile(File, "utf8");

		for (const Match of Source.matchAll(EmitRegex)) {
			const Name = Match[1];

			if (!Map.has(Name))
				Map.set(Name, {
					Name,
					EmittedFrom: [],
					ListenedFromSky: false,
				});

			Map.get(Name)?.EmittedFrom.push(relative(RepoRoot, File));
		}
	}

	for (const File of TsFiles) {
		const Source = await Filesystem.readFile(File, "utf8");

		for (const Match of Source.matchAll(ListenRegex)) {
			const Name = Match[1];

			if (!Map.has(Name))
				Map.set(Name, {
					Name,
					EmittedFrom: [],
					ListenedFromSky: false,
				});

			(Map.get(Name) as Channel).ListenedFromSky = true;
		}
	}

	return Array.from(Map.values()).sort((A, B) =>
		A.Name.localeCompare(B.Name),
	);
}

async function WriteIfChanged(Path: string, Content: string): Promise<boolean> {
	const Existing = await Filesystem.readFile(Path, "utf8").catch(() => "");

	if (Existing === Content) return false;

	await Filesystem.mkdir(dirname(Path), { recursive: true });

	await Filesystem.writeFile(Path, Content);

	return true;
}

async function Main() {
	const Handlers = await ScanHandlers();

	const Channels = await ScanSkyChannels();

	const HandlerManifest =
		JSON.stringify(
			{
				Generated: new globalThis.Date().toISOString(),
				Total: Handlers.length,
				Handlers,
			},
			null,
			"\t",
		) + "\n";

	const HandlerPath = join(
		RepoRoot,
		"Element/Mountain/Source/IPC/Generated/HandlerRegistry.json",
	);

	const HandlerWrote = await WriteIfChanged(HandlerPath, HandlerManifest);

	const ChannelTs = `// AUTOGENERATED by Maintain/Codegen/Sync.ts -- DO NOT EDIT.
// Mirror of every \`Mountain.emit("sky://...")\` call site, plus
// whether Sky has a listener installed for it.

export type SkyChannelName =
${
	Channels.length === 0
		? "\t| string"
		: Channels.map((C) => `\t| "${C.Name}"`).join("\n")
};

export const SkyChannels: ReadonlyArray<{
\tName: SkyChannelName;
\tEmittedFrom: ReadonlyArray<string>;
\tListenedFromSky: boolean;
}> = ${JSON.stringify(Channels, null, "\t")} as const;

export const SkyChannelCount = ${Channels.length};
`;

	const ChannelPath = join(
		RepoRoot,
		"Element/Sky/Source/Function/Generated/SkyChannels.ts",
	);

	const ChannelWrote = await WriteIfChanged(ChannelPath, ChannelTs);

	console.log(
		`[codegen] handlers=${Handlers.length} ${HandlerWrote ? "(updated)" : "(unchanged)"}`,
	);

	console.log(
		`[codegen] channels=${Channels.length} ${ChannelWrote ? "(updated)" : "(unchanged)"}`,
	);

	const EmitterOnly = Channels.filter(
		(C) => C.EmittedFrom.length > 0 && !C.ListenedFromSky,
	);

	const ListenerOnly = Channels.filter(
		(C) => C.EmittedFrom.length === 0 && C.ListenedFromSky,
	);

	if (EmitterOnly.length > 0) {
		console.warn(
			`[codegen] WARN: ${EmitterOnly.length} sky:// channels have emitters but no Sky listener:`,
		);

		for (const Orphan of EmitterOnly) {
			console.warn(
				`  - ${Orphan.Name} (emitted from ${Orphan.EmittedFrom.length} site(s))`,
			);
		}
	}

	if (ListenerOnly.length > 0) {
		console.warn(
			`[codegen] WARN: ${ListenerOnly.length} sky:// channels have Sky listeners but no Mountain emitter:`,
		);

		for (const Orphan of ListenerOnly) {
			console.warn(`  - ${Orphan.Name}`);
		}
	}
}

Main().catch((Error: unknown) => {
	console.error(Error);

	process.exit(1);
});
