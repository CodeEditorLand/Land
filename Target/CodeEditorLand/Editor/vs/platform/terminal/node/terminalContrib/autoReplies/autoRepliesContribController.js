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
import { ILogService } from '../../../../log/common/log.js';
import { TerminalAutoResponder } from './terminalAutoResponder.js';
let AutoRepliesPtyServiceContribution = class AutoRepliesPtyServiceContribution {
    constructor(_logService) {
        this._logService = _logService;
        this._autoReplies = new Map();
        this._terminalProcesses = new Map();
        this._autoResponders = new Map();
    }
    async installAutoReply(match, reply) {
        this._autoReplies.set(match, reply);
        // If the auto reply exists on any existing terminals it will be overridden
        for (const persistentProcessId of this._autoResponders.keys()) {
            const process = this._terminalProcesses.get(persistentProcessId);
            if (!process) {
                this._logService.error('Could not find terminal process to install auto reply');
                continue;
            }
            this._processInstallAutoReply(persistentProcessId, process, match, reply);
        }
    }
    async uninstallAllAutoReplies() {
        for (const match of this._autoReplies.keys()) {
            for (const processAutoResponders of this._autoResponders.values()) {
                processAutoResponders.get(match)?.dispose();
                processAutoResponders.delete(match);
            }
        }
    }
    handleProcessReady(persistentProcessId, process) {
        this._terminalProcesses.set(persistentProcessId, process);
        this._autoResponders.set(persistentProcessId, new Map());
        for (const [match, reply] of this._autoReplies.entries()) {
            this._processInstallAutoReply(persistentProcessId, process, match, reply);
        }
    }
    handleProcessDispose(persistentProcessId) {
        const processAutoResponders = this._autoResponders.get(persistentProcessId);
        if (processAutoResponders) {
            for (const e of processAutoResponders.values()) {
                e.dispose();
            }
            processAutoResponders.clear();
        }
    }
    handleProcessInput(persistentProcessId, data) {
        const processAutoResponders = this._autoResponders.get(persistentProcessId);
        if (processAutoResponders) {
            for (const listener of processAutoResponders.values()) {
                listener.handleInput();
            }
        }
    }
    handleProcessResize(persistentProcessId, cols, rows) {
        const processAutoResponders = this._autoResponders.get(persistentProcessId);
        if (processAutoResponders) {
            for (const listener of processAutoResponders.values()) {
                listener.handleResize();
            }
        }
    }
    _processInstallAutoReply(persistentProcessId, terminalProcess, match, reply) {
        const processAutoResponders = this._autoResponders.get(persistentProcessId);
        if (processAutoResponders) {
            processAutoResponders.get(match)?.dispose();
            processAutoResponders.set(match, new TerminalAutoResponder(terminalProcess, match, reply, this._logService));
        }
    }
};
AutoRepliesPtyServiceContribution = __decorate([
    __param(0, ILogService),
    __metadata("design:paramtypes", [Object])
], AutoRepliesPtyServiceContribution);
export { AutoRepliesPtyServiceContribution };
