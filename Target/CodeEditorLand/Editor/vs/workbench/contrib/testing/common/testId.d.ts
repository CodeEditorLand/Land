export declare const enum TestIdPathParts {
    Delimiter = "\0"
}
export declare const enum TestPosition {
    IsSame = 0,
    Disconnected = 1,
    IsChild = 2,
    IsParent = 3
}
type TestItemLike = {
    id: string;
    parent?: TestItemLike;
    _isRoot?: boolean;
};
export declare class TestId {
    readonly path: readonly string[];
    private readonly viewEnd;
    private stringifed?;
    static fromExtHostTestItem(item: TestItemLike, rootId: string, parent?: TestItemLike | undefined): TestId;
    static isRoot(idString: string): boolean;
    static root(idString: string): string;
    static fromString(idString: string): TestId;
    static join(base: TestId, b: string): TestId;
    static joinToString(base: string | TestId, b: string): string;
    static parentId(idString: string): string | undefined;
    static localId(idString: string): string;
    static isChild(maybeParent: string, maybeChild: string): boolean;
    static compare(a: string, b: string): TestPosition;
    static getLengthOfCommonPrefix(length: number, getId: (i: number) => TestId): number;
    constructor(path: readonly string[], viewEnd?: number);
    get rootId(): TestId;
    get parentId(): TestId | undefined;
    get localId(): string | undefined;
    get controllerId(): string | undefined;
    get isRoot(): boolean;
    idsFromRoot(): Generator<TestId, void, unknown>;
    idsToRoot(): Generator<TestId, void, unknown>;
    compare(other: TestId | string): TestPosition;
    toJSON(): string | undefined;
    toString(): string | undefined;
}
export {};
