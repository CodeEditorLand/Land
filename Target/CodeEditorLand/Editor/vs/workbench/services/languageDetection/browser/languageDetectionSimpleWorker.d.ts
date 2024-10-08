import { IRequestHandler, IWorkerServer } from '../../../../base/common/worker/simpleWorker.js';
import { ILanguageDetectionWorker } from './languageDetectionWorker.protocol.js';
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
/**
 * @internal
 */
export declare class LanguageDetectionSimpleWorker implements ILanguageDetectionWorker {
    _requestHandlerBrand: any;
    private static readonly expectedRelativeConfidence;
    private static readonly positiveConfidenceCorrectionBucket1;
    private static readonly positiveConfidenceCorrectionBucket2;
    private static readonly negativeConfidenceCorrection;
    private readonly _workerTextModelSyncServer;
    private readonly _host;
    private _regexpModel;
    private _regexpLoadFailed;
    private _modelOperations;
    private _loadFailed;
    private modelIdToCoreId;
    constructor(workerServer: IWorkerServer);
    $detectLanguage(uri: string, langBiases: Record<string, number> | undefined, preferHistory: boolean, supportedLangs?: string[]): Promise<string | undefined>;
    private getTextForDetection;
    private getRegexpModel;
    private runRegexpModel;
    private getModelOperations;
    private adjustLanguageConfidence;
    private detectLanguagesImpl;
}
