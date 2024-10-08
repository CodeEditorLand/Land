import { IRequestHandler, IWorkerServer } from '../../../base/common/worker/simpleWorker.js';
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
