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
import { Codicon } from '../../../../base/common/codicons.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ChatInputPart } from './chatInputPart.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
let ChatImageDropAndPaste = class ChatImageDropAndPaste extends Disposable {
    constructor(inputPart, clipboardService, configurationService) {
        super();
        this.inputPart = inputPart;
        this.clipboardService = clipboardService;
        this.configurationService = configurationService;
        this._register(this.inputPart.inputEditor.onDidPaste((e) => {
            if (this.configurationService.getValue('chat.experimental.imageAttachments')) {
                this._handlePaste();
            }
        }));
    }
    async _handlePaste() {
        const currClipboard = await this.clipboardService.readImage();
        if (!currClipboard || !isImage(currClipboard)) {
            return;
        }
        const context = await getImageAttachContext(currClipboard);
        if (!context) {
            return;
        }
        const currentContextIds = new Set(Array.from(this.inputPart.attachedContext).map(context => context.id));
        const filteredContext = [];
        if (!currentContextIds.has(context.id)) {
            currentContextIds.add(context.id);
            filteredContext.push(context);
        }
        this.inputPart.attachContext(false, ...filteredContext);
    }
};
ChatImageDropAndPaste = __decorate([
    __param(1, IClipboardService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [ChatInputPart, Object, Object])
], ChatImageDropAndPaste);
export { ChatImageDropAndPaste };
async function getImageAttachContext(data) {
    return {
        value: data,
        id: await imageToHash(data),
        name: localize('pastedImage', 'Pasted Image'),
        isImage: true,
        icon: Codicon.fileMedia,
        isDynamic: true,
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
    const identifier = {
        png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        jpeg: [0xFF, 0xD8, 0xFF],
        bmp: [0x42, 0x4D],
        gif: [0x47, 0x49, 0x46, 0x38],
        tiff: [0x49, 0x49, 0x2A, 0x00]
    };
    return Object.values(identifier).some((signature) => signature.every((byte, index) => array[index] === byte));
}
