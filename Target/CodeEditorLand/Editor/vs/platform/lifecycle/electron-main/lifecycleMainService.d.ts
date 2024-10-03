import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { NativeParsedArgs } from '../../environment/common/argv.js';
import { ILogService } from '../../log/common/log.js';
import { IStateService } from '../../state/node/state.js';
import { ICodeWindow, LoadReason, UnloadReason } from '../../window/electron-main/window.js';
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { IAuxiliaryWindow } from '../../auxiliaryWindow/electron-main/auxiliaryWindow.js';
export declare const ILifecycleMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILifecycleMainService>;
interface WindowLoadEvent {
    readonly window: ICodeWindow;
    readonly workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | undefined;
    readonly reason: LoadReason;
}
export declare const enum ShutdownReason {
    QUIT = 1,
    KILL = 2
}
export interface ShutdownEvent {
    reason: ShutdownReason;
    join(id: string, promise: Promise<void>): void;
}
export interface IRelaunchHandler {
    handleRelaunch(options?: IRelaunchOptions): boolean;
}
export interface IRelaunchOptions {
    readonly addArgs?: string[];
    readonly removeArgs?: string[];
}
export interface ILifecycleMainService {
    readonly _serviceBrand: undefined;
    readonly wasRestarted: boolean;
    readonly quitRequested: boolean;
    phase: LifecycleMainPhase;
    readonly onBeforeShutdown: Event<void>;
    readonly onWillShutdown: Event<ShutdownEvent>;
    readonly onWillLoadWindow: Event<WindowLoadEvent>;
    readonly onBeforeCloseWindow: Event<ICodeWindow>;
    registerWindow(window: ICodeWindow): void;
    registerAuxWindow(auxWindow: IAuxiliaryWindow): void;
    reload(window: ICodeWindow, cli?: NativeParsedArgs): Promise<void>;
    unload(window: ICodeWindow, reason: UnloadReason): Promise<boolean>;
    relaunch(options?: IRelaunchOptions): Promise<void>;
    setRelaunchHandler(handler: IRelaunchHandler): void;
    quit(willRestart?: boolean): Promise<boolean>;
    kill(code?: number): Promise<void>;
    when(phase: LifecycleMainPhase): Promise<void>;
}
export declare const enum LifecycleMainPhase {
    Starting = 1,
    Ready = 2,
    AfterWindowOpen = 3,
    Eventually = 4
}
export declare class LifecycleMainService extends Disposable implements ILifecycleMainService {
    private readonly logService;
    private readonly stateService;
    private readonly environmentMainService;
    readonly _serviceBrand: undefined;
    private static readonly QUIT_AND_RESTART_KEY;
    private readonly _onBeforeShutdown;
    readonly onBeforeShutdown: Event<void>;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<ShutdownEvent>;
    private readonly _onWillLoadWindow;
    readonly onWillLoadWindow: Event<WindowLoadEvent>;
    private readonly _onBeforeCloseWindow;
    readonly onBeforeCloseWindow: Event<ICodeWindow>;
    private _quitRequested;
    get quitRequested(): boolean;
    private _wasRestarted;
    get wasRestarted(): boolean;
    private _phase;
    get phase(): LifecycleMainPhase;
    private readonly windowToCloseRequest;
    private oneTimeListenerTokenGenerator;
    private windowCounter;
    private pendingQuitPromise;
    private pendingQuitPromiseResolve;
    private pendingWillShutdownPromise;
    private readonly mapWindowIdToPendingUnload;
    private readonly phaseWhen;
    private relaunchHandler;
    constructor(logService: ILogService, stateService: IStateService, environmentMainService: IEnvironmentMainService);
    private resolveRestarted;
    private registerListeners;
    private fireOnWillShutdown;
    set phase(value: LifecycleMainPhase);
    when(phase: LifecycleMainPhase): Promise<void>;
    registerWindow(window: ICodeWindow): void;
    registerAuxWindow(auxWindow: IAuxiliaryWindow): void;
    reload(window: ICodeWindow, cli?: NativeParsedArgs): Promise<void>;
    unload(window: ICodeWindow, reason: UnloadReason): Promise<boolean>;
    private doUnload;
    private handleWindowUnloadVeto;
    private resolvePendingQuitPromise;
    private onBeforeUnloadWindowInRenderer;
    private onWillUnloadWindowInRenderer;
    quit(willRestart?: boolean): Promise<boolean>;
    private doQuit;
    private trace;
    setRelaunchHandler(handler: IRelaunchHandler): void;
    relaunch(options?: IRelaunchOptions): Promise<void>;
    kill(code?: number): Promise<void>;
}
export {};
