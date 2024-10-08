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
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { WebviewThemeDataProvider } from './themeing.js';
import { WebviewElement } from './webviewElement.js';
import { OverlayWebview } from './overlayWebview.js';
let WebviewService = class WebviewService extends Disposable {
    constructor(_instantiationService) {
        super();
        this._instantiationService = _instantiationService;
        this._webviews = new Set();
        this._onDidChangeActiveWebview = this._register(new Emitter());
        this.onDidChangeActiveWebview = this._onDidChangeActiveWebview.event;
        this._webviewThemeDataProvider = this._instantiationService.createInstance(WebviewThemeDataProvider);
    }
    get activeWebview() { return this._activeWebview; }
    _updateActiveWebview(value) {
        if (value !== this._activeWebview) {
            this._activeWebview = value;
            this._onDidChangeActiveWebview.fire(value);
        }
    }
    get webviews() {
        return this._webviews.values();
    }
    createWebviewElement(initInfo) {
        const webview = this._instantiationService.createInstance(WebviewElement, initInfo, this._webviewThemeDataProvider);
        this.registerNewWebview(webview);
        return webview;
    }
    createWebviewOverlay(initInfo) {
        const webview = this._instantiationService.createInstance(OverlayWebview, initInfo);
        this.registerNewWebview(webview);
        return webview;
    }
    registerNewWebview(webview) {
        this._webviews.add(webview);
        const store = new DisposableStore();
        store.add(webview.onDidFocus(() => {
            this._updateActiveWebview(webview);
        }));
        const onBlur = () => {
            if (this._activeWebview === webview) {
                this._updateActiveWebview(undefined);
            }
        };
        store.add(webview.onDidBlur(onBlur));
        store.add(webview.onDidDispose(() => {
            onBlur();
            store.dispose();
            this._webviews.delete(webview);
        }));
    }
};
WebviewService = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], WebviewService);
export { WebviewService };
