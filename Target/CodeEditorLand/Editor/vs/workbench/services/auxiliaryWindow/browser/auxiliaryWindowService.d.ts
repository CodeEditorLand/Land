import { Dimension } from '../../../../base/browser/dom.js';
import { CodeWindow } from '../../../../base/browser/window.js';
import { Barrier } from '../../../../base/common/async.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IRectangle } from '../../../../platform/window/common/window.js';
import { BaseWindow } from '../../../browser/window.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IHostService } from '../../host/browser/host.js';
import { IWorkbenchLayoutService } from '../../layout/browser/layoutService.js';
export declare const IAuxiliaryWindowService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuxiliaryWindowService>;
export interface IAuxiliaryWindowOpenEvent {
    readonly window: IAuxiliaryWindow;
    readonly disposables: DisposableStore;
}
export declare enum AuxiliaryWindowMode {
    Maximized = 0,
    Normal = 1,
    Fullscreen = 2
}
export interface IAuxiliaryWindowOpenOptions {
    readonly bounds?: Partial<IRectangle>;
    readonly mode?: AuxiliaryWindowMode;
    readonly zoomLevel?: number;
    readonly nativeTitlebar?: boolean;
    readonly disableFullscreen?: boolean;
}
export interface IAuxiliaryWindowService {
    readonly _serviceBrand: undefined;
    readonly onDidOpenAuxiliaryWindow: Event<IAuxiliaryWindowOpenEvent>;
    open(options?: IAuxiliaryWindowOpenOptions): Promise<IAuxiliaryWindow>;
    getWindow(windowId: number): IAuxiliaryWindow | undefined;
}
export interface BeforeAuxiliaryWindowUnloadEvent {
    veto(reason: string | undefined): void;
}
export interface IAuxiliaryWindow extends IDisposable {
    readonly onWillLayout: Event<Dimension>;
    readonly onDidLayout: Event<Dimension>;
    readonly onBeforeUnload: Event<BeforeAuxiliaryWindowUnloadEvent>;
    readonly onUnload: Event<void>;
    readonly whenStylesHaveLoaded: Promise<void>;
    readonly window: CodeWindow;
    readonly container: HTMLElement;
    layout(): void;
    createState(): IAuxiliaryWindowOpenOptions;
}
export declare class AuxiliaryWindow extends BaseWindow implements IAuxiliaryWindow {
    readonly window: CodeWindow;
    readonly container: HTMLElement;
    private readonly configurationService;
    private readonly _onWillLayout;
    readonly onWillLayout: Event<Dimension>;
    private readonly _onDidLayout;
    readonly onDidLayout: Event<Dimension>;
    private readonly _onBeforeUnload;
    readonly onBeforeUnload: Event<BeforeAuxiliaryWindowUnloadEvent>;
    private readonly _onUnload;
    readonly onUnload: Event<void>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    readonly whenStylesHaveLoaded: Promise<void>;
    constructor(window: CodeWindow, container: HTMLElement, stylesHaveLoaded: Barrier, configurationService: IConfigurationService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    private registerListeners;
    private handleBeforeUnload;
    protected handleVetoBeforeClose(e: BeforeUnloadEvent, reason: string): void;
    protected preventUnload(e: BeforeUnloadEvent): void;
    protected confirmBeforeClose(e: BeforeUnloadEvent): void;
    private handleUnload;
    layout(): void;
    createState(): IAuxiliaryWindowOpenOptions;
    dispose(): void;
}
export declare class BrowserAuxiliaryWindowService extends Disposable implements IAuxiliaryWindowService {
    private readonly layoutService;
    protected readonly dialogService: IDialogService;
    protected readonly configurationService: IConfigurationService;
    private readonly telemetryService;
    protected readonly hostService: IHostService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    readonly _serviceBrand: undefined;
    private static readonly DEFAULT_SIZE;
    private static WINDOW_IDS;
    private readonly _onDidOpenAuxiliaryWindow;
    readonly onDidOpenAuxiliaryWindow: Event<IAuxiliaryWindowOpenEvent>;
    private readonly windows;
    constructor(layoutService: IWorkbenchLayoutService, dialogService: IDialogService, configurationService: IConfigurationService, telemetryService: ITelemetryService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    open(options?: IAuxiliaryWindowOpenOptions): Promise<IAuxiliaryWindow>;
    protected createAuxiliaryWindow(targetWindow: CodeWindow, container: HTMLElement, stylesLoaded: Barrier): AuxiliaryWindow;
    private openWindow;
    protected resolveWindowId(auxiliaryWindow: Window): Promise<number>;
    protected createContainer(auxiliaryWindow: CodeWindow, disposables: DisposableStore, options?: IAuxiliaryWindowOpenOptions): {
        stylesLoaded: Barrier;
        container: HTMLElement;
    };
    private applyMeta;
    private applyCSS;
    private applyHTML;
    getWindow(windowId: number): IAuxiliaryWindow | undefined;
}
