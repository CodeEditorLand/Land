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
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IDebugService } from './debug.js';
let ReplAccessibilityAnnouncer = class ReplAccessibilityAnnouncer extends Disposable {
    static { this.ID = 'debug.replAccessibilityAnnouncer'; }
    constructor(debugService, accessibilityService, logService) {
        super();
        const viewModel = debugService.getViewModel();
        this._register(viewModel.onDidFocusSession((session) => {
            if (!session) {
                return;
            }
            this._register(session.onDidChangeReplElements((element) => {
                if (!element || !('originalExpression' in element)) {
                    // element was removed or hasn't been resolved yet
                    return;
                }
                const value = element.toString();
                accessibilityService.status(value);
                logService.trace('ReplAccessibilityAnnouncer#onDidChangeReplElements', element.originalExpression + ': ' + value);
            }));
        }));
    }
};
ReplAccessibilityAnnouncer = __decorate([
    __param(0, IDebugService),
    __param(1, IAccessibilityService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ReplAccessibilityAnnouncer);
export { ReplAccessibilityAnnouncer };
