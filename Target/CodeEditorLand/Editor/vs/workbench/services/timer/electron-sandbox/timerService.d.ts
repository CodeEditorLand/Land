import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IStartupMetrics, AbstractTimerService, Writeable } from '../browser/timerService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchLayoutService } from '../../layout/browser/layoutService.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IPaneCompositePartService } from '../../panecomposite/browser/panecomposite.js';
export declare class TimerService extends AbstractTimerService {
    private readonly _nativeHostService;
    private readonly _environmentService;
    private readonly _productService;
    private readonly _storageService;
    constructor(_nativeHostService: INativeHostService, _environmentService: INativeWorkbenchEnvironmentService, lifecycleService: ILifecycleService, contextService: IWorkspaceContextService, extensionService: IExtensionService, updateService: IUpdateService, paneCompositeService: IPaneCompositePartService, editorService: IEditorService, accessibilityService: IAccessibilityService, telemetryService: ITelemetryService, layoutService: IWorkbenchLayoutService, _productService: IProductService, _storageService: IStorageService);
    protected _isInitialStartup(): boolean;
    protected _didUseCachedData(): boolean;
    protected _getWindowCount(): Promise<number>;
    protected _extendStartupInfo(info: Writeable<IStartupMetrics>): Promise<void>;
    protected _shouldReportPerfMarks(): boolean;
}
export declare function didUseCachedData(productService: IProductService, storageService: IStorageService, environmentService: INativeWorkbenchEnvironmentService): boolean;
