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
var InstallExtensionQuickAccessProvider_1, ManageExtensionsQuickAccessProvider_1;
import { PickerQuickAccessProvider } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { localize } from '../../../../nls.js';
import { IExtensionGalleryService, IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IExtensionsWorkbenchService } from '../common/extensions.js';
let InstallExtensionQuickAccessProvider = class InstallExtensionQuickAccessProvider extends PickerQuickAccessProvider {
    static { InstallExtensionQuickAccessProvider_1 = this; }
    static { this.PREFIX = 'ext install '; }
    constructor(extensionsWorkbenchService, galleryService, extensionsService, notificationService, logService) {
        super(InstallExtensionQuickAccessProvider_1.PREFIX);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.galleryService = galleryService;
        this.extensionsService = extensionsService;
        this.notificationService = notificationService;
        this.logService = logService;
    }
    _getPicks(filter, disposables, token) {
        // Nothing typed
        if (!filter) {
            return [{
                    label: localize('type', "Type an extension name to install or search.")
                }];
        }
        const genericSearchPickItem = {
            label: localize('searchFor', "Press Enter to search for extension '{0}'.", filter),
            accept: () => this.extensionsWorkbenchService.openSearch(filter)
        };
        // Extension ID typed: try to find it
        if (/\./.test(filter)) {
            return this.getPicksForExtensionId(filter, genericSearchPickItem, token);
        }
        // Extension name typed: offer to search it
        return [genericSearchPickItem];
    }
    async getPicksForExtensionId(filter, fallback, token) {
        try {
            const [galleryExtension] = await this.galleryService.getExtensions([{ id: filter }], token);
            if (token.isCancellationRequested) {
                return []; // return early if canceled
            }
            if (!galleryExtension) {
                return [fallback];
            }
            return [{
                    label: localize('install', "Press Enter to install extension '{0}'.", filter),
                    accept: () => this.installExtension(galleryExtension, filter)
                }];
        }
        catch (error) {
            if (token.isCancellationRequested) {
                return []; // expected error
            }
            this.logService.error(error);
            return [fallback];
        }
    }
    async installExtension(extension, name) {
        try {
            await this.extensionsWorkbenchService.openSearch(`@id:${name}`);
            await this.extensionsService.installFromGallery(extension);
        }
        catch (error) {
            this.notificationService.error(error);
        }
    }
};
InstallExtensionQuickAccessProvider = InstallExtensionQuickAccessProvider_1 = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IExtensionGalleryService),
    __param(2, IExtensionManagementService),
    __param(3, INotificationService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], InstallExtensionQuickAccessProvider);
export { InstallExtensionQuickAccessProvider };
let ManageExtensionsQuickAccessProvider = class ManageExtensionsQuickAccessProvider extends PickerQuickAccessProvider {
    static { ManageExtensionsQuickAccessProvider_1 = this; }
    static { this.PREFIX = 'ext '; }
    constructor(extensionsWorkbenchService) {
        super(ManageExtensionsQuickAccessProvider_1.PREFIX);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
    }
    _getPicks() {
        return [{
                label: localize('manage', "Press Enter to manage your extensions."),
                accept: () => this.extensionsWorkbenchService.openSearch('')
            }];
    }
};
ManageExtensionsQuickAccessProvider = ManageExtensionsQuickAccessProvider_1 = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __metadata("design:paramtypes", [Object])
], ManageExtensionsQuickAccessProvider);
export { ManageExtensionsQuickAccessProvider };
