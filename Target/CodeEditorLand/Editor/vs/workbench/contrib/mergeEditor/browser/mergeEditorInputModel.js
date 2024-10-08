/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkspaceMergeEditorModeFactory_1;
import { assertFn } from '../../../../base/common/assert.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { derived, observableFromEvent, observableValue } from '../../../../base/common/observable.js';
import { basename, isEqual } from '../../../../base/common/resources.js';
import Severity from '../../../../base/common/severity.js';
import { URI } from '../../../../base/common/uri.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../nls.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { SaveSourceRegistry } from '../../../common/editor.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { conflictMarkers } from './mergeMarkers/mergeMarkersController.js';
import { MergeDiffComputer } from './model/diffComputer.js';
import { MergeEditorModel } from './model/mergeEditorModel.js';
import { MergeEditorTelemetry } from './telemetry.js';
import { StorageCloseWithConflicts } from '../common/mergeEditor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
/* ================ Temp File ================ */
let TempFileMergeEditorModeFactory = class TempFileMergeEditorModeFactory {
    constructor(_mergeEditorTelemetry, _instantiationService, _textModelService, _modelService) {
        this._mergeEditorTelemetry = _mergeEditorTelemetry;
        this._instantiationService = _instantiationService;
        this._textModelService = _textModelService;
        this._modelService = _modelService;
    }
    async createInputModel(args) {
        const store = new DisposableStore();
        const [base, result, input1Data, input2Data,] = await Promise.all([
            this._textModelService.createModelReference(args.base),
            this._textModelService.createModelReference(args.result),
            toInputData(args.input1, this._textModelService, store),
            toInputData(args.input2, this._textModelService, store),
        ]);
        store.add(base);
        store.add(result);
        const tempResultUri = result.object.textEditorModel.uri.with({ scheme: 'merge-result' });
        const temporaryResultModel = this._modelService.createModel('', {
            languageId: result.object.textEditorModel.getLanguageId(),
            onDidChange: Event.None,
        }, tempResultUri);
        store.add(temporaryResultModel);
        const mergeDiffComputer = this._instantiationService.createInstance(MergeDiffComputer);
        const model = this._instantiationService.createInstance(MergeEditorModel, base.object.textEditorModel, input1Data, input2Data, temporaryResultModel, mergeDiffComputer, {
            resetResult: true,
        }, this._mergeEditorTelemetry);
        store.add(model);
        await model.onInitialized;
        return this._instantiationService.createInstance(TempFileMergeEditorInputModel, model, store, result.object, args.result);
    }
};
TempFileMergeEditorModeFactory = __decorate([
    __param(1, IInstantiationService),
    __param(2, ITextModelService),
    __param(3, IModelService),
    __metadata("design:paramtypes", [MergeEditorTelemetry, Object, Object, Object])
], TempFileMergeEditorModeFactory);
export { TempFileMergeEditorModeFactory };
let TempFileMergeEditorInputModel = class TempFileMergeEditorInputModel extends EditorModel {
    constructor(model, disposable, result, resultUri, textFileService, dialogService, editorService) {
        super();
        this.model = model;
        this.disposable = disposable;
        this.result = result;
        this.resultUri = resultUri;
        this.textFileService = textFileService;
        this.dialogService = dialogService;
        this.editorService = editorService;
        this.savedAltVersionId = observableValue(this, this.model.resultTextModel.getAlternativeVersionId());
        this.altVersionId = observableFromEvent(this, e => this.model.resultTextModel.onDidChangeContent(e), () => 
        /** @description getAlternativeVersionId */ this.model.resultTextModel.getAlternativeVersionId());
        this.isDirty = derived(this, (reader) => this.altVersionId.read(reader) !== this.savedAltVersionId.read(reader));
        this.finished = false;
    }
    dispose() {
        this.disposable.dispose();
        super.dispose();
    }
    async accept() {
        const value = await this.model.resultTextModel.getValue();
        this.result.textEditorModel.setValue(value);
        this.savedAltVersionId.set(this.model.resultTextModel.getAlternativeVersionId(), undefined);
        await this.textFileService.save(this.result.textEditorModel.uri);
        this.finished = true;
    }
    async _discard() {
        await this.textFileService.revert(this.model.resultTextModel.uri);
        this.savedAltVersionId.set(this.model.resultTextModel.getAlternativeVersionId(), undefined);
        this.finished = true;
    }
    shouldConfirmClose() {
        return true;
    }
    async confirmClose(inputModels) {
        assertFn(() => inputModels.some((m) => m === this));
        const someDirty = inputModels.some((m) => m.isDirty.get());
        let choice;
        if (someDirty) {
            const isMany = inputModels.length > 1;
            const message = isMany
                ? localize('messageN', 'Do you want keep the merge result of {0} files?', inputModels.length)
                : localize('message1', 'Do you want keep the merge result of {0}?', basename(inputModels[0].model.resultTextModel.uri));
            const hasUnhandledConflicts = inputModels.some((m) => m.model.hasUnhandledConflicts.get());
            const buttons = [
                {
                    label: hasUnhandledConflicts ?
                        localize({ key: 'saveWithConflict', comment: ['&& denotes a mnemonic'] }, "&&Save With Conflicts") :
                        localize({ key: 'save', comment: ['&& denotes a mnemonic'] }, "&&Save"),
                    run: () => 0 /* ConfirmResult.SAVE */
                },
                {
                    label: localize({ key: 'discard', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save"),
                    run: () => 1 /* ConfirmResult.DONT_SAVE */
                }
            ];
            choice = (await this.dialogService.prompt({
                type: Severity.Info,
                message,
                detail: hasUnhandledConflicts
                    ? isMany
                        ? localize('detailNConflicts', "The files contain unhandled conflicts. The merge results will be lost if you don't save them.")
                        : localize('detail1Conflicts', "The file contains unhandled conflicts. The merge result will be lost if you don't save it.")
                    : isMany
                        ? localize('detailN', "The merge results will be lost if you don't save them.")
                        : localize('detail1', "The merge result will be lost if you don't save it."),
                buttons,
                cancelButton: {
                    run: () => 2 /* ConfirmResult.CANCEL */
                }
            })).result;
        }
        else {
            choice = 1 /* ConfirmResult.DONT_SAVE */;
        }
        if (choice === 0 /* ConfirmResult.SAVE */) {
            // save with conflicts
            await Promise.all(inputModels.map(m => m.accept()));
        }
        else if (choice === 1 /* ConfirmResult.DONT_SAVE */) {
            // discard changes
            await Promise.all(inputModels.map(m => m._discard()));
        }
        else {
            // cancel: stay in editor
        }
        return choice;
    }
    async save(options) {
        if (this.finished) {
            return;
        }
        // It does not make sense to save anything in the temp file mode.
        // The file stays dirty from the first edit on.
        (async () => {
            const { confirmed } = await this.dialogService.confirm({
                message: localize('saveTempFile.message', "Do you want to accept the merge result?"),
                detail: localize('saveTempFile.detail', "This will write the merge result to the original file and close the merge editor."),
                primaryButton: localize({ key: 'acceptMerge', comment: ['&& denotes a mnemonic'] }, '&&Accept Merge')
            });
            if (confirmed) {
                await this.accept();
                const editors = this.editorService.findEditors(this.resultUri).filter(e => e.editor.typeId === 'mergeEditor.Input');
                await this.editorService.closeEditors(editors);
            }
        })();
    }
    async revert(options) {
        // no op
    }
};
TempFileMergeEditorInputModel = __decorate([
    __param(4, ITextFileService),
    __param(5, IDialogService),
    __param(6, IEditorService),
    __metadata("design:paramtypes", [MergeEditorModel, Object, Object, URI, Object, Object, Object])
], TempFileMergeEditorInputModel);
/* ================ Workspace ================ */
let WorkspaceMergeEditorModeFactory = class WorkspaceMergeEditorModeFactory {
    static { WorkspaceMergeEditorModeFactory_1 = this; }
    constructor(_mergeEditorTelemetry, _instantiationService, _textModelService, textFileService) {
        this._mergeEditorTelemetry = _mergeEditorTelemetry;
        this._instantiationService = _instantiationService;
        this._textModelService = _textModelService;
        this.textFileService = textFileService;
    }
    static { this.FILE_SAVED_SOURCE = SaveSourceRegistry.registerSource('merge-editor.source', localize('merge-editor.source', "Before Resolving Conflicts In Merge Editor")); }
    async createInputModel(args) {
        const store = new DisposableStore();
        let resultTextFileModel = undefined;
        const modelListener = store.add(new DisposableStore());
        const handleDidCreate = (model) => {
            if (isEqual(args.result, model.resource)) {
                modelListener.clear();
                resultTextFileModel = model;
            }
        };
        modelListener.add(this.textFileService.files.onDidCreate(handleDidCreate));
        this.textFileService.files.models.forEach(handleDidCreate);
        const [base, result, input1Data, input2Data,] = await Promise.all([
            this._textModelService.createModelReference(args.base),
            this._textModelService.createModelReference(args.result),
            toInputData(args.input1, this._textModelService, store),
            toInputData(args.input2, this._textModelService, store),
        ]);
        store.add(base);
        store.add(result);
        if (!resultTextFileModel) {
            throw new BugIndicatingError();
        }
        // So that "Don't save" does revert the file
        await resultTextFileModel.save({ source: WorkspaceMergeEditorModeFactory_1.FILE_SAVED_SOURCE });
        const lines = resultTextFileModel.textEditorModel.getLinesContent();
        const hasConflictMarkers = lines.some(l => l.startsWith(conflictMarkers.start));
        const resetResult = hasConflictMarkers;
        const mergeDiffComputer = this._instantiationService.createInstance(MergeDiffComputer);
        const model = this._instantiationService.createInstance(MergeEditorModel, base.object.textEditorModel, input1Data, input2Data, result.object.textEditorModel, mergeDiffComputer, {
            resetResult
        }, this._mergeEditorTelemetry);
        store.add(model);
        await model.onInitialized;
        return this._instantiationService.createInstance(WorkspaceMergeEditorInputModel, model, store, resultTextFileModel, this._mergeEditorTelemetry);
    }
};
WorkspaceMergeEditorModeFactory = WorkspaceMergeEditorModeFactory_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, ITextModelService),
    __param(3, ITextFileService),
    __metadata("design:paramtypes", [MergeEditorTelemetry, Object, Object, Object])
], WorkspaceMergeEditorModeFactory);
export { WorkspaceMergeEditorModeFactory };
let WorkspaceMergeEditorInputModel = class WorkspaceMergeEditorInputModel extends EditorModel {
    constructor(model, disposableStore, resultTextFileModel, telemetry, _dialogService, _storageService) {
        super();
        this.model = model;
        this.disposableStore = disposableStore;
        this.resultTextFileModel = resultTextFileModel;
        this.telemetry = telemetry;
        this._dialogService = _dialogService;
        this._storageService = _storageService;
        this.isDirty = observableFromEvent(this, Event.any(this.resultTextFileModel.onDidChangeDirty, this.resultTextFileModel.onDidSaveError), () => /** @description isDirty */ this.resultTextFileModel.isDirty());
        this.reported = false;
        this.dateTimeOpened = new Date();
    }
    dispose() {
        this.disposableStore.dispose();
        super.dispose();
        this.reportClose(false);
    }
    reportClose(accepted) {
        if (!this.reported) {
            const remainingConflictCount = this.model.unhandledConflictsCount.get();
            const durationOpenedMs = new Date().getTime() - this.dateTimeOpened.getTime();
            this.telemetry.reportMergeEditorClosed({
                durationOpenedSecs: durationOpenedMs / 1000,
                remainingConflictCount,
                accepted,
                conflictCount: this.model.conflictCount,
                combinableConflictCount: this.model.combinableConflictCount,
                conflictsResolvedWithBase: this.model.conflictsResolvedWithBase,
                conflictsResolvedWithInput1: this.model.conflictsResolvedWithInput1,
                conflictsResolvedWithInput2: this.model.conflictsResolvedWithInput2,
                conflictsResolvedWithSmartCombination: this.model.conflictsResolvedWithSmartCombination,
                manuallySolvedConflictCountThatEqualNone: this.model.manuallySolvedConflictCountThatEqualNone,
                manuallySolvedConflictCountThatEqualSmartCombine: this.model.manuallySolvedConflictCountThatEqualSmartCombine,
                manuallySolvedConflictCountThatEqualInput1: this.model.manuallySolvedConflictCountThatEqualInput1,
                manuallySolvedConflictCountThatEqualInput2: this.model.manuallySolvedConflictCountThatEqualInput2,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBase,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart,
                manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: this.model.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart,
            });
            this.reported = true;
        }
    }
    async accept() {
        this.reportClose(true);
        await this.resultTextFileModel.save();
    }
    get resultUri() {
        return this.resultTextFileModel.resource;
    }
    async save(options) {
        await this.resultTextFileModel.save(options);
    }
    /**
     * If save resets the dirty state, revert must do so too.
    */
    async revert(options) {
        await this.resultTextFileModel.revert(options);
    }
    shouldConfirmClose() {
        // Always confirm
        return true;
    }
    async confirmClose(inputModels) {
        const isMany = inputModels.length > 1;
        const someDirty = inputModels.some(m => m.isDirty.get());
        const someUnhandledConflicts = inputModels.some(m => m.model.hasUnhandledConflicts.get());
        if (someDirty) {
            const message = isMany
                ? localize('workspace.messageN', 'Do you want to save the changes you made to {0} files?', inputModels.length)
                : localize('workspace.message1', 'Do you want to save the changes you made to {0}?', basename(inputModels[0].resultUri));
            const { result } = await this._dialogService.prompt({
                type: Severity.Info,
                message,
                detail: someUnhandledConflicts ?
                    isMany
                        ? localize('workspace.detailN.unhandled', "The files contain unhandled conflicts. Your changes will be lost if you don't save them.")
                        : localize('workspace.detail1.unhandled', "The file contains unhandled conflicts. Your changes will be lost if you don't save them.")
                    : isMany
                        ? localize('workspace.detailN.handled', "Your changes will be lost if you don't save them.")
                        : localize('workspace.detail1.handled', "Your changes will be lost if you don't save them."),
                buttons: [
                    {
                        label: someUnhandledConflicts
                            ? localize({ key: 'workspace.saveWithConflict', comment: ['&& denotes a mnemonic'] }, '&&Save with Conflicts')
                            : localize({ key: 'workspace.save', comment: ['&& denotes a mnemonic'] }, '&&Save'),
                        run: () => 0 /* ConfirmResult.SAVE */
                    },
                    {
                        label: localize({ key: 'workspace.doNotSave', comment: ['&& denotes a mnemonic'] }, "Do&&n't Save"),
                        run: () => 1 /* ConfirmResult.DONT_SAVE */
                    }
                ],
                cancelButton: {
                    run: () => 2 /* ConfirmResult.CANCEL */
                }
            });
            return result;
        }
        else if (someUnhandledConflicts && !this._storageService.getBoolean(StorageCloseWithConflicts, 0 /* StorageScope.PROFILE */, false)) {
            const { confirmed, checkboxChecked } = await this._dialogService.confirm({
                message: isMany
                    ? localize('workspace.messageN.nonDirty', 'Do you want to close {0} merge editors?', inputModels.length)
                    : localize('workspace.message1.nonDirty', 'Do you want to close the merge editor for {0}?', basename(inputModels[0].resultUri)),
                detail: someUnhandledConflicts ?
                    isMany
                        ? localize('workspace.detailN.unhandled.nonDirty', "The files contain unhandled conflicts.")
                        : localize('workspace.detail1.unhandled.nonDirty', "The file contains unhandled conflicts.")
                    : undefined,
                primaryButton: someUnhandledConflicts
                    ? localize({ key: 'workspace.closeWithConflicts', comment: ['&& denotes a mnemonic'] }, '&&Close with Conflicts')
                    : localize({ key: 'workspace.close', comment: ['&& denotes a mnemonic'] }, '&&Close'),
                checkbox: { label: localize('noMoreWarn', "Do not ask me again") }
            });
            if (checkboxChecked) {
                this._storageService.store(StorageCloseWithConflicts, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            return confirmed ? 0 /* ConfirmResult.SAVE */ : 2 /* ConfirmResult.CANCEL */;
        }
        else {
            // This shouldn't do anything
            return 0 /* ConfirmResult.SAVE */;
        }
    }
};
WorkspaceMergeEditorInputModel = __decorate([
    __param(4, IDialogService),
    __param(5, IStorageService),
    __metadata("design:paramtypes", [MergeEditorModel,
        DisposableStore, Object, MergeEditorTelemetry, Object, Object])
], WorkspaceMergeEditorInputModel);
/* ================= Utils ================== */
async function toInputData(data, textModelService, store) {
    const ref = await textModelService.createModelReference(data.uri);
    store.add(ref);
    return {
        textModel: ref.object.textEditorModel,
        title: data.title,
        description: data.description,
        detail: data.detail,
    };
}
