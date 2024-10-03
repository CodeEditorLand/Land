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
var TerminalClipboardContribution_1;
import { Disposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalConfigurationService } from '../../../terminal/browser/terminal.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { shouldPasteTerminalText } from './terminalClipboard.js';
import { Emitter } from '../../../../../base/common/event.js';
import { BrowserFeatures } from '../../../../../base/browser/canIUse.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { isLinux, isMacintosh } from '../../../../../base/common/platform.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { registerActiveInstanceAction, registerActiveXtermAction } from '../../../terminal/browser/terminalActions.js';
import { localize2 } from '../../../../../nls.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { terminalStrings } from '../../../terminal/common/terminalStrings.js';
import { isString } from '../../../../../base/common/types.js';
let TerminalClipboardContribution = class TerminalClipboardContribution extends Disposable {
    static { TerminalClipboardContribution_1 = this; }
    static { this.ID = 'terminal.clipboard'; }
    static get(instance) {
        return instance.getContribution(TerminalClipboardContribution_1.ID);
    }
    constructor(_ctx, _clipboardService, _configurationService, _instantiationService, _notificationService, _terminalConfigurationService) {
        super();
        this._ctx = _ctx;
        this._clipboardService = _clipboardService;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._notificationService = _notificationService;
        this._terminalConfigurationService = _terminalConfigurationService;
        this._overrideCopySelection = undefined;
        this._onWillPaste = this._register(new Emitter());
        this.onWillPaste = this._onWillPaste.event;
        this._onDidPaste = this._register(new Emitter());
        this.onDidPaste = this._onDidPaste.event;
    }
    xtermReady(xterm) {
        this._xterm = xterm;
        this._register(xterm.onDidRequestCopyAsHtml(e => this.copySelection(true, e.command)));
        this._register(xterm.raw.onSelectionChange(async () => {
            if (this._configurationService.getValue("terminal.integrated.copyOnSelection")) {
                if (this._overrideCopySelection === false) {
                    return;
                }
                if (this._ctx.instance.hasSelection()) {
                    await this.copySelection();
                }
            }
        }));
    }
    async copySelection(asHtml, command) {
        this._xterm?.copySelection(asHtml, command);
    }
    async paste() {
        await this._paste(await this._clipboardService.readText());
    }
    async pasteSelection() {
        await this._paste(await this._clipboardService.readText('selection'));
    }
    async _paste(value) {
        if (!this._xterm) {
            return;
        }
        let currentText = value;
        const shouldPasteText = await this._instantiationService.invokeFunction(shouldPasteTerminalText, currentText, this._xterm?.raw.modes.bracketedPasteMode);
        if (!shouldPasteText) {
            return;
        }
        if (typeof shouldPasteText === 'object') {
            currentText = shouldPasteText.modifiedText;
        }
        this._ctx.instance.focus();
        this._onWillPaste.fire(currentText);
        this._xterm.raw.paste(currentText);
        this._onDidPaste.fire(currentText);
    }
    async handleMouseEvent(event) {
        switch (event.button) {
            case 1: {
                if (this._terminalConfigurationService.config.middleClickBehavior === 'paste') {
                    this.paste();
                    return { handled: true };
                }
                break;
            }
            case 2: {
                if (event.shiftKey) {
                    return;
                }
                const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
                if (rightClickBehavior !== 'copyPaste' && rightClickBehavior !== 'paste') {
                    return;
                }
                if (rightClickBehavior === 'copyPaste' && this._ctx.instance.hasSelection()) {
                    await this.copySelection();
                    this._ctx.instance.clearSelection();
                }
                else {
                    if (BrowserFeatures.clipboard.readText) {
                        this.paste();
                    }
                    else {
                        this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                    }
                }
                if (isMacintosh) {
                    setTimeout(() => this._ctx.instance.clearSelection(), 0);
                }
                return { handled: true };
            }
        }
    }
    overrideCopyOnSelection(value) {
        if (this._overrideCopySelection !== undefined) {
            throw new Error('Cannot set a copy on selection override multiple times');
        }
        this._overrideCopySelection = value;
        return toDisposable(() => this._overrideCopySelection = undefined);
    }
};
TerminalClipboardContribution = TerminalClipboardContribution_1 = __decorate([
    __param(1, IClipboardService),
    __param(2, IConfigurationService),
    __param(3, IInstantiationService),
    __param(4, INotificationService),
    __param(5, ITerminalConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TerminalClipboardContribution);
export { TerminalClipboardContribution };
registerTerminalContribution(TerminalClipboardContribution.ID, TerminalClipboardContribution, false);
const terminalAvailableWhenClause = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);
registerActiveInstanceAction({
    id: "workbench.action.terminal.copyLastCommand",
    title: localize2('workbench.action.terminal.copyLastCommand', "Copy Last Command"),
    precondition: terminalAvailableWhenClause,
    run: async (instance, c, accessor) => {
        const clipboardService = accessor.get(IClipboardService);
        const commands = instance.capabilities.get(2)?.commands;
        if (!commands || commands.length === 0) {
            return;
        }
        const command = commands[commands.length - 1];
        if (!command.command) {
            return;
        }
        await clipboardService.writeText(command.command);
    }
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.copyLastCommandOutput",
    title: localize2('workbench.action.terminal.copyLastCommandOutput', "Copy Last Command Output"),
    precondition: terminalAvailableWhenClause,
    run: async (instance, c, accessor) => {
        const clipboardService = accessor.get(IClipboardService);
        const commands = instance.capabilities.get(2)?.commands;
        if (!commands || commands.length === 0) {
            return;
        }
        const command = commands[commands.length - 1];
        if (!command?.hasOutput()) {
            return;
        }
        const output = command.getOutput();
        if (isString(output)) {
            await clipboardService.writeText(output);
        }
    }
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.copyLastCommandAndLastCommandOutput",
    title: localize2('workbench.action.terminal.copyLastCommandAndOutput', "Copy Last Command and Output"),
    precondition: terminalAvailableWhenClause,
    run: async (instance, c, accessor) => {
        const clipboardService = accessor.get(IClipboardService);
        const commands = instance.capabilities.get(2)?.commands;
        if (!commands || commands.length === 0) {
            return;
        }
        const command = commands[commands.length - 1];
        if (!command?.hasOutput()) {
            return;
        }
        const output = command.getOutput();
        if (isString(output)) {
            await clipboardService.writeText(`${command.command !== '' ? command.command + '\n' : ''}${output}`);
        }
    }
});
if (BrowserFeatures.clipboard.writeText) {
    registerActiveXtermAction({
        id: "workbench.action.terminal.copySelection",
        title: localize2('workbench.action.terminal.copySelection', 'Copy Selection'),
        precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(terminalAvailableWhenClause, TerminalContextKeys.textSelected)),
        keybinding: [{
                primary: 2048 | 1024 | 33,
                mac: { primary: 2048 | 33 },
                weight: 200,
                when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.textSelected, TerminalContextKeys.focus), TerminalContextKeys.textSelectedInFocused)
            }],
        run: (activeInstance) => activeInstance.copySelection()
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.copyAndClearSelection",
        title: localize2('workbench.action.terminal.copyAndClearSelection', 'Copy and Clear Selection'),
        precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(terminalAvailableWhenClause, TerminalContextKeys.textSelected)),
        keybinding: [{
                win: { primary: 2048 | 33 },
                weight: 200,
                when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.textSelected, TerminalContextKeys.focus), TerminalContextKeys.textSelectedInFocused)
            }],
        run: async (xterm) => {
            await xterm.copySelection();
            xterm.clearSelection();
        }
    });
    registerActiveXtermAction({
        id: "workbench.action.terminal.copySelectionAsHtml",
        title: localize2('workbench.action.terminal.copySelectionAsHtml', 'Copy Selection as HTML'),
        f1: true,
        category: terminalStrings.actionCategory,
        precondition: ContextKeyExpr.or(TerminalContextKeys.textSelectedInFocused, ContextKeyExpr.and(terminalAvailableWhenClause, TerminalContextKeys.textSelected)),
        run: (xterm) => xterm.copySelection(true)
    });
}
if (BrowserFeatures.clipboard.readText) {
    registerActiveInstanceAction({
        id: "workbench.action.terminal.paste",
        title: localize2('workbench.action.terminal.paste', 'Paste into Active Terminal'),
        precondition: terminalAvailableWhenClause,
        keybinding: [{
                primary: 2048 | 52,
                win: { primary: 2048 | 52, secondary: [2048 | 1024 | 52] },
                linux: { primary: 2048 | 1024 | 52 },
                weight: 200,
                when: TerminalContextKeys.focus
            }],
        run: (activeInstance) => TerminalClipboardContribution.get(activeInstance)?.paste()
    });
}
if (BrowserFeatures.clipboard.readText && isLinux) {
    registerActiveInstanceAction({
        id: "workbench.action.terminal.pasteSelection",
        title: localize2('workbench.action.terminal.pasteSelection', 'Paste Selection into Active Terminal'),
        precondition: terminalAvailableWhenClause,
        keybinding: [{
                linux: { primary: 1024 | 19 },
                weight: 200,
                when: TerminalContextKeys.focus
            }],
        run: (activeInstance) => TerminalClipboardContribution.get(activeInstance)?.pasteSelection()
    });
}
