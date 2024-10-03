export interface IPosition {
    readonly lineNumber: number;
    readonly column: number;
}
export declare class Position {
    readonly lineNumber: number;
    readonly column: number;
    constructor(lineNumber: number, column: number);
    with(newLineNumber?: number, newColumn?: number): Position;
    delta(deltaLineNumber?: number, deltaColumn?: number): Position;
    equals(other: IPosition): boolean;
    static equals(a: IPosition | null, b: IPosition | null): boolean;
    isBefore(other: IPosition): boolean;
    static isBefore(a: IPosition, b: IPosition): boolean;
    isBeforeOrEqual(other: IPosition): boolean;
    static isBeforeOrEqual(a: IPosition, b: IPosition): boolean;
    static compare(a: IPosition, b: IPosition): number;
    clone(): Position;
    toString(): string;
    static lift(pos: IPosition): Position;
    static isIPosition(obj: any): obj is IPosition;
    toJSON(): IPosition;
}
