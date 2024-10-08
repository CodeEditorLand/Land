import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IDocumentDiff, IDocumentDiffProvider, IDocumentDiffProviderOptions } from '../../../common/diff/documentDiffProvider.js';
import { ITextModel } from '../../../common/model.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export declare const IDiffProviderFactoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDiffProviderFactoryService>;
export interface IDocumentDiffFactoryOptions {
    readonly diffAlgorithm?: 'legacy' | 'advanced';
}
export interface IDiffProviderFactoryService {
    readonly _serviceBrand: undefined;
    createDiffProvider(options: IDocumentDiffFactoryOptions): IDocumentDiffProvider;
}
export declare class WorkerBasedDiffProviderFactoryService implements IDiffProviderFactoryService {
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    constructor(instantiationService: IInstantiationService);
    createDiffProvider(options: IDocumentDiffFactoryOptions): IDocumentDiffProvider;
}
export declare class WorkerBasedDocumentDiffProvider implements IDocumentDiffProvider, IDisposable {
    private readonly editorWorkerService;
    private readonly telemetryService;
    private onDidChangeEventEmitter;
    readonly onDidChange: Event<void>;
    private diffAlgorithm;
    private diffAlgorithmOnDidChangeSubscription;
    private static readonly diffCache;
    constructor(options: IWorkerBasedDocumentDiffProviderOptions, editorWorkerService: IEditorWorkerService, telemetryService: ITelemetryService);
    dispose(): void;
    computeDiff(original: ITextModel, modified: ITextModel, options: IDocumentDiffProviderOptions, cancellationToken: CancellationToken): Promise<IDocumentDiff>;
    setOptions(newOptions: IWorkerBasedDocumentDiffProviderOptions): void;
}
interface IWorkerBasedDocumentDiffProviderOptions {
    readonly diffAlgorithm?: 'legacy' | 'advanced' | IDocumentDiffProvider;
}
export {};
