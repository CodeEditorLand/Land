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
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import * as dom from '../../../../../base/browser/dom.js';
import { RunOnceScheduler } from '../../../../../base/common/async.js';
import { convertBufferRangeToViewport } from './terminalLinkHelpers.js';
import { isMacintosh } from '../../../../../base/common/platform.js';
import { Emitter } from '../../../../../base/common/event.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
let TerminalLink = class TerminalLink extends Disposable {
    get onInvalidated() { return this._onInvalidated.event; }
    get type() { return this._type; }
    constructor(_xterm, range, text, uri, parsedLink, actions, _viewportY, _activateCallback, _tooltipCallback, _isHighConfidenceLink, label, _type, _configurationService) {
        super();
        this._xterm = _xterm;
        this.range = range;
        this.text = text;
        this.uri = uri;
        this.parsedLink = parsedLink;
        this.actions = actions;
        this._viewportY = _viewportY;
        this._activateCallback = _activateCallback;
        this._tooltipCallback = _tooltipCallback;
        this._isHighConfidenceLink = _isHighConfidenceLink;
        this.label = label;
        this._type = _type;
        this._configurationService = _configurationService;
        this._tooltipScheduler = this._register(new MutableDisposable());
        this._hoverListeners = this._register(new MutableDisposable());
        this._onInvalidated = new Emitter();
        this.decorations = {
            pointerCursor: false,
            underline: this._isHighConfidenceLink
        };
    }
    activate(event, text) {
        this._activateCallback(event, text);
    }
    hover(event, text) {
        const w = dom.getWindow(event);
        const d = w.document;
        // Listen for modifier before handing it off to the hover to handle so it gets disposed correctly
        const hoverListeners = this._hoverListeners.value = new DisposableStore();
        hoverListeners.add(dom.addDisposableListener(d, 'keydown', e => {
            if (!e.repeat && this._isModifierDown(e)) {
                this._enableDecorations();
            }
        }));
        hoverListeners.add(dom.addDisposableListener(d, 'keyup', e => {
            if (!e.repeat && !this._isModifierDown(e)) {
                this._disableDecorations();
            }
        }));
        // Listen for when the terminal renders on the same line as the link
        hoverListeners.add(this._xterm.onRender(e => {
            const viewportRangeY = this.range.start.y - this._viewportY;
            if (viewportRangeY >= e.start && viewportRangeY <= e.end) {
                this._onInvalidated.fire();
            }
        }));
        // Only show the tooltip and highlight for high confidence links (not word/search workspace
        // links). Feedback was that this makes using the terminal overly noisy.
        if (this._isHighConfidenceLink) {
            this._tooltipScheduler.value = new RunOnceScheduler(() => {
                this._tooltipCallback(this, convertBufferRangeToViewport(this.range, this._viewportY), this._isHighConfidenceLink ? () => this._enableDecorations() : undefined, this._isHighConfidenceLink ? () => this._disableDecorations() : undefined);
                // Clear out scheduler until next hover event
                this._tooltipScheduler.clear();
            }, this._configurationService.getValue('workbench.hover.delay'));
            this._tooltipScheduler.value.schedule();
        }
        const origin = { x: event.pageX, y: event.pageY };
        hoverListeners.add(dom.addDisposableListener(d, dom.EventType.MOUSE_MOVE, e => {
            // Update decorations
            if (this._isModifierDown(e)) {
                this._enableDecorations();
            }
            else {
                this._disableDecorations();
            }
            // Reset the scheduler if the mouse moves too much
            if (Math.abs(e.pageX - origin.x) > w.devicePixelRatio * 2 || Math.abs(e.pageY - origin.y) > w.devicePixelRatio * 2) {
                origin.x = e.pageX;
                origin.y = e.pageY;
                this._tooltipScheduler.value?.schedule();
            }
        }));
    }
    leave() {
        this._hoverListeners.clear();
        this._tooltipScheduler.clear();
    }
    _enableDecorations() {
        if (!this.decorations.pointerCursor) {
            this.decorations.pointerCursor = true;
        }
        if (!this.decorations.underline) {
            this.decorations.underline = true;
        }
    }
    _disableDecorations() {
        if (this.decorations.pointerCursor) {
            this.decorations.pointerCursor = false;
        }
        if (this.decorations.underline !== this._isHighConfidenceLink) {
            this.decorations.underline = this._isHighConfidenceLink;
        }
    }
    _isModifierDown(event) {
        const multiCursorModifier = this._configurationService.getValue('editor.multiCursorModifier');
        if (multiCursorModifier === 'ctrlCmd') {
            return !!event.altKey;
        }
        return isMacintosh ? event.metaKey : event.ctrlKey;
    }
};
TerminalLink = __decorate([
    __param(12, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, String, Object, Object, Object, Number, Function, Function, Boolean, Object, Object, Object])
], TerminalLink);
export { TerminalLink };
