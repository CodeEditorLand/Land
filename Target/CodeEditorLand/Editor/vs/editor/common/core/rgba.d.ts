export declare class RGBA8 {
    _rgba8Brand: void;
    static readonly Empty: RGBA8;
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a: number);
    equals(other: RGBA8): boolean;
    static _clamp(c: number): number;
}
