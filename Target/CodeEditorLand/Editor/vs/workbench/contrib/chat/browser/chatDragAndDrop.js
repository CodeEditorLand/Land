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
import { DataTransfers } from '../../../../base/browser/dnd.js';
import { $, DragAndDropObserver } from '../../../../base/browser/dom.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { basename } from '../../../../base/common/resources.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { containsDragType, extractEditorsDropData } from '../../../../platform/dnd/browser/dnd.js';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { ChatInputPart } from './chatInputPart.js';
var ChatDragAndDropType;
(function (ChatDragAndDropType) {
    ChatDragAndDropType[ChatDragAndDropType["FILE"] = 0] = "FILE";
    ChatDragAndDropType[ChatDragAndDropType["IMAGE"] = 1] = "IMAGE";
})(ChatDragAndDropType || (ChatDragAndDropType = {}));
let ChatDragAndDrop = class ChatDragAndDrop extends Themable {
    constructor(contianer, inputPart, styles, themeService, configurationService) {
        super(themeService);
        this.contianer = contianer;
        this.inputPart = inputPart;
        this.styles = styles;
        this.configurationService = configurationService;
        this.overlayTextBackground = '';
        // If the mouse enters and leaves the overlay quickly,
        // the overlay may stick around due to too many drag enter events
        // Make sure the mouse enters only once
        let mouseInside = false;
        this._register(new DragAndDropObserver(this.contianer, {
            onDragEnter: (e) => {
                if (!mouseInside) {
                    mouseInside = true;
                    this.onDragEnter(e);
                }
            },
            onDragOver: (e) => {
                e.stopPropagation();
            },
            onDragLeave: (e) => {
                this.onDragLeave(e);
                mouseInside = false;
            },
            onDrop: (e) => {
                this.onDrop(e);
                mouseInside = false;
            },
        }));
        this.overlay = document.createElement('div');
        this.overlay.classList.add('chat-dnd-overlay');
        this.contianer.appendChild(this.overlay);
        this.updateStyles();
    }
    onDragEnter(e) {
        const estimatedDropType = this.guessDropType(e);
        if (estimatedDropType !== undefined) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.updateDropFeedback(e, estimatedDropType);
    }
    onDragLeave(e) {
        this.updateDropFeedback(e, undefined);
    }
    onDrop(e) {
        this.updateDropFeedback(e, undefined);
        const contexts = this.getAttachContext(e);
        if (contexts.length === 0) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        // Make sure to attach only new contexts
        const currentContextIds = this.inputPart.attachmentModel.getAttachmentIDs();
        const filteredContext = [];
        for (const context of contexts) {
            if (!currentContextIds.has(context.id)) {
                currentContextIds.add(context.id);
                filteredContext.push(context);
            }
        }
        this.inputPart.attachmentModel.addContext(...filteredContext);
    }
    updateDropFeedback(e, dropType) {
        const showOverlay = dropType !== undefined;
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = showOverlay ? 'copy' : 'none';
        }
        this.setOverlay(dropType);
    }
    isImageDnd(e) {
        // Image detection should not have false positives, only false negatives are allowed
        if (containsDragType(e, 'image')) {
            return true;
        }
        if (containsDragType(e, DataTransfers.FILES)) {
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                return file.type.startsWith('image/');
            }
            const items = e.dataTransfer?.items;
            if (items && items.length > 0) {
                const item = items[0];
                return item.type.startsWith('image/');
            }
        }
        return false;
    }
    guessDropType(e) {
        // This is an esstimation based on the datatransfer types/items
        if (this.isImageDnd(e)) {
            const imageDndSupported = this.configurationService.getValue('chat.experimental.imageAttachments');
            return imageDndSupported ? ChatDragAndDropType.IMAGE : undefined;
        }
        else if (containsDragType(e, DataTransfers.FILES, DataTransfers.INTERNAL_URI_LIST)) {
            return ChatDragAndDropType.FILE;
        }
        return undefined;
    }
    isDragEventSupported(e) {
        // if guessed drop type is undefined, it means the drop is not supported
        const dropType = this.guessDropType(e);
        return dropType !== undefined;
    }
    getDropTypeName(type) {
        switch (type) {
            case ChatDragAndDropType.FILE: return localize('file', 'File');
            case ChatDragAndDropType.IMAGE: return localize('image', 'Image');
        }
    }
    getAttachContext(e) {
        if (!this.isDragEventSupported(e)) {
            return [];
        }
        const data = extractEditorsDropData(e);
        return coalesce(data.map(editorInput => {
            return this.resolveAttachContext(editorInput);
        }));
    }
    resolveAttachContext(editorInput) {
        // Image
        const imageContext = getImageAttachContext(editorInput);
        if (imageContext) {
            const isImageDndSupported = this.configurationService.getValue('chat.experimental.imageAttachments');
            return isImageDndSupported ? imageContext : undefined;
        }
        // File
        return getEditorAttachContext(editorInput);
    }
    setOverlay(type) {
        // Remove any previous overlay text
        this.overlayText?.remove();
        this.overlayText = undefined;
        if (type !== undefined) {
            // Render the overlay text
            const typeName = this.getDropTypeName(type);
            const iconAndtextElements = renderLabelWithIcons(`$(${Codicon.attach.id}) ${localize('attach as context', 'Attach {0} as Context', typeName)}`);
            const htmlElements = iconAndtextElements.map(element => {
                if (typeof element === 'string') {
                    return $('span.overlay-text', undefined, element);
                }
                return element;
            });
            this.overlayText = $('span.attach-context-overlay-text', undefined, ...htmlElements);
            this.overlayText.style.backgroundColor = this.overlayTextBackground;
            this.overlay.appendChild(this.overlayText);
        }
        this.overlay.classList.toggle('visible', type !== undefined);
    }
    updateStyles() {
        this.overlay.style.backgroundColor = this.getColor(this.styles.overlayBackground) || '';
        this.overlay.style.color = this.getColor(this.styles.listForeground) || '';
        this.overlayTextBackground = this.getColor(this.styles.listBackground) || '';
    }
};
ChatDragAndDrop = __decorate([
    __param(3, IThemeService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [HTMLElement,
        ChatInputPart, Object, Object, Object])
], ChatDragAndDrop);
export { ChatDragAndDrop };
function getEditorAttachContext(editor) {
    if (!editor.resource) {
        return undefined;
    }
    return getFileAttachContext(editor.resource);
}
function getFileAttachContext(resource) {
    return {
        value: resource,
        id: resource.toString(),
        name: basename(resource),
        isFile: true,
        isDynamic: true
    };
}
function getImageAttachContext(editor) {
    if (!editor.resource) {
        return undefined;
    }
    if (/\.(png|jpg|jpeg|bmp|gif|tiff)$/i.test(editor.resource.path)) {
        const fileName = basename(editor.resource);
        return {
            id: editor.resource.toString(),
            name: fileName,
            fullName: editor.resource.path,
            value: editor.resource,
            icon: Codicon.fileMedia,
            isDynamic: true,
            isImage: true,
            isFile: false
        };
    }
    return undefined;
}
