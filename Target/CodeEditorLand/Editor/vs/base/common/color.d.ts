export declare class RGBA {
    _rgbaBrand: void;
    /**
     * Red: integer in [0-255]
     */
    readonly r: number;
    /**
     * Green: integer in [0-255]
     */
    readonly g: number;
    /**
     * Blue: integer in [0-255]
     */
    readonly b: number;
    /**
     * Alpha: float in [0-1]
     */
    readonly a: number;
    constructor(r: number, g: number, b: number, a?: number);
    static equals(a: RGBA, b: RGBA): boolean;
}
export declare class HSLA {
    _hslaBrand: void;
    /**
     * Hue: integer in [0, 360]
     */
    readonly h: number;
    /**
     * Saturation: float in [0, 1]
     */
    readonly s: number;
    /**
     * Luminosity: float in [0, 1]
     */
    readonly l: number;
    /**
     * Alpha: float in [0, 1]
     */
    readonly a: number;
    constructor(h: number, s: number, l: number, a: number);
    static equals(a: HSLA, b: HSLA): boolean;
    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h in the set [0, 360], s, and l in the set [0, 1].
     */
    static fromRGBA(rgba: RGBA): HSLA;
    private static _hue2rgb;
    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h in the set [0, 360] s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     */
    static toRGBA(hsla: HSLA): RGBA;
}
export declare class HSVA {
    _hsvaBrand: void;
    /**
     * Hue: integer in [0, 360]
     */
    readonly h: number;
    /**
     * Saturation: float in [0, 1]
     */
    readonly s: number;
    /**
     * Value: float in [0, 1]
     */
    readonly v: number;
    /**
     * Alpha: float in [0, 1]
     */
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
    /**
     * http://www.w3.org/TR/WCAG20/#relativeluminancedef
     * Returns the number in the set [0, 1]. O => Darkest Black. 1 => Lightest white.
     */
    getRelativeLuminance(): number;
    /**
     * Reduces the "foreground" color on this "background" color unti it is
     * below the relative luminace ratio.
     * @returns the new foreground color
     * @see https://github.com/xtermjs/xterm.js/blob/44f9fa39ae03e2ca6d28354d88a399608686770e/src/common/Color.ts#L315
     */
    reduceRelativeLuminace(foreground: Color, ratio: number): Color;
    /**
     * Increases the "foreground" color on this "background" color unti it is
     * below the relative luminace ratio.
     * @returns the new foreground color
     * @see https://github.com/xtermjs/xterm.js/blob/44f9fa39ae03e2ca6d28354d88a399608686770e/src/common/Color.ts#L335
     */
    increaseRelativeLuminace(foreground: Color, ratio: number): Color;
    private static _relativeLuminanceForComponent;
    /**
     * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
     * Returns the contrast ration number in the set [1, 21].
     */
    getContrastRatio(another: Color): number;
    /**
     *	http://24ways.org/2010/calculating-color-contrast
     *  Return 'true' if darker color otherwise 'false'
     */
    isDarker(): boolean;
    /**
     *	http://24ways.org/2010/calculating-color-contrast
     *  Return 'true' if lighter color otherwise 'false'
     */
    isLighter(): boolean;
    isLighterThan(another: Color): boolean;
    isDarkerThan(another: Color): boolean;
    /**
     * Based on xterm.js: https://github.com/xtermjs/xterm.js/blob/44f9fa39ae03e2ca6d28354d88a399608686770e/src/common/Color.ts#L288
     *
     * Given a foreground color and a background color, either increase or reduce the luminance of the
     * foreground color until the specified contrast ratio is met. If pure white or black is hit
     * without the contrast ratio being met, go the other direction using the background color as the
     * foreground color and take either the first or second result depending on which has the higher
     * contrast ratio.
     *
     * @param foreground The foreground color.
     * @param ratio The contrast ratio to achieve.
     * @returns The adjusted foreground color.
     */
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
            /**
             * Formats the color as #RRGGBB
             */
            function formatHex(color: Color): string;
            /**
             * Formats the color as #RRGGBBAA
             * If 'compact' is set, colors without transparancy will be printed as #RRGGBB
             */
            function formatHexA(color: Color, compact?: boolean): string;
            /**
             * The default format will use HEX if opaque and RGBA otherwise.
             */
            function format(color: Color): string;
            /**
             * Converts an Hex color value to a Color.
             * returns r, g, and b are contained in the set [0, 255]
             * @param hex string (#RGB, #RGBA, #RRGGBB or #RRGGBBAA).
             */
            function parseHex(hex: string): Color | null;
        }
    }
}
