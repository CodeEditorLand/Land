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
import { importAMDNodeModule } from '../../../../../amdX.js';
import { $, addDisposableListener, addStandardDisposableListener, getWindow } from '../../../../../base/browser/dom.js';
import { memoize, throttle } from '../../../../../base/common/decorators.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, MutableDisposable, combinedDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { removeAnsiEscapeCodes } from '../../../../../base/common/strings.js';
import './media/stickyScroll.css';
import { localize } from '../../../../../nls.js';
import { IMenuService, MenuId } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { ITerminalConfigurationService } from '../../../terminal/browser/terminal.js';
import { openContextMenu } from '../../../terminal/browser/terminalContextMenu.js';
import { TERMINAL_CONFIG_SECTION } from '../../../terminal/common/terminal.js';
import { terminalStrings } from '../../../terminal/common/terminalStrings.js';
import { terminalStickyScrollBackground, terminalStickyScrollHoverBackground } from './terminalStickyScrollColorRegistry.js';
let TerminalStickyScrollOverlay = class TerminalStickyScrollOverlay extends Disposable {
    constructor(_instance, _xterm, _xtermColorProvider, _commandDetection, xtermCtor, configurationService, contextKeyService, _contextMenuService, _keybindingService, menuService, _terminalConfigurationService, _themeService) {
        super();
        this._instance = _instance;
        this._xterm = _xterm;
        this._xtermColorProvider = _xtermColorProvider;
        this._commandDetection = _commandDetection;
        this._contextMenuService = _contextMenuService;
        this._keybindingService = _keybindingService;
        this._terminalConfigurationService = _terminalConfigurationService;
        this._themeService = _themeService;
        this._refreshListeners = this._register(new MutableDisposable());
        this._state = 0;
        this._isRefreshQueued = false;
        this._rawMaxLineCount = 5;
        this._contextMenu = this._register(menuService.createMenu(MenuId.TerminalStickyScrollContext, contextKeyService));
        this._register(Event.runAndSubscribe(this._xterm.raw.buffer.onBufferChange, buffer => {
            this._setState((buffer ?? this._xterm.raw.buffer.active).type === 'normal' ? 1 : 0);
        }));
        this._register(Event.runAndSubscribe(configurationService.onDidChangeConfiguration, e => {
            if (!e || e.affectsConfiguration("terminal.integrated.stickyScroll.maxLineCount")) {
                this._rawMaxLineCount = configurationService.getValue("terminal.integrated.stickyScroll.maxLineCount");
            }
        }));
        this._register(this._instance.onDidChangeTarget(() => this._syncOptions()));
        xtermCtor.then(ctor => {
            if (this._store.isDisposed) {
                return;
            }
            this._stickyScrollOverlay = this._register(new ctor({
                rows: 1,
                cols: this._xterm.raw.cols,
                allowProposedApi: true,
                ...this._getOptions()
            }));
            this._refreshGpuAcceleration();
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(TERMINAL_CONFIG_SECTION)) {
                    this._syncOptions();
                }
            }));
            this._register(this._themeService.onDidColorThemeChange(() => {
                this._syncOptions();
            }));
            this._register(this._xterm.raw.onResize(() => {
                this._syncOptions();
                this._refresh();
            }));
            this._register(this._instance.onDidChangeVisibility(isVisible => {
                if (isVisible) {
                    this._refresh();
                }
            }));
            this._getSerializeAddonConstructor().then(SerializeAddon => {
                if (this._store.isDisposed) {
                    return;
                }
                this._serializeAddon = this._register(new SerializeAddon());
                this._xterm.raw.loadAddon(this._serializeAddon);
                this._refresh();
            });
        });
    }
    lockHide() {
        this._element?.classList.add('lock-hide');
    }
    unlockHide() {
        this._element?.classList.remove('lock-hide');
    }
    _setState(state) {
        if (this._state === state) {
            return;
        }
        switch (state) {
            case 0: {
                this._setVisible(false);
                this._uninstallRefreshListeners();
                break;
            }
            case 1: {
                this._refresh();
                this._installRefreshListeners();
                break;
            }
        }
    }
    _installRefreshListeners() {
        if (!this._refreshListeners.value) {
            this._refreshListeners.value = combinedDisposable(Event.any(this._xterm.raw.onScroll, this._xterm.raw.onLineFeed, this._xterm.raw.onCursorMove)(() => this._refresh()), addStandardDisposableListener(this._xterm.raw.element.querySelector('.xterm-viewport'), 'scroll', () => this._refresh()));
        }
    }
    _uninstallRefreshListeners() {
        this._refreshListeners.clear();
    }
    _setVisible(isVisible) {
        if (isVisible) {
            this._ensureElement();
        }
        this._element?.classList.toggle("visible", isVisible);
    }
    _refresh() {
        if (this._isRefreshQueued) {
            return;
        }
        this._isRefreshQueued = true;
        queueMicrotask(() => {
            this._refreshNow();
            this._isRefreshQueued = false;
        });
    }
    _refreshNow() {
        const command = this._commandDetection.getCommandForLine(this._xterm.raw.buffer.active.viewportY);
        this._currentStickyCommand = undefined;
        if (!command) {
            this._setVisible(false);
            return;
        }
        if (!('marker' in command)) {
            const partialCommand = this._commandDetection.currentCommand;
            if (partialCommand?.commandStartMarker && partialCommand.commandExecutedMarker) {
                this._updateContent(partialCommand, partialCommand.commandStartMarker);
                return;
            }
            this._setVisible(false);
            return;
        }
        const marker = command.marker;
        if (!marker || marker.line === -1) {
            this._setVisible(false);
            return;
        }
        this._updateContent(command, marker);
    }
    _updateContent(command, startMarker) {
        const xterm = this._xterm.raw;
        if (!xterm.element?.parentElement || !this._stickyScrollOverlay || !this._serializeAddon) {
            return;
        }
        if (command.promptStartMarker?.line === -1) {
            this._setVisible(false);
            return;
        }
        const buffer = xterm.buffer.active;
        const promptRowCount = command.getPromptRowCount();
        const commandRowCount = command.getCommandRowCount();
        const stickyScrollLineStart = startMarker.line - (promptRowCount - 1);
        const isPartialCommand = !('getOutput' in command);
        const rowOffset = !isPartialCommand && command.endMarker ? Math.max(buffer.viewportY - command.endMarker.line + 1, 0) : 0;
        const maxLineCount = Math.min(this._rawMaxLineCount, Math.floor(xterm.rows * 0.4));
        const stickyScrollLineCount = Math.min(promptRowCount + commandRowCount - 1, maxLineCount) - rowOffset;
        if (buffer.viewportY <= stickyScrollLineStart) {
            this._setVisible(false);
            return;
        }
        if (isPartialCommand && buffer.viewportY === buffer.baseY && buffer.cursorY === xterm.rows - 1) {
            const line = buffer.getLine(buffer.baseY + xterm.rows - 1);
            if ((buffer.cursorX === 1 && lineStartsWith(line, ':')) ||
                (buffer.cursorX === 5 && lineStartsWith(line, '(END)'))) {
                this._setVisible(false);
                return;
            }
        }
        const content = this._serializeAddon.serialize({
            range: {
                start: stickyScrollLineStart + rowOffset,
                end: stickyScrollLineStart + rowOffset + Math.max(stickyScrollLineCount - 1, 0)
            }
        });
        if (isPartialCommand && removeAnsiEscapeCodes(content).length === 0) {
            this._setVisible(false);
            return;
        }
        if (content && this._currentContent !== content ||
            this._stickyScrollOverlay.cols !== xterm.cols ||
            this._stickyScrollOverlay.rows !== stickyScrollLineCount) {
            this._stickyScrollOverlay.resize(this._stickyScrollOverlay.cols, stickyScrollLineCount);
            this._stickyScrollOverlay.write('\x1b[0m\x1b[H\x1b[2J');
            this._stickyScrollOverlay.write(content);
            this._currentContent = content;
        }
        if (content) {
            this._currentStickyCommand = command;
            this._setVisible(true);
            if (this._element) {
                const termBox = xterm.element.getBoundingClientRect();
                if (termBox.height > 0) {
                    const rowHeight = termBox.height / xterm.rows;
                    const overlayHeight = stickyScrollLineCount * rowHeight;
                    let endMarkerOffset = 0;
                    if (!isPartialCommand && command.endMarker && command.endMarker.line !== -1) {
                        if (buffer.viewportY + stickyScrollLineCount > command.endMarker.line) {
                            const diff = buffer.viewportY + stickyScrollLineCount - command.endMarker.line;
                            endMarkerOffset = diff * rowHeight;
                        }
                    }
                    this._element.style.bottom = `${termBox.height - overlayHeight + 1 + endMarkerOffset}px`;
                }
            }
        }
        else {
            this._setVisible(false);
        }
    }
    _ensureElement() {
        if (this._element ||
            !this._stickyScrollOverlay ||
            !this._xterm?.raw.element?.parentElement) {
            return;
        }
        const overlay = this._stickyScrollOverlay;
        const hoverOverlay = $('.hover-overlay');
        this._element = $('.terminal-sticky-scroll', undefined, hoverOverlay);
        this._xterm.raw.element.parentElement.append(this._element);
        this._register(toDisposable(() => this._element?.remove()));
        let hoverTitle = localize('stickyScrollHoverTitle', 'Navigate to Command');
        const scrollToPreviousCommandKeybinding = this._keybindingService.lookupKeybinding("workbench.action.terminal.scrollToPreviousCommand");
        if (scrollToPreviousCommandKeybinding) {
            const label = scrollToPreviousCommandKeybinding.getLabel();
            if (label) {
                hoverTitle += '\n' + localize('labelWithKeybinding', "{0} ({1})", terminalStrings.scrollToPreviousCommand.value, label);
            }
        }
        const scrollToNextCommandKeybinding = this._keybindingService.lookupKeybinding("workbench.action.terminal.scrollToNextCommand");
        if (scrollToNextCommandKeybinding) {
            const label = scrollToNextCommandKeybinding.getLabel();
            if (label) {
                hoverTitle += '\n' + localize('labelWithKeybinding', "{0} ({1})", terminalStrings.scrollToNextCommand.value, label);
            }
        }
        hoverOverlay.title = hoverTitle;
        const scrollBarWidth = this._xterm.raw._core.viewport?.scrollBarWidth;
        if (scrollBarWidth !== undefined) {
            this._element.style.right = `${scrollBarWidth}px`;
        }
        this._stickyScrollOverlay.open(this._element);
        this._register(addStandardDisposableListener(hoverOverlay, 'click', () => {
            if (this._xterm && this._currentStickyCommand) {
                this._xterm.markTracker.revealCommand(this._currentStickyCommand);
                this._instance.focus();
            }
        }));
        this._register(addStandardDisposableListener(hoverOverlay, 'wheel', e => this._xterm?.raw.element?.dispatchEvent(new WheelEvent(e.type, e))));
        this._register(addDisposableListener(hoverOverlay, 'mousedown', e => {
            e.stopImmediatePropagation();
            e.preventDefault();
        }));
        this._register(addDisposableListener(hoverOverlay, 'contextmenu', e => {
            e.stopImmediatePropagation();
            e.preventDefault();
            openContextMenu(getWindow(hoverOverlay), e, this._instance, this._contextMenu, this._contextMenuService);
        }));
        this._register(addStandardDisposableListener(hoverOverlay, 'mouseover', () => overlay.options.theme = this._getTheme(true)));
        this._register(addStandardDisposableListener(hoverOverlay, 'mouseleave', () => overlay.options.theme = this._getTheme(false)));
    }
    _syncOptions() {
        if (!this._stickyScrollOverlay) {
            return;
        }
        this._stickyScrollOverlay.resize(this._xterm.raw.cols, this._stickyScrollOverlay.rows);
        this._stickyScrollOverlay.options = this._getOptions();
        this._refreshGpuAcceleration();
    }
    _getOptions() {
        const o = this._xterm.raw.options;
        return {
            cursorInactiveStyle: 'none',
            scrollback: 0,
            logLevel: 'off',
            theme: this._getTheme(false),
            documentOverride: o.documentOverride,
            fontFamily: o.fontFamily,
            fontWeight: o.fontWeight,
            fontWeightBold: o.fontWeightBold,
            fontSize: o.fontSize,
            letterSpacing: o.letterSpacing,
            lineHeight: o.lineHeight,
            drawBoldTextInBrightColors: o.drawBoldTextInBrightColors,
            minimumContrastRatio: o.minimumContrastRatio,
            tabStopWidth: o.tabStopWidth,
            customGlyphs: o.customGlyphs,
        };
    }
    async _refreshGpuAcceleration() {
        if (this._shouldLoadWebgl() && !this._webglAddon) {
            const WebglAddon = await this._getWebglAddonConstructor();
            if (this._store.isDisposed) {
                return;
            }
            this._webglAddon = this._register(new WebglAddon());
            this._stickyScrollOverlay?.loadAddon(this._webglAddon);
        }
        else if (!this._shouldLoadWebgl() && this._webglAddon) {
            this._webglAddon.dispose();
            this._webglAddon = undefined;
        }
    }
    _shouldLoadWebgl() {
        return this._terminalConfigurationService.config.gpuAcceleration === 'auto' || this._terminalConfigurationService.config.gpuAcceleration === 'on';
    }
    _getTheme(isHovering) {
        const theme = this._themeService.getColorTheme();
        return {
            ...this._xterm.getXtermTheme(),
            background: isHovering
                ? theme.getColor(terminalStickyScrollHoverBackground)?.toString() ?? this._xtermColorProvider.getBackgroundColor(theme)?.toString()
                : theme.getColor(terminalStickyScrollBackground)?.toString() ?? this._xtermColorProvider.getBackgroundColor(theme)?.toString(),
            selectionBackground: undefined,
            selectionInactiveBackground: undefined
        };
    }
    async _getSerializeAddonConstructor() {
        return (await importAMDNodeModule('@xterm/addon-serialize', 'lib/addon-serialize.js')).SerializeAddon;
    }
    async _getWebglAddonConstructor() {
        return (await importAMDNodeModule('@xterm/addon-webgl', 'lib/addon-webgl.js')).WebglAddon;
    }
};
__decorate([
    throttle(0),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TerminalStickyScrollOverlay.prototype, "_syncOptions", null);
__decorate([
    throttle(0),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TerminalStickyScrollOverlay.prototype, "_refreshGpuAcceleration", null);
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TerminalStickyScrollOverlay.prototype, "_getSerializeAddonConstructor", null);
__decorate([
    memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TerminalStickyScrollOverlay.prototype, "_getWebglAddonConstructor", null);
TerminalStickyScrollOverlay = __decorate([
    __param(5, IConfigurationService),
    __param(6, IContextKeyService),
    __param(7, IContextMenuService),
    __param(8, IKeybindingService),
    __param(9, IMenuService),
    __param(10, ITerminalConfigurationService),
    __param(11, IThemeService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Promise, Object, Object, Object, Object, Object, Object, Object])
], TerminalStickyScrollOverlay);
export { TerminalStickyScrollOverlay };
function lineStartsWith(line, text) {
    if (!line) {
        return false;
    }
    for (let i = 0; i < text.length; i++) {
        if (line.getCell(i)?.getChars() !== text[i]) {
            return false;
        }
    }
    return true;
}
