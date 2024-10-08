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
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { MainContext } from '../common/extHost.protocol.js';
import { IClipboardService } from '../../../platform/clipboard/common/clipboardService.js';
let MainThreadClipboard = class MainThreadClipboard {
    constructor(_context, _clipboardService) {
        this._clipboardService = _clipboardService;
    }
    dispose() {
        // nothing
    }
    $readText() {
        return this._clipboardService.readText();
    }
    $writeText(value) {
        return this._clipboardService.writeText(value);
    }
};
MainThreadClipboard = __decorate([
    extHostNamedCustomer(MainContext.MainThreadClipboard),
    __param(1, IClipboardService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadClipboard);
export { MainThreadClipboard };
