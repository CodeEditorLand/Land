import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkerClient, IWorkerServer } from '../../../../base/common/worker/simpleWorker.js';
import { IPosition } from '../../core/position.js';
import { IRange, Range } from '../../core/range.js';
import { IWordAtPosition } from '../../core/wordHelper.js';
import { IDocumentColorComputerTarget } from '../../languages/defaultDocumentColorsComputer.js';
import { ILinkComputerTarget } from '../../languages/linkComputer.js';
import { MirrorTextModel as BaseMirrorModel, IModelChangedEvent } from '../../model/mirrorTextModel.js';
import { IMirrorModel } from '../editorSimpleWorker.js';
import { IModelService } from '../model.js';
import { IRawModelData, IWorkerTextModelSyncChannelServer } from './textModelSync.protocol.js';
/**
 * Stop syncing a model to the worker if it was not needed for 1 min.
 */
export declare const STOP_SYNC_MODEL_DELTA_TIME_MS: number;
export declare const WORKER_TEXT_MODEL_SYNC_CHANNEL = "workerTextModelSync";
export declare class WorkerTextModelSyncClient extends Disposable {
    static create(workerClient: IWorkerClient<any>, modelService: IModelService): WorkerTextModelSyncClient;
    private readonly _proxy;
    private readonly _modelService;
    private _syncedModels;
    private _syncedModelsLastUsedTime;
    constructor(proxy: IWorkerTextModelSyncChannelServer, modelService: IModelService, keepIdleModels?: boolean);
    dispose(): void;
    ensureSyncedResources(resources: URI[], forceLargeModels?: boolean): void;
    private _checkStopModelSync;
    private _beginModelSync;
    private _stopModelSync;
}
export declare class WorkerTextModelSyncServer implements IWorkerTextModelSyncChannelServer {
    private readonly _models;
    constructor();
    bindToServer(workerServer: IWorkerServer): void;
    getModel(uri: string): ICommonModel | undefined;
    getModels(): ICommonModel[];
    $acceptNewModel(data: IRawModelData): void;
    $acceptModelChanged(uri: string, e: IModelChangedEvent): void;
    $acceptRemovedModel(uri: string): void;
}
export declare class MirrorModel extends BaseMirrorModel implements ICommonModel {
    get uri(): URI;
    get eol(): string;
    getValue(): string;
    findMatches(regex: RegExp): RegExpMatchArray[];
    getLinesContent(): string[];
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getWordAtPosition(position: IPosition, wordDefinition: RegExp): Range | null;
    getWordUntilPosition(position: IPosition, wordDefinition: RegExp): IWordAtPosition;
    words(wordDefinition: RegExp): Iterable<string>;
    getLineWords(lineNumber: number, wordDefinition: RegExp): IWordAtPosition[];
    private _wordenize;
    getValueInRange(range: IRange): string;
    offsetAt(position: IPosition): number;
    positionAt(offset: number): IPosition;
    private _validateRange;
    private _validatePosition;
}
export interface ICommonModel extends ILinkComputerTarget, IDocumentColorComputerTarget, IMirrorModel {
    uri: URI;
    version: number;
    eol: string;
    getValue(): string;
    getLinesContent(): string[];
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineWords(lineNumber: number, wordDefinition: RegExp): IWordAtPosition[];
    words(wordDefinition: RegExp): Iterable<string>;
    getWordUntilPosition(position: IPosition, wordDefinition: RegExp): IWordAtPosition;
    getValueInRange(range: IRange): string;
    getWordAtPosition(position: IPosition, wordDefinition: RegExp): Range | null;
    offsetAt(position: IPosition): number;
    positionAt(offset: number): IPosition;
    findMatches(regex: RegExp): RegExpMatchArray[];
}
