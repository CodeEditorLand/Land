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
var ContributedExternalUriOpenersStore_1;
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Memento } from '../../../common/memento.js';
import { updateContributedOpeners } from './configuration.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
let ContributedExternalUriOpenersStore = class ContributedExternalUriOpenersStore extends Disposable {
    static { ContributedExternalUriOpenersStore_1 = this; }
    static { this.STORAGE_ID = 'externalUriOpeners'; }
    constructor(storageService, _extensionService) {
        super();
        this._extensionService = _extensionService;
        this._openers = new Map();
        this._memento = new Memento(ContributedExternalUriOpenersStore_1.STORAGE_ID, storageService);
        this._mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        for (const [id, value] of Object.entries(this._mementoObject || {})) {
            this.add(id, value.extensionId, { isCurrentlyRegistered: false });
        }
        this.invalidateOpenersOnExtensionsChanged();
        this._register(this._extensionService.onDidChangeExtensions(() => this.invalidateOpenersOnExtensionsChanged()));
        this._register(this._extensionService.onDidChangeExtensionsStatus(() => this.invalidateOpenersOnExtensionsChanged()));
    }
    didRegisterOpener(id, extensionId) {
        this.add(id, extensionId, {
            isCurrentlyRegistered: true
        });
    }
    add(id, extensionId, options) {
        const existing = this._openers.get(id);
        if (existing) {
            existing.isCurrentlyRegistered = existing.isCurrentlyRegistered || options.isCurrentlyRegistered;
            return;
        }
        const entry = {
            extensionId,
            isCurrentlyRegistered: options.isCurrentlyRegistered
        };
        this._openers.set(id, entry);
        this._mementoObject[id] = entry;
        this._memento.saveMemento();
        this.updateSchema();
    }
    delete(id) {
        this._openers.delete(id);
        delete this._mementoObject[id];
        this._memento.saveMemento();
        this.updateSchema();
    }
    async invalidateOpenersOnExtensionsChanged() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        const registeredExtensions = this._extensionService.extensions;
        for (const [id, entry] of this._openers) {
            const extension = registeredExtensions.find(r => r.identifier.value === entry.extensionId);
            if (extension) {
                if (!this._extensionService.canRemoveExtension(extension)) {
                    // The extension is running. We should have registered openers at this point
                    if (!entry.isCurrentlyRegistered) {
                        this.delete(id);
                    }
                }
            }
            else {
                // The opener came from an extension that is no longer enabled/installed
                this.delete(id);
            }
        }
    }
    updateSchema() {
        const ids = [];
        const descriptions = [];
        for (const [id, entry] of this._openers) {
            ids.push(id);
            descriptions.push(entry.extensionId);
        }
        updateContributedOpeners(ids, descriptions);
    }
};
ContributedExternalUriOpenersStore = ContributedExternalUriOpenersStore_1 = __decorate([
    __param(0, IStorageService),
    __param(1, IExtensionService),
    __metadata("design:paramtypes", [Object, Object])
], ContributedExternalUriOpenersStore);
export { ContributedExternalUriOpenersStore };
