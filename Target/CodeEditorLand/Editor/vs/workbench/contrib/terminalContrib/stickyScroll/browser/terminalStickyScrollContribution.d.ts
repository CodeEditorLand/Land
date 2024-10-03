import type { Terminal as RawXtermTerminal } from '@xterm/xterm';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import './media/stickyScroll.css';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ITerminalContribution, ITerminalInstance, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { ITerminalProcessInfo, ITerminalProcessManager } from '../../../terminal/common/terminal.js';
export declare class TerminalStickyScrollContribution extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _configurationService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _keybindingService;
    static readonly ID = "terminal.stickyScroll";
    static get(instance: ITerminalInstance): TerminalStickyScrollContribution | null;
    private _xterm?;
    private readonly _overlay;
    private readonly _enableListeners;
    private readonly _disableListeners;
    constructor(_instance: ITerminalInstance, processManager: ITerminalProcessManager | ITerminalProcessInfo, widgetManager: TerminalWidgetManager, _configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _keybindingService: IKeybindingService);
    xtermReady(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    xtermOpen(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    hideLock(): void;
    hideUnlock(): void;
    private _refreshState;
    private _tryEnable;
    private _tryDisable;
    private _shouldBeEnabled;
}
