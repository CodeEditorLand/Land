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
import { localize } from '../../../../nls.js';
import { asCssVariable, asCssVariableName, registerColor, transparent } from '../../../../platform/theme/common/colorRegistry.js';
import { IDebugService } from '../common/debug.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { STATUS_BAR_FOREGROUND, STATUS_BAR_BORDER, COMMAND_CENTER_BACKGROUND } from '../../../common/theme.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
export const STATUS_BAR_DEBUGGING_BACKGROUND = registerColor('statusBar.debuggingBackground', {
    dark: '#CC6633',
    light: '#CC6633',
    hcDark: '#BA592C',
    hcLight: '#B5200D'
}, localize('statusBarDebuggingBackground', "Status bar background color when a program is being debugged. The status bar is shown in the bottom of the window"));
export const STATUS_BAR_DEBUGGING_FOREGROUND = registerColor('statusBar.debuggingForeground', {
    dark: STATUS_BAR_FOREGROUND,
    light: STATUS_BAR_FOREGROUND,
    hcDark: STATUS_BAR_FOREGROUND,
    hcLight: '#FFFFFF'
}, localize('statusBarDebuggingForeground', "Status bar foreground color when a program is being debugged. The status bar is shown in the bottom of the window"));
export const STATUS_BAR_DEBUGGING_BORDER = registerColor('statusBar.debuggingBorder', STATUS_BAR_BORDER, localize('statusBarDebuggingBorder', "Status bar border color separating to the sidebar and editor when a program is being debugged. The status bar is shown in the bottom of the window"));
export const COMMAND_CENTER_DEBUGGING_BACKGROUND = registerColor('commandCenter.debuggingBackground', transparent(STATUS_BAR_DEBUGGING_BACKGROUND, 0.258), localize('commandCenter-activeBackground', "Command center background color when a program is being debugged"), true);
let StatusBarColorProvider = class StatusBarColorProvider {
    set enabled(enabled) {
        if (enabled === !!this.disposable) {
            return;
        }
        if (enabled) {
            this.disposable = this.statusbarService.overrideStyle({
                priority: 10,
                foreground: STATUS_BAR_DEBUGGING_FOREGROUND,
                background: STATUS_BAR_DEBUGGING_BACKGROUND,
                border: STATUS_BAR_DEBUGGING_BORDER,
            });
        }
        else {
            this.disposable.dispose();
            this.disposable = undefined;
        }
    }
    constructor(debugService, contextService, statusbarService, layoutService, configurationService) {
        this.debugService = debugService;
        this.contextService = contextService;
        this.statusbarService = statusbarService;
        this.layoutService = layoutService;
        this.configurationService = configurationService;
        this.disposables = new DisposableStore();
        this.debugService.onDidChangeState(this.update, this, this.disposables);
        this.contextService.onDidChangeWorkbenchState(this.update, this, this.disposables);
        this.configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('debug.enableStatusBarColor') || e.affectsConfiguration('debug.toolBarLocation')) {
                this.update();
            }
        }, undefined, this.disposables);
        this.update();
    }
    update() {
        const debugConfig = this.configurationService.getValue('debug');
        const isInDebugMode = isStatusbarInDebugMode(this.debugService.state, this.debugService.getModel().getSessions());
        if (!debugConfig.enableStatusBarColor) {
            this.enabled = false;
        }
        else {
            this.enabled = isInDebugMode;
        }
        const isInCommandCenter = debugConfig.toolBarLocation === 'commandCenter';
        this.layoutService.mainContainer.style.setProperty(asCssVariableName(COMMAND_CENTER_BACKGROUND), isInCommandCenter && isInDebugMode
            ? asCssVariable(COMMAND_CENTER_DEBUGGING_BACKGROUND)
            : '');
    }
    dispose() {
        this.disposable?.dispose();
        this.disposables.dispose();
    }
};
StatusBarColorProvider = __decorate([
    __param(0, IDebugService),
    __param(1, IWorkspaceContextService),
    __param(2, IStatusbarService),
    __param(3, ILayoutService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], StatusBarColorProvider);
export { StatusBarColorProvider };
export function isStatusbarInDebugMode(state, sessions) {
    if (state === 0 || state === 1 || sessions.every(s => s.suppressDebugStatusbar || s.configuration?.noDebug)) {
        return false;
    }
    return true;
}
