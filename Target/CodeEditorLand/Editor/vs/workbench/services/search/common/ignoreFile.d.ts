export declare class IgnoreFile {
    private readonly location;
    private readonly parent?;
    private isPathIgnored;
    constructor(contents: string, location: string, parent?: IgnoreFile | undefined);
    /**
     * Updates the contents of the ignorefile. Preservering the location and parent
     * @param contents The new contents of the gitignore file
     */
    updateContents(contents: string): void;
    /**
     * Returns true if a path in a traversable directory has not been ignored.
     *
     * Note: For performance reasons this does not check if the parent directories have been ignored,
     * so it should always be used in tandem with `shouldTraverseDir` when walking a directory.
     *
     * In cases where a path must be tested in isolation, `isArbitraryPathIncluded` should be used.
     */
    isPathIncludedInTraversal(path: string, isDir: boolean): boolean;
    /**
     * Returns true if an arbitrary path has not been ignored.
     * This is an expensive operation and should only be used ouside of traversals.
     */
    isArbitraryPathIgnored(path: string, isDir: boolean): boolean;
    private gitignoreLinesToExpression;
    private parseIgnoreFile;
    private gitignoreLineToGlob;
}
