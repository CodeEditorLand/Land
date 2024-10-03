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
var TerminalFindContribution_1;
import { Lazy } from '../../../../../base/common/lazy.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { localize2 } from '../../../../../nls.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { findInFilesCommand } from '../../../search/browser/searchActionsFind.js';
import { ITerminalService, isDetachedTerminalInstance } from '../../../terminal/browser/terminal.js';
import { registerActiveInstanceAction, registerActiveXtermAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { TerminalFindWidget } from './terminalFindWidget.js';
import './media/terminalFind.css';
let TerminalFindContribution = class TerminalFindContribution extends Disposable {
    static { TerminalFindContribution_1 = this; }
    static { this.ID = 'terminal.find'; }
    static get(instance) {
        return instance.getContribution(TerminalFindContribution_1.ID);
    }
    get findWidget() { return this._findWidget.value; }
    constructor(_instance, processManager, widgetManager, instantiationService, terminalService) {
        super();
        this._instance = _instance;
        this._findWidget = new Lazy(() => {
            const findWidget = instantiationService.createInstance(TerminalFindWidget, this._instance);
            findWidget.focusTracker.onDidFocus(() => {
                TerminalFindContribution_1.activeFindWidget = this;
                this._instance.forceScrollbarVisibility();
                if (!isDetachedTerminalInstance(this._instance)) {
                    terminalService.setActiveInstance(this._instance);
                }
            });
            findWidget.focusTracker.onDidBlur(() => {
                TerminalFindContribution_1.activeFindWidget = undefined;
                this._instance.resetScrollbarVisibility();
            });
            if (!this._instance.domElement) {
                throw new Error('FindWidget expected terminal DOM to be initialized');
            }
            this._instance.domElement?.appendChild(findWidget.getDomNode());
            if (this._lastLayoutDimensions) {
                findWidget.layout(this._lastLayoutDimensions.width);
            }
            return findWidget;
        });
    }
    layout(_xterm, dimension) {
        this._lastLayoutDimensions = dimension;
        this._findWidget.rawValue?.layout(dimension.width);
    }
    xtermReady(xterm) {
        this._register(xterm.onDidChangeFindResults(() => this._findWidget.rawValue?.updateResultCount()));
    }
    dispose() {
        if (TerminalFindContribution_1.activeFindWidget === this) {
            TerminalFindContribution_1.activeFindWidget = undefined;
        }
        super.dispose();
        this._findWidget.rawValue?.dispose();
    }
};
TerminalFindContribution = TerminalFindContribution_1 = __decorate([
    __param(3, IInstantiationService),
    __param(4, ITerminalService),
    __metadata("design:paramtypes", [Object, Object, TerminalWidgetManager, Object, Object])
], TerminalFindContribution);
registerTerminalContribution(TerminalFindContribution.ID, TerminalFindContribution, true);
registerActiveXtermAction({
    id: "workbench.action.terminal.focusFind",
    title: localize2('workbench.action.terminal.focusFind', 'Focus Find'),
    keybinding: {
        primary: 2048 | 36,
        when: ContextKeyExpr.or(TerminalContextKeys.findFocus, TerminalContextKeys.focusInAny),
        weight: 200
    },
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    run: (_xterm, _accessor, activeInstance) => {
        const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
        contr?.findWidget.reveal();
    }
});
registerActiveXtermAction({
    id: "workbench.action.terminal.hideFind",
    title: localize2('workbench.action.terminal.hideFind', 'Hide Find'),
    keybinding: {
        primary: 9,
        secondary: [1024 | 9],
        when: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.findVisible),
        weight: 200
    },
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    run: (_xterm, _accessor, activeInstance) => {
        const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
        contr?.findWidget.hide();
    }
});
registerActiveXtermAction({
    id: "workbench.action.terminal.toggleFindRegex",
    title: localize2('workbench.action.terminal.toggleFindRegex', 'Toggle Find Using Regex'),
    keybinding: {
        primary: 512 | 48,
        mac: { primary: 2048 | 512 | 48 },
        when: TerminalContextKeys.findVisible,
        weight: 200
    },
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    run: (_xterm, _accessor, activeInstance) => {
        const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
        const state = contr?.findWidget.state;
        state?.change({ isRegex: !state.isRegex }, false);
    }
});
registerActiveXtermAction({
    id: "workbench.action.terminal.toggleFindWholeWord",
    title: localize2('workbench.action.terminal.toggleFindWholeWord', 'Toggle Find Using Whole Word'),
    keybinding: {
        primary: 512 | 53,
        mac: { primary: 2048 | 512 | 53 },
        when: TerminalContextKeys.findVisible,
        weight: 200
    },
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    run: (_xterm, _accessor, activeInstance) => {
        const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
        const state = contr?.findWidget.state;
        state?.change({ wholeWord: !state.wholeWord }, false);
    }
});
registerActiveXtermAction({
    id: "workbench.action.terminal.toggleFindCaseSensitive",
    title: localize2('workbench.action.terminal.toggleFindCaseSensitive', 'Toggle Find Using Case Sensitive'),
    keybinding: {
        primary: 512 | 33,
        mac: { primary: 2048 | 512 | 33 },
        when: TerminalContextKeys.findVisible,
        weight: 200
    },
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    run: (_xterm, _accessor, activeInstance) => {
        const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
        const state = contr?.findWidget.state;
        state?.change({ matchCase: !state.matchCase }, false);
    }
});
registerActiveXtermAction({
    id: "workbench.action.terminal.findNext",
    title: localize2('workbench.action.terminal.findNext', 'Find Next'),
    keybinding: [
        {
            primary: 61,
            mac: { primary: 2048 | 37, secondary: [61] },
            when: ContextKeyExpr.or(TerminalContextKeys.focusInAny, TerminalContextKeys.findFocus),
            weight: 200
        },
        {
            primary: 1024 | 3,
            when: TerminalContextKeys.findInputFocus,
            weight: 200
        }
    ],
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    run: (_xterm, _accessor, activeInstance) => {
        const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
        const widget = contr?.findWidget;
        if (widget) {
            widget.show();
            widget.find(false);
        }
    }
});
registerActiveXtermAction({
    id: "workbench.action.terminal.findPrevious",
    title: localize2('workbench.action.terminal.findPrevious', 'Find Previous'),
    keybinding: [
        {
            primary: 1024 | 61,
            mac: { primary: 2048 | 1024 | 37, secondary: [1024 | 61] },
            when: ContextKeyExpr.or(TerminalContextKeys.focusInAny, TerminalContextKeys.findFocus),
            weight: 200
        },
        {
            primary: 3,
            when: TerminalContextKeys.findInputFocus,
            weight: 200
        }
    ],
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
    run: (_xterm, _accessor, activeInstance) => {
        const contr = TerminalFindContribution.activeFindWidget || TerminalFindContribution.get(activeInstance);
        const widget = contr?.findWidget;
        if (widget) {
            widget.show();
            widget.find(true);
        }
    }
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.searchWorkspace",
    title: localize2('workbench.action.terminal.searchWorkspace', 'Search Workspace'),
    keybinding: [
        {
            primary: 2048 | 1024 | 36,
            when: ContextKeyExpr.and(TerminalContextKeys.processSupported, TerminalContextKeys.focus, TerminalContextKeys.textSelected),
            weight: 200 + 50
        }
    ],
    run: (activeInstance, c, accessor) => findInFilesCommand(accessor, { query: activeInstance.selection })
});
