import { Color } from '../../../../base/common/color.js';
import { ExtensionData, ITokenColorCustomizations, ITextMateThemingRule, IWorkbenchColorTheme, IThemeExtensionPoint, IColorCustomizations, ISemanticTokenColorCustomizations, IThemeScopableCustomizations, IThemeScopedCustomizations } from './workbenchThemeService.js';
import { ColorIdentifier } from '../../../../platform/theme/common/colorRegistry.js';
import { ITokenStyle } from '../../../../platform/theme/common/themeService.js';
import { URI } from '../../../../base/common/uri.js';
import { TokenStyle, SemanticTokenRule, ProbeScope, TokenStyleValue, TokenStyleData } from '../../../../platform/theme/common/tokenClassificationRegistry.js';
import { IExtensionResourceLoaderService } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ThemeConfiguration } from './themeConfiguration.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
export type TokenStyleDefinition = SemanticTokenRule | ProbeScope[] | TokenStyleValue;
export type TokenStyleDefinitions = {
    [P in keyof TokenStyleData]?: TokenStyleDefinition | undefined;
};
export type TextMateThemingRuleDefinitions = {
    [P in keyof TokenStyleData]?: ITextMateThemingRule | undefined;
} & {
    scope?: ProbeScope;
};
export declare class ColorThemeData implements IWorkbenchColorTheme {
    static readonly STORAGE_KEY = "colorThemeData";
    id: string;
    label: string;
    settingsId: string;
    description?: string;
    isLoaded: boolean;
    location?: URI;
    watch?: boolean;
    extensionData?: ExtensionData;
    private themeSemanticHighlighting;
    private customSemanticHighlighting;
    private customSemanticHighlightingDeprecated;
    private themeTokenColors;
    private customTokenColors;
    private colorMap;
    private customColorMap;
    private semanticTokenRules;
    private customSemanticTokenRules;
    private themeTokenScopeMatchers;
    private customTokenScopeMatchers;
    private textMateThemingRules;
    private tokenColorIndex;
    private constructor();
    get semanticHighlighting(): boolean;
    get tokenColors(): ITextMateThemingRule[];
    getColor(colorId: ColorIdentifier, useDefault?: boolean): Color | undefined;
    private getTokenStyle;
    resolveTokenStyleValue(tokenStyleValue: TokenStyleValue | undefined): TokenStyle | undefined;
    getTokenColorIndex(): TokenColorIndex;
    get tokenColorMap(): string[];
    getTokenStyleMetadata(typeWithLanguage: string, modifiers: string[], defaultLanguage: string, useDefault?: boolean, definitions?: TokenStyleDefinitions): ITokenStyle | undefined;
    getTokenStylingRuleScope(rule: SemanticTokenRule): 'setting' | 'theme' | undefined;
    getDefault(colorId: ColorIdentifier): Color | undefined;
    resolveScopes(scopes: ProbeScope[], definitions?: TextMateThemingRuleDefinitions): TokenStyle | undefined;
    defines(colorId: ColorIdentifier): boolean;
    setCustomizations(settings: ThemeConfiguration): void;
    setCustomColors(colors: IColorCustomizations): void;
    private overwriteCustomColors;
    setCustomTokenColors(customTokenColors: ITokenColorCustomizations): void;
    setCustomSemanticTokenColors(semanticTokenColors: ISemanticTokenColorCustomizations | undefined): void;
    isThemeScope(key: string): boolean;
    isThemeScopeMatch(themeId: string): boolean;
    getThemeSpecificColors(colors: IThemeScopableCustomizations): IThemeScopedCustomizations | undefined;
    private readSemanticTokenRules;
    private addCustomTokenColors;
    ensureLoaded(extensionResourceLoaderService: IExtensionResourceLoaderService): Promise<void>;
    reload(extensionResourceLoaderService: IExtensionResourceLoaderService): Promise<void>;
    private load;
    clearCaches(): void;
    toStorage(storageService: IStorageService): void;
    get baseTheme(): string;
    get classNames(): string[];
    get type(): ColorScheme;
    static createUnloadedThemeForThemeType(themeType: ColorScheme, colorMap?: {
        [id: string]: string;
    }): ColorThemeData;
    static createUnloadedTheme(id: string, colorMap?: {
        [id: string]: string;
    }): ColorThemeData;
    static createLoadedEmptyTheme(id: string, settingsId: string): ColorThemeData;
    static fromStorageData(storageService: IStorageService): ColorThemeData | undefined;
    static fromExtensionTheme(theme: IThemeExtensionPoint, colorThemeLocation: URI, extensionData: ExtensionData): ColorThemeData;
}
export declare function findMetadata(colorThemeData: ColorThemeData, captureNames: string[], languageId: number): number;
declare class TokenColorIndex {
    private _lastColorId;
    private _id2color;
    private _color2id;
    constructor();
    add(color: string | Color | undefined): number;
    get(color: string | Color | undefined): number;
    asArray(): string[];
}
export {};
