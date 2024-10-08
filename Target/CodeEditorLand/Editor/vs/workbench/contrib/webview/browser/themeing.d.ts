import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkbenchColorTheme, IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
import { WebviewStyles } from './webview.js';
interface WebviewThemeData {
    readonly activeTheme: string;
    readonly themeLabel: string;
    readonly themeId: string;
    readonly styles: Readonly<WebviewStyles>;
}
export declare class WebviewThemeDataProvider extends Disposable {
    private readonly _themeService;
    private readonly _configurationService;
    private _cachedWebViewThemeData;
    private readonly _onThemeDataChanged;
    readonly onThemeDataChanged: import("../../../workbench.web.main.internal.js").Event<void>;
    constructor(_themeService: IWorkbenchThemeService, _configurationService: IConfigurationService);
    getTheme(): IWorkbenchColorTheme;
    getWebviewThemeData(): WebviewThemeData;
    private _reset;
}
export {};
