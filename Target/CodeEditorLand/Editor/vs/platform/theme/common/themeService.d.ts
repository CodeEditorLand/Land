import { Color } from '../../../base/common/color.js';
import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { ColorIdentifier } from './colorRegistry.js';
import { IconContribution, IconDefinition } from './iconRegistry.js';
import { ColorScheme } from './theme.js';
export declare const IThemeService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IThemeService>;
export declare function themeColorFromId(id: ColorIdentifier): {
    id: string;
};
export declare const FileThemeIcon: import("../../../base/common/themables.js").ThemeIcon;
export declare const FolderThemeIcon: import("../../../base/common/themables.js").ThemeIcon;
export declare function getThemeTypeSelector(type: ColorScheme): string;
export interface ITokenStyle {
    readonly foreground: number | undefined;
    readonly bold: boolean | undefined;
    readonly underline: boolean | undefined;
    readonly strikethrough: boolean | undefined;
    readonly italic: boolean | undefined;
}
export interface IColorTheme {
    readonly type: ColorScheme;
    readonly label: string;
    /**
     * Resolves the color of the given color identifier. If the theme does not
     * specify the color, the default color is returned unless <code>useDefault</code> is set to false.
     * @param color the id of the color
     * @param useDefault specifies if the default color should be used. If not set, the default is used.
     */
    getColor(color: ColorIdentifier, useDefault?: boolean): Color | undefined;
    /**
     * Returns whether the theme defines a value for the color. If not, that means the
     * default color will be used.
     */
    defines(color: ColorIdentifier): boolean;
    /**
     * Returns the token style for a given classification. The result uses the <code>MetadataConsts</code> format
     */
    getTokenStyleMetadata(type: string, modifiers: string[], modelLanguage: string): ITokenStyle | undefined;
    /**
     * List of all colors used with tokens. <code>getTokenStyleMetadata</code> references the colors by index into this list.
     */
    readonly tokenColorMap: string[];
    /**
     * Defines whether semantic highlighting should be enabled for the theme.
     */
    readonly semanticHighlighting: boolean;
}
export interface IFileIconTheme {
    readonly hasFileIcons: boolean;
    readonly hasFolderIcons: boolean;
    readonly hidesExplorerArrows: boolean;
}
export interface IProductIconTheme {
    /**
     * Resolves the definition for the given icon as defined by the theme.
     *
     * @param iconContribution The icon
     */
    getIcon(iconContribution: IconContribution): IconDefinition | undefined;
}
export interface ICssStyleCollector {
    addRule(rule: string): void;
}
export interface IThemingParticipant {
    (theme: IColorTheme, collector: ICssStyleCollector, environment: IEnvironmentService): void;
}
export interface IThemeService {
    readonly _serviceBrand: undefined;
    getColorTheme(): IColorTheme;
    readonly onDidColorThemeChange: Event<IColorTheme>;
    getFileIconTheme(): IFileIconTheme;
    readonly onDidFileIconThemeChange: Event<IFileIconTheme>;
    getProductIconTheme(): IProductIconTheme;
    readonly onDidProductIconThemeChange: Event<IProductIconTheme>;
}
export declare const Extensions: {
    ThemingContribution: string;
};
export interface IThemingRegistry {
    /**
     * Register a theming participant that is invoked on every theme change.
     */
    onColorThemeChange(participant: IThemingParticipant): IDisposable;
    getThemingParticipants(): IThemingParticipant[];
    readonly onThemingParticipantAdded: Event<IThemingParticipant>;
}
export declare function registerThemingParticipant(participant: IThemingParticipant): IDisposable;
/**
 * Utility base class for all themable components.
 */
export declare class Themable extends Disposable {
    protected themeService: IThemeService;
    protected theme: IColorTheme;
    constructor(themeService: IThemeService);
    protected onThemeChange(theme: IColorTheme): void;
    updateStyles(): void;
    protected getColor(id: string, modify?: (color: Color, theme: IColorTheme) => Color): string | null;
}
export interface IPartsSplash {
    zoomLevel: number | undefined;
    baseTheme: string;
    colorInfo: {
        background: string;
        foreground: string | undefined;
        editorBackground: string | undefined;
        titleBarBackground: string | undefined;
        titleBarBorder: string | undefined;
        activityBarBackground: string | undefined;
        activityBarBorder: string | undefined;
        sideBarBackground: string | undefined;
        sideBarBorder: string | undefined;
        statusBarBackground: string | undefined;
        statusBarBorder: string | undefined;
        statusBarNoFolderBackground: string | undefined;
        windowBorder: string | undefined;
    };
    layoutInfo: {
        sideBarSide: string;
        editorPartMinWidth: number;
        titleBarHeight: number;
        activityBarWidth: number;
        sideBarWidth: number;
        statusBarHeight: number;
        windowBorder: boolean;
        windowBorderRadius: string | undefined;
    } | undefined;
}
