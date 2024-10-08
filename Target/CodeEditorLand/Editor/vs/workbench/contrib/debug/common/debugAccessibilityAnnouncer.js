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
import { IDebugService } from './debug.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Expression } from './debugModel.js';
let DebugWatchAccessibilityAnnouncer = class DebugWatchAccessibilityAnnouncer extends Disposable {
    static { this.ID = 'workbench.contrib.debugWatchAccessibilityAnnouncer'; }
    constructor(_debugService, _logService, _accessibilityService, _configurationService) {
        super();
        this._debugService = _debugService;
        this._logService = _logService;
        this._accessibilityService = _accessibilityService;
        this._configurationService = _configurationService;
        this._listener = this._register(new MutableDisposable());
        this._setListener();
        this._register(_configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('accessibility.debugWatchVariableAnnouncements')) {
                this._setListener();
            }
        }));
    }
    _setListener() {
        const value = this._configurationService.getValue('accessibility.debugWatchVariableAnnouncements');
        if (value && !this._listener.value) {
            this._listener.value = this._debugService.getModel().onDidChangeWatchExpressionValue((e) => {
                if (!e || e.value === Expression.DEFAULT_VALUE) {
                    return;
                }
                // TODO: get user feedback, perhaps setting to configure verbosity + whether value, name, neither, or both are announced
                this._accessibilityService.alert(`${e.name} = ${e.value}`);
                this._logService.trace(`debugAccessibilityAnnouncerValueChanged ${e.name} ${e.value}`);
            });
        }
        else {
            this._listener.clear();
        }
    }
};
DebugWatchAccessibilityAnnouncer = __decorate([
    __param(0, IDebugService),
    __param(1, ILogService),
    __param(2, IAccessibilityService),
    __param(3, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DebugWatchAccessibilityAnnouncer);
export { DebugWatchAccessibilityAnnouncer };
