type FilenameAttributes = {
    basename: string;
    extname: string;
    dirname: string;
};
/**
 * A sort of double-ended trie, used to efficiently query for matches to "star" patterns, where
 * a given key represents a parent and may contain a capturing group ("*"), which can then be
 * referenced via the token "$(capture)" in associated child patterns.
 *
 * The generated tree will have at most two levels, as subtrees are flattened rather than nested.
 *
 * Example:
 * The config: [
 * [ *.ts , [ $(capture).*.ts ; $(capture).js ] ]
 * [ *.js , [ $(capture).min.js ] ] ]
 * Nests the files: [ a.ts ; a.d.ts ; a.js ; a.min.js ; b.ts ; b.min.js ]
 * As:
 * - a.ts => [ a.d.ts ; a.js ; a.min.js ]
 * - b.ts => [ ]
 * - b.min.ts => [ ]
 */
export declare class ExplorerFileNestingTrie {
    private root;
    constructor(config: [string, string[]][]);
    toString(): string;
    private getAttributes;
    nest(files: string[], dirname: string): Map<string, Set<string>>;
}
/** Export for test only. */
export declare class PreTrie {
    private value;
    private map;
    constructor();
    add(key: string, value: string): void;
    get(key: string, attributes: FilenameAttributes): string[];
    toString(indentation?: string): string;
}
/** Export for test only. */
export declare class SufTrie {
    private star;
    private epsilon;
    private map;
    hasItems: boolean;
    constructor();
    add(key: string, value: string): void;
    get(key: string, attributes: FilenameAttributes): string[];
    toString(indentation?: string): string;
}
export {};
