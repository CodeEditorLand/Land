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
import { ITerminalInstanceService } from './terminal.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { TerminalExtensions } from '../../../../platform/terminal/common/terminal.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TerminalInstance } from './terminalInstance.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Emitter } from '../../../../base/common/event.js';
import { TerminalContextKeys } from '../common/terminalContextKey.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { promiseWithResolvers } from '../../../../base/common/async.js';
let TerminalInstanceService = class TerminalInstanceService extends Disposable {
    get onDidCreateInstance() { return this._onDidCreateInstance.event; }
    get onDidRegisterBackend() { return this._onDidRegisterBackend.event; }
    constructor(_instantiationService, _contextKeyService, environmentService) {
        super();
        this._instantiationService = _instantiationService;
        this._contextKeyService = _contextKeyService;
        this._backendRegistration = new Map();
        this._onDidCreateInstance = this._register(new Emitter());
        this._onDidRegisterBackend = this._register(new Emitter());
        this._terminalShellTypeContextKey = TerminalContextKeys.shellType.bindTo(this._contextKeyService);
        for (const remoteAuthority of [undefined, environmentService.remoteAuthority]) {
            const { promise, resolve } = promiseWithResolvers();
            this._backendRegistration.set(remoteAuthority, { promise, resolve });
        }
    }
    createInstance(config, target) {
        const shellLaunchConfig = this.convertProfileToShellLaunchConfig(config);
        const instance = this._instantiationService.createInstance(TerminalInstance, this._terminalShellTypeContextKey, shellLaunchConfig);
        instance.target = target;
        this._onDidCreateInstance.fire(instance);
        return instance;
    }
    convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) {
        // Profile was provided
        if (shellLaunchConfigOrProfile && 'profileName' in shellLaunchConfigOrProfile) {
            const profile = shellLaunchConfigOrProfile;
            if (!profile.path) {
                return shellLaunchConfigOrProfile;
            }
            return {
                executable: profile.path,
                args: profile.args,
                env: profile.env,
                icon: profile.icon,
                color: profile.color,
                name: profile.overrideName ? profile.profileName : undefined,
                cwd
            };
        }
        // A shell launch config was provided
        if (shellLaunchConfigOrProfile) {
            if (cwd) {
                shellLaunchConfigOrProfile.cwd = cwd;
            }
            return shellLaunchConfigOrProfile;
        }
        // Return empty shell launch config
        return {};
    }
    async getBackend(remoteAuthority) {
        let backend = Registry.as(TerminalExtensions.Backend).getTerminalBackend(remoteAuthority);
        if (!backend) {
            // Ensure backend is initialized and try again
            await this._backendRegistration.get(remoteAuthority)?.promise;
            backend = Registry.as(TerminalExtensions.Backend).getTerminalBackend(remoteAuthority);
        }
        return backend;
    }
    getRegisteredBackends() {
        return Registry.as(TerminalExtensions.Backend).backends.values();
    }
    didRegisterBackend(backend) {
        this._backendRegistration.get(backend.remoteAuthority)?.resolve();
        this._onDidRegisterBackend.fire(backend);
    }
};
TerminalInstanceService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IContextKeyService),
    __param(2, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalInstanceService);
export { TerminalInstanceService };
registerSingleton(ITerminalInstanceService, TerminalInstanceService, 1 /* InstantiationType.Delayed */);
