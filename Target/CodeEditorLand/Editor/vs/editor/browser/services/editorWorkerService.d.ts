import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { Proxied, IWorkerDescriptor } from '../../../base/common/worker/simpleWorker.js';
import { IRange } from '../../common/core/range.js';
import * as languages from '../../common/languages.js';
import { ILanguageConfigurationService } from '../../common/languages/languageConfigurationRegistry.js';
import { EditorSimpleWorker } from '../../common/services/editorSimpleWorker.js';
import { DiffAlgorithmName, IEditorWorkerService, IUnicodeHighlightsResult } from '../../common/services/editorWorker.js';
import { IModelService } from '../../common/services/model.js';
import { ITextResourceConfigurationService } from '../../common/services/textResourceConfiguration.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { UnicodeHighlighterOptions } from '../../common/services/unicodeTextModelHighlighter.js';
import { ILanguageFeaturesService } from '../../common/services/languageFeatures.js';
import { IChange } from '../../common/diff/legacyLinesDiffComputer.js';
import { IDocumentDiff, IDocumentDiffProviderOptions } from '../../common/diff/documentDiffProvider.js';
import { SectionHeader, FindSectionHeaderOptions } from '../../common/services/findSectionHeaders.js';
export declare abstract class EditorWorkerService extends Disposable implements IEditorWorkerService {
    private readonly _languageConfigurationService;
    readonly _serviceBrand: undefined;
    private readonly _modelService;
    private readonly _workerManager;
    private readonly _logService;
    constructor(workerDescriptor: IWorkerDescriptor, modelService: IModelService, configurationService: ITextResourceConfigurationService, logService: ILogService, _languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    canComputeUnicodeHighlights(uri: URI): boolean;
    computedUnicodeHighlights(uri: URI, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null>;
    canComputeDirtyDiff(original: URI, modified: URI): boolean;
    computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    computeMoreMinimalEdits(resource: URI, edits: languages.TextEdit[] | null | undefined, pretty?: boolean): Promise<languages.TextEdit[] | undefined>;
    computeHumanReadableDiff(resource: URI, edits: languages.TextEdit[] | null | undefined): Promise<languages.TextEdit[] | undefined>;
    canNavigateValueSet(resource: URI): boolean;
    navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<languages.IInplaceReplaceSupportResult | null>;
    canComputeWordRanges(resource: URI): boolean;
    computeWordRanges(resource: URI, range: IRange): Promise<{
        [word: string]: IRange[];
    } | null>;
    findSectionHeaders(uri: URI, options: FindSectionHeaderOptions): Promise<SectionHeader[]>;
    computeDefaultDocumentColors(uri: URI): Promise<languages.IColorInformation[] | null>;
    private _workerWithResources;
}
export interface IEditorWorkerClient {
    fhr(method: string, args: any[]): Promise<any>;
}
export declare class EditorWorkerClient extends Disposable implements IEditorWorkerClient {
    private readonly _workerDescriptor;
    private readonly _modelService;
    private readonly _keepIdleModels;
    private _worker;
    private _modelManager;
    private _disposed;
    constructor(_workerDescriptor: IWorkerDescriptor, keepIdleModels: boolean, modelService: IModelService);
    fhr(method: string, args: any[]): Promise<any>;
    private _getOrCreateWorker;
    protected _getProxy(): Promise<Proxied<EditorSimpleWorker>>;
    private _createFallbackLocalWorker;
    private _createEditorWorkerHost;
    private _getOrCreateModelManager;
    workerWithSyncedResources(resources: URI[], forceLargeModels?: boolean): Promise<Proxied<EditorSimpleWorker>>;
    textualSuggest(resources: URI[], leadingWord: string | undefined, wordDefRegExp: RegExp): Promise<{
        words: string[];
        duration: number;
    } | null>;
    dispose(): void;
}
