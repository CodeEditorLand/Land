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
import * as dom from '../../../../../base/browser/dom.js';
import { SimpleFindWidget } from '../../../codeEditor/browser/find/simpleFindWidget.js';
import { IContextMenuService, IContextViewService } from '../../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { Event } from '../../../../../base/common/event.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { openContextMenu } from './textInputContextMenu.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
const TERMINAL_FIND_WIDGET_INITIAL_WIDTH = 419;
let TerminalFindWidget = class TerminalFindWidget extends SimpleFindWidget {
    constructor(_instance, _contextViewService, keybindingService, _contextKeyService, _contextMenuService, _clipboardService, hoverService, _themeService, _configurationService) {
        super({
            showCommonFindToggles: true,
            checkImeCompletionState: true,
            showResultCount: true,
            initialWidth: TERMINAL_FIND_WIDGET_INITIAL_WIDTH,
            enableSash: true,
            appendCaseSensitiveActionId: "workbench.action.terminal.toggleFindCaseSensitive",
            appendRegexActionId: "workbench.action.terminal.toggleFindRegex",
            appendWholeWordsActionId: "workbench.action.terminal.toggleFindWholeWord",
            previousMatchActionId: "workbench.action.terminal.findPrevious",
            nextMatchActionId: "workbench.action.terminal.findNext",
            closeWidgetActionId: "workbench.action.terminal.hideFind",
            type: 'Terminal',
            matchesLimit: 1000
        }, _contextViewService, _contextKeyService, hoverService, keybindingService);
        this._instance = _instance;
        this._contextKeyService = _contextKeyService;
        this._themeService = _themeService;
        this._configurationService = _configurationService;
        this._register(this.state.onFindReplaceStateChange(() => {
            this.show();
        }));
        this._findInputFocused = TerminalContextKeys.findInputFocus.bindTo(this._contextKeyService);
        this._findWidgetFocused = TerminalContextKeys.findFocus.bindTo(this._contextKeyService);
        this._findWidgetVisible = TerminalContextKeys.findVisible.bindTo(this._contextKeyService);
        const innerDom = this.getDomNode().firstChild;
        if (innerDom) {
            this._register(dom.addDisposableListener(innerDom, 'mousedown', (event) => {
                event.stopPropagation();
            }));
            this._register(dom.addDisposableListener(innerDom, 'contextmenu', (event) => {
                event.stopPropagation();
            }));
        }
        const findInputDomNode = this.getFindInputDomNode();
        this._register(dom.addDisposableListener(findInputDomNode, 'contextmenu', (event) => {
            openContextMenu(dom.getWindow(findInputDomNode), event, _clipboardService, _contextMenuService);
            event.stopPropagation();
        }));
        this._register(this._themeService.onDidColorThemeChange(() => {
            if (this.isVisible()) {
                this.find(true, true);
            }
        }));
        this._register(this._configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('workbench.colorCustomizations') && this.isVisible()) {
                this.find(true, true);
            }
        }));
        this.updateResultCount();
    }
    find(previous, update) {
        const xterm = this._instance.xterm;
        if (!xterm) {
            return;
        }
        if (previous) {
            this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: update });
        }
        else {
            this._findNextWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
        }
    }
    reveal() {
        const initialInput = this._instance.hasSelection() && !this._instance.selection.includes('\n') ? this._instance.selection : undefined;
        const inputValue = initialInput ?? this.inputValue;
        const xterm = this._instance.xterm;
        if (xterm && inputValue && inputValue !== '') {
            this._findPreviousWithEvent(xterm, inputValue, { incremental: true, regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() }).then(foundMatch => {
                this.updateButtons(foundMatch);
                this._register(Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
            });
        }
        this.updateButtons(false);
        super.reveal(inputValue);
        this._findWidgetVisible.set(true);
    }
    show() {
        const initialInput = this._instance.hasSelection() && !this._instance.selection.includes('\n') ? this._instance.selection : undefined;
        super.show(initialInput);
        this._findWidgetVisible.set(true);
    }
    hide() {
        super.hide();
        this._findWidgetVisible.reset();
        this._instance.focus(true);
        this._instance.xterm?.clearSearchDecorations();
    }
    async _getResultCount() {
        return this._instance.xterm?.findResult;
    }
    _onInputChanged() {
        const xterm = this._instance.xterm;
        if (xterm) {
            this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: true }).then(foundMatch => {
                this.updateButtons(foundMatch);
            });
        }
        return false;
    }
    _onFocusTrackerFocus() {
        if ('overrideCopyOnSelection' in this._instance) {
            this._overrideCopyOnSelectionDisposable = this._instance.overrideCopyOnSelection(false);
        }
        this._findWidgetFocused.set(true);
    }
    _onFocusTrackerBlur() {
        this._overrideCopyOnSelectionDisposable?.dispose();
        this._instance.xterm?.clearActiveSearchDecoration();
        this._findWidgetFocused.reset();
    }
    _onFindInputFocusTrackerFocus() {
        this._findInputFocused.set(true);
    }
    _onFindInputFocusTrackerBlur() {
        this._findInputFocused.reset();
    }
    findFirst() {
        const instance = this._instance;
        if (instance.hasSelection()) {
            instance.clearSelection();
        }
        const xterm = instance.xterm;
        if (xterm) {
            this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
        }
    }
    async _findNextWithEvent(xterm, term, options) {
        return xterm.findNext(term, options).then(foundMatch => {
            this._register(Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
            return foundMatch;
        });
    }
    async _findPreviousWithEvent(xterm, term, options) {
        return xterm.findPrevious(term, options).then(foundMatch => {
            this._register(Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
            return foundMatch;
        });
    }
};
TerminalFindWidget = __decorate([
    __param(1, IContextViewService),
    __param(2, IKeybindingService),
    __param(3, IContextKeyService),
    __param(4, IContextMenuService),
    __param(5, IClipboardService),
    __param(6, IHoverService),
    __param(7, IThemeService),
    __param(8, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalFindWidget);
export { TerminalFindWidget };
