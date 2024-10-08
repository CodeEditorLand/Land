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
import { createRandomIPCHandle } from '../../../base/parts/ipc/node/ipc.net.js';
import * as http from 'http';
import * as fs from 'fs';
import { IExtHostCommands } from '../common/extHostCommands.js';
import { URI } from '../../../base/common/uri.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { hasWorkspaceFileExtension } from '../../../platform/workspace/common/workspace.js';
export class CLIServerBase {
    constructor(_commands, logService, _ipcHandlePath) {
        this._commands = _commands;
        this.logService = logService;
        this._ipcHandlePath = _ipcHandlePath;
        this._server = http.createServer((req, res) => this.onRequest(req, res));
        this.setup().catch(err => {
            logService.error(err);
            return '';
        });
    }
    get ipcHandlePath() {
        return this._ipcHandlePath;
    }
    async setup() {
        try {
            this._server.listen(this.ipcHandlePath);
            this._server.on('error', err => this.logService.error(err));
        }
        catch (err) {
            this.logService.error('Could not start open from terminal server.');
        }
        return this._ipcHandlePath;
    }
    onRequest(req, res) {
        const sendResponse = (statusCode, returnObj) => {
            res.writeHead(statusCode, { 'content-type': 'application/json' });
            res.end(JSON.stringify(returnObj || null), (err) => err && this.logService.error(err)); // CodeQL [SM01524] Only the message portion of errors are passed in.
        };
        const chunks = [];
        req.setEncoding('utf8');
        req.on('data', (d) => chunks.push(d));
        req.on('end', async () => {
            try {
                const data = JSON.parse(chunks.join(''));
                let returnObj;
                switch (data.type) {
                    case 'open':
                        returnObj = await this.open(data);
                        break;
                    case 'openExternal':
                        returnObj = await this.openExternal(data);
                        break;
                    case 'status':
                        returnObj = await this.getStatus(data);
                        break;
                    case 'extensionManagement':
                        returnObj = await this.manageExtensions(data);
                        break;
                    default:
                        sendResponse(404, `Unknown message type: ${data.type}`);
                        break;
                }
                sendResponse(200, returnObj);
            }
            catch (e) {
                const message = e instanceof Error ? e.message : JSON.stringify(e);
                sendResponse(500, message);
                this.logService.error('Error while processing pipe request', e);
            }
        });
    }
    async open(data) {
        const { fileURIs, folderURIs, forceNewWindow, diffMode, mergeMode, addMode, forceReuseWindow, gotoLineMode, waitMarkerFilePath, remoteAuthority } = data;
        const urisToOpen = [];
        if (Array.isArray(folderURIs)) {
            for (const s of folderURIs) {
                try {
                    urisToOpen.push({ folderUri: URI.parse(s) });
                }
                catch (e) {
                    // ignore
                }
            }
        }
        if (Array.isArray(fileURIs)) {
            for (const s of fileURIs) {
                try {
                    if (hasWorkspaceFileExtension(s)) {
                        urisToOpen.push({ workspaceUri: URI.parse(s) });
                    }
                    else {
                        urisToOpen.push({ fileUri: URI.parse(s) });
                    }
                }
                catch (e) {
                    // ignore
                }
            }
        }
        const waitMarkerFileURI = waitMarkerFilePath ? URI.file(waitMarkerFilePath) : undefined;
        const preferNewWindow = !forceReuseWindow && !waitMarkerFileURI && !addMode;
        const windowOpenArgs = { forceNewWindow, diffMode, mergeMode, addMode, gotoLineMode, forceReuseWindow, preferNewWindow, waitMarkerFileURI, remoteAuthority };
        this._commands.executeCommand('_remoteCLI.windowOpen', urisToOpen, windowOpenArgs);
    }
    async openExternal(data) {
        for (const uriString of data.uris) {
            const uri = URI.parse(uriString);
            const urioOpen = uri.scheme === 'file' ? uri : uriString; // workaround for #112577
            await this._commands.executeCommand('_remoteCLI.openExternal', urioOpen);
        }
    }
    async manageExtensions(data) {
        const toExtOrVSIX = (inputs) => inputs?.map(input => /\.vsix$/i.test(input) ? URI.parse(input) : input);
        const commandArgs = {
            list: data.list,
            install: toExtOrVSIX(data.install),
            uninstall: toExtOrVSIX(data.uninstall),
            force: data.force
        };
        return await this._commands.executeCommand('_remoteCLI.manageExtensions', commandArgs);
    }
    async getStatus(data) {
        return await this._commands.executeCommand('_remoteCLI.getSystemStatus');
    }
    dispose() {
        this._server.close();
        if (this._ipcHandlePath && process.platform !== 'win32' && fs.existsSync(this._ipcHandlePath)) {
            fs.unlinkSync(this._ipcHandlePath);
        }
    }
}
let CLIServer = class CLIServer extends CLIServerBase {
    constructor(commands, logService) {
        super(commands, logService, createRandomIPCHandle());
    }
};
CLIServer = __decorate([
    __param(0, IExtHostCommands),
    __param(1, ILogService),
    __metadata("design:paramtypes", [Object, Object])
], CLIServer);
export { CLIServer };
