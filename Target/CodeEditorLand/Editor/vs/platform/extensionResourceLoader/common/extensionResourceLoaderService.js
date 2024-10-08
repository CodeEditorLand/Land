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
import { registerSingleton } from '../../instantiation/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { IProductService } from '../../product/common/productService.js';
import { asTextOrError, IRequestService } from '../../request/common/request.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { AbstractExtensionResourceLoaderService, IExtensionResourceLoaderService } from './extensionResourceLoader.js';
let ExtensionResourceLoaderService = class ExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {
    constructor(fileService, storageService, productService, environmentService, configurationService, _requestService) {
        super(fileService, storageService, productService, environmentService, configurationService);
        this._requestService = _requestService;
    }
    async readExtensionResource(uri) {
        if (this.isExtensionGalleryResource(uri)) {
            const headers = await this.getExtensionGalleryRequestHeaders();
            const requestContext = await this._requestService.request({ url: uri.toString(), headers }, CancellationToken.None);
            return (await asTextOrError(requestContext)) || '';
        }
        const result = await this._fileService.readFile(uri);
        return result.value.toString();
    }
};
ExtensionResourceLoaderService = __decorate([
    __param(0, IFileService),
    __param(1, IStorageService),
    __param(2, IProductService),
    __param(3, IEnvironmentService),
    __param(4, IConfigurationService),
    __param(5, IRequestService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ExtensionResourceLoaderService);
export { ExtensionResourceLoaderService };
registerSingleton(IExtensionResourceLoaderService, ExtensionResourceLoaderService, 1 /* InstantiationType.Delayed */);
