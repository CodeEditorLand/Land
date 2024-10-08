import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IStateService } from '../../state/node/state.js';
import { IPartsSplash } from '../common/themeService.js';
import { IColorScheme } from '../../window/common/window.js';
export declare const IThemeMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IThemeMainService>;
export interface IThemeMainService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeColorScheme: Event<IColorScheme>;
    getBackgroundColor(): string;
    saveWindowSplash(windowId: number | undefined, splash: IPartsSplash): void;
    getWindowSplash(): IPartsSplash | undefined;
    getColorScheme(): IColorScheme;
}
export declare class ThemeMainService extends Disposable implements IThemeMainService {
    private stateService;
    private configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeColorScheme;
    readonly onDidChangeColorScheme: Event<IColorScheme>;
    constructor(stateService: IStateService, configurationService: IConfigurationService);
    private updateSystemColorTheme;
    getColorScheme(): IColorScheme;
    getBackgroundColor(): string;
    private getBaseTheme;
    saveWindowSplash(windowId: number | undefined, splash: IPartsSplash): void;
    private updateBackgroundColor;
    getWindowSplash(): IPartsSplash | undefined;
}
