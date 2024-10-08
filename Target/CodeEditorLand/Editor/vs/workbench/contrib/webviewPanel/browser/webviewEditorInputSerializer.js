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
import { URI } from '../../../../base/common/uri.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { WebviewInput } from './webviewEditorInput.js';
import { IWebviewWorkbenchService } from './webviewWorkbenchService.js';
let WebviewEditorInputSerializer = class WebviewEditorInputSerializer {
    static { this.ID = WebviewInput.typeId; }
    constructor(_webviewWorkbenchService) {
        this._webviewWorkbenchService = _webviewWorkbenchService;
    }
    canSerialize(input) {
        return this._webviewWorkbenchService.shouldPersist(input);
    }
    serialize(input) {
        if (!this.canSerialize(input)) {
            return undefined;
        }
        const data = this.toJson(input);
        try {
            return JSON.stringify(data);
        }
        catch {
            return undefined;
        }
    }
    deserialize(_instantiationService, serializedEditorInput) {
        const data = this.fromJson(JSON.parse(serializedEditorInput));
        return this._webviewWorkbenchService.openRevivedWebview({
            webviewInitInfo: {
                providedViewType: data.providedId,
                origin: data.origin,
                title: data.title,
                options: data.webviewOptions,
                contentOptions: data.contentOptions,
                extension: data.extension,
            },
            viewType: data.viewType,
            title: data.title,
            iconPath: data.iconPath,
            state: data.state,
            group: data.group
        });
    }
    fromJson(data) {
        return {
            ...data,
            extension: reviveWebviewExtensionDescription(data.extensionId, data.extensionLocation),
            iconPath: reviveIconPath(data.iconPath),
            state: reviveState(data.state),
            webviewOptions: restoreWebviewOptions(data.options),
            contentOptions: restoreWebviewContentOptions(data.options),
        };
    }
    toJson(input) {
        return {
            origin: input.webview.origin,
            viewType: input.viewType,
            providedId: input.providedId,
            title: input.getName(),
            options: { ...input.webview.options, ...input.webview.contentOptions },
            extensionLocation: input.extension?.location,
            extensionId: input.extension?.id.value,
            state: input.webview.state,
            iconPath: input.iconPath ? { light: input.iconPath.light, dark: input.iconPath.dark, } : undefined,
            group: input.group
        };
    }
};
WebviewEditorInputSerializer = __decorate([
    __param(0, IWebviewWorkbenchService),
    __metadata("design:paramtypes", [Object])
], WebviewEditorInputSerializer);
export { WebviewEditorInputSerializer };
export function reviveWebviewExtensionDescription(extensionId, extensionLocation) {
    if (!extensionId) {
        return undefined;
    }
    const location = reviveUri(extensionLocation);
    if (!location) {
        return undefined;
    }
    return {
        id: new ExtensionIdentifier(extensionId),
        location,
    };
}
function reviveIconPath(data) {
    if (!data) {
        return undefined;
    }
    const light = reviveUri(data.light);
    const dark = reviveUri(data.dark);
    return light && dark ? { light, dark } : undefined;
}
function reviveUri(data) {
    if (!data) {
        return undefined;
    }
    try {
        if (typeof data === 'string') {
            return URI.parse(data);
        }
        return URI.from(data);
    }
    catch {
        return undefined;
    }
}
function reviveState(state) {
    return typeof state === 'string' ? state : undefined;
}
export function restoreWebviewOptions(options) {
    return options;
}
export function restoreWebviewContentOptions(options) {
    return {
        ...options,
        localResourceRoots: options.localResourceRoots?.map(uri => reviveUri(uri)),
    };
}
