import { URI } from '../common/uri.js';
import { IWorkerClient, IWorkerDescriptor } from '../common/worker/simpleWorker.js';
export declare function createBlobWorker(blobUrl: string, options?: WorkerOptions): Worker;
export declare class WorkerDescriptor implements IWorkerDescriptor {
    readonly moduleId: string;
    readonly label: string | undefined;
    readonly esmModuleLocation: URI | undefined;
    constructor(moduleId: string, label: string | undefined);
}
export declare function createWebWorker<T extends object>(moduleId: string, label: string | undefined): IWorkerClient<T>;
export declare function createWebWorker<T extends object>(workerDescriptor: IWorkerDescriptor): IWorkerClient<T>;
