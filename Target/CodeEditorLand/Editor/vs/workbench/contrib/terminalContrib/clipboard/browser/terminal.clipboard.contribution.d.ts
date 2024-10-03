import type { Terminal as RawXtermTerminal } from '@xterm/xterm';
import { Disposable, type IDisposable } from '../../../../../base/common/lifecycle.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IDetachedTerminalInstance, ITerminalConfigurationService, ITerminalContribution, ITerminalInstance, type IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { type IDetachedCompatibleTerminalContributionContext, type ITerminalContributionContext } from '../../../terminal/browser/terminalExtensions.js';
import { type ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
export declare class TerminalClipboardContribution extends Disposable implements ITerminalContribution {
    private readonly _ctx;
    private readonly _clipboardService;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _notificationService;
    private readonly _terminalConfigurationService;
    static readonly ID = "terminal.clipboard";
    static get(instance: ITerminalInstance | IDetachedTerminalInstance): TerminalClipboardContribution | null;
    private _xterm;
    private _overrideCopySelection;
    private readonly _onWillPaste;
    readonly onWillPaste: import("../../../../workbench.web.main.internal.js").Event<string>;
    private readonly _onDidPaste;
    readonly onDidPaste: import("../../../../workbench.web.main.internal.js").Event<string>;
    constructor(_ctx: ITerminalContributionContext | IDetachedCompatibleTerminalContributionContext, _clipboardService: IClipboardService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _notificationService: INotificationService, _terminalConfigurationService: ITerminalConfigurationService);
    xtermReady(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    copySelection(asHtml?: boolean, command?: ITerminalCommand): Promise<void>;
    paste(): Promise<void>;
    pasteSelection(): Promise<void>;
    private _paste;
    handleMouseEvent(event: MouseEvent): Promise<{
        handled: boolean;
    } | void>;
    overrideCopyOnSelection(value: boolean): IDisposable;
}
