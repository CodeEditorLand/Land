import { BrowserWindowConstructorOptions, HandlerDetails, WebContents } from 'electron';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { AuxiliaryWindow, IAuxiliaryWindow } from './auxiliaryWindow.js';
import { IAuxiliaryWindowsMainService } from './auxiliaryWindows.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
export declare class AuxiliaryWindowsMainService extends Disposable implements IAuxiliaryWindowsMainService {
    private readonly instantiationService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidMaximizeWindow;
    readonly onDidMaximizeWindow: Event<IAuxiliaryWindow>;
    private readonly _onDidUnmaximizeWindow;
    readonly onDidUnmaximizeWindow: Event<IAuxiliaryWindow>;
    private readonly _onDidChangeFullScreen;
    readonly onDidChangeFullScreen: Event<{
        window: IAuxiliaryWindow;
        fullscreen: boolean;
    }>;
    private readonly _onDidTriggerSystemContextMenu;
    readonly onDidTriggerSystemContextMenu: Event<{
        window: IAuxiliaryWindow;
        x: number;
        y: number;
    }>;
    private readonly windows;
    constructor(instantiationService: IInstantiationService, logService: ILogService);
    private registerListeners;
    createWindow(details: HandlerDetails): BrowserWindowConstructorOptions;
    private computeWindowStateAndOverrides;
    registerWindow(webContents: WebContents): void;
    getWindowByWebContents(webContents: WebContents): AuxiliaryWindow | undefined;
    getFocusedWindow(): IAuxiliaryWindow | undefined;
    getLastActiveWindow(): IAuxiliaryWindow | undefined;
    getWindows(): readonly IAuxiliaryWindow[];
}
