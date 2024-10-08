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
var TerminalTypeAheadContribution_1;
import { DisposableStore, toDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TERMINAL_CONFIG_SECTION } from '../../../terminal/common/terminal.js';
import { TypeAheadAddon } from './terminalTypeAheadAddon.js';
let TerminalTypeAheadContribution = class TerminalTypeAheadContribution extends DisposableStore {
    static { TerminalTypeAheadContribution_1 = this; }
    static { this.ID = 'terminal.typeAhead'; }
    static get(instance) {
        return instance.getContribution(TerminalTypeAheadContribution_1.ID);
    }
    constructor(_ctx, _configurationService, _instantiationService) {
        super();
        this._ctx = _ctx;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this.add(toDisposable(() => this._addon?.dispose()));
    }
    xtermReady(xterm) {
        this._loadTypeAheadAddon(xterm.raw);
        this.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.localEchoEnabled" /* TerminalTypeAheadSettingId.LocalEchoEnabled */)) {
                this._loadTypeAheadAddon(xterm.raw);
            }
        }));
        // Reset the addon when the terminal launches or relaunches
        this.add(this._ctx.processManager.onProcessReady(() => {
            this._addon?.reset();
        }));
    }
    _loadTypeAheadAddon(xterm) {
        const enabled = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).localEchoEnabled;
        const isRemote = !!this._ctx.processManager.remoteAuthority;
        if (enabled === 'off' || enabled === 'auto' && !isRemote) {
            this._addon?.dispose();
            this._addon = undefined;
            return;
        }
        if (this._addon) {
            return;
        }
        if (enabled === 'on' || (enabled === 'auto' && isRemote)) {
            this._addon = this._instantiationService.createInstance(TypeAheadAddon, this._ctx.processManager);
            xterm.loadAddon(this._addon);
        }
    }
};
TerminalTypeAheadContribution = TerminalTypeAheadContribution_1 = __decorate([
    __param(1, IConfigurationService),
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalTypeAheadContribution);
registerTerminalContribution(TerminalTypeAheadContribution.ID, TerminalTypeAheadContribution);
