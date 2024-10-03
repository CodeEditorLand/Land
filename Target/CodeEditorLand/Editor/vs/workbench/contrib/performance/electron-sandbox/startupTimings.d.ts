import { IWorkbenchContribution } from '../../../common/contributions.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ITimerService } from '../../../services/timer/browser/timerService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { StartupTimings } from '../browser/startupTimings.js';
export declare class NativeStartupTimings extends StartupTimings implements IWorkbenchContribution {
    private readonly _fileService;
    private readonly _timerService;
    private readonly _nativeHostService;
    private readonly _telemetryService;
    private readonly _environmentService;
    private readonly _productService;
    constructor(_fileService: IFileService, _timerService: ITimerService, _nativeHostService: INativeHostService, editorService: IEditorService, paneCompositeService: IPaneCompositePartService, _telemetryService: ITelemetryService, lifecycleService: ILifecycleService, updateService: IUpdateService, _environmentService: INativeWorkbenchEnvironmentService, _productService: IProductService, workspaceTrustService: IWorkspaceTrustManagementService);
    private _report;
    private _appendStartupTimes;
    protected _isStandardStartup(): Promise<string | undefined>;
    private _appendContent;
    private _resolveStartupHeapStatistics;
    private _telemetryLogHeapStatistics;
    private _printStartupHeapStatistics;
}
