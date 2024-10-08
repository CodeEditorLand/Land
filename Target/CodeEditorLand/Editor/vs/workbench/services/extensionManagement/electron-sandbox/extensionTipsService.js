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
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { IExtensionTipsService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionTipsService } from '../../../../platform/extensionManagement/common/extensionTipsService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Schemas } from '../../../../base/common/network.js';
let NativeExtensionTipsService = class NativeExtensionTipsService extends ExtensionTipsService {
    constructor(fileService, productService, sharedProcessService) {
        super(fileService, productService);
        this.channel = sharedProcessService.getChannel('extensionTipsService');
    }
    getConfigBasedTips(folder) {
        if (folder.scheme === Schemas.file) {
            return this.channel.call('getConfigBasedTips', [folder]);
        }
        return super.getConfigBasedTips(folder);
    }
    getImportantExecutableBasedTips() {
        return this.channel.call('getImportantExecutableBasedTips');
    }
    getOtherExecutableBasedTips() {
        return this.channel.call('getOtherExecutableBasedTips');
    }
};
NativeExtensionTipsService = __decorate([
    __param(0, IFileService),
    __param(1, IProductService),
    __param(2, ISharedProcessService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NativeExtensionTipsService);
registerSingleton(IExtensionTipsService, NativeExtensionTipsService, 1 /* InstantiationType.Delayed */);
