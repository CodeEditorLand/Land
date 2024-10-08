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
import { localize } from '../../../../../nls.js';
import { toErrorMessage } from '../../../../../base/common/errorMessage.js';
import { basename, isEqual } from '../../../../../base/common/resources.js';
import { Action } from '../../../../../base/common/actions.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITextFileService } from '../../../../services/textfile/common/textfiles.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { dispose, Disposable } from '../../../../../base/common/lifecycle.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { ResourceMap } from '../../../../../base/common/map.js';
import { DiffEditorInput } from '../../../../common/editor/diffEditorInput.js';
import { IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { TextFileContentProvider } from '../../common/files.js';
import { FileEditorInput } from './fileEditorInput.js';
import { SAVE_FILE_AS_LABEL } from '../fileConstants.js';
import { INotificationService, Severity } from '../../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { Event } from '../../../../../base/common/event.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { isWindows } from '../../../../../base/common/platform.js';
import { Schemas } from '../../../../../base/common/network.js';
import { IPreferencesService } from '../../../../services/preferences/common/preferences.js';
import { SideBySideEditor } from '../../../../common/editor.js';
import { hash } from '../../../../../base/common/hash.js';
export const CONFLICT_RESOLUTION_CONTEXT = 'saveConflictResolutionContext';
export const CONFLICT_RESOLUTION_SCHEME = 'conflictResolution';
const LEARN_MORE_DIRTY_WRITE_IGNORE_KEY = 'learnMoreDirtyWriteError';
const conflictEditorHelp = localize('userGuide', "Use the actions in the editor tool bar to either undo your changes or overwrite the content of the file with your changes.");
// A handler for text file save error happening with conflict resolution actions
let TextFileSaveErrorHandler = class TextFileSaveErrorHandler extends Disposable {
    static { this.ID = 'workbench.contrib.textFileSaveErrorHandler'; }
    constructor(notificationService, textFileService, contextKeyService, editorService, textModelService, instantiationService, storageService) {
        super();
        this.notificationService = notificationService;
        this.textFileService = textFileService;
        this.contextKeyService = contextKeyService;
        this.editorService = editorService;
        this.instantiationService = instantiationService;
        this.storageService = storageService;
        this.messages = new ResourceMap();
        this.conflictResolutionContext = new RawContextKey(CONFLICT_RESOLUTION_CONTEXT, false, true).bindTo(this.contextKeyService);
        this.activeConflictResolutionResource = undefined;
        const provider = this._register(instantiationService.createInstance(TextFileContentProvider));
        this._register(textModelService.registerTextModelContentProvider(CONFLICT_RESOLUTION_SCHEME, provider));
        // Set as save error handler to service for text files
        this.textFileService.files.saveErrorHandler = this;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.textFileService.files.onDidSave(e => this.onFileSavedOrReverted(e.model.resource)));
        this._register(this.textFileService.files.onDidRevert(model => this.onFileSavedOrReverted(model.resource)));
        this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChanged()));
    }
    onActiveEditorChanged() {
        let isActiveEditorSaveConflictResolution = false;
        let activeConflictResolutionResource;
        const activeInput = this.editorService.activeEditor;
        if (activeInput instanceof DiffEditorInput) {
            const resource = activeInput.original.resource;
            if (resource?.scheme === CONFLICT_RESOLUTION_SCHEME) {
                isActiveEditorSaveConflictResolution = true;
                activeConflictResolutionResource = activeInput.modified.resource;
            }
        }
        this.conflictResolutionContext.set(isActiveEditorSaveConflictResolution);
        this.activeConflictResolutionResource = activeConflictResolutionResource;
    }
    onFileSavedOrReverted(resource) {
        const messageHandle = this.messages.get(resource);
        if (messageHandle) {
            messageHandle.close();
            this.messages.delete(resource);
        }
    }
    onSaveError(error, model, options) {
        const fileOperationError = error;
        const resource = model.resource;
        let message;
        const primaryActions = [];
        const secondaryActions = [];
        // Dirty write prevention
        if (fileOperationError.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
            // If the user tried to save from the opened conflict editor, show its message again
            if (this.activeConflictResolutionResource && isEqual(this.activeConflictResolutionResource, model.resource)) {
                if (this.storageService.getBoolean(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, -1 /* StorageScope.APPLICATION */)) {
                    return; // return if this message is ignored
                }
                message = conflictEditorHelp;
                primaryActions.push(this.instantiationService.createInstance(ResolveConflictLearnMoreAction));
                secondaryActions.push(this.instantiationService.createInstance(DoNotShowResolveConflictLearnMoreAction));
            }
            // Otherwise show the message that will lead the user into the save conflict editor.
            else {
                message = localize('staleSaveError', "Failed to save '{0}': The content of the file is newer. Please compare your version with the file contents or overwrite the content of the file with your changes.", basename(resource));
                primaryActions.push(this.instantiationService.createInstance(ResolveSaveConflictAction, model));
                primaryActions.push(this.instantiationService.createInstance(SaveModelIgnoreModifiedSinceAction, model, options));
                secondaryActions.push(this.instantiationService.createInstance(ConfigureSaveConflictAction));
            }
        }
        // Any other save error
        else {
            const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
            const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
            const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
            const canSaveElevated = resource.scheme === Schemas.file; // currently only supported for local schemes (https://github.com/microsoft/vscode/issues/48659)
            // Save Elevated
            if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
                primaryActions.push(this.instantiationService.createInstance(SaveModelElevatedAction, model, options, !!triedToUnlock));
            }
            // Unlock
            else if (isWriteLocked) {
                primaryActions.push(this.instantiationService.createInstance(UnlockModelAction, model, options));
            }
            // Retry
            else {
                primaryActions.push(this.instantiationService.createInstance(RetrySaveModelAction, model, options));
            }
            // Save As
            primaryActions.push(this.instantiationService.createInstance(SaveModelAsAction, model));
            // Revert
            primaryActions.push(this.instantiationService.createInstance(RevertModelAction, model));
            // Message
            if (isWriteLocked) {
                if (triedToUnlock && canSaveElevated) {
                    message = isWindows ? localize('readonlySaveErrorAdmin', "Failed to save '{0}': File is read-only. Select 'Overwrite as Admin' to retry as administrator.", basename(resource)) : localize('readonlySaveErrorSudo', "Failed to save '{0}': File is read-only. Select 'Overwrite as Sudo' to retry as superuser.", basename(resource));
                }
                else {
                    message = localize('readonlySaveError', "Failed to save '{0}': File is read-only. Select 'Overwrite' to attempt to make it writeable.", basename(resource));
                }
            }
            else if (canSaveElevated && isPermissionDenied) {
                message = isWindows ? localize('permissionDeniedSaveError', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Admin' to retry as administrator.", basename(resource)) : localize('permissionDeniedSaveErrorSudo', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Sudo' to retry as superuser.", basename(resource));
            }
            else {
                message = localize({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", basename(resource), toErrorMessage(error, false));
            }
        }
        // Show message and keep function to hide in case the file gets saved/reverted
        const actions = { primary: primaryActions, secondary: secondaryActions };
        const handle = this.notificationService.notify({
            id: `${hash(model.resource.toString())}`, // unique per model (https://github.com/microsoft/vscode/issues/121539)
            severity: Severity.Error,
            message,
            actions
        });
        Event.once(handle.onDidClose)(() => { dispose(primaryActions); dispose(secondaryActions); });
        this.messages.set(model.resource, handle);
    }
    dispose() {
        super.dispose();
        this.messages.clear();
    }
};
TextFileSaveErrorHandler = __decorate([
    __param(0, INotificationService),
    __param(1, ITextFileService),
    __param(2, IContextKeyService),
    __param(3, IEditorService),
    __param(4, ITextModelService),
    __param(5, IInstantiationService),
    __param(6, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], TextFileSaveErrorHandler);
export { TextFileSaveErrorHandler };
const pendingResolveSaveConflictMessages = [];
function clearPendingResolveSaveConflictMessages() {
    while (pendingResolveSaveConflictMessages.length > 0) {
        const item = pendingResolveSaveConflictMessages.pop();
        item?.close();
    }
}
let ResolveConflictLearnMoreAction = class ResolveConflictLearnMoreAction extends Action {
    constructor(openerService) {
        super('workbench.files.action.resolveConflictLearnMore', localize('learnMore', "Learn More"));
        this.openerService = openerService;
    }
    async run() {
        await this.openerService.open(URI.parse('https://go.microsoft.com/fwlink/?linkid=868264'));
    }
};
ResolveConflictLearnMoreAction = __decorate([
    __param(0, IOpenerService),
    __metadata("design:paramtypes", [Object])
], ResolveConflictLearnMoreAction);
let DoNotShowResolveConflictLearnMoreAction = class DoNotShowResolveConflictLearnMoreAction extends Action {
    constructor(storageService) {
        super('workbench.files.action.resolveConflictLearnMoreDoNotShowAgain', localize('dontShowAgain', "Don't Show Again"));
        this.storageService = storageService;
    }
    async run(notification) {
        // Remember this as application state
        this.storageService.store(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        // Hide notification
        notification.dispose();
    }
};
DoNotShowResolveConflictLearnMoreAction = __decorate([
    __param(0, IStorageService),
    __metadata("design:paramtypes", [Object])
], DoNotShowResolveConflictLearnMoreAction);
let ResolveSaveConflictAction = class ResolveSaveConflictAction extends Action {
    constructor(model, editorService, notificationService, instantiationService, productService) {
        super('workbench.files.action.resolveConflict', localize('compareChanges', "Compare"));
        this.model = model;
        this.editorService = editorService;
        this.notificationService = notificationService;
        this.instantiationService = instantiationService;
        this.productService = productService;
    }
    async run() {
        if (!this.model.isDisposed()) {
            const resource = this.model.resource;
            const name = basename(resource);
            const editorLabel = localize('saveConflictDiffLabel', "{0} (in file) ↔ {1} (in {2}) - Resolve save conflict", name, name, this.productService.nameLong);
            await TextFileContentProvider.open(resource, CONFLICT_RESOLUTION_SCHEME, editorLabel, this.editorService, { pinned: true });
            // Show additional help how to resolve the save conflict
            const actions = { primary: [this.instantiationService.createInstance(ResolveConflictLearnMoreAction)] };
            const handle = this.notificationService.notify({
                id: `${hash(resource.toString())}`, // unique per model
                severity: Severity.Info,
                message: conflictEditorHelp,
                actions,
                neverShowAgain: { id: LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, isSecondary: true }
            });
            Event.once(handle.onDidClose)(() => dispose(actions.primary));
            pendingResolveSaveConflictMessages.push(handle);
        }
    }
};
ResolveSaveConflictAction = __decorate([
    __param(1, IEditorService),
    __param(2, INotificationService),
    __param(3, IInstantiationService),
    __param(4, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ResolveSaveConflictAction);
class SaveModelElevatedAction extends Action {
    constructor(model, options, triedToUnlock) {
        super('workbench.files.action.saveModelElevated', triedToUnlock ? isWindows ? localize('overwriteElevated', "Overwrite as Admin...") : localize('overwriteElevatedSudo', "Overwrite as Sudo...") : isWindows ? localize('saveElevated', "Retry as Admin...") : localize('saveElevatedSudo', "Retry as Sudo..."));
        this.model = model;
        this.options = options;
        this.triedToUnlock = triedToUnlock;
    }
    async run() {
        if (!this.model.isDisposed()) {
            await this.model.save({
                ...this.options,
                writeElevated: true,
                writeUnlock: this.triedToUnlock,
                reason: 1 /* SaveReason.EXPLICIT */
            });
        }
    }
}
class RetrySaveModelAction extends Action {
    constructor(model, options) {
        super('workbench.files.action.saveModel', localize('retry', "Retry"));
        this.model = model;
        this.options = options;
    }
    async run() {
        if (!this.model.isDisposed()) {
            await this.model.save({ ...this.options, reason: 1 /* SaveReason.EXPLICIT */ });
        }
    }
}
class RevertModelAction extends Action {
    constructor(model) {
        super('workbench.files.action.revertModel', localize('revert', "Revert"));
        this.model = model;
    }
    async run() {
        if (!this.model.isDisposed()) {
            await this.model.revert();
        }
    }
}
let SaveModelAsAction = class SaveModelAsAction extends Action {
    constructor(model, editorService) {
        super('workbench.files.action.saveModelAs', SAVE_FILE_AS_LABEL.value);
        this.model = model;
        this.editorService = editorService;
    }
    async run() {
        if (!this.model.isDisposed()) {
            const editor = this.findEditor();
            if (editor) {
                await this.editorService.save(editor, { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    findEditor() {
        let preferredMatchingEditor;
        const editors = this.editorService.findEditors(this.model.resource, { supportSideBySide: SideBySideEditor.PRIMARY });
        for (const identifier of editors) {
            if (identifier.editor instanceof FileEditorInput) {
                // We prefer a `FileEditorInput` for "Save As", but it is possible
                // that a custom editor is leveraging the text file model and as
                // such we need to fallback to any other editor having the resource
                // opened for running the save.
                preferredMatchingEditor = identifier;
                break;
            }
            else if (!preferredMatchingEditor) {
                preferredMatchingEditor = identifier;
            }
        }
        return preferredMatchingEditor;
    }
};
SaveModelAsAction = __decorate([
    __param(1, IEditorService),
    __metadata("design:paramtypes", [Object, Object])
], SaveModelAsAction);
class UnlockModelAction extends Action {
    constructor(model, options) {
        super('workbench.files.action.unlock', localize('overwrite', "Overwrite"));
        this.model = model;
        this.options = options;
    }
    async run() {
        if (!this.model.isDisposed()) {
            await this.model.save({ ...this.options, writeUnlock: true, reason: 1 /* SaveReason.EXPLICIT */ });
        }
    }
}
class SaveModelIgnoreModifiedSinceAction extends Action {
    constructor(model, options) {
        super('workbench.files.action.saveIgnoreModifiedSince', localize('overwrite', "Overwrite"));
        this.model = model;
        this.options = options;
    }
    async run() {
        if (!this.model.isDisposed()) {
            await this.model.save({ ...this.options, ignoreModifiedSince: true, reason: 1 /* SaveReason.EXPLICIT */ });
        }
    }
}
let ConfigureSaveConflictAction = class ConfigureSaveConflictAction extends Action {
    constructor(preferencesService) {
        super('workbench.files.action.configureSaveConflict', localize('configure', "Configure"));
        this.preferencesService = preferencesService;
    }
    async run() {
        this.preferencesService.openSettings({ query: 'files.saveConflictResolution' });
    }
};
ConfigureSaveConflictAction = __decorate([
    __param(0, IPreferencesService),
    __metadata("design:paramtypes", [Object])
], ConfigureSaveConflictAction);
export const acceptLocalChangesCommand = (accessor, resource) => {
    return acceptOrRevertLocalChangesCommand(accessor, resource, true);
};
export const revertLocalChangesCommand = (accessor, resource) => {
    return acceptOrRevertLocalChangesCommand(accessor, resource, false);
};
async function acceptOrRevertLocalChangesCommand(accessor, resource, accept) {
    const editorService = accessor.get(IEditorService);
    const editorPane = editorService.activeEditorPane;
    if (!editorPane) {
        return;
    }
    const editor = editorPane.input;
    const group = editorPane.group;
    // Hide any previously shown message about how to use these actions
    clearPendingResolveSaveConflictMessages();
    // Accept or revert
    if (accept) {
        const options = { ignoreModifiedSince: true, reason: 1 /* SaveReason.EXPLICIT */ };
        await editorService.save({ editor, groupId: group.id }, options);
    }
    else {
        await editorService.revert({ editor, groupId: group.id });
    }
    // Reopen original editor
    await editorService.openEditor({ resource }, group);
    // Clean up
    return group.closeEditor(editor);
}
