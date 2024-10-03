import electron from 'electron';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ISerializableCommandAction } from '../../action/common/action.js';
import { NativeParsedArgs } from '../../environment/common/argv.js';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { INativeWindowConfiguration } from '../common/window.js';
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export interface IBaseWindow extends IDisposable {
    readonly onDidMaximize: Event<void>;
    readonly onDidUnmaximize: Event<void>;
    readonly onDidTriggerSystemContextMenu: Event<{
        readonly x: number;
        readonly y: number;
    }>;
    readonly onDidEnterFullScreen: Event<void>;
    readonly onDidLeaveFullScreen: Event<void>;
    readonly onDidClose: Event<void>;
    readonly id: number;
    readonly win: electron.BrowserWindow | null;
    readonly lastFocusTime: number;
    focus(options?: {
        force: boolean;
    }): void;
    setRepresentedFilename(name: string): void;
    getRepresentedFilename(): string | undefined;
    setDocumentEdited(edited: boolean): void;
    isDocumentEdited(): boolean;
    handleTitleDoubleClick(): void;
    readonly isFullScreen: boolean;
    toggleFullScreen(): void;
    updateWindowControls(options: {
        height?: number;
        backgroundColor?: string;
        foregroundColor?: string;
    }): void;
    matches(webContents: electron.WebContents): boolean;
}
export interface ICodeWindow extends IBaseWindow {
    readonly onWillLoad: Event<ILoadEvent>;
    readonly onDidSignalReady: Event<void>;
    readonly onDidDestroy: Event<void>;
    readonly whenClosedOrLoaded: Promise<void>;
    readonly config: INativeWindowConfiguration | undefined;
    readonly openedWorkspace?: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier;
    readonly profile?: IUserDataProfile;
    readonly backupPath?: string;
    readonly remoteAuthority?: string;
    readonly isExtensionDevelopmentHost: boolean;
    readonly isExtensionTestHost: boolean;
    readonly isReady: boolean;
    ready(): Promise<ICodeWindow>;
    setReady(): void;
    addTabbedWindow(window: ICodeWindow): void;
    load(config: INativeWindowConfiguration, options?: {
        isReload?: boolean;
    }): void;
    reload(cli?: NativeParsedArgs): void;
    close(): void;
    getBounds(): electron.Rectangle;
    send(channel: string, ...args: any[]): void;
    sendWhenReady(channel: string, token: CancellationToken, ...args: any[]): void;
    updateTouchBar(items: ISerializableCommandAction[][]): void;
    notifyZoomLevel(zoomLevel: number | undefined): void;
    serializeWindowState(): IWindowState;
}
export declare const enum LoadReason {
    INITIAL = 1,
    LOAD = 2,
    RELOAD = 3
}
export declare const enum UnloadReason {
    CLOSE = 1,
    QUIT = 2,
    RELOAD = 3,
    LOAD = 4
}
export interface IWindowState {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    mode?: WindowMode;
    zoomLevel?: number;
    readonly display?: number;
}
export declare const defaultWindowState: (mode?: WindowMode) => IWindowState;
export declare const defaultAuxWindowState: () => IWindowState;
export declare const enum WindowMode {
    Maximized = 0,
    Normal = 1,
    Minimized = 2,
    Fullscreen = 3
}
export interface ILoadEvent {
    readonly workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | undefined;
    readonly reason: LoadReason;
}
export declare const enum WindowError {
    UNRESPONSIVE = 1,
    PROCESS_GONE = 2,
    LOAD = 3
}
