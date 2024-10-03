import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IDetachedTerminalInstance, ITerminalContribution, ITerminalEditorService, ITerminalGroupService, ITerminalInstance, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import type { Terminal as RawXtermTerminal, ITerminalAddon } from '@xterm/xterm';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { ITerminalProcessManager, ITerminalProcessInfo } from '../../../terminal/common/terminal.js';
import { ITerminalCapabilityStore } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { Event } from '../../../../../base/common/event.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import './media/terminalInitialHint.css';
import { IChatAgent, IChatAgentService } from '../../../chat/common/chatAgents.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
export declare class InitialHintAddon extends Disposable implements ITerminalAddon {
    private readonly _capabilities;
    private readonly _onDidChangeAgents;
    private readonly _onDidRequestCreateHint;
    get onDidRequestCreateHint(): Event<void>;
    private readonly _disposables;
    constructor(_capabilities: ITerminalCapabilityStore, _onDidChangeAgents: Event<IChatAgent | undefined>);
    activate(terminal: RawXtermTerminal): void;
}
export declare class TerminalInitialHintContribution extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _terminalGroupService;
    private readonly _terminalEditorService;
    private readonly _chatAgentService;
    private readonly _storageService;
    static readonly ID = "terminal.initialHint";
    private _addon;
    private _hintWidget;
    static get(instance: ITerminalInstance | IDetachedTerminalInstance): TerminalInitialHintContribution | null;
    private _decoration;
    private _xterm;
    constructor(_instance: Pick<ITerminalInstance, 'capabilities' | 'shellLaunchConfig'> | IDetachedTerminalInstance, processManager: ITerminalProcessManager | ITerminalProcessInfo | undefined, widgetManager: TerminalWidgetManager | undefined, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _terminalGroupService: ITerminalGroupService, _terminalEditorService: ITerminalEditorService, _chatAgentService: IChatAgentService, _storageService: IStorageService);
    xtermOpen(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    private _createHint;
}
