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
import { DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { UntitledFileWorkingCopy } from './untitledFileWorkingCopy.js';
import { Emitter } from '../../../../base/common/event.js';
import { Schemas } from '../../../../base/common/network.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { BaseFileWorkingCopyManager } from './abstractFileWorkingCopyManager.js';
import { ResourceMap } from '../../../../base/common/map.js';
let UntitledFileWorkingCopyManager = class UntitledFileWorkingCopyManager extends BaseFileWorkingCopyManager {
    constructor(workingCopyTypeId, modelFactory, saveDelegate, fileService, labelService, logService, workingCopyBackupService, workingCopyService) {
        super(fileService, logService, workingCopyBackupService);
        this.workingCopyTypeId = workingCopyTypeId;
        this.modelFactory = modelFactory;
        this.saveDelegate = saveDelegate;
        this.labelService = labelService;
        this.workingCopyService = workingCopyService;
        //#region Events
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        //#endregion
        this.mapResourceToWorkingCopyListeners = new ResourceMap();
    }
    async resolve(options) {
        const workingCopy = this.doCreateOrGet(options);
        await workingCopy.resolve();
        return workingCopy;
    }
    doCreateOrGet(options = Object.create(null)) {
        const massagedOptions = this.massageOptions(options);
        // Return existing instance if asked for it
        if (massagedOptions.untitledResource) {
            const existingWorkingCopy = this.get(massagedOptions.untitledResource);
            if (existingWorkingCopy) {
                return existingWorkingCopy;
            }
        }
        // Create new instance otherwise
        return this.doCreate(massagedOptions);
    }
    massageOptions(options) {
        const massagedOptions = Object.create(null);
        // Handle associated resource
        if (options.associatedResource) {
            massagedOptions.untitledResource = URI.from({
                scheme: Schemas.untitled,
                authority: options.associatedResource.authority,
                fragment: options.associatedResource.fragment,
                path: options.associatedResource.path,
                query: options.associatedResource.query
            });
            massagedOptions.associatedResource = options.associatedResource;
        }
        // Handle untitled resource
        else {
            if (options.untitledResource?.scheme === Schemas.untitled) {
                massagedOptions.untitledResource = options.untitledResource;
            }
            massagedOptions.isScratchpad = options.isScratchpad;
        }
        // Take over initial value
        massagedOptions.contents = options.contents;
        return massagedOptions;
    }
    doCreate(options) {
        // Create a new untitled resource if none is provided
        let untitledResource = options.untitledResource;
        if (!untitledResource) {
            let counter = 1;
            do {
                untitledResource = URI.from({
                    scheme: Schemas.untitled,
                    path: options.isScratchpad ? `Scratchpad-${counter}` : `Untitled-${counter}`,
                    query: this.workingCopyTypeId ?
                        `typeId=${this.workingCopyTypeId}` : // distinguish untitled resources among others by encoding the `typeId` as query param
                        undefined // keep untitled resources for text files as they are (when `typeId === ''`)
                });
                counter++;
            } while (this.has(untitledResource));
        }
        // Create new working copy with provided options
        const workingCopy = new UntitledFileWorkingCopy(this.workingCopyTypeId, untitledResource, this.labelService.getUriBasenameLabel(untitledResource), !!options.associatedResource, !!options.isScratchpad, options.contents, this.modelFactory, this.saveDelegate, this.workingCopyService, this.workingCopyBackupService, this.logService);
        // Register
        this.registerWorkingCopy(workingCopy);
        return workingCopy;
    }
    registerWorkingCopy(workingCopy) {
        // Install working copy listeners
        const workingCopyListeners = new DisposableStore();
        workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
        workingCopyListeners.add(workingCopy.onWillDispose(() => this._onWillDispose.fire(workingCopy)));
        // Keep for disposal
        this.mapResourceToWorkingCopyListeners.set(workingCopy.resource, workingCopyListeners);
        // Add to cache
        this.add(workingCopy.resource, workingCopy);
        // If the working copy is dirty right from the beginning,
        // make sure to emit this as an event
        if (workingCopy.isDirty()) {
            this._onDidChangeDirty.fire(workingCopy);
        }
    }
    remove(resource) {
        const removed = super.remove(resource);
        // Dispose any existing working copy listeners
        const workingCopyListener = this.mapResourceToWorkingCopyListeners.get(resource);
        if (workingCopyListener) {
            dispose(workingCopyListener);
            this.mapResourceToWorkingCopyListeners.delete(resource);
        }
        return removed;
    }
    //#endregion
    //#region Lifecycle
    dispose() {
        super.dispose();
        // Dispose the working copy change listeners
        dispose(this.mapResourceToWorkingCopyListeners.values());
        this.mapResourceToWorkingCopyListeners.clear();
    }
};
UntitledFileWorkingCopyManager = __decorate([
    __param(3, IFileService),
    __param(4, ILabelService),
    __param(5, ILogService),
    __param(6, IWorkingCopyBackupService),
    __param(7, IWorkingCopyService),
    __metadata("design:paramtypes", [String, Object, Function, Object, Object, Object, Object, Object])
], UntitledFileWorkingCopyManager);
export { UntitledFileWorkingCopyManager };
