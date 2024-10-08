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
import { createDecorator, IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Extensions } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { mark } from '../../../../base/common/performance.js';
export const IUserDataInitializationService = createDecorator('IUserDataInitializationService');
export class UserDataInitializationService {
    constructor(initializers = []) {
        this.initializers = initializers;
    }
    async whenInitializationFinished() {
        if (await this.requiresInitialization()) {
            await Promise.all(this.initializers.map(initializer => initializer.whenInitializationFinished()));
        }
    }
    async requiresInitialization() {
        return (await Promise.all(this.initializers.map(initializer => initializer.requiresInitialization()))).some(result => result);
    }
    async initializeRequiredResources() {
        if (await this.requiresInitialization()) {
            await Promise.all(this.initializers.map(initializer => initializer.initializeRequiredResources()));
        }
    }
    async initializeOtherResources(instantiationService) {
        if (await this.requiresInitialization()) {
            await Promise.all(this.initializers.map(initializer => initializer.initializeOtherResources(instantiationService)));
        }
    }
    async initializeInstalledExtensions(instantiationService) {
        if (await this.requiresInitialization()) {
            await Promise.all(this.initializers.map(initializer => initializer.initializeInstalledExtensions(instantiationService)));
        }
    }
}
let InitializeOtherResourcesContribution = class InitializeOtherResourcesContribution {
    constructor(userDataInitializeService, instantiationService, extensionService) {
        extensionService.whenInstalledExtensionsRegistered().then(() => this.initializeOtherResource(userDataInitializeService, instantiationService));
    }
    async initializeOtherResource(userDataInitializeService, instantiationService) {
        if (await userDataInitializeService.requiresInitialization()) {
            mark('code/willInitOtherUserData');
            await userDataInitializeService.initializeOtherResources(instantiationService);
            mark('code/didInitOtherUserData');
        }
    }
};
InitializeOtherResourcesContribution = __decorate([
    __param(0, IUserDataInitializationService),
    __param(1, IInstantiationService),
    __param(2, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object])
], InitializeOtherResourcesContribution);
if (isWeb) {
    const workbenchRegistry = Registry.as(Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(InitializeOtherResourcesContribution, 3 /* LifecyclePhase.Restored */);
}
