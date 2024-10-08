import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { IUtilityProcessWorkerCreateConfiguration, IOnDidTerminateUtilityrocessWorkerProcess, IUtilityProcessWorkerConfiguration, IUtilityProcessWorkerService } from '../common/utilityProcessWorkerService.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
export declare const IUtilityProcessWorkerMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUtilityProcessWorkerMainService>;
export interface IUtilityProcessWorkerMainService extends IUtilityProcessWorkerService {
    readonly _serviceBrand: undefined;
}
export declare class UtilityProcessWorkerMainService extends Disposable implements IUtilityProcessWorkerMainService {
    private readonly logService;
    private readonly windowsMainService;
    private readonly telemetryService;
    private readonly lifecycleMainService;
    readonly _serviceBrand: undefined;
    private readonly workers;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, telemetryService: ITelemetryService, lifecycleMainService: ILifecycleMainService);
    createWorker(configuration: IUtilityProcessWorkerCreateConfiguration): Promise<IOnDidTerminateUtilityrocessWorkerProcess>;
    private hash;
    disposeWorker(configuration: IUtilityProcessWorkerConfiguration): Promise<void>;
}
