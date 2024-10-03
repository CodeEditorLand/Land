export declare class IgnoreFile {
    private readonly location;
    private readonly parent?;
    private isPathIgnored;
    constructor(contents: string, location: string, parent?: IgnoreFile | undefined);
    updateContents(contents: string): void;
    isPathIncludedInTraversal(path: string, isDir: boolean): boolean;
    isArbitraryPathIgnored(path: string, isDir: boolean): boolean;
    private gitignoreLinesToExpression;
    private parseIgnoreFile;
    private gitignoreLineToGlob;
}
