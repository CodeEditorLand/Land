export declare const enum Direction {
    Left = 0,
    Right = 1,
    Nearest = 2
}
export declare class AtomicTabMoveOperations {
    static whitespaceVisibleColumn(lineContent: string, position: number, tabSize: number): [number, number, number];
    static atomicPosition(lineContent: string, position: number, tabSize: number, direction: Direction): number;
}
