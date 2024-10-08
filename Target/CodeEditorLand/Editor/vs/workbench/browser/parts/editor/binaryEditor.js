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
import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { BinaryEditorModel } from '../../../common/editor/binaryEditorModel.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ByteSize } from '../../../../platform/files/common/files.js';
import { EditorPlaceholder } from './editorPlaceholder.js';
/*
 * This class is only intended to be subclassed and not instantiated.
 */
let BaseBinaryResourceEditor = class BaseBinaryResourceEditor extends EditorPlaceholder {
    constructor(id, group, callbacks, telemetryService, themeService, storageService) {
        super(id, group, telemetryService, themeService, storageService);
        this.callbacks = callbacks;
        this._onDidChangeMetadata = this._register(new Emitter());
        this.onDidChangeMetadata = this._onDidChangeMetadata.event;
        this._onDidOpenInPlace = this._register(new Emitter());
        this.onDidOpenInPlace = this._onDidOpenInPlace.event;
    }
    getTitle() {
        return this.input ? this.input.getName() : localize('binaryEditor', "Binary Viewer");
    }
    async getContents(input, options) {
        const model = await input.resolve();
        // Assert Model instance
        if (!(model instanceof BinaryEditorModel)) {
            throw new Error('Unable to open file as binary');
        }
        // Update metadata
        const size = model.getSize();
        this.handleMetadataChanged(typeof size === 'number' ? ByteSize.formatSize(size) : '');
        return {
            icon: '$(warning)',
            label: localize('binaryError', "The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding."),
            actions: [
                {
                    label: localize('openAnyway', "Open Anyway"),
                    run: async () => {
                        // Open in place
                        await this.callbacks.openInternal(input, options);
                        // Signal to listeners that the binary editor has been opened in-place
                        this._onDidOpenInPlace.fire();
                    }
                }
            ]
        };
    }
    handleMetadataChanged(meta) {
        this.metadata = meta;
        this._onDidChangeMetadata.fire();
    }
    getMetadata() {
        return this.metadata;
    }
};
BaseBinaryResourceEditor = __decorate([
    __param(5, IStorageService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object])
], BaseBinaryResourceEditor);
export { BaseBinaryResourceEditor };
