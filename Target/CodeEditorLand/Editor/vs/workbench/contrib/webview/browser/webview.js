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
import { equals } from '../../../../base/common/arrays.js';
import { isEqual } from '../../../../base/common/resources.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Memento } from '../../../common/memento.js';
/**
 * Set when the find widget in a webview in a webview is visible.
 */
export const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = new RawContextKey('webviewFindWidgetVisible', false);
/**
 * Set when the find widget in a webview is focused.
 */
export const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED = new RawContextKey('webviewFindWidgetFocused', false);
/**
 * Set when the find widget in a webview is enabled in a webview
 */
export const KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED = new RawContextKey('webviewFindWidgetEnabled', false);
export const IWebviewService = createDecorator('webviewService');
/**
 * Check if two {@link WebviewContentOptions} are equal.
 */
export function areWebviewContentOptionsEqual(a, b) {
    return (a.allowMultipleAPIAcquire === b.allowMultipleAPIAcquire
        && a.allowScripts === b.allowScripts
        && a.allowForms === b.allowForms
        && equals(a.localResourceRoots, b.localResourceRoots, isEqual)
        && equals(a.portMapping, b.portMapping, (a, b) => a.extensionHostPort === b.extensionHostPort && a.webviewPort === b.webviewPort)
        && areEnableCommandUrisEqual(a, b));
}
function areEnableCommandUrisEqual(a, b) {
    if (a.enableCommandUris === b.enableCommandUris) {
        return true;
    }
    if (Array.isArray(a.enableCommandUris) && Array.isArray(b.enableCommandUris)) {
        return equals(a.enableCommandUris, b.enableCommandUris);
    }
    return false;
}
/**
 * Stores the unique origins for a webview.
 *
 * These are randomly generated
 */
let WebviewOriginStore = class WebviewOriginStore {
    constructor(rootStorageKey, storageService) {
        this._memento = new Memento(rootStorageKey, storageService);
        this._state = this._memento.getMemento(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
    }
    getOrigin(viewType, additionalKey) {
        const key = this._getKey(viewType, additionalKey);
        const existing = this._state[key];
        if (existing && typeof existing === 'string') {
            return existing;
        }
        const newOrigin = generateUuid();
        this._state[key] = newOrigin;
        this._memento.saveMemento();
        return newOrigin;
    }
    _getKey(viewType, additionalKey) {
        return JSON.stringify({ viewType, key: additionalKey });
    }
};
WebviewOriginStore = __decorate([
    __param(1, IStorageService),
    __metadata("design:paramtypes", [String, Object])
], WebviewOriginStore);
export { WebviewOriginStore };
/**
 * Stores the unique origins for a webview.
 *
 * These are randomly generated, but keyed on extension and webview viewType.
 */
let ExtensionKeyedWebviewOriginStore = class ExtensionKeyedWebviewOriginStore {
    constructor(rootStorageKey, storageService) {
        this._store = new WebviewOriginStore(rootStorageKey, storageService);
    }
    getOrigin(viewType, extId) {
        return this._store.getOrigin(viewType, extId.value);
    }
};
ExtensionKeyedWebviewOriginStore = __decorate([
    __param(1, IStorageService),
    __metadata("design:paramtypes", [String, Object])
], ExtensionKeyedWebviewOriginStore);
export { ExtensionKeyedWebviewOriginStore };
