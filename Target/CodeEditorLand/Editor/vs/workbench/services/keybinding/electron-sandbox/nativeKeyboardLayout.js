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
import { IKeyboardLayoutService } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
import { Emitter } from '../../../../base/common/event.js';
import { OS } from '../../../../base/common/platform.js';
import { CachedKeyboardMapper } from '../../../../platform/keyboardLayout/common/keyboardMapper.js';
import { WindowsKeyboardMapper } from '../common/windowsKeyboardMapper.js';
import { FallbackKeyboardMapper } from '../common/fallbackKeyboardMapper.js';
import { MacLinuxKeyboardMapper } from '../common/macLinuxKeyboardMapper.js';
import { readKeyboardConfig } from '../../../../platform/keyboardLayout/common/keyboardConfig.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INativeKeyboardLayoutService } from './nativeKeyboardLayoutService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
let KeyboardLayoutService = class KeyboardLayoutService extends Disposable {
    constructor(_nativeKeyboardLayoutService, _configurationService) {
        super();
        this._nativeKeyboardLayoutService = _nativeKeyboardLayoutService;
        this._configurationService = _configurationService;
        this._onDidChangeKeyboardLayout = this._register(new Emitter());
        this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
        this._keyboardMapper = null;
        this._register(this._nativeKeyboardLayoutService.onDidChangeKeyboardLayout(async () => {
            this._keyboardMapper = null;
            this._onDidChangeKeyboardLayout.fire();
        }));
        this._register(_configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('keyboard')) {
                this._keyboardMapper = null;
                this._onDidChangeKeyboardLayout.fire();
            }
        }));
    }
    getRawKeyboardMapping() {
        return this._nativeKeyboardLayoutService.getRawKeyboardMapping();
    }
    getCurrentKeyboardLayout() {
        return this._nativeKeyboardLayoutService.getCurrentKeyboardLayout();
    }
    getAllKeyboardLayouts() {
        return [];
    }
    getKeyboardMapper() {
        const config = readKeyboardConfig(this._configurationService);
        if (config.dispatch === 1 /* DispatchConfig.KeyCode */) {
            // Forcefully set to use keyCode
            return new FallbackKeyboardMapper(config.mapAltGrToCtrlAlt, OS);
        }
        if (!this._keyboardMapper) {
            this._keyboardMapper = new CachedKeyboardMapper(createKeyboardMapper(this.getCurrentKeyboardLayout(), this.getRawKeyboardMapping(), config.mapAltGrToCtrlAlt));
        }
        return this._keyboardMapper;
    }
    validateCurrentKeyboardMapping(keyboardEvent) {
        return;
    }
};
KeyboardLayoutService = __decorate([
    __param(0, INativeKeyboardLayoutService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], KeyboardLayoutService);
export { KeyboardLayoutService };
function createKeyboardMapper(layoutInfo, rawMapping, mapAltGrToCtrlAlt) {
    const _isUSStandard = isUSStandard(layoutInfo);
    if (OS === 1 /* OperatingSystem.Windows */) {
        return new WindowsKeyboardMapper(_isUSStandard, rawMapping, mapAltGrToCtrlAlt);
    }
    if (!rawMapping || Object.keys(rawMapping).length === 0) {
        // Looks like reading the mappings failed (most likely Mac + Japanese/Chinese keyboard layouts)
        return new FallbackKeyboardMapper(mapAltGrToCtrlAlt, OS);
    }
    if (OS === 2 /* OperatingSystem.Macintosh */) {
        const kbInfo = layoutInfo;
        if (kbInfo.id === 'com.apple.keylayout.DVORAK-QWERTYCMD') {
            // Use keyCode based dispatching for DVORAK - QWERTY ⌘
            return new FallbackKeyboardMapper(mapAltGrToCtrlAlt, OS);
        }
    }
    return new MacLinuxKeyboardMapper(_isUSStandard, rawMapping, mapAltGrToCtrlAlt, OS);
}
function isUSStandard(_kbInfo) {
    if (!_kbInfo) {
        return false;
    }
    if (OS === 3 /* OperatingSystem.Linux */) {
        const kbInfo = _kbInfo;
        const layouts = kbInfo.layout.split(/,/g);
        return (layouts[kbInfo.group] === 'us');
    }
    if (OS === 2 /* OperatingSystem.Macintosh */) {
        const kbInfo = _kbInfo;
        return (kbInfo.id === 'com.apple.keylayout.US');
    }
    if (OS === 1 /* OperatingSystem.Windows */) {
        const kbInfo = _kbInfo;
        return (kbInfo.name === '00000409');
    }
    return false;
}
registerSingleton(IKeyboardLayoutService, KeyboardLayoutService, 1 /* InstantiationType.Delayed */);
