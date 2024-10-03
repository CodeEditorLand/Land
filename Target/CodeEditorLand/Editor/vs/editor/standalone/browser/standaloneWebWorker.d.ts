import { URI } from '../../../base/common/uri.js';
import { IModelService } from '../../common/services/model.js';
export declare function createWebWorker<T extends object>(modelService: IModelService, opts: IWebWorkerOptions): MonacoWebWorker<T>;
export interface MonacoWebWorker<T> {
    dispose(): void;
    getProxy(): Promise<T>;
    withSyncedResources(resources: URI[]): Promise<T>;
}
export interface IWebWorkerOptions {
    moduleId: string;
    createData?: any;
    label?: string;
    host?: any;
    keepIdleModels?: boolean;
}
