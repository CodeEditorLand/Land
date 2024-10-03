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
import { Dimension, getActiveWindow, trackFocus } from '../../../../../base/browser/dom.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { MicrotaskDelay } from '../../../../../base/common/symbols.js';
import './media/terminalChatWidget.css';
import { localize } from '../../../../../nls.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ChatAgentLocation } from '../../../chat/common/chatAgents.js';
import { InlineChatWidget } from '../../../inlineChat/browser/inlineChatWidget.js';
import { MENU_TERMINAL_CHAT_INPUT, MENU_TERMINAL_CHAT_WIDGET, MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from './terminalChat.js';
import { TerminalStickyScrollContribution } from '../../stickyScroll/browser/terminalStickyScrollContribution.js';
import { MENU_INLINE_CHAT_WIDGET_SECONDARY } from '../../../inlineChat/common/inlineChat.js';
let TerminalChatWidget = class TerminalChatWidget extends Disposable {
    get inlineChatWidget() { return this._inlineChatWidget; }
    constructor(_terminalElement, _instance, _xterm, _instantiationService, _contextKeyService) {
        super();
        this._terminalElement = _terminalElement;
        this._instance = _instance;
        this._xterm = _xterm;
        this._instantiationService = _instantiationService;
        this._contextKeyService = _contextKeyService;
        this._onDidHide = this._register(new Emitter());
        this.onDidHide = this._onDidHide.event;
        this._focusedContextKey = TerminalChatContextKeys.focused.bindTo(this._contextKeyService);
        this._visibleContextKey = TerminalChatContextKeys.visible.bindTo(this._contextKeyService);
        this._container = document.createElement('div');
        this._container.classList.add('terminal-inline-chat');
        _terminalElement.appendChild(this._container);
        this._inlineChatWidget = this._instantiationService.createInstance(InlineChatWidget, {
            location: ChatAgentLocation.Terminal,
            resolveData: () => {
                return undefined;
            }
        }, {
            statusMenuId: {
                menu: MENU_TERMINAL_CHAT_WIDGET_STATUS,
                options: {
                    buttonConfigProvider: action => {
                        if (action.id === "workbench.action.terminal.chat.viewInChat" || action.id === "workbench.action.terminal.chat.runCommand" || action.id === "workbench.action.terminal.chat.runFirstCommand") {
                            return { isSecondary: false };
                        }
                        else {
                            return { isSecondary: true };
                        }
                    }
                }
            },
            secondaryMenuId: MENU_INLINE_CHAT_WIDGET_SECONDARY,
            chatWidgetViewOptions: {
                rendererOptions: { editableCodeBlock: true },
                menus: {
                    telemetrySource: 'terminal-inline-chat',
                    executeToolbar: MENU_TERMINAL_CHAT_INPUT,
                    inputSideToolbar: MENU_TERMINAL_CHAT_WIDGET,
                }
            }
        });
        this._register(Event.any(this._inlineChatWidget.onDidChangeHeight, this._instance.onDimensionsChanged, this._inlineChatWidget.chatWidget.onDidChangeContentHeight, Event.debounce(this._xterm.raw.onCursorMove, () => void 0, MicrotaskDelay))(() => this._relayout()));
        const observer = new ResizeObserver(() => this._relayout());
        observer.observe(this._terminalElement);
        this._register(toDisposable(() => observer.disconnect()));
        this._reset();
        this._container.appendChild(this._inlineChatWidget.domNode);
        this._focusTracker = this._register(trackFocus(this._container));
        this._register(this._focusTracker.onDidFocus(() => this._focusedContextKey.set(true)));
        this._register(this._focusTracker.onDidBlur(() => this._focusedContextKey.set(false)));
        this.hide();
    }
    _relayout() {
        if (this._dimension) {
            this._doLayout(this._inlineChatWidget.contentHeight);
        }
    }
    _doLayout(heightInPixel) {
        const xtermElement = this._xterm.raw.element;
        if (!xtermElement) {
            return;
        }
        const style = getActiveWindow().getComputedStyle(xtermElement);
        const xtermPadding = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
        const width = Math.min(640, xtermElement.clientWidth - 12 - 2 - 10 - xtermPadding);
        const terminalWrapperHeight = this._getTerminalWrapperHeight() ?? Number.MAX_SAFE_INTEGER;
        let height = Math.min(480, heightInPixel, terminalWrapperHeight);
        const top = this._getTop() ?? 0;
        if (width === 0 || height === 0) {
            return;
        }
        let adjustedHeight = undefined;
        if (height < this._inlineChatWidget.contentHeight) {
            if (height - top > 0) {
                height = height - top - 30;
            }
            else {
                height = height - 30;
                adjustedHeight = height;
            }
        }
        this._container.style.paddingLeft = style.paddingLeft;
        this._dimension = new Dimension(width, height);
        this._inlineChatWidget.layout(this._dimension);
        this._updateVerticalPosition(adjustedHeight);
    }
    _reset() {
        this._inlineChatWidget.placeholder = localize('default.placeholder', "Ask how to do something in the terminal");
        this._inlineChatWidget.updateInfo(localize('welcome.1', "AI-generated commands may be incorrect"));
    }
    reveal() {
        this._doLayout(this._inlineChatWidget.contentHeight);
        this._container.classList.remove('hide');
        this._visibleContextKey.set(true);
        this._inlineChatWidget.focus();
        this._instance.scrollToBottom();
    }
    _getTop() {
        const font = this._instance.xterm?.getFont();
        if (!font?.charHeight) {
            return;
        }
        const terminalWrapperHeight = this._getTerminalWrapperHeight() ?? 0;
        const cellHeight = font.charHeight * font.lineHeight;
        const topPadding = terminalWrapperHeight - (this._instance.rows * cellHeight);
        const cursorY = (this._instance.xterm?.raw.buffer.active.cursorY ?? 0) + 1;
        return topPadding + cursorY * cellHeight;
    }
    _updateVerticalPosition(adjustedHeight) {
        const top = this._getTop();
        if (!top) {
            return;
        }
        this._container.style.top = `${top}px`;
        const widgetHeight = this._inlineChatWidget.contentHeight;
        const terminalWrapperHeight = this._getTerminalWrapperHeight();
        if (!terminalWrapperHeight) {
            return;
        }
        if (top > terminalWrapperHeight - widgetHeight && terminalWrapperHeight - widgetHeight > 0) {
            this._setTerminalOffset(top - (terminalWrapperHeight - widgetHeight));
        }
        else if (adjustedHeight) {
            this._setTerminalOffset(adjustedHeight);
        }
        else {
            this._setTerminalOffset(undefined);
        }
    }
    _getTerminalWrapperHeight() {
        return this._terminalElement.clientHeight;
    }
    hide() {
        this._container.classList.add('hide');
        this._inlineChatWidget.reset();
        this._reset();
        this._inlineChatWidget.updateToolbar(false);
        this._visibleContextKey.set(false);
        this._inlineChatWidget.value = '';
        this._instance.focus();
        this._setTerminalOffset(undefined);
        this._onDidHide.fire();
    }
    _setTerminalOffset(offset) {
        if (offset === undefined || this._container.classList.contains('hide')) {
            this._terminalElement.style.position = '';
            this._terminalElement.style.bottom = '';
            TerminalStickyScrollContribution.get(this._instance)?.hideUnlock();
        }
        else {
            this._terminalElement.style.position = 'relative';
            this._terminalElement.style.bottom = `${offset}px`;
            TerminalStickyScrollContribution.get(this._instance)?.hideLock();
        }
    }
    focus() {
        this._inlineChatWidget.focus();
    }
    hasFocus() {
        return this._inlineChatWidget.hasFocus();
    }
    input() {
        return this._inlineChatWidget.value;
    }
    setValue(value) {
        this._inlineChatWidget.value = value ?? '';
    }
    acceptCommand(code, shouldExecute) {
        this._instance.runCommand(code, shouldExecute);
        this.hide();
    }
    get focusTracker() {
        return this._focusTracker;
    }
};
TerminalChatWidget = __decorate([
    __param(3, IInstantiationService),
    __param(4, IContextKeyService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object])
], TerminalChatWidget);
export { TerminalChatWidget };
