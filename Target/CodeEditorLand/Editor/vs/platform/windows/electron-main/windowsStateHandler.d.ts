import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IStateService } from '../../state/node/state.js';
import { INativeWindowConfiguration } from '../../window/common/window.js';
import { IWindowsMainService } from './windows.js';
import { IWindowState as IWindowUIState } from '../../window/electron-main/window.js';
import { IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export interface IWindowState {
    readonly windowId?: number;
    workspace?: IWorkspaceIdentifier;
    folderUri?: URI;
    backupPath?: string;
    remoteAuthority?: string;
    uiState: IWindowUIState;
}
export interface IWindowsState {
    lastActiveWindow?: IWindowState;
    lastPluginDevelopmentHostWindow?: IWindowState;
    openedWindows: IWindowState[];
}
interface INewWindowState extends IWindowUIState {
    hasDefaultState?: boolean;
}
interface ISerializedWindowsState {
    readonly lastActiveWindow?: ISerializedWindowState;
    readonly lastPluginDevelopmentHostWindow?: ISerializedWindowState;
    readonly openedWindows: ISerializedWindowState[];
}
interface ISerializedWindowState {
    readonly workspaceIdentifier?: {
        id: string;
        configURIPath: string;
    };
    readonly folder?: string;
    readonly backupPath?: string;
    readonly remoteAuthority?: string;
    readonly uiState: IWindowUIState;
}
export declare class WindowsStateHandler extends Disposable {
    private readonly windowsMainService;
    private readonly stateService;
    private readonly lifecycleMainService;
    private readonly logService;
    private readonly configurationService;
    private static readonly windowsStateStorageKey;
    get state(): IWindowsState;
    private readonly _state;
    private lastClosedState;
    private shuttingDown;
    constructor(windowsMainService: IWindowsMainService, stateService: IStateService, lifecycleMainService: ILifecycleMainService, logService: ILogService, configurationService: IConfigurationService);
    private registerListeners;
    private onBeforeShutdown;
    private saveWindowsState;
    private onBeforeCloseWindow;
    private toWindowState;
    getNewWindowState(configuration: INativeWindowConfiguration): INewWindowState;
    private doGetNewWindowState;
    private ensureNoOverlap;
}
export declare function restoreWindowsState(data: ISerializedWindowsState | undefined): IWindowsState;
export declare function getWindowsStateStoreData(windowsState: IWindowsState): IWindowsState;
export {};
