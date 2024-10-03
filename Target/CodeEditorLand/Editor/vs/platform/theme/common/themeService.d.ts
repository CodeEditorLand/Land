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
    getColor(color: ColorIdentifier, useDefault?: boolean): Color | undefined;
    defines(color: ColorIdentifier): boolean;
    getTokenStyleMetadata(type: string, modifiers: string[], modelLanguage: string): ITokenStyle | undefined;
    readonly tokenColorMap: string[];
    readonly semanticHighlighting: boolean;
}
export interface IFileIconTheme {
    readonly hasFileIcons: boolean;
    readonly hasFolderIcons: boolean;
    readonly hidesExplorerArrows: boolean;
}
export interface IProductIconTheme {
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
    onColorThemeChange(participant: IThemingParticipant): IDisposable;
    getThemingParticipants(): IThemingParticipant[];
    readonly onThemingParticipantAdded: Event<IThemingParticipant>;
}
export declare function registerThemingParticipant(participant: IThemingParticipant): IDisposable;
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
