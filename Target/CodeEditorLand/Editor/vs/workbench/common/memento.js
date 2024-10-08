/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isEmptyObject } from '../../base/common/types.js';
import { onUnexpectedError } from '../../base/common/errors.js';
export class Memento {
    static { this.applicationMementos = new Map(); }
    static { this.profileMementos = new Map(); }
    static { this.workspaceMementos = new Map(); }
    static { this.COMMON_PREFIX = 'memento/'; }
    constructor(id, storageService) {
        this.storageService = storageService;
        this.id = Memento.COMMON_PREFIX + id;
    }
    getMemento(scope, target) {
        switch (scope) {
            case 1 /* StorageScope.WORKSPACE */: {
                let workspaceMemento = Memento.workspaceMementos.get(this.id);
                if (!workspaceMemento) {
                    workspaceMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                    Memento.workspaceMementos.set(this.id, workspaceMemento);
                }
                return workspaceMemento.getMemento();
            }
            case 0 /* StorageScope.PROFILE */: {
                let profileMemento = Memento.profileMementos.get(this.id);
                if (!profileMemento) {
                    profileMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                    Memento.profileMementos.set(this.id, profileMemento);
                }
                return profileMemento.getMemento();
            }
            case -1 /* StorageScope.APPLICATION */: {
                let applicationMemento = Memento.applicationMementos.get(this.id);
                if (!applicationMemento) {
                    applicationMemento = new ScopedMemento(this.id, scope, target, this.storageService);
                    Memento.applicationMementos.set(this.id, applicationMemento);
                }
                return applicationMemento.getMemento();
            }
        }
    }
    onDidChangeValue(scope, disposables) {
        return this.storageService.onDidChangeValue(scope, this.id, disposables);
    }
    saveMemento() {
        Memento.workspaceMementos.get(this.id)?.save();
        Memento.profileMementos.get(this.id)?.save();
        Memento.applicationMementos.get(this.id)?.save();
    }
    reloadMemento(scope) {
        let memento;
        switch (scope) {
            case -1 /* StorageScope.APPLICATION */:
                memento = Memento.applicationMementos.get(this.id);
                break;
            case 0 /* StorageScope.PROFILE */:
                memento = Memento.profileMementos.get(this.id);
                break;
            case 1 /* StorageScope.WORKSPACE */:
                memento = Memento.workspaceMementos.get(this.id);
                break;
        }
        memento?.reload();
    }
    static clear(scope) {
        switch (scope) {
            case 1 /* StorageScope.WORKSPACE */:
                Memento.workspaceMementos.clear();
                break;
            case 0 /* StorageScope.PROFILE */:
                Memento.profileMementos.clear();
                break;
            case -1 /* StorageScope.APPLICATION */:
                Memento.applicationMementos.clear();
                break;
        }
    }
}
class ScopedMemento {
    constructor(id, scope, target, storageService) {
        this.id = id;
        this.scope = scope;
        this.target = target;
        this.storageService = storageService;
        this.mementoObj = this.doLoad();
    }
    doLoad() {
        try {
            return this.storageService.getObject(this.id, this.scope, {});
        }
        catch (error) {
            // Seeing reports from users unable to open editors
            // from memento parsing exceptions. Log the contents
            // to diagnose further
            // https://github.com/microsoft/vscode/issues/102251
            onUnexpectedError(`[memento]: failed to parse contents: ${error} (id: ${this.id}, scope: ${this.scope}, contents: ${this.storageService.get(this.id, this.scope)})`);
        }
        return {};
    }
    getMemento() {
        return this.mementoObj;
    }
    reload() {
        // Clear old
        for (const name of Object.getOwnPropertyNames(this.mementoObj)) {
            delete this.mementoObj[name];
        }
        // Assign new
        Object.assign(this.mementoObj, this.doLoad());
    }
    save() {
        if (!isEmptyObject(this.mementoObj)) {
            this.storageService.store(this.id, this.mementoObj, this.scope, this.target);
        }
        else {
            this.storageService.remove(this.id, this.scope);
        }
    }
}
