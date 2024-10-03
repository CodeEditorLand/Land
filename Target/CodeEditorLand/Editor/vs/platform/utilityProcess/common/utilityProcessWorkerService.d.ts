export interface IUtilityProcessWorkerProcess {
    readonly moduleId: string;
    readonly type: string;
}
export interface IOnDidTerminateUtilityrocessWorkerProcess {
    readonly reason: IUtilityProcessWorkerProcessExit;
}
export interface IUtilityProcessWorkerProcessExit {
    readonly code?: number;
    readonly signal?: string;
}
export interface IUtilityProcessWorkerConfiguration {
    readonly process: IUtilityProcessWorkerProcess;
    readonly reply: {
        readonly windowId: number;
        readonly channel?: string;
        readonly nonce?: string;
    };
}
export interface IUtilityProcessWorkerCreateConfiguration extends IUtilityProcessWorkerConfiguration {
    readonly reply: {
        readonly windowId: number;
        readonly channel: string;
        readonly nonce: string;
    };
}
export declare const ipcUtilityProcessWorkerChannelName = "utilityProcessWorker";
export interface IUtilityProcessWorkerService {
    readonly _serviceBrand: undefined;
    createWorker(configuration: IUtilityProcessWorkerCreateConfiguration): Promise<IOnDidTerminateUtilityrocessWorkerProcess>;
    disposeWorker(configuration: IUtilityProcessWorkerConfiguration): Promise<void>;
}
