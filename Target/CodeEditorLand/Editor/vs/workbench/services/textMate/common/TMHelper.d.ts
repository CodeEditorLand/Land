export interface IColorTheme {
    readonly tokenColors: ITokenColorizationRule[];
}
export interface ITokenColorizationRule {
    name?: string;
    scope?: string | string[];
    settings: ITokenColorizationSetting;
}
export interface ITokenColorizationSetting {
    foreground?: string;
    background?: string;
    fontStyle?: string;
}
export declare function findMatchingThemeRule(theme: IColorTheme, scopes: string[], onlyColorRules?: boolean): ThemeRule | null;
export declare class ThemeRule {
    readonly rawSelector: string;
    readonly settings: ITokenColorizationSetting;
    readonly scope: string;
    readonly parentScopes: string[];
    constructor(rawSelector: string, settings: ITokenColorizationSetting);
    matches(scope: string, parentScopes: string[]): boolean;
    private static _cmp;
    isMoreSpecific(other: ThemeRule | null): boolean;
    private static _matchesOne;
    private static _matches;
}
