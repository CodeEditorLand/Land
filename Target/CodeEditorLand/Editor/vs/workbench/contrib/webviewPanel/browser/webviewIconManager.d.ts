import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
export interface WebviewIcons {
    readonly light: URI;
    readonly dark: URI;
}
export declare class WebviewIconManager extends Disposable {
    private readonly _lifecycleService;
    private readonly _configService;
    private readonly _icons;
    private _styleElement;
    constructor(_lifecycleService: ILifecycleService, _configService: IConfigurationService);
    dispose(): void;
    private get styleElement();
    setIcons(webviewId: string, iconPath: WebviewIcons | undefined): void;
    private updateStyleSheet;
}
