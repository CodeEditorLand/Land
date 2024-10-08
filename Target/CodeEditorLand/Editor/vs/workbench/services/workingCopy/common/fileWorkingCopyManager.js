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
var FileWorkingCopyManager_1;
import { localize } from '../../../../nls.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Promises } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { toLocalResource, joinPath, isEqual, basename, dirname } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileDialogService, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { SaveSourceRegistry } from '../../../common/editor.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { StoredFileWorkingCopyManager } from './storedFileWorkingCopyManager.js';
import { UntitledFileWorkingCopy } from './untitledFileWorkingCopy.js';
import { UntitledFileWorkingCopyManager } from './untitledFileWorkingCopyManager.js';
import { IWorkingCopyFileService } from './workingCopyFileService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { IWorkingCopyEditorService } from './workingCopyEditorService.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { Schemas } from '../../../../base/common/network.js';
import { IDecorationsService } from '../../decorations/common/decorations.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { listErrorForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
let FileWorkingCopyManager = class FileWorkingCopyManager extends Disposable {
    static { FileWorkingCopyManager_1 = this; }
    static { this.FILE_WORKING_COPY_SAVE_CREATE_SOURCE = SaveSourceRegistry.registerSource('fileWorkingCopyCreate.source', localize('fileWorkingCopyCreate.source', "File Created")); }
    static { this.FILE_WORKING_COPY_SAVE_REPLACE_SOURCE = SaveSourceRegistry.registerSource('fileWorkingCopyReplace.source', localize('fileWorkingCopyReplace.source', "File Replaced")); }
    constructor(workingCopyTypeId, storedWorkingCopyModelFactory, untitledWorkingCopyModelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, fileDialogService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, pathService, environmentService, dialogService, decorationsService, progressService) {
        super();
        this.workingCopyTypeId = workingCopyTypeId;
        this.storedWorkingCopyModelFactory = storedWorkingCopyModelFactory;
        this.untitledWorkingCopyModelFactory = untitledWorkingCopyModelFactory;
        this.fileService = fileService;
        this.logService = logService;
        this.workingCopyFileService = workingCopyFileService;
        this.uriIdentityService = uriIdentityService;
        this.fileDialogService = fileDialogService;
        this.filesConfigurationService = filesConfigurationService;
        this.pathService = pathService;
        this.environmentService = environmentService;
        this.dialogService = dialogService;
        this.decorationsService = decorationsService;
        // Stored file working copies manager
        this.stored = this._register(new StoredFileWorkingCopyManager(this.workingCopyTypeId, this.storedWorkingCopyModelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, progressService));
        // Untitled file working copies manager
        this.untitled = this._register(new UntitledFileWorkingCopyManager(this.workingCopyTypeId, this.untitledWorkingCopyModelFactory, async (workingCopy, options) => {
            const result = await this.saveAs(workingCopy.resource, undefined, options);
            return result ? true : false;
        }, fileService, labelService, logService, workingCopyBackupService, workingCopyService));
        // Events
        this.onDidCreate = Event.any(this.stored.onDidCreate, this.untitled.onDidCreate);
        // Decorations
        this.provideDecorations();
    }
    //#region decorations
    provideDecorations() {
        // File working copy decorations
        const provider = this._register(new class extends Disposable {
            constructor(stored) {
                super();
                this.stored = stored;
                this.label = localize('fileWorkingCopyDecorations', "File Working Copy Decorations");
                this._onDidChange = this._register(new Emitter());
                this.onDidChange = this._onDidChange.event;
                this.registerListeners();
            }
            registerListeners() {
                // Creates
                this._register(this.stored.onDidResolve(workingCopy => {
                    if (workingCopy.isReadonly() || workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */)) {
                        this._onDidChange.fire([workingCopy.resource]);
                    }
                }));
                // Removals: once a stored working copy is no longer
                // under our control, make sure to signal this as
                // decoration change because from this point on we
                // have no way of updating the decoration anymore.
                this._register(this.stored.onDidRemove(workingCopyUri => this._onDidChange.fire([workingCopyUri])));
                // Changes
                this._register(this.stored.onDidChangeReadonly(workingCopy => this._onDidChange.fire([workingCopy.resource])));
                this._register(this.stored.onDidChangeOrphaned(workingCopy => this._onDidChange.fire([workingCopy.resource])));
            }
            provideDecorations(uri) {
                const workingCopy = this.stored.get(uri);
                if (!workingCopy || workingCopy.isDisposed()) {
                    return undefined;
                }
                const isReadonly = workingCopy.isReadonly();
                const isOrphaned = workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */);
                // Readonly + Orphaned
                if (isReadonly && isOrphaned) {
                    return {
                        color: listErrorForeground,
                        letter: Codicon.lockSmall,
                        strikethrough: true,
                        tooltip: localize('readonlyAndDeleted', "Deleted, Read-only"),
                    };
                }
                // Readonly
                else if (isReadonly) {
                    return {
                        letter: Codicon.lockSmall,
                        tooltip: localize('readonly', "Read-only"),
                    };
                }
                // Orphaned
                else if (isOrphaned) {
                    return {
                        color: listErrorForeground,
                        strikethrough: true,
                        tooltip: localize('deleted', "Deleted"),
                    };
                }
                return undefined;
            }
        }(this.stored));
        this._register(this.decorationsService.registerDecorationsProvider(provider));
    }
    //#endregin
    //#region get / get all
    get workingCopies() {
        return [...this.stored.workingCopies, ...this.untitled.workingCopies];
    }
    get(resource) {
        return this.stored.get(resource) ?? this.untitled.get(resource);
    }
    resolve(arg1, arg2) {
        if (URI.isUri(arg1)) {
            // Untitled: via untitled manager
            if (arg1.scheme === Schemas.untitled) {
                return this.untitled.resolve({ untitledResource: arg1 });
            }
            // else: via stored file manager
            else {
                return this.stored.resolve(arg1, arg2);
            }
        }
        return this.untitled.resolve(arg1);
    }
    //#endregion
    //#region Save
    async saveAs(source, target, options) {
        // Get to target resource
        if (!target) {
            const workingCopy = this.get(source);
            if (workingCopy instanceof UntitledFileWorkingCopy && workingCopy.hasAssociatedFilePath) {
                target = await this.suggestSavePath(source);
            }
            else {
                target = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(options?.suggestedTarget ?? source), options?.availableFileSystems);
            }
        }
        if (!target) {
            return; // user canceled
        }
        // Ensure target is not marked as readonly and prompt otherwise
        if (this.filesConfigurationService.isReadonly(target)) {
            const confirmed = await this.confirmMakeWriteable(target);
            if (!confirmed) {
                return;
            }
            else {
                this.filesConfigurationService.updateReadonly(target, false);
            }
        }
        // Just save if target is same as working copies own resource
        // and we are not saving an untitled file working copy
        if (this.fileService.hasProvider(source) && isEqual(source, target)) {
            return this.doSave(source, { ...options, force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ });
        }
        // If the target is different but of same identity, we
        // move the source to the target, knowing that the
        // underlying file system cannot have both and then save.
        // However, this will only work if the source exists
        // and is not orphaned, so we need to check that too.
        if (this.fileService.hasProvider(source) && this.uriIdentityService.extUri.isEqual(source, target) && (await this.fileService.exists(source))) {
            // Move via working copy file service to enable participants
            await this.workingCopyFileService.move([{ file: { source, target } }], CancellationToken.None);
            // At this point we don't know whether we have a
            // working copy for the source or the target URI so we
            // simply try to save with both resources.
            return (await this.doSave(source, options)) ?? (await this.doSave(target, options));
        }
        // Perform normal "Save As"
        return this.doSaveAs(source, target, options);
    }
    async doSave(resource, options) {
        // Save is only possible with stored file working copies,
        // any other have to go via `saveAs` flow.
        const storedFileWorkingCopy = this.stored.get(resource);
        if (storedFileWorkingCopy) {
            const success = await storedFileWorkingCopy.save(options);
            if (success) {
                return storedFileWorkingCopy;
            }
        }
        return undefined;
    }
    async doSaveAs(source, target, options) {
        let sourceContents;
        // If the source is an existing file working copy, we can directly
        // use that to copy the contents to the target destination
        const sourceWorkingCopy = this.get(source);
        if (sourceWorkingCopy?.isResolved()) {
            sourceContents = await sourceWorkingCopy.model.snapshot(1 /* SnapshotContext.Save */, CancellationToken.None);
        }
        // Otherwise we resolve the contents from the underlying file
        else {
            sourceContents = (await this.fileService.readFileStream(source)).value;
        }
        // Resolve target
        const { targetFileExists, targetStoredFileWorkingCopy } = await this.doResolveSaveTarget(source, target);
        // Confirm to overwrite if we have an untitled file working copy with associated path where
        // the file actually exists on disk and we are instructed to save to that file path.
        // This can happen if the file was created after the untitled file was opened.
        // See https://github.com/microsoft/vscode/issues/67946
        if (sourceWorkingCopy instanceof UntitledFileWorkingCopy &&
            sourceWorkingCopy.hasAssociatedFilePath &&
            targetFileExists &&
            this.uriIdentityService.extUri.isEqual(target, toLocalResource(sourceWorkingCopy.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme))) {
            const overwrite = await this.confirmOverwrite(target);
            if (!overwrite) {
                return undefined;
            }
        }
        // Take over content from source to target
        await targetStoredFileWorkingCopy.model?.update(sourceContents, CancellationToken.None);
        // Set source options depending on target exists or not
        if (!options?.source) {
            options = {
                ...options,
                source: targetFileExists ? FileWorkingCopyManager_1.FILE_WORKING_COPY_SAVE_REPLACE_SOURCE : FileWorkingCopyManager_1.FILE_WORKING_COPY_SAVE_CREATE_SOURCE
            };
        }
        // Save target
        const success = await targetStoredFileWorkingCopy.save({
            ...options,
            from: source,
            force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */
        });
        if (!success) {
            return undefined;
        }
        // Revert the source
        try {
            await sourceWorkingCopy?.revert();
        }
        catch (error) {
            // It is possible that reverting the source fails, for example
            // when a remote is disconnected and we cannot read it anymore.
            // However, this should not interrupt the "Save As" flow, so
            // we gracefully catch the error and just log it.
            this.logService.error(error);
        }
        return targetStoredFileWorkingCopy;
    }
    async doResolveSaveTarget(source, target) {
        // Prefer an existing stored file working copy if it is already resolved
        // for the given target resource
        let targetFileExists = false;
        let targetStoredFileWorkingCopy = this.stored.get(target);
        if (targetStoredFileWorkingCopy?.isResolved()) {
            targetFileExists = true;
        }
        // Otherwise create the target working copy empty if
        // it does not exist already and resolve it from there
        else {
            targetFileExists = await this.fileService.exists(target);
            // Create target file adhoc if it does not exist yet
            if (!targetFileExists) {
                await this.workingCopyFileService.create([{ resource: target }], CancellationToken.None);
            }
            // At this point we need to resolve the target working copy
            // and we have to do an explicit check if the source URI
            // equals the target via URI identity. If they match and we
            // have had an existing working copy with the source, we
            // prefer that one over resolving the target. Otherwise we
            // would potentially introduce a
            if (this.uriIdentityService.extUri.isEqual(source, target) && this.get(source)) {
                targetStoredFileWorkingCopy = await this.stored.resolve(source);
            }
            else {
                targetStoredFileWorkingCopy = await this.stored.resolve(target);
            }
        }
        return { targetFileExists, targetStoredFileWorkingCopy };
    }
    async confirmOverwrite(resource) {
        const { confirmed } = await this.dialogService.confirm({
            type: 'warning',
            message: localize('confirmOverwrite', "'{0}' already exists. Do you want to replace it?", basename(resource)),
            detail: localize('overwriteIrreversible', "A file or folder with the name '{0}' already exists in the folder '{1}'. Replacing it will overwrite its current contents.", basename(resource), basename(dirname(resource))),
            primaryButton: localize({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace")
        });
        return confirmed;
    }
    async confirmMakeWriteable(resource) {
        const { confirmed } = await this.dialogService.confirm({
            type: 'warning',
            message: localize('confirmMakeWriteable', "'{0}' is marked as read-only. Do you want to save anyway?", basename(resource)),
            detail: localize('confirmMakeWriteableDetail', "Paths can be configured as read-only via settings."),
            primaryButton: localize({ key: 'makeWriteableButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Save Anyway")
        });
        return confirmed;
    }
    async suggestSavePath(resource) {
        // 1.) Just take the resource as is if the file service can handle it
        if (this.fileService.hasProvider(resource)) {
            return resource;
        }
        // 2.) Pick the associated file path for untitled working copies if any
        const workingCopy = this.get(resource);
        if (workingCopy instanceof UntitledFileWorkingCopy && workingCopy.hasAssociatedFilePath) {
            return toLocalResource(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
        }
        const defaultFilePath = await this.fileDialogService.defaultFilePath();
        // 3.) Pick the working copy name if valid joined with default path
        if (workingCopy) {
            const candidatePath = joinPath(defaultFilePath, workingCopy.name);
            if (await this.pathService.hasValidBasename(candidatePath, workingCopy.name)) {
                return candidatePath;
            }
        }
        // 4.) Finally fallback to the name of the resource joined with default path
        return joinPath(defaultFilePath, basename(resource));
    }
    //#endregion
    //#region Lifecycle
    async destroy() {
        await Promises.settled([
            this.stored.destroy(),
            this.untitled.destroy()
        ]);
    }
};
FileWorkingCopyManager = FileWorkingCopyManager_1 = __decorate([
    __param(3, IFileService),
    __param(4, ILifecycleService),
    __param(5, ILabelService),
    __param(6, ILogService),
    __param(7, IWorkingCopyFileService),
    __param(8, IWorkingCopyBackupService),
    __param(9, IUriIdentityService),
    __param(10, IFileDialogService),
    __param(11, IFilesConfigurationService),
    __param(12, IWorkingCopyService),
    __param(13, INotificationService),
    __param(14, IWorkingCopyEditorService),
    __param(15, IEditorService),
    __param(16, IElevatedFileService),
    __param(17, IPathService),
    __param(18, IWorkbenchEnvironmentService),
    __param(19, IDialogService),
    __param(20, IDecorationsService),
    __param(21, IProgressService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], FileWorkingCopyManager);
export { FileWorkingCopyManager };
