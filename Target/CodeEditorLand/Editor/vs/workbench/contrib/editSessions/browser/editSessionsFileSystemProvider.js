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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { FilePermission, FileSystemProviderErrorCode, FileType } from '../../../../platform/files/common/files.js';
import { ChangeType, decodeEditSessionFileContent, EDIT_SESSIONS_SCHEME, IEditSessionsStorageService } from '../common/editSessions.js';
import { NotSupportedError } from '../../../../base/common/errors.js';
let EditSessionsFileSystemProvider = class EditSessionsFileSystemProvider {
    static { this.SCHEMA = EDIT_SESSIONS_SCHEME; }
    constructor(editSessionsStorageService) {
        this.editSessionsStorageService = editSessionsStorageService;
        this.capabilities = 2048 /* FileSystemProviderCapabilities.Readonly */ + 2 /* FileSystemProviderCapabilities.FileReadWrite */;
        //#region Unsupported file operations
        this.onDidChangeCapabilities = Event.None;
        this.onDidChangeFile = Event.None;
    }
    async readFile(resource) {
        const match = /(?<ref>[^/]+)\/(?<folderName>[^/]+)\/(?<filePath>.*)/.exec(resource.path.substring(1));
        if (!match?.groups) {
            throw FileSystemProviderErrorCode.FileNotFound;
        }
        const { ref, folderName, filePath } = match.groups;
        const data = await this.editSessionsStorageService.read('editSessions', ref);
        if (!data) {
            throw FileSystemProviderErrorCode.FileNotFound;
        }
        const content = JSON.parse(data.content);
        const change = content.folders.find((f) => f.name === folderName)?.workingChanges.find((change) => change.relativeFilePath === filePath);
        if (!change || change.type === ChangeType.Deletion) {
            throw FileSystemProviderErrorCode.FileNotFound;
        }
        return decodeEditSessionFileContent(content.version, change.contents).buffer;
    }
    async stat(resource) {
        const content = await this.readFile(resource);
        const currentTime = Date.now();
        return {
            type: FileType.File,
            permissions: FilePermission.Readonly,
            mtime: currentTime,
            ctime: currentTime,
            size: content.byteLength
        };
    }
    watch(resource, opts) { return Disposable.None; }
    async mkdir(resource) { }
    async readdir(resource) { return []; }
    async rename(from, to, opts) { }
    async delete(resource, opts) { }
    async writeFile() {
        throw new NotSupportedError();
    }
};
EditSessionsFileSystemProvider = __decorate([
    __param(0, IEditSessionsStorageService),
    __metadata("design:paramtypes", [Object])
], EditSessionsFileSystemProvider);
export { EditSessionsFileSystemProvider };
