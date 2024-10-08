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
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, dispose } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { Promises } from '../../../../base/common/async.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
let BaseFileWorkingCopyManager = class BaseFileWorkingCopyManager extends Disposable {
    constructor(fileService, logService, workingCopyBackupService) {
        super();
        this.fileService = fileService;
        this.logService = logService;
        this.workingCopyBackupService = workingCopyBackupService;
        this._onDidCreate = this._register(new Emitter());
        this.onDidCreate = this._onDidCreate.event;
        this.mapResourceToWorkingCopy = new ResourceMap();
        this.mapResourceToDisposeListener = new ResourceMap();
    }
    has(resource) {
        return this.mapResourceToWorkingCopy.has(resource);
    }
    add(resource, workingCopy) {
        const knownWorkingCopy = this.get(resource);
        if (knownWorkingCopy === workingCopy) {
            return; // already cached
        }
        // Add to our working copy map
        this.mapResourceToWorkingCopy.set(resource, workingCopy);
        // Update our dispose listener to remove it on dispose
        this.mapResourceToDisposeListener.get(resource)?.dispose();
        this.mapResourceToDisposeListener.set(resource, workingCopy.onWillDispose(() => this.remove(resource)));
        // Signal creation event
        this._onDidCreate.fire(workingCopy);
    }
    remove(resource) {
        // Dispose any existing listener
        const disposeListener = this.mapResourceToDisposeListener.get(resource);
        if (disposeListener) {
            dispose(disposeListener);
            this.mapResourceToDisposeListener.delete(resource);
        }
        // Remove from our working copy map
        return this.mapResourceToWorkingCopy.delete(resource);
    }
    //#region Get / Get all
    get workingCopies() {
        return [...this.mapResourceToWorkingCopy.values()];
    }
    get(resource) {
        return this.mapResourceToWorkingCopy.get(resource);
    }
    //#endregion
    //#region Lifecycle
    dispose() {
        super.dispose();
        // Clear working copy caches
        //
        // Note: we are not explicitly disposing the working copies
        // known to the manager because this can have unwanted side
        // effects such as backups getting discarded once the working
        // copy unregisters. We have an explicit `destroy`
        // for that purpose (https://github.com/microsoft/vscode/pull/123555)
        //
        this.mapResourceToWorkingCopy.clear();
        // Dispose the dispose listeners
        dispose(this.mapResourceToDisposeListener.values());
        this.mapResourceToDisposeListener.clear();
    }
    async destroy() {
        // Make sure all dirty working copies are saved to disk
        try {
            await Promises.settled(this.workingCopies.map(async (workingCopy) => {
                if (workingCopy.isDirty()) {
                    await this.saveWithFallback(workingCopy);
                }
            }));
        }
        catch (error) {
            this.logService.error(error);
        }
        // Dispose all working copies
        dispose(this.mapResourceToWorkingCopy.values());
        // Finally dispose manager
        this.dispose();
    }
    async saveWithFallback(workingCopy) {
        // First try regular save
        let saveSuccess = false;
        try {
            saveSuccess = await workingCopy.save();
        }
        catch (error) {
            // Ignore
        }
        // Then fallback to backup if that exists
        if (!saveSuccess || workingCopy.isDirty()) {
            const backup = await this.workingCopyBackupService.resolve(workingCopy);
            if (backup) {
                await this.fileService.writeFile(workingCopy.resource, backup.value, { unlock: true });
            }
        }
    }
};
BaseFileWorkingCopyManager = __decorate([
    __param(0, IFileService),
    __param(1, ILogService),
    __param(2, IWorkingCopyBackupService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BaseFileWorkingCopyManager);
export { BaseFileWorkingCopyManager };
