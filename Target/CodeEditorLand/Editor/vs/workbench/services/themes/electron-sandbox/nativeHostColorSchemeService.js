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
var NativeHostColorSchemeService_1;
import { Emitter } from '../../../../base/common/event.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IHostColorSchemeService } from '../common/hostColorSchemeService.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { isBoolean, isObject } from '../../../../base/common/types.js';
let NativeHostColorSchemeService = class NativeHostColorSchemeService extends Disposable {
    static { NativeHostColorSchemeService_1 = this; }
    static { this.STORAGE_KEY = 'HostColorSchemeData'; }
    constructor(nativeHostService, environmentService, storageService) {
        super();
        this.nativeHostService = nativeHostService;
        this.storageService = storageService;
        this._onDidChangeColorScheme = this._register(new Emitter());
        this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
        // register listener with the OS
        this._register(this.nativeHostService.onDidChangeColorScheme(scheme => this.update(scheme)));
        const initial = this.getStoredValue() ?? environmentService.window.colorScheme;
        this.dark = initial.dark;
        this.highContrast = initial.highContrast;
        // fetch the actual value from the OS
        this.nativeHostService.getOSColorScheme().then(scheme => this.update(scheme));
    }
    getStoredValue() {
        const stored = this.storageService.get(NativeHostColorSchemeService_1.STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
        if (stored) {
            try {
                const scheme = JSON.parse(stored);
                if (isObject(scheme) && isBoolean(scheme.highContrast) && isBoolean(scheme.dark)) {
                    return scheme;
                }
            }
            catch (e) {
                // ignore
            }
        }
        return undefined;
    }
    update({ highContrast, dark }) {
        if (dark !== this.dark || highContrast !== this.highContrast) {
            this.dark = dark;
            this.highContrast = highContrast;
            this.storageService.store(NativeHostColorSchemeService_1.STORAGE_KEY, JSON.stringify({ highContrast, dark }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this._onDidChangeColorScheme.fire();
        }
    }
};
NativeHostColorSchemeService = NativeHostColorSchemeService_1 = __decorate([
    __param(0, INativeHostService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NativeHostColorSchemeService);
export { NativeHostColorSchemeService };
registerSingleton(IHostColorSchemeService, NativeHostColorSchemeService, 1 /* InstantiationType.Delayed */);
