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
import { session } from 'electron';
import { Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import { COI, FileAccess, Schemas } from '../../../base/common/network.js';
import { basename, extname, normalize } from '../../../base/common/path.js';
import { isLinux } from '../../../base/common/platform.js';
import { TernarySearchTree } from '../../../base/common/ternarySearchTree.js';
import { URI } from '../../../base/common/uri.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { validatedIpcMain } from '../../../base/parts/ipc/electron-main/ipcMain.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
let ProtocolMainService = class ProtocolMainService extends Disposable {
    constructor(environmentService, userDataProfilesService, logService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        this.validRoots = TernarySearchTree.forPaths(!isLinux);
        this.validExtensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.mp4']); // https://github.com/microsoft/vscode/issues/119384
        // Define an initial set of roots we allow loading from
        // - appRoot	: all files installed as part of the app
        // - extensions : all files shipped from extensions
        // - storage    : all files in global and workspace storage (https://github.com/microsoft/vscode/issues/116735)
        this.addValidFileRoot(environmentService.appRoot);
        this.addValidFileRoot(environmentService.extensionsPath);
        this.addValidFileRoot(userDataProfilesService.defaultProfile.globalStorageHome.with({ scheme: Schemas.file }).fsPath);
        this.addValidFileRoot(environmentService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath);
        // Handle protocols
        this.handleProtocols();
    }
    handleProtocols() {
        const { defaultSession } = session;
        // Register vscode-file:// handler
        defaultSession.protocol.registerFileProtocol(Schemas.vscodeFileResource, (request, callback) => this.handleResourceRequest(request, callback));
        // Block any file:// access
        defaultSession.protocol.interceptFileProtocol(Schemas.file, (request, callback) => this.handleFileRequest(request, callback));
        // Cleanup
        this._register(toDisposable(() => {
            defaultSession.protocol.unregisterProtocol(Schemas.vscodeFileResource);
            defaultSession.protocol.uninterceptProtocol(Schemas.file);
        }));
    }
    addValidFileRoot(root) {
        // Pass to `normalize` because we later also do the
        // same for all paths to check against.
        const normalizedRoot = normalize(root);
        if (!this.validRoots.get(normalizedRoot)) {
            this.validRoots.set(normalizedRoot, true);
            return toDisposable(() => this.validRoots.delete(normalizedRoot));
        }
        return Disposable.None;
    }
    //#region file://
    handleFileRequest(request, callback) {
        const uri = URI.parse(request.url);
        this.logService.error(`Refused to load resource ${uri.fsPath} from ${Schemas.file}: protocol (original URL: ${request.url})`);
        return callback({ error: -3 /* ABORTED */ });
    }
    //#endregion
    //#region vscode-file://
    handleResourceRequest(request, callback) {
        const path = this.requestToNormalizedFilePath(request);
        let headers;
        if (this.environmentService.crossOriginIsolated) {
            const pathBasename = basename(path);
            if (pathBasename === 'workbench.html' || pathBasename === 'workbench-dev.html') {
                headers = COI.CoopAndCoep;
            }
            else {
                headers = COI.getHeadersFromQuery(request.url);
            }
        }
        // first check by validRoots
        if (this.validRoots.findSubstr(path)) {
            return callback({ path, headers });
        }
        // then check by validExtensions
        if (this.validExtensions.has(extname(path).toLowerCase())) {
            return callback({ path });
        }
        // finally block to load the resource
        this.logService.error(`${Schemas.vscodeFileResource}: Refused to load resource ${path} from ${Schemas.vscodeFileResource}: protocol (original URL: ${request.url})`);
        return callback({ error: -3 /* ABORTED */ });
    }
    requestToNormalizedFilePath(request) {
        // 1.) Use `URI.parse()` util from us to convert the raw
        //     URL into our URI.
        const requestUri = URI.parse(request.url);
        // 2.) Use `FileAccess.asFileUri` to convert back from a
        //     `vscode-file:` URI to a `file:` URI.
        const unnormalizedFileUri = FileAccess.uriToFileUri(requestUri);
        // 3.) Strip anything from the URI that could result in
        //     relative paths (such as "..") by using `normalize`
        return normalize(unnormalizedFileUri.fsPath);
    }
    //#endregion
    //#region IPC Object URLs
    createIPCObjectUrl() {
        let obj = undefined;
        // Create unique URI
        const resource = URI.from({
            scheme: 'vscode', // used for all our IPC communication (vscode:<channel>)
            path: generateUuid()
        });
        // Install IPC handler
        const channel = resource.toString();
        const handler = async () => obj;
        validatedIpcMain.handle(channel, handler);
        this.logService.trace(`IPC Object URL: Registered new channel ${channel}.`);
        return {
            resource,
            update: updatedObj => obj = updatedObj,
            dispose: () => {
                this.logService.trace(`IPC Object URL: Removed channel ${channel}.`);
                validatedIpcMain.removeHandler(channel);
            }
        };
    }
};
ProtocolMainService = __decorate([
    __param(0, INativeEnvironmentService),
    __param(1, IUserDataProfilesService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ProtocolMainService);
export { ProtocolMainService };
