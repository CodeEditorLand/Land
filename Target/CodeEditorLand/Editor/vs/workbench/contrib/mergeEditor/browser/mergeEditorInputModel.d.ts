import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { ConfirmResult } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IRevertOptions } from '../../../common/editor.js';
import { MergeEditorInputData } from './mergeEditorInput.js';
import { MergeEditorModel } from './model/mergeEditorModel.js';
import { MergeEditorTelemetry } from './telemetry.js';
import { ITextFileSaveOptions, ITextFileService } from '../../../services/textfile/common/textfiles.js';
export interface MergeEditorArgs {
    base: URI;
    input1: MergeEditorInputData;
    input2: MergeEditorInputData;
    result: URI;
}
export interface IMergeEditorInputModelFactory {
    createInputModel(args: MergeEditorArgs): Promise<IMergeEditorInputModel>;
}
export interface IMergeEditorInputModel extends IDisposable {
    readonly resultUri: URI;
    readonly model: MergeEditorModel;
    readonly isDirty: IObservable<boolean>;
    save(options?: ITextFileSaveOptions): Promise<void>;
    revert(options?: IRevertOptions): Promise<void>;
    shouldConfirmClose(): boolean;
    confirmClose(inputModels: IMergeEditorInputModel[]): Promise<ConfirmResult>;
    accept(): Promise<void>;
}
export declare class TempFileMergeEditorModeFactory implements IMergeEditorInputModelFactory {
    private readonly _mergeEditorTelemetry;
    private readonly _instantiationService;
    private readonly _textModelService;
    private readonly _modelService;
    constructor(_mergeEditorTelemetry: MergeEditorTelemetry, _instantiationService: IInstantiationService, _textModelService: ITextModelService, _modelService: IModelService);
    createInputModel(args: MergeEditorArgs): Promise<IMergeEditorInputModel>;
}
export declare class WorkspaceMergeEditorModeFactory implements IMergeEditorInputModelFactory {
    private readonly _mergeEditorTelemetry;
    private readonly _instantiationService;
    private readonly _textModelService;
    private readonly textFileService;
    constructor(_mergeEditorTelemetry: MergeEditorTelemetry, _instantiationService: IInstantiationService, _textModelService: ITextModelService, textFileService: ITextFileService);
    private static readonly FILE_SAVED_SOURCE;
    createInputModel(args: MergeEditorArgs): Promise<IMergeEditorInputModel>;
}
