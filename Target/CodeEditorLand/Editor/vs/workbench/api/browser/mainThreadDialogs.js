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
var MainThreadDialogs_1;
import { URI } from '../../../base/common/uri.js';
import { MainContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IFileDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { Schemas } from '../../../base/common/network.js';
let MainThreadDialogs = MainThreadDialogs_1 = class MainThreadDialogs {
    constructor(context, _fileDialogService) {
        this._fileDialogService = _fileDialogService;
        //
    }
    dispose() {
        //
    }
    async $showOpenDialog(options) {
        const convertedOptions = MainThreadDialogs_1._convertOpenOptions(options);
        if (!convertedOptions.defaultUri) {
            convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
        }
        return Promise.resolve(this._fileDialogService.showOpenDialog(convertedOptions));
    }
    async $showSaveDialog(options) {
        const convertedOptions = MainThreadDialogs_1._convertSaveOptions(options);
        if (!convertedOptions.defaultUri) {
            convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
        }
        return Promise.resolve(this._fileDialogService.showSaveDialog(convertedOptions));
    }
    static _convertOpenOptions(options) {
        const result = {
            openLabel: options?.openLabel || undefined,
            canSelectFiles: options?.canSelectFiles || (!options?.canSelectFiles && !options?.canSelectFolders),
            canSelectFolders: options?.canSelectFolders,
            canSelectMany: options?.canSelectMany,
            defaultUri: options?.defaultUri ? URI.revive(options.defaultUri) : undefined,
            title: options?.title || undefined,
            availableFileSystems: options?.allowUIResources ? [Schemas.vscodeRemote, Schemas.file] : []
        };
        if (options?.filters) {
            result.filters = [];
            for (const [key, value] of Object.entries(options.filters)) {
                result.filters.push({ name: key, extensions: value });
            }
        }
        return result;
    }
    static _convertSaveOptions(options) {
        const result = {
            defaultUri: options?.defaultUri ? URI.revive(options.defaultUri) : undefined,
            saveLabel: options?.saveLabel || undefined,
            title: options?.title || undefined
        };
        if (options?.filters) {
            result.filters = [];
            for (const [key, value] of Object.entries(options.filters)) {
                result.filters.push({ name: key, extensions: value });
            }
        }
        return result;
    }
};
MainThreadDialogs = MainThreadDialogs_1 = __decorate([
    extHostNamedCustomer(MainContext.MainThreadDialogs),
    __param(1, IFileDialogService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadDialogs);
export { MainThreadDialogs };
