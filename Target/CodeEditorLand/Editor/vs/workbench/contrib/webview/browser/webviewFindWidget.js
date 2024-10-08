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
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { SimpleFindWidget } from '../../codeEditor/browser/find/simpleFindWidget.js';
import { KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED } from './webview.js';
let WebviewFindWidget = class WebviewFindWidget extends SimpleFindWidget {
    async _getResultCount(dataChanged) {
        return undefined;
    }
    constructor(_delegate, contextViewService, contextKeyService, hoverService, keybindingService) {
        super({
            showCommonFindToggles: false,
            checkImeCompletionState: _delegate.checkImeCompletionState,
            enableSash: true,
        }, contextViewService, contextKeyService, hoverService, keybindingService);
        this._delegate = _delegate;
        this._findWidgetFocused = KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
        this._register(_delegate.hasFindResult(hasResult => {
            this.updateButtons(hasResult);
            this.focusFindBox();
        }));
        this._register(_delegate.onDidStopFind(() => {
            this.updateButtons(false);
        }));
    }
    find(previous) {
        const val = this.inputValue;
        if (val) {
            this._delegate.find(val, previous);
        }
    }
    hide(animated = true) {
        super.hide(animated);
        this._delegate.stopFind(true);
        this._delegate.focus();
    }
    _onInputChanged() {
        const val = this.inputValue;
        if (val) {
            this._delegate.updateFind(val);
        }
        else {
            this._delegate.stopFind(false);
        }
        return false;
    }
    _onFocusTrackerFocus() {
        this._findWidgetFocused.set(true);
    }
    _onFocusTrackerBlur() {
        this._findWidgetFocused.reset();
    }
    _onFindInputFocusTrackerFocus() { }
    _onFindInputFocusTrackerBlur() { }
    findFirst() { }
};
WebviewFindWidget = __decorate([
    __param(1, IContextViewService),
    __param(2, IContextKeyService),
    __param(3, IHoverService),
    __param(4, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WebviewFindWidget);
export { WebviewFindWidget };
