/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Emitter } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { Disposable, toDisposable, DisposableStore, DisposableMap } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
export const IWorkingCopyService = createDecorator('workingCopyService');
export class WorkingCopyService extends Disposable {
    constructor() {
        super(...arguments);
        //#region Events
        this._onDidRegister = this._register(new Emitter());
        this.onDidRegister = this._onDidRegister.event;
        this._onDidUnregister = this._register(new Emitter());
        this.onDidUnregister = this._onDidUnregister.event;
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onDidChangeContent = this._register(new Emitter());
        this.onDidChangeContent = this._onDidChangeContent.event;
        this._onDidSave = this._register(new Emitter());
        this.onDidSave = this._onDidSave.event;
        this._workingCopies = new Set();
        this.mapResourceToWorkingCopies = new ResourceMap();
        this.mapWorkingCopyToListeners = this._register(new DisposableMap());
        //#endregion
    }
    //#endregion
    //#region Registry
    get workingCopies() { return Array.from(this._workingCopies.values()); }
    registerWorkingCopy(workingCopy) {
        let workingCopiesForResource = this.mapResourceToWorkingCopies.get(workingCopy.resource);
        if (workingCopiesForResource?.has(workingCopy.typeId)) {
            throw new Error(`Cannot register more than one working copy with the same resource ${workingCopy.resource.toString()} and type ${workingCopy.typeId}.`);
        }
        // Registry (all)
        this._workingCopies.add(workingCopy);
        // Registry (type based)
        if (!workingCopiesForResource) {
            workingCopiesForResource = new Map();
            this.mapResourceToWorkingCopies.set(workingCopy.resource, workingCopiesForResource);
        }
        workingCopiesForResource.set(workingCopy.typeId, workingCopy);
        // Wire in Events
        const disposables = new DisposableStore();
        disposables.add(workingCopy.onDidChangeContent(() => this._onDidChangeContent.fire(workingCopy)));
        disposables.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
        disposables.add(workingCopy.onDidSave(e => this._onDidSave.fire({ workingCopy, ...e })));
        this.mapWorkingCopyToListeners.set(workingCopy, disposables);
        // Send some initial events
        this._onDidRegister.fire(workingCopy);
        if (workingCopy.isDirty()) {
            this._onDidChangeDirty.fire(workingCopy);
        }
        return toDisposable(() => {
            // Unregister working copy
            this.unregisterWorkingCopy(workingCopy);
            // Signal as event
            this._onDidUnregister.fire(workingCopy);
        });
    }
    unregisterWorkingCopy(workingCopy) {
        // Registry (all)
        this._workingCopies.delete(workingCopy);
        // Registry (type based)
        const workingCopiesForResource = this.mapResourceToWorkingCopies.get(workingCopy.resource);
        if (workingCopiesForResource?.delete(workingCopy.typeId) && workingCopiesForResource.size === 0) {
            this.mapResourceToWorkingCopies.delete(workingCopy.resource);
        }
        // If copy is dirty, ensure to fire an event to signal the dirty change
        // (a disposed working copy cannot account for being dirty in our model)
        if (workingCopy.isDirty()) {
            this._onDidChangeDirty.fire(workingCopy);
        }
        // Remove all listeners associated to working copy
        this.mapWorkingCopyToListeners.deleteAndDispose(workingCopy);
    }
    has(resourceOrIdentifier) {
        if (URI.isUri(resourceOrIdentifier)) {
            return this.mapResourceToWorkingCopies.has(resourceOrIdentifier);
        }
        return this.mapResourceToWorkingCopies.get(resourceOrIdentifier.resource)?.has(resourceOrIdentifier.typeId) ?? false;
    }
    get(identifier) {
        return this.mapResourceToWorkingCopies.get(identifier.resource)?.get(identifier.typeId);
    }
    getAll(resource) {
        const workingCopies = this.mapResourceToWorkingCopies.get(resource);
        if (!workingCopies) {
            return undefined;
        }
        return Array.from(workingCopies.values());
    }
    //#endregion
    //#region Dirty Tracking
    get hasDirty() {
        for (const workingCopy of this._workingCopies) {
            if (workingCopy.isDirty()) {
                return true;
            }
        }
        return false;
    }
    get dirtyCount() {
        let totalDirtyCount = 0;
        for (const workingCopy of this._workingCopies) {
            if (workingCopy.isDirty()) {
                totalDirtyCount++;
            }
        }
        return totalDirtyCount;
    }
    get dirtyWorkingCopies() {
        return this.workingCopies.filter(workingCopy => workingCopy.isDirty());
    }
    get modifiedCount() {
        let totalModifiedCount = 0;
        for (const workingCopy of this._workingCopies) {
            if (workingCopy.isModified()) {
                totalModifiedCount++;
            }
        }
        return totalModifiedCount;
    }
    get modifiedWorkingCopies() {
        return this.workingCopies.filter(workingCopy => workingCopy.isModified());
    }
    isDirty(resource, typeId) {
        const workingCopies = this.mapResourceToWorkingCopies.get(resource);
        if (workingCopies) {
            // For a specific type
            if (typeof typeId === 'string') {
                return workingCopies.get(typeId)?.isDirty() ?? false;
            }
            // Across all working copies
            else {
                for (const [, workingCopy] of workingCopies) {
                    if (workingCopy.isDirty()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
registerSingleton(IWorkingCopyService, WorkingCopyService, 1 /* InstantiationType.Delayed */);
