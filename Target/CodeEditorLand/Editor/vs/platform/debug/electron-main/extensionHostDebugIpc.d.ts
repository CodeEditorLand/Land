import { ExtensionHostDebugBroadcastChannel } from '../common/extensionHostDebugIpc.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
export declare class ElectronExtensionHostDebugBroadcastChannel<TContext> extends ExtensionHostDebugBroadcastChannel<TContext> {
    private windowsMainService;
    constructor(windowsMainService: IWindowsMainService);
    call(ctx: TContext, command: string, arg?: any): Promise<any>;
    private openExtensionDevelopmentHostWindow;
}
