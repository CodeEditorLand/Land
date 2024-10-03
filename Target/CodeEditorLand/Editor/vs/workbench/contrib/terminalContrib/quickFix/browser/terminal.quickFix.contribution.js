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
var TerminalQuickFixContribution_1;
import './media/terminalQuickFix.css';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { localize2 } from '../../../../../nls.js';
import { registerSingleton } from '../../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { registerActiveInstanceAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { ITerminalQuickFixService } from './quickFix.js';
import { TerminalQuickFixAddon } from './quickFixAddon.js';
import { freePort, gitCreatePr, gitFastForwardPull, gitPushSetUpstream, gitSimilar, gitTwoDashes, pwshGeneralError, pwshUnixCommandNotFoundError } from './terminalQuickFixBuiltinActions.js';
import { TerminalQuickFixService } from './terminalQuickFixService.js';
registerSingleton(ITerminalQuickFixService, TerminalQuickFixService, 1);
let TerminalQuickFixContribution = class TerminalQuickFixContribution extends DisposableStore {
    static { TerminalQuickFixContribution_1 = this; }
    static { this.ID = 'quickFix'; }
    static get(instance) {
        return instance.getContribution(TerminalQuickFixContribution_1.ID);
    }
    get addon() { return this._addon; }
    constructor(_instance, processManager, widgetManager, _instantiationService) {
        super();
        this._instance = _instance;
        this._instantiationService = _instantiationService;
    }
    xtermReady(xterm) {
        this._addon = this._instantiationService.createInstance(TerminalQuickFixAddon, undefined, this._instance.capabilities);
        xterm.raw.loadAddon(this._addon);
        this.add(this._addon.onDidRequestRerunCommand((e) => this._instance.runCommand(e.command, e.shouldExecute || false)));
        for (const actionOption of [
            gitTwoDashes(),
            gitFastForwardPull(),
            freePort((port, command) => this._instance.freePortKillProcess(port, command)),
            gitSimilar(),
            gitPushSetUpstream(),
            gitCreatePr(),
            pwshUnixCommandNotFoundError(),
            pwshGeneralError()
        ]) {
            this._addon.registerCommandFinishedListener(actionOption);
        }
    }
};
TerminalQuickFixContribution = TerminalQuickFixContribution_1 = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, TerminalWidgetManager, Object])
], TerminalQuickFixContribution);
registerTerminalContribution(TerminalQuickFixContribution.ID, TerminalQuickFixContribution);
registerActiveInstanceAction({
    id: "workbench.action.terminal.showQuickFixes",
    title: localize2('workbench.action.terminal.showQuickFixes', 'Show Terminal Quick Fixes'),
    precondition: TerminalContextKeys.focus,
    keybinding: {
        primary: 2048 | 89,
        weight: 200
    },
    run: (activeInstance) => TerminalQuickFixContribution.get(activeInstance)?.addon?.showMenu()
});
