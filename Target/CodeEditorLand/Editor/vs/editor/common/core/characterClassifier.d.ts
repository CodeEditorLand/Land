export declare class CharacterClassifier<T extends number> {
    protected readonly _asciiMap: Uint8Array;
    protected readonly _map: Map<number, number>;
    protected readonly _defaultValue: number;
    constructor(_defaultValue: T);
    private static _createAsciiMap;
    set(charCode: number, _value: T): void;
    get(charCode: number): T;
    clear(): void;
}
export declare class CharacterSet {
    private readonly _actual;
    constructor();
    add(charCode: number): void;
    has(charCode: number): boolean;
    clear(): void;
}
