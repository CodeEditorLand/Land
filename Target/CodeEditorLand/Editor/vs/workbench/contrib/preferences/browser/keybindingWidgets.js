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
var DefineKeybindingWidget_1, DefineKeybindingOverlayWidget_1;
import './media/keybindings.css';
import * as nls from '../../../../nls.js';
import { OS } from '../../../../base/common/platform.js';
import { Disposable, toDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { KeybindingLabel } from '../../../../base/browser/ui/keybindingLabel/keybindingLabel.js';
import { Widget } from '../../../../base/browser/ui/widget.js';
import * as dom from '../../../../base/browser/dom.js';
import * as aria from '../../../../base/browser/ui/aria/aria.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { createFastDomNode } from '../../../../base/browser/fastDomNode.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { asCssVariable, editorWidgetBackground, editorWidgetForeground, widgetShadow } from '../../../../platform/theme/common/colorRegistry.js';
import { SearchWidget } from './preferencesWidgets.js';
import { Promises, timeout } from '../../../../base/common/async.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { defaultInputBoxStyles, defaultKeybindingLabelStyles } from '../../../../platform/theme/browser/defaultStyles.js';
let KeybindingsSearchWidget = class KeybindingsSearchWidget extends SearchWidget {
    constructor(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService) {
        super(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService);
        this.recordDisposables = this._register(new DisposableStore());
        this._onKeybinding = this._register(new Emitter());
        this.onKeybinding = this._onKeybinding.event;
        this._onEnter = this._register(new Emitter());
        this.onEnter = this._onEnter.event;
        this._onEscape = this._register(new Emitter());
        this.onEscape = this._onEscape.event;
        this._onBlur = this._register(new Emitter());
        this.onBlur = this._onBlur.event;
        this._register(toDisposable(() => this.stopRecordingKeys()));
        this._chords = null;
        this._inputValue = '';
    }
    clear() {
        this._chords = null;
        super.clear();
    }
    startRecordingKeys() {
        this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => this._onKeyDown(new StandardKeyboardEvent(e))));
        this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.BLUR, () => this._onBlur.fire()));
        this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.INPUT, () => {
            this.setInputValue(this._inputValue);
        }));
    }
    stopRecordingKeys() {
        this._chords = null;
        this.recordDisposables.clear();
    }
    setInputValue(value) {
        this._inputValue = value;
        this.inputBox.value = this._inputValue;
    }
    _onKeyDown(keyboardEvent) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        const options = this.options;
        if (!options.recordEnter && keyboardEvent.equals(3)) {
            this._onEnter.fire();
            return;
        }
        if (keyboardEvent.equals(9)) {
            this._onEscape.fire();
            return;
        }
        this.printKeybinding(keyboardEvent);
    }
    printKeybinding(keyboardEvent) {
        const keybinding = this.keybindingService.resolveKeyboardEvent(keyboardEvent);
        const info = `code: ${keyboardEvent.browserEvent.code}, keyCode: ${keyboardEvent.browserEvent.keyCode}, key: ${keyboardEvent.browserEvent.key} => UI: ${keybinding.getAriaLabel()}, user settings: ${keybinding.getUserSettingsLabel()}, dispatch: ${keybinding.getDispatchChords()[0]}`;
        const options = this.options;
        if (!this._chords) {
            this._chords = [];
        }
        const hasIncompleteChord = this._chords.length > 0 && this._chords[this._chords.length - 1].getDispatchChords()[0] === null;
        if (hasIncompleteChord) {
            this._chords[this._chords.length - 1] = keybinding;
        }
        else {
            if (this._chords.length === 2) {
                this._chords = [];
            }
            this._chords.push(keybinding);
        }
        const value = this._chords.map((keybinding) => keybinding.getUserSettingsLabel() || '').join(' ');
        this.setInputValue(options.quoteRecordedKeys ? `"${value}"` : value);
        this.inputBox.inputElement.title = info;
        this._onKeybinding.fire(this._chords);
    }
};
KeybindingsSearchWidget = __decorate([
    __param(2, IContextViewService),
    __param(3, IInstantiationService),
    __param(4, IContextKeyService),
    __param(5, IKeybindingService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object])
], KeybindingsSearchWidget);
export { KeybindingsSearchWidget };
let DefineKeybindingWidget = class DefineKeybindingWidget extends Widget {
    static { DefineKeybindingWidget_1 = this; }
    static { this.WIDTH = 400; }
    static { this.HEIGHT = 110; }
    constructor(parent, instantiationService) {
        super();
        this.instantiationService = instantiationService;
        this._keybindingDisposables = this._register(new DisposableStore());
        this._chords = null;
        this._isVisible = false;
        this._onHide = this._register(new Emitter());
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._onShowExistingKeybindings = this._register(new Emitter());
        this.onShowExistingKeybidings = this._onShowExistingKeybindings.event;
        this._domNode = createFastDomNode(document.createElement('div'));
        this._domNode.setDisplay('none');
        this._domNode.setClassName('defineKeybindingWidget');
        this._domNode.setWidth(DefineKeybindingWidget_1.WIDTH);
        this._domNode.setHeight(DefineKeybindingWidget_1.HEIGHT);
        const message = nls.localize('defineKeybinding.initial', "Press desired key combination and then press ENTER.");
        dom.append(this._domNode.domNode, dom.$('.message', undefined, message));
        this._domNode.domNode.style.backgroundColor = asCssVariable(editorWidgetBackground);
        this._domNode.domNode.style.color = asCssVariable(editorWidgetForeground);
        this._domNode.domNode.style.boxShadow = `0 2px 8px ${asCssVariable(widgetShadow)}`;
        this._keybindingInputWidget = this._register(this.instantiationService.createInstance(KeybindingsSearchWidget, this._domNode.domNode, { ariaLabel: message, history: [], inputBoxStyles: defaultInputBoxStyles }));
        this._keybindingInputWidget.startRecordingKeys();
        this._register(this._keybindingInputWidget.onKeybinding(keybinding => this.onKeybinding(keybinding)));
        this._register(this._keybindingInputWidget.onEnter(() => this.hide()));
        this._register(this._keybindingInputWidget.onEscape(() => this.clearOrHide()));
        this._register(this._keybindingInputWidget.onBlur(() => this.onCancel()));
        this._outputNode = dom.append(this._domNode.domNode, dom.$('.output'));
        this._showExistingKeybindingsNode = dom.append(this._domNode.domNode, dom.$('.existing'));
        if (parent) {
            dom.append(parent, this._domNode.domNode);
        }
    }
    get domNode() {
        return this._domNode.domNode;
    }
    define() {
        this._keybindingInputWidget.clear();
        return Promises.withAsyncBody(async (c) => {
            if (!this._isVisible) {
                this._isVisible = true;
                this._domNode.setDisplay('block');
                this._chords = null;
                this._keybindingInputWidget.setInputValue('');
                dom.clearNode(this._outputNode);
                dom.clearNode(this._showExistingKeybindingsNode);
                await timeout(0);
                this._keybindingInputWidget.focus();
            }
            const disposable = this._onHide.event(() => {
                c(this.getUserSettingsLabel());
                disposable.dispose();
            });
        });
    }
    layout(layout) {
        const top = Math.round((layout.height - DefineKeybindingWidget_1.HEIGHT) / 2);
        this._domNode.setTop(top);
        const left = Math.round((layout.width - DefineKeybindingWidget_1.WIDTH) / 2);
        this._domNode.setLeft(left);
    }
    printExisting(numberOfExisting) {
        if (numberOfExisting > 0) {
            const existingElement = dom.$('span.existingText');
            const text = numberOfExisting === 1 ? nls.localize('defineKeybinding.oneExists', "1 existing command has this keybinding", numberOfExisting) : nls.localize('defineKeybinding.existing', "{0} existing commands have this keybinding", numberOfExisting);
            dom.append(existingElement, document.createTextNode(text));
            aria.alert(text);
            this._showExistingKeybindingsNode.appendChild(existingElement);
            existingElement.onmousedown = (e) => { e.preventDefault(); };
            existingElement.onmouseup = (e) => { e.preventDefault(); };
            existingElement.onclick = () => { this._onShowExistingKeybindings.fire(this.getUserSettingsLabel()); };
        }
    }
    onKeybinding(keybinding) {
        this._keybindingDisposables.clear();
        this._chords = keybinding;
        dom.clearNode(this._outputNode);
        dom.clearNode(this._showExistingKeybindingsNode);
        const firstLabel = this._keybindingDisposables.add(new KeybindingLabel(this._outputNode, OS, defaultKeybindingLabelStyles));
        firstLabel.set(this._chords?.[0] ?? undefined);
        if (this._chords) {
            for (let i = 1; i < this._chords.length; i++) {
                this._outputNode.appendChild(document.createTextNode(nls.localize('defineKeybinding.chordsTo', "chord to")));
                const chordLabel = this._keybindingDisposables.add(new KeybindingLabel(this._outputNode, OS, defaultKeybindingLabelStyles));
                chordLabel.set(this._chords[i]);
            }
        }
        const label = this.getUserSettingsLabel();
        if (label) {
            this._onDidChange.fire(label);
        }
    }
    getUserSettingsLabel() {
        let label = null;
        if (this._chords) {
            label = this._chords.map(keybinding => keybinding.getUserSettingsLabel()).join(' ');
        }
        return label;
    }
    onCancel() {
        this._chords = null;
        this.hide();
    }
    clearOrHide() {
        if (this._chords === null) {
            this.hide();
        }
        else {
            this._chords = null;
            this._keybindingInputWidget.clear();
            dom.clearNode(this._outputNode);
            dom.clearNode(this._showExistingKeybindingsNode);
        }
    }
    hide() {
        this._domNode.setDisplay('none');
        this._isVisible = false;
        this._onHide.fire();
    }
};
DefineKeybindingWidget = DefineKeybindingWidget_1 = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], DefineKeybindingWidget);
export { DefineKeybindingWidget };
let DefineKeybindingOverlayWidget = class DefineKeybindingOverlayWidget extends Disposable {
    static { DefineKeybindingOverlayWidget_1 = this; }
    static { this.ID = 'editor.contrib.defineKeybindingWidget'; }
    constructor(_editor, instantiationService) {
        super();
        this._editor = _editor;
        this._widget = this._register(instantiationService.createInstance(DefineKeybindingWidget, null));
        this._editor.addOverlayWidget(this);
    }
    getId() {
        return DefineKeybindingOverlayWidget_1.ID;
    }
    getDomNode() {
        return this._widget.domNode;
    }
    getPosition() {
        return {
            preference: null
        };
    }
    dispose() {
        this._editor.removeOverlayWidget(this);
        super.dispose();
    }
    start() {
        if (this._editor.hasModel()) {
            this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition(), 0);
        }
        const layoutInfo = this._editor.getLayoutInfo();
        this._widget.layout(new dom.Dimension(layoutInfo.width, layoutInfo.height));
        return this._widget.define();
    }
};
DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget_1 = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], DefineKeybindingOverlayWidget);
export { DefineKeybindingOverlayWidget };
