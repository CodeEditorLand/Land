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
import { ExtensionRecommendations } from './extensionRecommendations.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { localize } from '../../../../nls.js';
import { IExtensionManagementServerService } from '../../../services/extensionManagement/common/extensionManagement.js';
let WebRecommendations = class WebRecommendations extends ExtensionRecommendations {
    get recommendations() { return this._recommendations; }
    constructor(productService, extensionManagementServerService) {
        super();
        this.productService = productService;
        this.extensionManagementServerService = extensionManagementServerService;
        this._recommendations = [];
    }
    async doActivate() {
        const isOnlyWeb = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer;
        if (isOnlyWeb && Array.isArray(this.productService.webExtensionTips)) {
            this._recommendations = this.productService.webExtensionTips.map((extensionId) => ({
                extension: extensionId.toLowerCase(),
                reason: {
                    reasonId: 6 /* ExtensionRecommendationReason.Application */,
                    reasonText: localize('reason', "This extension is recommended for {0} for the Web", this.productService.nameLong)
                }
            }));
        }
    }
};
WebRecommendations = __decorate([
    __param(0, IProductService),
    __param(1, IExtensionManagementServerService),
    __metadata("design:paramtypes", [Object, Object])
], WebRecommendations);
export { WebRecommendations };
