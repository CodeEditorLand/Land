import { ILogService } from '../../../../platform/log/common/log.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { IPCClient } from '../../../../base/parts/ipc/common/ipc.js';
import { IOnDidTerminateUtilityrocessWorkerProcess, IUtilityProcessWorkerProcess } from '../../../../platform/utilityProcess/common/utilityProcessWorkerService.js';
export declare const IUtilityProcessWorkerWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUtilityProcessWorkerWorkbenchService>;
export interface IUtilityProcessWorker extends IDisposable {
    /**
     * A IPC client to communicate to the worker process.
     */
    client: IPCClient<string>;
    /**
     * A promise that resolves to an object once the
     * worker process terminates, giving information
     * how the process terminated.
     *
     * This can be used to figure out whether the worker
     * should be restarted in case of an unexpected
     * termination.
     */
    onDidTerminate: Promise<IOnDidTerminateUtilityrocessWorkerProcess>;
}
export interface IUtilityProcessWorkerWorkbenchService {
    readonly _serviceBrand: undefined;
    /**
     * Will fork a new process with the provided module identifier in a utility
     * process and establishes a message port connection to that process.
     *
     * Requires the forked process to be ES module that uses our IPC channel framework
     * to respond to the provided `channelName` as a server.
     *
     * The process will be automatically terminated when the workbench window closes,
     * crashes or loads/reloads.
     *
     * Note on affinity: repeated calls to `createWorkerChannel` with the same `moduleId`
     * from the same window will result in any previous forked process to get terminated.
     * In other words, it is not possible, nor intended to create multiple workers of
     * the same process from one window. The intent of these workers is to be reused per
     * window and the communication channel allows to dynamically update the processes
     * after the fact.
     *
     * @param process information around the process to fork as worker
     *
     * @returns the worker IPC client to communicate with. Provides a `dispose` method that
     * allows to terminate the worker if needed.
     */
    createWorker(process: IUtilityProcessWorkerProcess): Promise<IUtilityProcessWorker>;
    /**
     * Notifies the service that the workbench window has restored.
     */
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
