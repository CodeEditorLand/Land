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
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtHostConsumerFileSystem } from './extHostFileSystemConsumer.js';
import { URI } from '../../../base/common/uri.js';
export const IExtensionStoragePaths = createDecorator('IExtensionStoragePaths');
let ExtensionStoragePaths = class ExtensionStoragePaths {
    constructor(initData, _logService, _extHostFileSystem) {
        this._logService = _logService;
        this._extHostFileSystem = _extHostFileSystem;
        this._workspace = initData.workspace ?? undefined;
        this._environment = initData.environment;
        this.whenReady = this._getOrCreateWorkspaceStoragePath().then(value => this._value = value);
    }
    async _getWorkspaceStorageURI(storageName) {
        return URI.joinPath(this._environment.workspaceStorageHome, storageName);
    }
    async _getOrCreateWorkspaceStoragePath() {
        if (!this._workspace) {
            return Promise.resolve(undefined);
        }
        const storageName = this._workspace.id;
        const storageUri = await this._getWorkspaceStorageURI(storageName);
        try {
            await this._extHostFileSystem.value.stat(storageUri);
            this._logService.trace('[ExtHostStorage] storage dir already exists', storageUri);
            return storageUri;
        }
        catch {
            // doesn't exist, that's OK
        }
        try {
            this._logService.trace('[ExtHostStorage] creating dir and metadata-file', storageUri);
            await this._extHostFileSystem.value.createDirectory(storageUri);
            await this._extHostFileSystem.value.writeFile(URI.joinPath(storageUri, 'meta.json'), new TextEncoder().encode(JSON.stringify({
                id: this._workspace.id,
                configuration: URI.revive(this._workspace.configuration)?.toString(),
                name: this._workspace.name
            }, undefined, 2)));
            return storageUri;
        }
        catch (e) {
            this._logService.error('[ExtHostStorage]', e);
            return undefined;
        }
    }
    workspaceValue(extension) {
        if (this._value) {
            return URI.joinPath(this._value, extension.identifier.value);
        }
        return undefined;
    }
    globalValue(extension) {
        return URI.joinPath(this._environment.globalStorageHome, extension.identifier.value.toLowerCase());
    }
    onWillDeactivateAll() {
    }
};
ExtensionStoragePaths = __decorate([
    __param(0, IExtHostInitDataService),
    __param(1, ILogService),
    __param(2, IExtHostConsumerFileSystem),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExtensionStoragePaths);
export { ExtensionStoragePaths };
