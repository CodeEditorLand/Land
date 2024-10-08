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
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
export const IChatSlashCommandService = createDecorator('chatSlashCommandService');
let ChatSlashCommandService = class ChatSlashCommandService extends Disposable {
    constructor(_extensionService) {
        super();
        this._extensionService = _extensionService;
        this._commands = new Map();
        this._onDidChangeCommands = this._register(new Emitter());
        this.onDidChangeCommands = this._onDidChangeCommands.event;
    }
    dispose() {
        super.dispose();
        this._commands.clear();
    }
    registerSlashCommand(data, command) {
        if (this._commands.has(data.command)) {
            throw new Error(`Already registered a command with id ${data.command}}`);
        }
        this._commands.set(data.command, { data, command });
        this._onDidChangeCommands.fire();
        return toDisposable(() => {
            if (this._commands.delete(data.command)) {
                this._onDidChangeCommands.fire();
            }
        });
    }
    getCommands(location) {
        return Array.from(this._commands.values(), v => v.data).filter(c => c.locations.includes(location));
    }
    hasCommand(id) {
        return this._commands.has(id);
    }
    async executeCommand(id, prompt, progress, history, location, token) {
        const data = this._commands.get(id);
        if (!data) {
            throw new Error('No command with id ${id} NOT registered');
        }
        if (!data.command) {
            await this._extensionService.activateByEvent(`onSlash:${id}`);
        }
        if (!data.command) {
            throw new Error(`No command with id ${id} NOT resolved`);
        }
        return await data.command(prompt, progress, history, location, token);
    }
};
ChatSlashCommandService = __decorate([
    __param(0, IExtensionService),
    __metadata("design:paramtypes", [Object])
], ChatSlashCommandService);
export { ChatSlashCommandService };
