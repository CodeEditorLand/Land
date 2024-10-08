import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ISingleEditOperation } from '../core/editOperation.js';
import { ITextBuffer, ITextBufferFactory, ITextModel, ITextModelCreationOptions } from '../model.js';
import { ILanguageSelection } from '../languages/language.js';
import { IModelService } from './model.js';
import { ITextResourcePropertiesService } from './textResourceConfiguration.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { IUndoRedoService } from '../../../platform/undoRedo/common/undoRedo.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
export declare class ModelService extends Disposable implements IModelService {
    private readonly _configurationService;
    private readonly _resourcePropertiesService;
    private readonly _undoRedoService;
    private readonly _instantiationService;
    static MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK: number;
    _serviceBrand: undefined;
    private readonly _onModelAdded;
    readonly onModelAdded: Event<ITextModel>;
    private readonly _onModelRemoved;
    readonly onModelRemoved: Event<ITextModel>;
    private readonly _onModelModeChanged;
    readonly onModelLanguageChanged: Event<{
        model: ITextModel;
        oldLanguageId: string;
    }>;
    private _modelCreationOptionsByLanguageAndResource;
    /**
     * All the models known in the system.
     */
    private readonly _models;
    private readonly _disposedModels;
    private _disposedModelsHeapSize;
    constructor(_configurationService: IConfigurationService, _resourcePropertiesService: ITextResourcePropertiesService, _undoRedoService: IUndoRedoService, _instantiationService: IInstantiationService);
    private static _readModelOptions;
    private _getEOL;
    private _shouldRestoreUndoStack;
    getCreationOptions(languageIdOrSelection: string | ILanguageSelection, resource: URI | undefined, isForSimpleWidget: boolean): ITextModelCreationOptions;
    private _updateModelOptions;
    private static _setModelOptionsForModel;
    private _insertDisposedModel;
    private _removeDisposedModel;
    private _ensureDisposedModelsHeapSize;
    private _createModelData;
    updateModel(model: ITextModel, value: string | ITextBufferFactory): void;
    private static _commonPrefix;
    private static _commonSuffix;
    /**
     * Compute edits to bring `model` to the state of `textSource`.
     */
    static _computeEdits(model: ITextModel, textBuffer: ITextBuffer): ISingleEditOperation[];
    createModel(value: string | ITextBufferFactory, languageSelection: ILanguageSelection | null, resource?: URI, isForSimpleWidget?: boolean): ITextModel;
    destroyModel(resource: URI): void;
    getModels(): ITextModel[];
    getModel(resource: URI): ITextModel | null;
    protected _schemaShouldMaintainUndoRedoElements(resource: URI): boolean;
    private _onWillDispose;
    private _onDidChangeLanguage;
    protected _getSHA1Computer(): ITextModelSHA1Computer;
}
export interface ITextModelSHA1Computer {
    canComputeSHA1(model: ITextModel): boolean;
    computeSHA1(model: ITextModel): string;
}
export declare class DefaultModelSHA1Computer implements ITextModelSHA1Computer {
    static MAX_MODEL_SIZE: number;
    canComputeSHA1(model: ITextModel): boolean;
    computeSHA1(model: ITextModel): string;
}
