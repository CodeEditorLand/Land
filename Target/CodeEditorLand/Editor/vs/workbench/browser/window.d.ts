import { Disposable } from '../../base/common/lifecycle.js';
import { IDialogService } from '../../platform/dialogs/common/dialogs.js';
import { IInstantiationService, ServicesAccessor } from '../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../platform/label/common/label.js';
import { IOpenerService } from '../../platform/opener/common/opener.js';
import { IProductService } from '../../platform/product/common/productService.js';
import { IBrowserWorkbenchEnvironmentService } from '../services/environment/browser/environmentService.js';
import { IWorkbenchLayoutService } from '../services/layout/browser/layoutService.js';
import { BrowserLifecycleService } from '../services/lifecycle/browser/lifecycleService.js';
import { ShutdownReason } from '../services/lifecycle/common/lifecycle.js';
import { IHostService } from '../services/host/browser/host.js';
import { CodeWindow } from '../../base/browser/window.js';
import { IWorkbenchEnvironmentService } from '../services/environment/common/environmentService.js';
export declare abstract class BaseWindow extends Disposable {
    protected readonly hostService: IHostService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    private static TIMEOUT_HANDLES;
    private static readonly TIMEOUT_DISPOSABLES;
    constructor(targetWindow: CodeWindow, dom: {
        getWindowsCount: () => number;
        getWindows: () => Iterable<import("../../base/browser/dom.js").IRegisteredCodeWindow>;
    } | undefined, /* for testing */ hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    protected enableWindowFocusOnElementFocus(targetWindow: CodeWindow): void;
    private onElementFocus;
    protected enableMultiWindowAwareTimeout(targetWindow: Window, dom?: {
        getWindowsCount: () => number;
        getWindows: () => Iterable<import("../../base/browser/dom.js").IRegisteredCodeWindow>;
    }): void;
    private registerFullScreenListeners;
    static confirmOnShutdown(accessor: ServicesAccessor, reason: ShutdownReason): Promise<boolean>;
}
export declare class BrowserWindow extends BaseWindow {
    private readonly openerService;
    private readonly lifecycleService;
    private readonly dialogService;
    private readonly labelService;
    private readonly productService;
    private readonly browserEnvironmentService;
    private readonly layoutService;
    private readonly instantiationService;
    constructor(openerService: IOpenerService, lifecycleService: BrowserLifecycleService, dialogService: IDialogService, labelService: ILabelService, productService: IProductService, browserEnvironmentService: IBrowserWorkbenchEnvironmentService, layoutService: IWorkbenchLayoutService, instantiationService: IInstantiationService, hostService: IHostService);
    private registerListeners;
    private onWillShutdown;
    private create;
    private setupDriver;
    private setupOpenHandlers;
    private registerLabelFormatters;
    private registerCommands;
}
