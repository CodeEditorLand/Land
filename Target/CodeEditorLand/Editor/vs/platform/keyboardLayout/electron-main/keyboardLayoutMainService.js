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
import * as platform from '../../../base/common/platform.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
export const IKeyboardLayoutMainService = createDecorator('keyboardLayoutMainService');
let KeyboardLayoutMainService = class KeyboardLayoutMainService extends Disposable {
    constructor(lifecycleMainService) {
        super();
        this._onDidChangeKeyboardLayout = this._register(new Emitter());
        this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
        this._initPromise = null;
        this._keyboardLayoutData = null;
        // perf: automatically trigger initialize after windows
        // have opened so that we can do this work in parallel
        // to the window load.
        lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */).then(() => this._initialize());
    }
    _initialize() {
        if (!this._initPromise) {
            this._initPromise = this._doInitialize();
        }
        return this._initPromise;
    }
    async _doInitialize() {
        const nativeKeymapMod = await import('native-keymap');
        this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
        if (!platform.isCI) {
            // See https://github.com/microsoft/vscode/issues/152840
            // Do not register the keyboard layout change listener in CI because it doesn't work
            // on the build machines and it just adds noise to the build logs.
            nativeKeymapMod.onDidChangeKeyboardLayout(() => {
                this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
                this._onDidChangeKeyboardLayout.fire(this._keyboardLayoutData);
            });
        }
    }
    async getKeyboardLayoutData() {
        await this._initialize();
        return this._keyboardLayoutData;
    }
};
KeyboardLayoutMainService = __decorate([
    __param(0, ILifecycleMainService),
    __metadata("design:paramtypes", [Object])
], KeyboardLayoutMainService);
export { KeyboardLayoutMainService };
function readKeyboardLayoutData(nativeKeymapMod) {
    const keyboardMapping = nativeKeymapMod.getKeyMap();
    const keyboardLayoutInfo = nativeKeymapMod.getCurrentKeyboardLayout();
    return { keyboardMapping, keyboardLayoutInfo };
}
