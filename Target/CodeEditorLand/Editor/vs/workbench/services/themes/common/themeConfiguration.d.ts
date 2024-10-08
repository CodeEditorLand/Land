import { ThemeSettings, IWorkbenchColorTheme, IWorkbenchFileIconTheme, IColorCustomizations, ITokenColorCustomizations, IWorkbenchProductIconTheme, ISemanticTokenColorCustomizations, ThemeSettingTarget } from './workbenchThemeService.js';
import { IConfigurationService, ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
import { IHostColorSchemeService } from './hostColorSchemeService.js';
export declare function formatSettingAsLink(str: string): string;
export declare const COLOR_THEME_CONFIGURATION_SETTINGS_TAG = "colorThemeConfiguration";
export declare function updateColorThemeConfigurationSchemas(themes: IWorkbenchColorTheme[]): void;
export declare function updateFileIconThemeConfigurationSchemas(themes: IWorkbenchFileIconTheme[]): void;
export declare function updateProductIconThemeConfigurationSchemas(themes: IWorkbenchProductIconTheme[]): void;
export declare class ThemeConfiguration {
    private configurationService;
    private hostColorService;
    constructor(configurationService: IConfigurationService, hostColorService: IHostColorSchemeService);
    get colorTheme(): string;
    get fileIconTheme(): string | null;
    get productIconTheme(): string;
    get colorCustomizations(): IColorCustomizations;
    get tokenColorCustomizations(): ITokenColorCustomizations;
    get semanticTokenColorCustomizations(): ISemanticTokenColorCustomizations | undefined;
    getPreferredColorScheme(): ColorScheme | undefined;
    isDetectingColorScheme(): boolean;
    getColorThemeSettingId(): ThemeSettings;
    setColorTheme(theme: IWorkbenchColorTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchColorTheme>;
    setFileIconTheme(theme: IWorkbenchFileIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchFileIconTheme>;
    setProductIconTheme(theme: IWorkbenchProductIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchProductIconTheme>;
    isDefaultColorTheme(): boolean;
    findAutoConfigurationTarget(key: string): ConfigurationTarget.USER | ConfigurationTarget.USER_REMOTE | ConfigurationTarget.WORKSPACE | ConfigurationTarget.WORKSPACE_FOLDER;
    private writeConfiguration;
}
