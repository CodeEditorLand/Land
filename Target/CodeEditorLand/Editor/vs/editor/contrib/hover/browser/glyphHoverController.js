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
var GlyphHoverController_1;
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { isMousePositionWithinElement } from './hoverUtils.js';
import './hover.css';
import { GlyphHoverWidget } from './glyphHoverWidget.js';
// sticky hover widget which doesn't disappear on focus out and such
const _sticky = false;
let GlyphHoverController = class GlyphHoverController extends Disposable {
    static { GlyphHoverController_1 = this; }
    static { this.ID = 'editor.contrib.marginHover'; }
    constructor(_editor, _instantiationService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this.shouldKeepOpenOnEditorMouseMoveOrLeave = false;
        this._listenersStore = new DisposableStore();
        this._hoverState = {
            mouseDown: false
        };
        this._reactToEditorMouseMoveRunner = this._register(new RunOnceScheduler(() => this._reactToEditorMouseMove(this._mouseMoveEvent), 0));
        this._hookListeners();
        this._register(this._editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(62 /* EditorOption.hover */)) {
                this._unhookListeners();
                this._hookListeners();
            }
        }));
    }
    static get(editor) {
        return editor.getContribution(GlyphHoverController_1.ID);
    }
    _hookListeners() {
        const hoverOpts = this._editor.getOption(62 /* EditorOption.hover */);
        this._hoverSettings = {
            enabled: hoverOpts.enabled,
            sticky: hoverOpts.sticky,
            hidingDelay: hoverOpts.hidingDelay
        };
        if (hoverOpts.enabled) {
            this._listenersStore.add(this._editor.onMouseDown((e) => this._onEditorMouseDown(e)));
            this._listenersStore.add(this._editor.onMouseUp(() => this._onEditorMouseUp()));
            this._listenersStore.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
            this._listenersStore.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
        }
        else {
            this._listenersStore.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
            this._listenersStore.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
        }
        this._listenersStore.add(this._editor.onMouseLeave((e) => this._onEditorMouseLeave(e)));
        this._listenersStore.add(this._editor.onDidChangeModel(() => {
            this._cancelScheduler();
            this._hideWidgets();
        }));
        this._listenersStore.add(this._editor.onDidChangeModelContent(() => this._cancelScheduler()));
        this._listenersStore.add(this._editor.onDidScrollChange((e) => this._onEditorScrollChanged(e)));
    }
    _unhookListeners() {
        this._listenersStore.clear();
    }
    _cancelScheduler() {
        this._mouseMoveEvent = undefined;
        this._reactToEditorMouseMoveRunner.cancel();
    }
    _onEditorScrollChanged(e) {
        if (e.scrollTopChanged || e.scrollLeftChanged) {
            this._hideWidgets();
        }
    }
    _onEditorMouseDown(mouseEvent) {
        this._hoverState.mouseDown = true;
        const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
        if (shouldNotHideCurrentHoverWidget) {
            return;
        }
        this._hideWidgets();
    }
    _isMouseOnGlyphHoverWidget(mouseEvent) {
        const glyphHoverWidgetNode = this._glyphWidget?.getDomNode();
        if (glyphHoverWidgetNode) {
            return isMousePositionWithinElement(glyphHoverWidgetNode, mouseEvent.event.posx, mouseEvent.event.posy);
        }
        return false;
    }
    _onEditorMouseUp() {
        this._hoverState.mouseDown = false;
    }
    _onEditorMouseLeave(mouseEvent) {
        if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
            return;
        }
        this._cancelScheduler();
        const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
        if (shouldNotHideCurrentHoverWidget) {
            return;
        }
        if (_sticky) {
            return;
        }
        this._hideWidgets();
    }
    _shouldNotRecomputeCurrentHoverWidget(mouseEvent) {
        const isHoverSticky = this._hoverSettings.sticky;
        const isMouseOnGlyphHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
        return isHoverSticky && isMouseOnGlyphHoverWidget;
    }
    _onEditorMouseMove(mouseEvent) {
        if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
            return;
        }
        this._mouseMoveEvent = mouseEvent;
        const shouldNotRecomputeCurrentHoverWidget = this._shouldNotRecomputeCurrentHoverWidget(mouseEvent);
        if (shouldNotRecomputeCurrentHoverWidget) {
            this._reactToEditorMouseMoveRunner.cancel();
            return;
        }
        this._reactToEditorMouseMove(mouseEvent);
    }
    _reactToEditorMouseMove(mouseEvent) {
        if (!mouseEvent) {
            return;
        }
        const glyphWidgetShowsOrWillShow = this._tryShowHoverWidget(mouseEvent);
        if (glyphWidgetShowsOrWillShow) {
            return;
        }
        if (_sticky) {
            return;
        }
        this._hideWidgets();
    }
    _tryShowHoverWidget(mouseEvent) {
        const glyphWidget = this._getOrCreateGlyphWidget();
        return glyphWidget.showsOrWillShow(mouseEvent);
    }
    _onKeyDown(e) {
        if (!this._editor.hasModel()) {
            return;
        }
        if (e.keyCode === 5 /* KeyCode.Ctrl */
            || e.keyCode === 6 /* KeyCode.Alt */
            || e.keyCode === 57 /* KeyCode.Meta */
            || e.keyCode === 4 /* KeyCode.Shift */) {
            // Do not hide hover when a modifier key is pressed
            return;
        }
        this._hideWidgets();
    }
    _hideWidgets() {
        if (_sticky) {
            return;
        }
        this._glyphWidget?.hide();
    }
    _getOrCreateGlyphWidget() {
        if (!this._glyphWidget) {
            this._glyphWidget = this._instantiationService.createInstance(GlyphHoverWidget, this._editor);
        }
        return this._glyphWidget;
    }
    hideContentHover() {
        this._hideWidgets();
    }
    dispose() {
        super.dispose();
        this._unhookListeners();
        this._listenersStore.dispose();
        this._glyphWidget?.dispose();
    }
};
GlyphHoverController = GlyphHoverController_1 = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], GlyphHoverController);
export { GlyphHoverController };
