import { ILogService } from '../../../../platform/log/common/log.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { IPCClient } from '../../../../base/parts/ipc/common/ipc.js';
import { IOnDidTerminateUtilityrocessWorkerProcess, IUtilityProcessWorkerProcess } from '../../../../platform/utilityProcess/common/utilityProcessWorkerService.js';
export declare const IUtilityProcessWorkerWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUtilityProcessWorkerWorkbenchService>;
export interface IUtilityProcessWorker extends IDisposable {
    client: IPCClient<string>;
    onDidTerminate: Promise<IOnDidTerminateUtilityrocessWorkerProcess>;
}
export interface IUtilityProcessWorkerWorkbenchService {
    readonly _serviceBrand: undefined;
    createWorker(process: IUtilityProcessWorkerProcess): Promise<IUtilityProcessWorker>;
    notifyRestored(): void;
}
export declare class UtilityProcessWorkerWorkbenchService extends Disposable implements IUtilityProcessWorkerWorkbenchService {
    readonly windowId: number;
    private readonly logService;
    private readonly mainProcessService;
    readonly _serviceBrand: undefined;
    private _utilityProcessWorkerService;
    private get utilityProcessWorkerService();
    private readonly restoredBarrier;
    constructor(windowId: number, logService: ILogService, mainProcessService: IMainProcessService);
    createWorker(process: IUtilityProcessWorkerProcess): Promise<IUtilityProcessWorker>;
    notifyRestored(): void;
}
