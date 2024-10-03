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
var TerminalCommandGuideContribution_1;
import { addDisposableListener } from '../../../../../base/browser/dom.js';
import { combinedDisposable, Disposable, MutableDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { listInactiveSelectionBackground } from '../../../../../platform/theme/common/colorRegistry.js';
import { registerColor, transparent } from '../../../../../platform/theme/common/colorUtils.js';
import { PANEL_BORDER } from '../../../../common/theme.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { terminalCommandGuideConfigSection } from '../common/terminalCommandGuideConfiguration.js';
let TerminalCommandGuideContribution = class TerminalCommandGuideContribution extends Disposable {
    static { TerminalCommandGuideContribution_1 = this; }
    static { this.ID = 'terminal.highlight'; }
    static get(instance) {
        return instance.getContribution(TerminalCommandGuideContribution_1.ID);
    }
    constructor(_instance, processManager, widgetManager, _configurationService) {
        super();
        this._instance = _instance;
        this._configurationService = _configurationService;
        this._activeCommandGuide = this._register(new MutableDisposable());
    }
    xtermOpen(xterm) {
        this._xterm = xterm;
        this._refreshActivatedState();
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.shellIntegration.showCommandGuide")) {
                this._refreshActivatedState();
            }
        }));
    }
    _refreshActivatedState() {
        const xterm = this._xterm;
        if (!xterm) {
            return;
        }
        const showCommandGuide = this._configurationService.getValue(terminalCommandGuideConfigSection).showCommandGuide;
        if (!!this._activeCommandGuide.value === showCommandGuide) {
            return;
        }
        if (!showCommandGuide) {
            this._activeCommandGuide.clear();
        }
        else {
            const screenElement = xterm.raw.element.querySelector('.xterm-screen');
            const viewportElement = xterm.raw.element.querySelector('.xterm-viewport');
            this._activeCommandGuide.value = combinedDisposable(addDisposableListener(screenElement, 'mousemove', (e) => this._tryShowHighlight(screenElement, xterm, e)), addDisposableListener(viewportElement, 'mousemove', (e) => this._tryShowHighlight(screenElement, xterm, e)), addDisposableListener(xterm.raw.element, 'mouseout', () => xterm.markTracker.showCommandGuide(undefined)), xterm.raw.onData(() => xterm.markTracker.showCommandGuide(undefined)), toDisposable(() => xterm.markTracker.showCommandGuide(undefined)));
        }
    }
    _tryShowHighlight(element, xterm, e) {
        const rect = element.getBoundingClientRect();
        if (!rect) {
            return;
        }
        const mouseCursorY = Math.floor((e.clientY - rect.top) / (rect.height / xterm.raw.rows));
        const command = this._instance.capabilities.get(2)?.getCommandForLine(xterm.raw.buffer.active.viewportY + mouseCursorY);
        if (command && 'getOutput' in command) {
            xterm.markTracker.showCommandGuide(command);
        }
        else {
            xterm.markTracker.showCommandGuide(undefined);
        }
    }
};
TerminalCommandGuideContribution = TerminalCommandGuideContribution_1 = __decorate([
    __param(3, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, TerminalWidgetManager, Object])
], TerminalCommandGuideContribution);
registerTerminalContribution(TerminalCommandGuideContribution.ID, TerminalCommandGuideContribution, false);
export const TERMINAL_COMMAND_GUIDE_COLOR = registerColor('terminalCommandGuide.foreground', {
    dark: transparent(listInactiveSelectionBackground, 1),
    light: transparent(listInactiveSelectionBackground, 1),
    hcDark: PANEL_BORDER,
    hcLight: PANEL_BORDER
}, localize('terminalCommandGuide.foreground', 'The foreground color of the terminal command guide that appears to the left of a command and its output on hover.'));
