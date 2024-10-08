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
var MainThreadFileSystemEventService_1;
import { DisposableMap, DisposableStore } from '../../../base/common/lifecycle.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { localize } from '../../../nls.js';
import { IWorkingCopyFileService } from '../../services/workingCopy/common/workingCopyFileService.js';
import { IBulkEditService } from '../../../editor/browser/services/bulkEditService.js';
import { IProgressService } from '../../../platform/progress/common/progress.js';
import { raceCancellation } from '../../../base/common/async.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import Severity from '../../../base/common/severity.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { Action2, registerAction2 } from '../../../platform/actions/common/actions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { reviveWorkspaceEditDto } from './mainThreadBulkEdits.js';
import { URI } from '../../../base/common/uri.js';
let MainThreadFileSystemEventService = class MainThreadFileSystemEventService {
    static { MainThreadFileSystemEventService_1 = this; }
    static { this.MementoKeyAdditionalEdits = `file.particpants.additionalEdits`; }
    constructor(extHostContext, _fileService, workingCopyFileService, bulkEditService, progressService, dialogService, storageService, logService, envService, uriIdentService, _logService) {
        this._fileService = _fileService;
        this._logService = _logService;
        this._listener = new DisposableStore();
        this._watches = new DisposableMap();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostFileSystemEventService);
        this._listener.add(_fileService.onDidFilesChange(event => {
            this._proxy.$onFileEvent({
                created: event.rawAdded,
                changed: event.rawUpdated,
                deleted: event.rawDeleted
            });
        }));
        const that = this;
        const fileOperationParticipant = new class {
            async participate(files, operation, undoInfo, timeout, token) {
                if (undoInfo?.isUndoing) {
                    return;
                }
                const cts = new CancellationTokenSource(token);
                const timer = setTimeout(() => cts.cancel(), timeout);
                const data = await progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: this._progressLabel(operation),
                    cancellable: true,
                    delay: Math.min(timeout / 2, 3000)
                }, () => {
                    // race extension host event delivery against timeout AND user-cancel
                    const onWillEvent = that._proxy.$onWillRunFileOperation(operation, files, timeout, cts.token);
                    return raceCancellation(onWillEvent, cts.token);
                }, () => {
                    // user-cancel
                    cts.cancel();
                }).finally(() => {
                    cts.dispose();
                    clearTimeout(timer);
                });
                if (!data || data.edit.edits.length === 0) {
                    // cancelled, no reply, or no edits
                    return;
                }
                const needsConfirmation = data.edit.edits.some(edit => edit.metadata?.needsConfirmation);
                let showPreview = storageService.getBoolean(MainThreadFileSystemEventService_1.MementoKeyAdditionalEdits, 0 /* StorageScope.PROFILE */);
                if (envService.extensionTestsLocationURI) {
                    // don't show dialog in tests
                    showPreview = false;
                }
                if (showPreview === undefined) {
                    // show a user facing message
                    let message;
                    if (data.extensionNames.length === 1) {
                        if (operation === 0 /* FileOperation.CREATE */) {
                            message = localize('ask.1.create', "Extension '{0}' wants to make refactoring changes with this file creation", data.extensionNames[0]);
                        }
                        else if (operation === 3 /* FileOperation.COPY */) {
                            message = localize('ask.1.copy', "Extension '{0}' wants to make refactoring changes with this file copy", data.extensionNames[0]);
                        }
                        else if (operation === 2 /* FileOperation.MOVE */) {
                            message = localize('ask.1.move', "Extension '{0}' wants to make refactoring changes with this file move", data.extensionNames[0]);
                        }
                        else /* if (operation === FileOperation.DELETE) */ {
                            message = localize('ask.1.delete', "Extension '{0}' wants to make refactoring changes with this file deletion", data.extensionNames[0]);
                        }
                    }
                    else {
                        if (operation === 0 /* FileOperation.CREATE */) {
                            message = localize({ key: 'ask.N.create', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file creation", data.extensionNames.length);
                        }
                        else if (operation === 3 /* FileOperation.COPY */) {
                            message = localize({ key: 'ask.N.copy', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file copy", data.extensionNames.length);
                        }
                        else if (operation === 2 /* FileOperation.MOVE */) {
                            message = localize({ key: 'ask.N.move', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file move", data.extensionNames.length);
                        }
                        else /* if (operation === FileOperation.DELETE) */ {
                            message = localize({ key: 'ask.N.delete', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file deletion", data.extensionNames.length);
                        }
                    }
                    if (needsConfirmation) {
                        // edit which needs confirmation -> always show dialog
                        const { confirmed } = await dialogService.confirm({
                            type: Severity.Info,
                            message,
                            primaryButton: localize('preview', "Show &&Preview"),
                            cancelButton: localize('cancel', "Skip Changes")
                        });
                        showPreview = true;
                        if (!confirmed) {
                            // no changes wanted
                            return;
                        }
                    }
                    else {
                        // choice
                        let Choice;
                        (function (Choice) {
                            Choice[Choice["OK"] = 0] = "OK";
                            Choice[Choice["Preview"] = 1] = "Preview";
                            Choice[Choice["Cancel"] = 2] = "Cancel";
                        })(Choice || (Choice = {}));
                        const { result, checkboxChecked } = await dialogService.prompt({
                            type: Severity.Info,
                            message,
                            buttons: [
                                {
                                    label: localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                                    run: () => Choice.OK
                                },
                                {
                                    label: localize({ key: 'preview', comment: ['&& denotes a mnemonic'] }, "Show &&Preview"),
                                    run: () => Choice.Preview
                                }
                            ],
                            cancelButton: {
                                label: localize('cancel', "Skip Changes"),
                                run: () => Choice.Cancel
                            },
                            checkbox: { label: localize('again', "Do not ask me again") }
                        });
                        if (result === Choice.Cancel) {
                            // no changes wanted, don't persist cancel option
                            return;
                        }
                        showPreview = result === Choice.Preview;
                        if (checkboxChecked) {
                            storageService.store(MainThreadFileSystemEventService_1.MementoKeyAdditionalEdits, showPreview, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                        }
                    }
                }
                logService.info('[onWill-handler] applying additional workspace edit from extensions', data.extensionNames);
                await bulkEditService.apply(reviveWorkspaceEditDto(data.edit, uriIdentService), { undoRedoGroupId: undoInfo?.undoRedoGroupId, showPreview });
            }
            _progressLabel(operation) {
                switch (operation) {
                    case 0 /* FileOperation.CREATE */:
                        return localize('msg-create', "Running 'File Create' participants...");
                    case 2 /* FileOperation.MOVE */:
                        return localize('msg-rename', "Running 'File Rename' participants...");
                    case 3 /* FileOperation.COPY */:
                        return localize('msg-copy', "Running 'File Copy' participants...");
                    case 1 /* FileOperation.DELETE */:
                        return localize('msg-delete', "Running 'File Delete' participants...");
                    case 4 /* FileOperation.WRITE */:
                        return localize('msg-write', "Running 'File Write' participants...");
                }
            }
        };
        // BEFORE file operation
        this._listener.add(workingCopyFileService.addFileOperationParticipant(fileOperationParticipant));
        // AFTER file operation
        this._listener.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => this._proxy.$onDidRunFileOperation(e.operation, e.files)));
    }
    async $watch(extensionId, session, resource, unvalidatedOpts, correlate) {
        const uri = URI.revive(resource);
        const opts = {
            ...unvalidatedOpts
        };
        // Convert a recursive watcher to a flat watcher if the path
        // turns out to not be a folder. Recursive watching is only
        // possible on folders, so we help all file watchers by checking
        // early.
        if (opts.recursive) {
            try {
                const stat = await this._fileService.stat(uri);
                if (!stat.isDirectory) {
                    opts.recursive = false;
                }
            }
            catch (error) {
                // ignore
            }
        }
        // Correlated file watching: use an exclusive `createWatcher()`
        if (correlate) {
            this._logService.trace(`MainThreadFileSystemEventService#$watch(): request to start watching correlated (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session}, excludes: ${JSON.stringify(opts.excludes)}, includes: ${JSON.stringify(opts.includes)})`);
            const watcherDisposables = new DisposableStore();
            const subscription = watcherDisposables.add(this._fileService.createWatcher(uri, opts));
            watcherDisposables.add(subscription.onDidChange(event => {
                this._proxy.$onFileEvent({
                    session,
                    created: event.rawAdded,
                    changed: event.rawUpdated,
                    deleted: event.rawDeleted
                });
            }));
            this._watches.set(session, watcherDisposables);
        }
        // Uncorrelated file watching: via shared `watch()`
        else {
            this._logService.trace(`MainThreadFileSystemEventService#$watch(): request to start watching uncorrelated (extension: ${extensionId}, path: ${uri.toString(true)}, recursive: ${opts.recursive}, session: ${session}, excludes: ${JSON.stringify(opts.excludes)}, includes: ${JSON.stringify(opts.includes)})`);
            const subscription = this._fileService.watch(uri, opts);
            this._watches.set(session, subscription);
        }
    }
    $unwatch(session) {
        if (this._watches.has(session)) {
            this._logService.trace(`MainThreadFileSystemEventService#$unwatch(): request to stop watching (session: ${session})`);
            this._watches.deleteAndDispose(session);
        }
    }
    dispose() {
        this._listener.dispose();
        this._watches.dispose();
    }
};
MainThreadFileSystemEventService = MainThreadFileSystemEventService_1 = __decorate([
    extHostNamedCustomer(MainContext.MainThreadFileSystemEventService),
    __param(1, IFileService),
    __param(2, IWorkingCopyFileService),
    __param(3, IBulkEditService),
    __param(4, IProgressService),
    __param(5, IDialogService),
    __param(6, IStorageService),
    __param(7, ILogService),
    __param(8, IEnvironmentService),
    __param(9, IUriIdentityService),
    __param(10, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MainThreadFileSystemEventService);
export { MainThreadFileSystemEventService };
registerAction2(class ResetMemento extends Action2 {
    constructor() {
        super({
            id: 'files.participants.resetChoice',
            title: {
                value: localize('label', "Reset choice for 'File operation needs preview'"),
                original: `Reset choice for 'File operation needs preview'`
            },
            f1: true
        });
    }
    run(accessor) {
        accessor.get(IStorageService).remove(MainThreadFileSystemEventService.MementoKeyAdditionalEdits, 0 /* StorageScope.PROFILE */);
    }
});
