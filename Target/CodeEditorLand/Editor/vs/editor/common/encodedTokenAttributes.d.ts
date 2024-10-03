export declare const enum LanguageId {
    Null = 0,
    PlainText = 1
}
export declare const enum FontStyle {
    NotSet = -1,
    None = 0,
    Italic = 1,
    Bold = 2,
    Underline = 4,
    Strikethrough = 8
}
export declare const enum ColorId {
    None = 0,
    DefaultForeground = 1,
    DefaultBackground = 2
}
export declare const enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 3
}
export declare const enum MetadataConsts {
    LANGUAGEID_MASK = 255,
    TOKEN_TYPE_MASK = 768,
    BALANCED_BRACKETS_MASK = 1024,
    FONT_STYLE_MASK = 30720,
    FOREGROUND_MASK = 16744448,
    BACKGROUND_MASK = 4278190080,
    ITALIC_MASK = 2048,
    BOLD_MASK = 4096,
    UNDERLINE_MASK = 8192,
    STRIKETHROUGH_MASK = 16384,
    SEMANTIC_USE_ITALIC = 1,
    SEMANTIC_USE_BOLD = 2,
    SEMANTIC_USE_UNDERLINE = 4,
    SEMANTIC_USE_STRIKETHROUGH = 8,
    SEMANTIC_USE_FOREGROUND = 16,
    SEMANTIC_USE_BACKGROUND = 32,
    LANGUAGEID_OFFSET = 0,
    TOKEN_TYPE_OFFSET = 8,
    BALANCED_BRACKETS_OFFSET = 10,
    FONT_STYLE_OFFSET = 11,
    FOREGROUND_OFFSET = 15,
    BACKGROUND_OFFSET = 24
}
export declare class TokenMetadata {
    static getLanguageId(metadata: number): LanguageId;
    static getTokenType(metadata: number): StandardTokenType;
    static containsBalancedBrackets(metadata: number): boolean;
    static getFontStyle(metadata: number): FontStyle;
    static getForeground(metadata: number): ColorId;
    static getBackground(metadata: number): ColorId;
    static getClassNameFromMetadata(metadata: number): string;
    static getInlineStyleFromMetadata(metadata: number, colorMap: string[]): string;
    static getPresentationFromMetadata(metadata: number): ITokenPresentation;
}
export interface ITokenPresentation {
    foreground: ColorId;
    italic: boolean;
    bold: boolean;
    underline: boolean;
    strikethrough: boolean;
}
