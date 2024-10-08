import { BrowserWindowConstructorOptions, WebContents } from 'electron';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IStateService } from '../../state/node/state.js';
import { IBaseWindow } from '../../window/electron-main/window.js';
import { BaseWindow } from '../../windows/electron-main/windowImpl.js';
export interface IAuxiliaryWindow extends IBaseWindow {
    readonly parentId: number;
}
export declare class AuxiliaryWindow extends BaseWindow implements IAuxiliaryWindow {
    private readonly webContents;
    private readonly lifecycleMainService;
    readonly id: any;
    parentId: number;
    get win(): any;
    private stateApplied;
    constructor(webContents: WebContents, environmentMainService: IEnvironmentMainService, logService: ILogService, configurationService: IConfigurationService, stateService: IStateService, lifecycleMainService: ILifecycleMainService);
    tryClaimWindow(options?: BrowserWindowConstructorOptions): void;
    private doTryClaimWindow;
    matches(webContents: WebContents): boolean;
}
