import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IRequestHandler, IWorkerServer } from '../../../base/common/worker/simpleWorker.js';
import { IRange } from '../core/range.js';
import { IMirrorTextModel, IModelChangedEvent } from '../model/mirrorTextModel.js';
import { IColorInformation, IInplaceReplaceSupportResult, ILink, TextEdit } from '../languages.js';
import { DiffAlgorithmName, IDiffComputationResult, IUnicodeHighlightsResult } from './editorWorker.js';
import { EditorWorkerHost } from './editorWorkerHost.js';
import { UnicodeHighlighterOptions } from './unicodeTextModelHighlighter.js';
import { IChange } from '../diff/legacyLinesDiffComputer.js';
import { ILinesDiffComputerOptions } from '../diff/linesDiffComputer.js';
import { IDocumentDiffProviderOptions } from '../diff/documentDiffProvider.js';
import { FindSectionHeaderOptions, SectionHeader } from './findSectionHeaders.js';
import { IRawModelData, IWorkerTextModelSyncChannelServer } from './textModelSync/textModelSync.protocol.js';
import { ICommonModel } from './textModelSync/textModelSync.impl.js';
export interface IMirrorModel extends IMirrorTextModel {
    readonly uri: URI;
    readonly version: number;
    getValue(): string;
}
export interface IWorkerContext<H = undefined> {
    /**
     * A proxy to the main thread host object.
     */
    host: H;
    /**
     * Get all available mirror models in this worker.
     */
    getMirrorModels(): IMirrorModel[];
}
/**
 * Range of a word inside a model.
 * @internal
 */
export interface IWordRange {
    /**
     * The index where the word starts.
     */
    readonly start: number;
    /**
     * The index where the word ends.
     */
    readonly end: number;
}
/**
 * @internal
 */
export interface IForeignModuleFactory {
    (ctx: IWorkerContext, createData: any): any;
}
/**
 * @internal
 */
export declare class BaseEditorSimpleWorker implements IDisposable, IWorkerTextModelSyncChannelServer, IRequestHandler {
    _requestHandlerBrand: any;
    private readonly _workerTextModelSyncServer;
    constructor();
    dispose(): void;
    protected _getModel(uri: string): ICommonModel | undefined;
    protected _getModels(): ICommonModel[];
    $acceptNewModel(data: IRawModelData): void;
    $acceptModelChanged(uri: string, e: IModelChangedEvent): void;
    $acceptRemovedModel(uri: string): void;
    $computeUnicodeHighlights(url: string, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    $findSectionHeaders(url: string, options: FindSectionHeaderOptions): Promise<SectionHeader[]>;
    $computeDiff(originalUrl: string, modifiedUrl: string, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDiffComputationResult | null>;
    private static computeDiff;
    private static _modelsAreIdentical;
    $computeDirtyDiff(originalUrl: string, modifiedUrl: string, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    private static readonly _diffLimit;
    $computeMoreMinimalEdits(modelUrl: string, edits: TextEdit[], pretty: boolean): Promise<TextEdit[]>;
    $computeHumanReadableDiff(modelUrl: string, edits: TextEdit[], options: ILinesDiffComputerOptions): TextEdit[];
    $computeLinks(modelUrl: string): Promise<ILink[] | null>;
    $computeDefaultDocumentColors(modelUrl: string): Promise<IColorInformation[] | null>;
    private static readonly _suggestionsLimit;
    $textualSuggest(modelUrls: string[], leadingWord: string | undefined, wordDef: string, wordDefFlags: string): Promise<{
        words: string[];
        duration: number;
    } | null>;
    $computeWordRanges(modelUrl: string, range: IRange, wordDef: string, wordDefFlags: string): Promise<{
        [word: string]: IRange[];
    }>;
    $navigateValueSet(modelUrl: string, range: IRange, up: boolean, wordDef: string, wordDefFlags: string): Promise<IInplaceReplaceSupportResult | null>;
}
/**
 * @internal
 */
export declare class EditorSimpleWorker extends BaseEditorSimpleWorker {
    private readonly _host;
    private readonly _foreignModuleFactory;
    private _foreignModule;
    constructor(_host: EditorWorkerHost, _foreignModuleFactory: IForeignModuleFactory | null);
    $ping(): Promise<string>;
    $loadForeignModule(moduleId: string, createData: any, foreignHostMethods: string[]): Promise<string[]>;
    $fmr(method: string, args: any[]): Promise<any>;
}
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 * @internal
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
