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
import { localize } from '../../../../nls.js';
import { DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { StoredFileWorkingCopy } from './storedFileWorkingCopy.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { Promises, ResourceQueue } from '../../../../base/common/async.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { joinPath } from '../../../../base/common/resources.js';
import { IWorkingCopyFileService } from './workingCopyFileService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { BaseFileWorkingCopyManager } from './abstractFileWorkingCopyManager.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IWorkingCopyEditorService } from './workingCopyEditorService.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { isWeb } from '../../../../base/common/platform.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
let StoredFileWorkingCopyManager = class StoredFileWorkingCopyManager extends BaseFileWorkingCopyManager {
    constructor(workingCopyTypeId, modelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, progressService) {
        super(fileService, logService, workingCopyBackupService);
        this.workingCopyTypeId = workingCopyTypeId;
        this.modelFactory = modelFactory;
        this.lifecycleService = lifecycleService;
        this.labelService = labelService;
        this.workingCopyFileService = workingCopyFileService;
        this.uriIdentityService = uriIdentityService;
        this.filesConfigurationService = filesConfigurationService;
        this.workingCopyService = workingCopyService;
        this.notificationService = notificationService;
        this.workingCopyEditorService = workingCopyEditorService;
        this.editorService = editorService;
        this.elevatedFileService = elevatedFileService;
        this.progressService = progressService;
        this._onDidResolve = this._register(new Emitter());
        this.onDidResolve = this._onDidResolve.event;
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onDidChangeReadonly = this._register(new Emitter());
        this.onDidChangeReadonly = this._onDidChangeReadonly.event;
        this._onDidChangeOrphaned = this._register(new Emitter());
        this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
        this._onDidSaveError = this._register(new Emitter());
        this.onDidSaveError = this._onDidSaveError.event;
        this._onDidSave = this._register(new Emitter());
        this.onDidSave = this._onDidSave.event;
        this._onDidRevert = this._register(new Emitter());
        this.onDidRevert = this._onDidRevert.event;
        this._onDidRemove = this._register(new Emitter());
        this.onDidRemove = this._onDidRemove.event;
        this.mapResourceToWorkingCopyListeners = new ResourceMap();
        this.mapResourceToPendingWorkingCopyResolve = new ResourceMap();
        this.workingCopyResolveQueue = this._register(new ResourceQueue());
        this.mapCorrelationIdToWorkingCopiesToRestore = new Map();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidChangeFileSystemProviderCapabilities(e)));
        this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidChangeFileSystemProviderRegistrations(e)));
        this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => this.onWillRunWorkingCopyFileOperation(e)));
        this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation(e => this.onDidFailWorkingCopyFileOperation(e)));
        this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => this.onDidRunWorkingCopyFileOperation(e)));
        if (isWeb) {
            this._register(this.lifecycleService.onBeforeShutdown(event => event.veto(this.onBeforeShutdownWeb(), 'veto.fileWorkingCopyManager')));
        }
        else {
            this._register(this.lifecycleService.onWillShutdown(event => event.join(this.onWillShutdownDesktop(), { id: 'join.fileWorkingCopyManager', label: localize('join.fileWorkingCopyManager', "Saving working copies") })));
        }
    }
    onBeforeShutdownWeb() {
        if (this.workingCopies.some(workingCopy => workingCopy.hasState(2))) {
            return true;
        }
        return false;
    }
    async onWillShutdownDesktop() {
        let pendingSavedWorkingCopies;
        while ((pendingSavedWorkingCopies = this.workingCopies.filter(workingCopy => workingCopy.hasState(2))).length > 0) {
            await Promises.settled(pendingSavedWorkingCopies.map(workingCopy => workingCopy.joinState(2)));
        }
    }
    onDidChangeFileSystemProviderCapabilities(e) {
        this.queueWorkingCopyReloads(e.scheme);
    }
    onDidChangeFileSystemProviderRegistrations(e) {
        if (!e.added) {
            return;
        }
        this.queueWorkingCopyReloads(e.scheme);
    }
    onDidFilesChange(e) {
        this.queueWorkingCopyReloads(e);
    }
    queueWorkingCopyReloads(schemeOrEvent) {
        for (const workingCopy of this.workingCopies) {
            if (workingCopy.isDirty()) {
                continue;
            }
            let resolveWorkingCopy = false;
            if (typeof schemeOrEvent === 'string') {
                resolveWorkingCopy = schemeOrEvent === workingCopy.resource.scheme;
            }
            else {
                resolveWorkingCopy = schemeOrEvent.contains(workingCopy.resource, 0, 1);
            }
            if (resolveWorkingCopy) {
                this.queueWorkingCopyReload(workingCopy);
            }
        }
    }
    queueWorkingCopyReload(workingCopy) {
        const queueSize = this.workingCopyResolveQueue.queueSize(workingCopy.resource);
        if (queueSize <= 1) {
            this.workingCopyResolveQueue.queueFor(workingCopy.resource, async () => {
                try {
                    await this.reload(workingCopy);
                }
                catch (error) {
                    this.logService.error(error);
                }
            });
        }
    }
    onWillRunWorkingCopyFileOperation(e) {
        if (e.operation === 2 || e.operation === 3) {
            e.waitUntil((async () => {
                const workingCopiesToRestore = [];
                for (const { source, target } of e.files) {
                    if (source) {
                        if (this.uriIdentityService.extUri.isEqual(source, target)) {
                            continue;
                        }
                        const sourceWorkingCopies = [];
                        for (const workingCopy of this.workingCopies) {
                            if (this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, source)) {
                                sourceWorkingCopies.push(workingCopy);
                            }
                        }
                        for (const sourceWorkingCopy of sourceWorkingCopies) {
                            const sourceResource = sourceWorkingCopy.resource;
                            let targetResource;
                            if (this.uriIdentityService.extUri.isEqual(sourceResource, source)) {
                                targetResource = target;
                            }
                            else {
                                targetResource = joinPath(target, sourceResource.path.substr(source.path.length + 1));
                            }
                            workingCopiesToRestore.push({
                                source: sourceResource,
                                target: targetResource,
                                snapshot: sourceWorkingCopy.isDirty() ? await sourceWorkingCopy.model?.snapshot(1, CancellationToken.None) : undefined
                            });
                        }
                    }
                }
                this.mapCorrelationIdToWorkingCopiesToRestore.set(e.correlationId, workingCopiesToRestore);
            })());
        }
    }
    onDidFailWorkingCopyFileOperation(e) {
        if ((e.operation === 2 || e.operation === 3)) {
            const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
            if (workingCopiesToRestore) {
                this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
                for (const workingCopy of workingCopiesToRestore) {
                    if (workingCopy.snapshot) {
                        this.get(workingCopy.source)?.markModified();
                    }
                }
            }
        }
    }
    onDidRunWorkingCopyFileOperation(e) {
        switch (e.operation) {
            case 0:
                e.waitUntil((async () => {
                    for (const { target } of e.files) {
                        const workingCopy = this.get(target);
                        if (workingCopy && !workingCopy.isDisposed()) {
                            await workingCopy.revert();
                        }
                    }
                })());
                break;
            case 2:
            case 3:
                e.waitUntil((async () => {
                    const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
                    if (workingCopiesToRestore) {
                        this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
                        await Promises.settled(workingCopiesToRestore.map(async (workingCopyToRestore) => {
                            const target = this.uriIdentityService.asCanonicalUri(workingCopyToRestore.target);
                            await this.resolve(target, {
                                reload: { async: false },
                                contents: workingCopyToRestore.snapshot
                            });
                        }));
                    }
                })());
                break;
        }
    }
    async reload(workingCopy) {
        await this.joinPendingResolves(workingCopy.resource);
        if (workingCopy.isDirty() || workingCopy.isDisposed() || !this.has(workingCopy.resource)) {
            return;
        }
        await this.doResolve(workingCopy, { reload: { async: false } });
    }
    async resolve(resource, options) {
        const pendingResolve = this.joinPendingResolves(resource);
        if (pendingResolve) {
            await pendingResolve;
        }
        return this.doResolve(resource, options);
    }
    async doResolve(resourceOrWorkingCopy, options) {
        let workingCopy;
        let resource;
        if (URI.isUri(resourceOrWorkingCopy)) {
            resource = resourceOrWorkingCopy;
            workingCopy = this.get(resource);
        }
        else {
            resource = resourceOrWorkingCopy.resource;
            workingCopy = resourceOrWorkingCopy;
        }
        let workingCopyResolve;
        let didCreateWorkingCopy = false;
        const resolveOptions = {
            contents: options?.contents,
            forceReadFromFile: options?.reload?.force,
            limits: options?.limits
        };
        if (workingCopy) {
            if (options?.contents) {
                workingCopyResolve = workingCopy.resolve(resolveOptions);
            }
            else if (options?.reload) {
                if (options.reload.async) {
                    workingCopyResolve = Promise.resolve();
                    (async () => {
                        try {
                            await workingCopy.resolve(resolveOptions);
                        }
                        catch (error) {
                            onUnexpectedError(error);
                        }
                    })();
                }
                else {
                    workingCopyResolve = workingCopy.resolve(resolveOptions);
                }
            }
            else {
                workingCopyResolve = Promise.resolve();
            }
        }
        else {
            didCreateWorkingCopy = true;
            workingCopy = new StoredFileWorkingCopy(this.workingCopyTypeId, resource, this.labelService.getUriBasenameLabel(resource), this.modelFactory, async (options) => { await this.resolve(resource, { ...options, reload: { async: false } }); }, this.fileService, this.logService, this.workingCopyFileService, this.filesConfigurationService, this.workingCopyBackupService, this.workingCopyService, this.notificationService, this.workingCopyEditorService, this.editorService, this.elevatedFileService, this.progressService);
            workingCopyResolve = workingCopy.resolve(resolveOptions);
            this.registerWorkingCopy(workingCopy);
        }
        this.mapResourceToPendingWorkingCopyResolve.set(resource, workingCopyResolve);
        this.add(resource, workingCopy);
        if (didCreateWorkingCopy) {
            if (workingCopy.isDirty()) {
                this._onDidChangeDirty.fire(workingCopy);
            }
        }
        try {
            await workingCopyResolve;
        }
        catch (error) {
            if (didCreateWorkingCopy) {
                workingCopy.dispose();
            }
            throw error;
        }
        finally {
            this.mapResourceToPendingWorkingCopyResolve.delete(resource);
        }
        if (didCreateWorkingCopy && workingCopy.isDirty()) {
            this._onDidChangeDirty.fire(workingCopy);
        }
        return workingCopy;
    }
    joinPendingResolves(resource) {
        const pendingWorkingCopyResolve = this.mapResourceToPendingWorkingCopyResolve.get(resource);
        if (!pendingWorkingCopyResolve) {
            return;
        }
        return this.doJoinPendingResolves(resource);
    }
    async doJoinPendingResolves(resource) {
        let currentWorkingCopyResolve;
        while (this.mapResourceToPendingWorkingCopyResolve.has(resource)) {
            const nextPendingWorkingCopyResolve = this.mapResourceToPendingWorkingCopyResolve.get(resource);
            if (nextPendingWorkingCopyResolve === currentWorkingCopyResolve) {
                return;
            }
            currentWorkingCopyResolve = nextPendingWorkingCopyResolve;
            try {
                await nextPendingWorkingCopyResolve;
            }
            catch (error) {
            }
        }
    }
    registerWorkingCopy(workingCopy) {
        const workingCopyListeners = new DisposableStore();
        workingCopyListeners.add(workingCopy.onDidResolve(() => this._onDidResolve.fire(workingCopy)));
        workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
        workingCopyListeners.add(workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire(workingCopy)));
        workingCopyListeners.add(workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire(workingCopy)));
        workingCopyListeners.add(workingCopy.onDidSaveError(() => this._onDidSaveError.fire(workingCopy)));
        workingCopyListeners.add(workingCopy.onDidSave(e => this._onDidSave.fire({ workingCopy, ...e })));
        workingCopyListeners.add(workingCopy.onDidRevert(() => this._onDidRevert.fire(workingCopy)));
        this.mapResourceToWorkingCopyListeners.set(workingCopy.resource, workingCopyListeners);
    }
    remove(resource) {
        const removed = super.remove(resource);
        const workingCopyListener = this.mapResourceToWorkingCopyListeners.get(resource);
        if (workingCopyListener) {
            dispose(workingCopyListener);
            this.mapResourceToWorkingCopyListeners.delete(resource);
        }
        if (removed) {
            this._onDidRemove.fire(resource);
        }
        return removed;
    }
    canDispose(workingCopy) {
        if (workingCopy.isDisposed() ||
            (!this.mapResourceToPendingWorkingCopyResolve.has(workingCopy.resource) && !workingCopy.isDirty())) {
            return true;
        }
        return this.doCanDispose(workingCopy);
    }
    async doCanDispose(workingCopy) {
        const pendingResolve = this.joinPendingResolves(workingCopy.resource);
        if (pendingResolve) {
            await pendingResolve;
            return this.canDispose(workingCopy);
        }
        if (workingCopy.isDirty()) {
            await Event.toPromise(workingCopy.onDidChangeDirty);
            return this.canDispose(workingCopy);
        }
        return true;
    }
    dispose() {
        super.dispose();
        this.mapResourceToPendingWorkingCopyResolve.clear();
        dispose(this.mapResourceToWorkingCopyListeners.values());
        this.mapResourceToWorkingCopyListeners.clear();
    }
};
StoredFileWorkingCopyManager = __decorate([
    __param(2, IFileService),
    __param(3, ILifecycleService),
    __param(4, ILabelService),
    __param(5, ILogService),
    __param(6, IWorkingCopyFileService),
    __param(7, IWorkingCopyBackupService),
    __param(8, IUriIdentityService),
    __param(9, IFilesConfigurationService),
    __param(10, IWorkingCopyService),
    __param(11, INotificationService),
    __param(12, IWorkingCopyEditorService),
    __param(13, IEditorService),
    __param(14, IElevatedFileService),
    __param(15, IProgressService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], StoredFileWorkingCopyManager);
export { StoredFileWorkingCopyManager };
