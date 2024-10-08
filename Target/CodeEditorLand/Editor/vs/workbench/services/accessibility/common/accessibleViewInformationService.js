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
import { ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX } from '../../../../platform/accessibility/common/accessibility.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export const IAccessibleViewInformationService = createDecorator('accessibleViewInformationService');
let AccessibleViewInformationService = class AccessibleViewInformationService extends Disposable {
    constructor(_storageService) {
        super();
        this._storageService = _storageService;
    }
    hasShownAccessibleView(viewId) {
        return this._storageService.getBoolean(`${ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX}${viewId}`, -1 /* StorageScope.APPLICATION */, false) === true;
    }
};
AccessibleViewInformationService = __decorate([
    __param(0, IStorageService),
    __metadata("design:paramtypes", [Object])
], AccessibleViewInformationService);
export { AccessibleViewInformationService };
