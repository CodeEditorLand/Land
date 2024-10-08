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
import { ITextFileService } from '../../../../services/textfile/common/textfiles.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { distinct, coalesce } from '../../../../../base/common/arrays.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { RunOnceWorker } from '../../../../../base/common/async.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { FILE_EDITOR_INPUT_ID } from '../../common/files.js';
import { Schemas } from '../../../../../base/common/network.js';
import { UntitledTextEditorInput } from '../../../../services/untitled/common/untitledTextEditorInput.js';
import { IWorkingCopyEditorService } from '../../../../services/workingCopy/common/workingCopyEditorService.js';
import { DEFAULT_EDITOR_ASSOCIATION } from '../../../../common/editor.js';
let TextFileEditorTracker = class TextFileEditorTracker extends Disposable {
    static { this.ID = 'workbench.contrib.textFileEditorTracker'; }
    constructor(editorService, textFileService, lifecycleService, hostService, codeEditorService, filesConfigurationService, workingCopyEditorService) {
        super();
        this.editorService = editorService;
        this.textFileService = textFileService;
        this.lifecycleService = lifecycleService;
        this.hostService = hostService;
        this.codeEditorService = codeEditorService;
        this.filesConfigurationService = filesConfigurationService;
        this.workingCopyEditorService = workingCopyEditorService;
        //#region Text File: Ensure every dirty text and untitled file is opened in an editor
        this.ensureDirtyFilesAreOpenedWorker = this._register(new RunOnceWorker(units => this.ensureDirtyTextFilesAreOpened(units), this.getDirtyTextFileTrackerDelay()));
        this.registerListeners();
    }
    registerListeners() {
        // Ensure dirty text file and untitled models are always opened as editors
        this._register(this.textFileService.files.onDidChangeDirty(model => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
        this._register(this.textFileService.files.onDidSaveError(model => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
        this._register(this.textFileService.untitled.onDidChangeDirty(model => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
        // Update visible text file editors when focus is gained
        this._register(this.hostService.onDidChangeFocus(hasFocus => hasFocus ? this.reloadVisibleTextFileEditors() : undefined));
        // Lifecycle
        this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
    }
    getDirtyTextFileTrackerDelay() {
        return 800; // encapsulated in a method for tests to override
    }
    ensureDirtyTextFilesAreOpened(resources) {
        this.doEnsureDirtyTextFilesAreOpened(distinct(resources.filter(resource => {
            if (!this.textFileService.isDirty(resource)) {
                return false; // resource must be dirty
            }
            const fileModel = this.textFileService.files.get(resource);
            if (fileModel?.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */)) {
                return false; // resource must not be pending to save
            }
            if (resource.scheme !== Schemas.untitled && !fileModel?.hasState(5 /* TextFileEditorModelState.ERROR */) && this.filesConfigurationService.hasShortAutoSaveDelay(resource)) {
                // leave models auto saved after short delay unless
                // the save resulted in an error and not for untitled
                // that are not auto-saved anyway
                return false;
            }
            if (this.editorService.isOpened({ resource, typeId: resource.scheme === Schemas.untitled ? UntitledTextEditorInput.ID : FILE_EDITOR_INPUT_ID, editorId: DEFAULT_EDITOR_ASSOCIATION.id })) {
                return false; // model must not be opened already as file (fast check via editor type)
            }
            const model = fileModel ?? this.textFileService.untitled.get(resource);
            if (model && this.workingCopyEditorService.findEditor(model)) {
                return false; // model must not be opened already as file (slower check via working copy)
            }
            return true;
        }), resource => resource.toString()));
    }
    doEnsureDirtyTextFilesAreOpened(resources) {
        if (!resources.length) {
            return;
        }
        this.editorService.openEditors(resources.map(resource => ({
            resource,
            options: { inactive: true, pinned: true, preserveFocus: true }
        })));
    }
    //#endregion
    //#region Window Focus Change: Update visible code editors when focus is gained that have a known text file model
    reloadVisibleTextFileEditors() {
        // the window got focus and we use this as a hint that files might have been changed outside
        // of this window. since file events can be unreliable, we queue a load for models that
        // are visible in any editor. since this is a fast operation in the case nothing has changed,
        // we tolerate the additional work.
        distinct(coalesce(this.codeEditorService.listCodeEditors()
            .map(codeEditor => {
            const resource = codeEditor.getModel()?.uri;
            if (!resource) {
                return undefined;
            }
            const model = this.textFileService.files.get(resource);
            if (!model || model.isDirty() || !model.isResolved()) {
                return undefined;
            }
            return model;
        })), model => model.resource.toString()).forEach(model => this.textFileService.files.resolve(model.resource, { reload: { async: true } }));
    }
};
TextFileEditorTracker = __decorate([
    __param(0, IEditorService),
    __param(1, ITextFileService),
    __param(2, ILifecycleService),
    __param(3, IHostService),
    __param(4, ICodeEditorService),
    __param(5, IFilesConfigurationService),
    __param(6, IWorkingCopyEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], TextFileEditorTracker);
export { TextFileEditorTracker };
