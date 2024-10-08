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
import { debounce } from '../../../../../base/common/decorators.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
let TextAreaSyncAddon = class TextAreaSyncAddon extends Disposable {
    activate(terminal) {
        this._terminal = terminal;
        this._refreshListeners();
    }
    constructor(_capabilities, _accessibilityService, _configurationService, _logService) {
        super();
        this._capabilities = _capabilities;
        this._accessibilityService = _accessibilityService;
        this._configurationService = _configurationService;
        this._logService = _logService;
        this._listeners = this._register(new MutableDisposable());
        this._register(Event.runAndSubscribe(Event.any(this._capabilities.onDidAddCapability, this._capabilities.onDidRemoveCapability, this._accessibilityService.onDidChangeScreenReaderOptimized), () => {
            this._refreshListeners();
        }));
    }
    _refreshListeners() {
        const commandDetection = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
        if (this._shouldBeActive() && commandDetection) {
            if (!this._listeners.value) {
                const textarea = this._terminal?.textarea;
                if (textarea) {
                    this._listeners.value = Event.runAndSubscribe(commandDetection.promptInputModel.onDidChangeInput, () => this._sync(textarea));
                }
            }
        }
        else {
            this._listeners.clear();
        }
    }
    _shouldBeActive() {
        return this._accessibilityService.isScreenReaderOptimized() || this._configurationService.getValue("terminal.integrated.developer.devMode" /* TerminalSettingId.DevMode */);
    }
    _sync(textArea) {
        const commandCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
        if (!commandCapability) {
            return;
        }
        textArea.value = commandCapability.promptInputModel.value;
        textArea.selectionStart = commandCapability.promptInputModel.cursorIndex;
        textArea.selectionEnd = commandCapability.promptInputModel.cursorIndex;
        this._logService.debug(`TextAreaSyncAddon#sync: text changed to "${textArea.value}"`);
    }
};
__decorate([
    debounce(50),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [HTMLTextAreaElement]),
    __metadata("design:returntype", void 0)
], TextAreaSyncAddon.prototype, "_sync", null);
TextAreaSyncAddon = __decorate([
    __param(1, IAccessibilityService),
    __param(2, IConfigurationService),
    __param(3, ITerminalLogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TextAreaSyncAddon);
export { TextAreaSyncAddon };
