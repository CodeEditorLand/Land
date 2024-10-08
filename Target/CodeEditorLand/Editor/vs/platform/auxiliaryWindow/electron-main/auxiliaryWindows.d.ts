import { BrowserWindowConstructorOptions, HandlerDetails, WebContents } from 'electron';
import { Event } from '../../../base/common/event.js';
import { IAuxiliaryWindow } from './auxiliaryWindow.js';
export declare const IAuxiliaryWindowsMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAuxiliaryWindowsMainService>;
export interface IAuxiliaryWindowsMainService {
    readonly _serviceBrand: undefined;
    readonly onDidMaximizeWindow: Event<IAuxiliaryWindow>;
    readonly onDidUnmaximizeWindow: Event<IAuxiliaryWindow>;
    readonly onDidChangeFullScreen: Event<{
        window: IAuxiliaryWindow;
        fullscreen: boolean;
    }>;
    readonly onDidTriggerSystemContextMenu: Event<{
        readonly window: IAuxiliaryWindow;
        readonly x: number;
        readonly y: number;
    }>;
    createWindow(details: HandlerDetails): BrowserWindowConstructorOptions;
    registerWindow(webContents: WebContents): void;
    getWindowByWebContents(webContents: WebContents): IAuxiliaryWindow | undefined;
    getFocusedWindow(): IAuxiliaryWindow | undefined;
    getLastActiveWindow(): IAuxiliaryWindow | undefined;
    getWindows(): readonly IAuxiliaryWindow[];
}
