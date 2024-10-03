export declare class RGBA {
    _rgbaBrand: void;
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a?: number);
    static equals(a: RGBA, b: RGBA): boolean;
}
export declare class HSLA {
    _hslaBrand: void;
    readonly h: number;
    readonly s: number;
    readonly l: number;
    readonly a: number;
    constructor(h: number, s: number, l: number, a: number);
    static equals(a: HSLA, b: HSLA): boolean;
    static fromRGBA(rgba: RGBA): HSLA;
    private static _hue2rgb;
    static toRGBA(hsla: HSLA): RGBA;
}
export declare class HSVA {
    _hsvaBrand: void;
    readonly h: number;
    readonly s: number;
    readonly v: number;
    readonly a: number;
    constructor(h: number, s: number, v: number, a: number);
    static equals(a: HSVA, b: HSVA): boolean;
    static fromRGBA(rgba: RGBA): HSVA;
    static toRGBA(hsva: HSVA): RGBA;
}
export declare class Color {
    static fromHex(hex: string): Color;
    static equals(a: Color | null, b: Color | null): boolean;
    readonly rgba: RGBA;
    private _hsla?;
    get hsla(): HSLA;
    private _hsva?;
    get hsva(): HSVA;
    constructor(arg: RGBA | HSLA | HSVA);
    equals(other: Color | null): boolean;
    getRelativeLuminance(): number;
    reduceRelativeLuminace(foreground: Color, ratio: number): Color;
    increaseRelativeLuminace(foreground: Color, ratio: number): Color;
    private static _relativeLuminanceForComponent;
    getContrastRatio(another: Color): number;
    isDarker(): boolean;
    isLighter(): boolean;
    isLighterThan(another: Color): boolean;
    isDarkerThan(another: Color): boolean;
    ensureConstrast(foreground: Color, ratio: number): Color;
    lighten(factor: number): Color;
    darken(factor: number): Color;
    transparent(factor: number): Color;
    isTransparent(): boolean;
    isOpaque(): boolean;
    opposite(): Color;
    blend(c: Color): Color;
    makeOpaque(opaqueBackground: Color): Color;
    flatten(...backgrounds: Color[]): Color;
    private static _flatten;
    private _toString?;
    toString(): string;
    static getLighterColor(of: Color, relative: Color, factor?: number): Color;
    static getDarkerColor(of: Color, relative: Color, factor?: number): Color;
    static readonly white: Color;
    static readonly black: Color;
    static readonly red: Color;
    static readonly blue: Color;
    static readonly green: Color;
    static readonly cyan: Color;
    static readonly lightgrey: Color;
    static readonly transparent: Color;
}
export declare namespace Color {
    namespace Format {
        namespace CSS {
            function formatRGB(color: Color): string;
            function formatRGBA(color: Color): string;
            function formatHSL(color: Color): string;
            function formatHSLA(color: Color): string;
            function formatHex(color: Color): string;
            function formatHexA(color: Color, compact?: boolean): string;
            function format(color: Color): string;
            function parseHex(hex: string): Color | null;
        }
    }
}
