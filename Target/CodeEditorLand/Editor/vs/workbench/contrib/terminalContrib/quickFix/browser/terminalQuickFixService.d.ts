import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { ITerminalCommandSelector } from '../../../../../platform/terminal/common/terminal.js';
import { ITerminalQuickFixService, ITerminalQuickFixProvider, ITerminalQuickFixProviderSelector } from './quickFix.js';
export declare class TerminalQuickFixService implements ITerminalQuickFixService {
    private readonly _logService;
    _serviceBrand: undefined;
    private _selectors;
    private _providers;
    get providers(): Map<string, ITerminalQuickFixProvider>;
    private readonly _onDidRegisterProvider;
    readonly onDidRegisterProvider: import("../../../../workbench.web.main.internal.js").Event<ITerminalQuickFixProviderSelector>;
    private readonly _onDidRegisterCommandSelector;
    readonly onDidRegisterCommandSelector: import("../../../../workbench.web.main.internal.js").Event<ITerminalCommandSelector>;
    private readonly _onDidUnregisterProvider;
    readonly onDidUnregisterProvider: import("../../../../workbench.web.main.internal.js").Event<string>;
    readonly extensionQuickFixes: Promise<Array<ITerminalCommandSelector>>;
    constructor(_logService: ILogService);
    registerCommandSelector(selector: ITerminalCommandSelector): void;
    registerQuickFixProvider(id: string, provider: ITerminalQuickFixProvider): IDisposable;
}
