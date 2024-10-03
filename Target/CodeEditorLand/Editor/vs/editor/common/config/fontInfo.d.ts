import { EditorOption, FindComputedEditorOptionValueById } from './editorOptions.js';
export interface IValidatedEditorOptions {
    get<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
}
export declare class BareFontInfo {
    readonly _bareFontInfoBrand: void;
    static createFromValidatedSettings(options: IValidatedEditorOptions, pixelRatio: number, ignoreEditorZoom: boolean): BareFontInfo;
    static createFromRawSettings(opts: {
        fontFamily?: string;
        fontWeight?: string;
        fontSize?: number;
        fontLigatures?: boolean | string;
        fontVariations?: boolean | string;
        lineHeight?: number;
        letterSpacing?: number;
    }, pixelRatio: number, ignoreEditorZoom?: boolean): BareFontInfo;
    private static _create;
    readonly pixelRatio: number;
    readonly fontFamily: string;
    readonly fontWeight: string;
    readonly fontSize: number;
    readonly fontFeatureSettings: string;
    readonly fontVariationSettings: string;
    readonly lineHeight: number;
    readonly letterSpacing: number;
    protected constructor(opts: {
        pixelRatio: number;
        fontFamily: string;
        fontWeight: string;
        fontSize: number;
        fontFeatureSettings: string;
        fontVariationSettings: string;
        lineHeight: number;
        letterSpacing: number;
    });
    getId(): string;
    getMassagedFontFamily(): string;
    private static _wrapInQuotes;
}
export declare const SERIALIZED_FONT_INFO_VERSION = 2;
export declare class FontInfo extends BareFontInfo {
    readonly _editorStylingBrand: void;
    readonly version: number;
    readonly isTrusted: boolean;
    readonly isMonospace: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly typicalFullwidthCharacterWidth: number;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly spaceWidth: number;
    readonly middotWidth: number;
    readonly wsmiddotWidth: number;
    readonly maxDigitWidth: number;
    constructor(opts: {
        pixelRatio: number;
        fontFamily: string;
        fontWeight: string;
        fontSize: number;
        fontFeatureSettings: string;
        fontVariationSettings: string;
        lineHeight: number;
        letterSpacing: number;
        isMonospace: boolean;
        typicalHalfwidthCharacterWidth: number;
        typicalFullwidthCharacterWidth: number;
        canUseHalfwidthRightwardsArrow: boolean;
        spaceWidth: number;
        middotWidth: number;
        wsmiddotWidth: number;
        maxDigitWidth: number;
    }, isTrusted: boolean);
    equals(other: FontInfo): boolean;
}
