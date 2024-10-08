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
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ChatInputPart } from './chatInputPart.js';
import { IChatWidgetService } from './chat.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export class PasteImageProvider {
    constructor(chatWidgetService, configurationService) {
        this.chatWidgetService = chatWidgetService;
        this.configurationService = configurationService;
        this.kind = new HierarchicalKind('image');
        this.pasteMimeTypes = ['image/*'];
    }
    async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context, token) {
        if (!this.configurationService.getValue('chat.experimental.imageAttachments')) {
            return;
        }
        const supportedMimeTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/bmp',
            'image/gif',
            'image/tiff'
        ];
        let mimeType;
        let imageItem;
        // Find the first matching image type in the dataTransfer
        for (const type of supportedMimeTypes) {
            imageItem = dataTransfer.get(type);
            if (imageItem) {
                mimeType = type;
                break;
            }
        }
        if (!imageItem || !mimeType) {
            return;
        }
        const currClipboard = await imageItem.asFile()?.data();
        if (token.isCancellationRequested || !currClipboard) {
            return;
        }
        const widget = this.chatWidgetService.getWidgetByInputUri(_model.uri);
        if (!widget) {
            return;
        }
        const attachedVariables = widget.attachmentModel.attachments;
        const displayName = localize('pastedImageName', 'Pasted Image');
        let tempDisplayName = displayName;
        for (let appendValue = 2; attachedVariables.some(attachment => attachment.name === tempDisplayName); appendValue++) {
            tempDisplayName = `${displayName} ${appendValue}`;
        }
        const imageContext = await getImageAttachContext(currClipboard, mimeType, token, tempDisplayName);
        if (token.isCancellationRequested || !imageContext) {
            return;
        }
        // Make sure to attach only new contexts
        const currentContextIds = widget.attachmentModel.getAttachmentIDs();
        if (currentContextIds.has(imageContext.id)) {
            return;
        }
        widget.attachmentModel.addContext(imageContext);
        return;
    }
}
async function getImageAttachContext(data, mimeType, token, displayName) {
    const imageHash = await imageToHash(data);
    if (token.isCancellationRequested) {
        return undefined;
    }
    return {
        value: data,
        id: imageHash,
        name: displayName,
        isImage: true,
        icon: Codicon.fileMedia,
        isDynamic: true,
        isFile: false,
        mimeType
    };
}
export async function imageToHash(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
export function isImage(array) {
    if (array.length < 4) {
        return false;
    }
    // Magic numbers (identification bytes) for various image formats
    const identifier = {
        png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        jpeg: [0xFF, 0xD8, 0xFF],
        bmp: [0x42, 0x4D],
        gif: [0x47, 0x49, 0x46, 0x38],
        tiff: [0x49, 0x49, 0x2A, 0x00]
    };
    return Object.values(identifier).some((signature) => signature.every((byte, index) => array[index] === byte));
}
let ChatPasteProvidersFeature = class ChatPasteProvidersFeature extends Disposable {
    constructor(languageFeaturesService, chatWidgetService, configurationService) {
        super();
        this._register(languageFeaturesService.documentPasteEditProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, pattern: '*', hasAccessToAllModels: true }, new PasteImageProvider(chatWidgetService, configurationService)));
    }
};
ChatPasteProvidersFeature = __decorate([
    __param(0, ILanguageFeaturesService),
    __param(1, IChatWidgetService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatPasteProvidersFeature);
export { ChatPasteProvidersFeature };
