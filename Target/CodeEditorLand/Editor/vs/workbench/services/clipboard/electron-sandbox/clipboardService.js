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
var NativeClipboardService_1;
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { URI } from '../../../../base/common/uri.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
let NativeClipboardService = class NativeClipboardService {
    static { NativeClipboardService_1 = this; }
    static { this.FILE_FORMAT = 'code/file-list'; } // Clipboard format for files
    constructor(nativeHostService) {
        this.nativeHostService = nativeHostService;
    }
    async readImage() {
        return this.nativeHostService.readImage();
    }
    async writeText(text, type) {
        return this.nativeHostService.writeClipboardText(text, type);
    }
    async readText(type) {
        return this.nativeHostService.readClipboardText(type);
    }
    async readFindText() {
        if (isMacintosh) {
            return this.nativeHostService.readClipboardFindText();
        }
        return '';
    }
    async writeFindText(text) {
        if (isMacintosh) {
            return this.nativeHostService.writeClipboardFindText(text);
        }
    }
    async writeResources(resources) {
        if (resources.length) {
            return this.nativeHostService.writeClipboardBuffer(NativeClipboardService_1.FILE_FORMAT, this.resourcesToBuffer(resources));
        }
    }
    async readResources() {
        return this.bufferToResources(await this.nativeHostService.readClipboardBuffer(NativeClipboardService_1.FILE_FORMAT));
    }
    async hasResources() {
        return this.nativeHostService.hasClipboard(NativeClipboardService_1.FILE_FORMAT);
    }
    resourcesToBuffer(resources) {
        return VSBuffer.fromString(resources.map(r => r.toString()).join('\n'));
    }
    bufferToResources(buffer) {
        if (!buffer) {
            return [];
        }
        const bufferValue = buffer.toString();
        if (!bufferValue) {
            return [];
        }
        try {
            return bufferValue.split('\n').map(f => URI.parse(f));
        }
        catch (error) {
            return []; // do not trust clipboard data
        }
    }
};
NativeClipboardService = NativeClipboardService_1 = __decorate([
    __param(0, INativeHostService),
    __metadata("design:paramtypes", [Object])
], NativeClipboardService);
export { NativeClipboardService };
registerSingleton(IClipboardService, NativeClipboardService, 1 /* InstantiationType.Delayed */);
