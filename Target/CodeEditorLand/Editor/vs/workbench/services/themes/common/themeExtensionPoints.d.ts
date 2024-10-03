import { IExtensionPoint } from '../../extensions/common/extensionsRegistry.js';
import { ExtensionData, IThemeExtensionPoint } from './workbenchThemeService.js';
import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
export declare function registerColorThemeExtensionPoint(): IExtensionPoint<IThemeExtensionPoint[]>;
export declare function registerFileIconThemeExtensionPoint(): IExtensionPoint<IThemeExtensionPoint[]>;
export declare function registerProductIconThemeExtensionPoint(): IExtensionPoint<IThemeExtensionPoint[]>;
export interface ThemeChangeEvent<T> {
    themes: T[];
    added: T[];
    removed: T[];
}
export interface IThemeData {
    id: string;
    settingsId: string | null;
    location?: URI;
}
export declare class ThemeRegistry<T extends IThemeData> implements IDisposable {
    private readonly themesExtPoint;
    private create;
    private idRequired;
    private builtInTheme;
    private extensionThemes;
    private readonly onDidChangeEmitter;
    readonly onDidChange: Event<ThemeChangeEvent<T>>;
    constructor(themesExtPoint: IExtensionPoint<IThemeExtensionPoint[]>, create: (theme: IThemeExtensionPoint, themeLocation: URI, extensionData: ExtensionData) => T, idRequired?: boolean, builtInTheme?: T | undefined);
    dispose(): void;
    private initialize;
    private onThemes;
    findThemeById(themeId: string): T | undefined;
    findThemeBySettingsId(settingsId: string | null, defaultSettingsId?: string): T | undefined;
    findThemeByExtensionLocation(extLocation: URI | undefined): T[];
    getThemes(): T[];
    getMarketplaceThemes(manifest: any, extensionLocation: URI, extensionData: ExtensionData): T[];
}
