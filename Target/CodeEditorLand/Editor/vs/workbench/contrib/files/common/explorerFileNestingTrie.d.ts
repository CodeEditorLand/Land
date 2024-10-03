type FilenameAttributes = {
    basename: string;
    extname: string;
    dirname: string;
};
export declare class ExplorerFileNestingTrie {
    private root;
    constructor(config: [string, string[]][]);
    toString(): string;
    private getAttributes;
    nest(files: string[], dirname: string): Map<string, Set<string>>;
}
export declare class PreTrie {
    private value;
    private map;
    constructor();
    add(key: string, value: string): void;
    get(key: string, attributes: FilenameAttributes): string[];
    toString(indentation?: string): string;
}
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
