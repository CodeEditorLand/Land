import { Event } from '../../../../base/common/event.js';
import { Color } from '../../../../base/common/color.js';
import { IColorTheme, IThemeService, IFileIconTheme, IProductIconTheme } from '../../../../platform/theme/common/themeService.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { IconContribution, IconDefinition } from '../../../../platform/theme/common/iconRegistry.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
export declare const IWorkbenchThemeService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchThemeService>;
export declare const VS_LIGHT_THEME = "vs";
export declare const VS_DARK_THEME = "vs-dark";
export declare const VS_HC_THEME = "hc-black";
export declare const VS_HC_LIGHT_THEME = "hc-light";
export declare const THEME_SCOPE_OPEN_PAREN = "[";
export declare const THEME_SCOPE_CLOSE_PAREN = "]";
export declare const THEME_SCOPE_WILDCARD = "*";
export declare const themeScopeRegex: RegExp;
export declare enum ThemeSettings {
    COLOR_THEME = "workbench.colorTheme",
    FILE_ICON_THEME = "workbench.iconTheme",
    PRODUCT_ICON_THEME = "workbench.productIconTheme",
    COLOR_CUSTOMIZATIONS = "workbench.colorCustomizations",
    TOKEN_COLOR_CUSTOMIZATIONS = "editor.tokenColorCustomizations",
    SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS = "editor.semanticTokenColorCustomizations",
    PREFERRED_DARK_THEME = "workbench.preferredDarkColorTheme",
    PREFERRED_LIGHT_THEME = "workbench.preferredLightColorTheme",
    PREFERRED_HC_DARK_THEME = "workbench.preferredHighContrastColorTheme",
    PREFERRED_HC_LIGHT_THEME = "workbench.preferredHighContrastLightColorTheme",
    DETECT_COLOR_SCHEME = "window.autoDetectColorScheme",
    DETECT_HC = "window.autoDetectHighContrast",
    SYSTEM_COLOR_THEME = "window.systemColorTheme"
}
export declare enum ThemeSettingDefaults {
    COLOR_THEME_DARK = "Default Dark Modern",
    COLOR_THEME_LIGHT = "Default Light Modern",
    COLOR_THEME_HC_DARK = "Default High Contrast",
    COLOR_THEME_HC_LIGHT = "Default High Contrast Light",
    COLOR_THEME_DARK_OLD = "Default Dark+",
    COLOR_THEME_LIGHT_OLD = "Default Light+",
    FILE_ICON_THEME = "vs-seti",
    PRODUCT_ICON_THEME = "Default"
}
export declare const COLOR_THEME_DARK_INITIAL_COLORS: {
    'activityBar.activeBorder': string;
    'activityBar.background': string;
    'activityBar.border': string;
    'activityBar.foreground': string;
    'activityBar.inactiveForeground': string;
    'editorGroup.border': string;
    'editorGroupHeader.tabsBackground': string;
    'editorGroupHeader.tabsBorder': string;
    'statusBar.background': string;
    'statusBar.border': string;
    'statusBar.foreground': string;
    'statusBar.noFolderBackground': string;
    'tab.activeBackground': string;
    'tab.activeBorder': string;
    'tab.activeBorderTop': string;
    'tab.activeForeground': string;
    'tab.border': string;
    'textLink.foreground': string;
    'titleBar.activeBackground': string;
    'titleBar.activeForeground': string;
    'titleBar.border': string;
    'titleBar.inactiveBackground': string;
    'titleBar.inactiveForeground': string;
    'welcomePage.tileBackground': string;
};
export declare const COLOR_THEME_LIGHT_INITIAL_COLORS: {
    'activityBar.activeBorder': string;
    'activityBar.background': string;
    'activityBar.border': string;
    'activityBar.foreground': string;
    'activityBar.inactiveForeground': string;
    'editorGroup.border': string;
    'editorGroupHeader.tabsBackground': string;
    'editorGroupHeader.tabsBorder': string;
    'statusBar.background': string;
    'statusBar.border': string;
    'statusBar.foreground': string;
    'statusBar.noFolderBackground': string;
    'tab.activeBackground': string;
    'tab.activeBorder': string;
    'tab.activeBorderTop': string;
    'tab.activeForeground': string;
    'tab.border': string;
    'textLink.foreground': string;
    'titleBar.activeBackground': string;
    'titleBar.activeForeground': string;
    'titleBar.border': string;
    'titleBar.inactiveBackground': string;
    'titleBar.inactiveForeground': string;
    'welcomePage.tileBackground': string;
};
export interface IWorkbenchTheme {
    readonly id: string;
    readonly label: string;
    readonly extensionData?: ExtensionData;
    readonly description?: string;
    readonly settingsId: string | null;
}
export interface IWorkbenchColorTheme extends IWorkbenchTheme, IColorTheme {
    readonly settingsId: string;
    readonly tokenColors: ITextMateThemingRule[];
}
export interface IColorMap {
    [id: string]: Color;
}
export interface IWorkbenchFileIconTheme extends IWorkbenchTheme, IFileIconTheme {
}
export interface IWorkbenchProductIconTheme extends IWorkbenchTheme, IProductIconTheme {
    readonly settingsId: string;
    getIcon(icon: IconContribution): IconDefinition | undefined;
}
export type ThemeSettingTarget = ConfigurationTarget | undefined | 'auto' | 'preview';
export interface IWorkbenchThemeService extends IThemeService {
    readonly _serviceBrand: undefined;
    setColorTheme(themeId: string | undefined | IWorkbenchColorTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchColorTheme | null>;
    getColorTheme(): IWorkbenchColorTheme;
    getColorThemes(): Promise<IWorkbenchColorTheme[]>;
    getMarketplaceColorThemes(publisher: string, name: string, version: string): Promise<IWorkbenchColorTheme[]>;
    onDidColorThemeChange: Event<IWorkbenchColorTheme>;
    hasUpdatedDefaultThemes(): boolean;
    getPreferredColorScheme(): ColorScheme | undefined;
    setFileIconTheme(iconThemeId: string | undefined | IWorkbenchFileIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchFileIconTheme>;
    getFileIconTheme(): IWorkbenchFileIconTheme;
    getFileIconThemes(): Promise<IWorkbenchFileIconTheme[]>;
    getMarketplaceFileIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchFileIconTheme[]>;
    onDidFileIconThemeChange: Event<IWorkbenchFileIconTheme>;
    setProductIconTheme(iconThemeId: string | undefined | IWorkbenchProductIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchProductIconTheme>;
    getProductIconTheme(): IWorkbenchProductIconTheme;
    getProductIconThemes(): Promise<IWorkbenchProductIconTheme[]>;
    getMarketplaceProductIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchProductIconTheme[]>;
    onDidProductIconThemeChange: Event<IWorkbenchProductIconTheme>;
}
export interface IThemeScopedColorCustomizations {
    [colorId: string]: string;
}
export interface IColorCustomizations {
    [colorIdOrThemeScope: string]: IThemeScopedColorCustomizations | string;
}
export interface IThemeScopedTokenColorCustomizations {
    [groupId: string]: ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
    comments?: string | ITokenColorizationSetting;
    strings?: string | ITokenColorizationSetting;
    numbers?: string | ITokenColorizationSetting;
    keywords?: string | ITokenColorizationSetting;
    types?: string | ITokenColorizationSetting;
    functions?: string | ITokenColorizationSetting;
    variables?: string | ITokenColorizationSetting;
    textMateRules?: ITextMateThemingRule[];
    semanticHighlighting?: boolean;
}
export interface ITokenColorCustomizations {
    [groupIdOrThemeScope: string]: IThemeScopedTokenColorCustomizations | ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
    comments?: string | ITokenColorizationSetting;
    strings?: string | ITokenColorizationSetting;
    numbers?: string | ITokenColorizationSetting;
    keywords?: string | ITokenColorizationSetting;
    types?: string | ITokenColorizationSetting;
    functions?: string | ITokenColorizationSetting;
    variables?: string | ITokenColorizationSetting;
    textMateRules?: ITextMateThemingRule[];
    semanticHighlighting?: boolean;
}
export interface IThemeScopedSemanticTokenColorCustomizations {
    [styleRule: string]: ISemanticTokenRules | boolean | undefined;
    enabled?: boolean;
    rules?: ISemanticTokenRules;
}
export interface ISemanticTokenColorCustomizations {
    [styleRuleOrThemeScope: string]: IThemeScopedSemanticTokenColorCustomizations | ISemanticTokenRules | boolean | undefined;
    enabled?: boolean;
    rules?: ISemanticTokenRules;
}
export interface IThemeScopedExperimentalSemanticTokenColorCustomizations {
    [themeScope: string]: ISemanticTokenRules | undefined;
}
export interface IExperimentalSemanticTokenColorCustomizations {
    [styleRuleOrThemeScope: string]: IThemeScopedExperimentalSemanticTokenColorCustomizations | ISemanticTokenRules | undefined;
}
export type IThemeScopedCustomizations = IThemeScopedColorCustomizations | IThemeScopedTokenColorCustomizations | IThemeScopedExperimentalSemanticTokenColorCustomizations | IThemeScopedSemanticTokenColorCustomizations;
export type IThemeScopableCustomizations = IColorCustomizations | ITokenColorCustomizations | IExperimentalSemanticTokenColorCustomizations | ISemanticTokenColorCustomizations;
export interface ISemanticTokenRules {
    [selector: string]: string | ISemanticTokenColorizationSetting | undefined;
}
export interface ITextMateThemingRule {
    name?: string;
    scope?: string | string[];
    settings: ITokenColorizationSetting;
}
export interface ITokenColorizationSetting {
    foreground?: string;
    background?: string;
    fontStyle?: string;
}
export interface ISemanticTokenColorizationSetting {
    foreground?: string;
    fontStyle?: string;
    bold?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    italic?: boolean;
}
export interface ExtensionData {
    extensionId: string;
    extensionPublisher: string;
    extensionName: string;
    extensionIsBuiltin: boolean;
}
export declare namespace ExtensionData {
    function toJSONObject(d: ExtensionData | undefined): any;
    function fromJSONObject(o: any): ExtensionData | undefined;
    function fromName(publisher: string, name: string, isBuiltin?: boolean): ExtensionData;
}
export interface IThemeExtensionPoint {
    id: string;
    label?: string;
    description?: string;
    path: string;
    uiTheme?: typeof VS_LIGHT_THEME | typeof VS_DARK_THEME | typeof VS_HC_THEME | typeof VS_HC_LIGHT_THEME;
    _watch: boolean;
}
