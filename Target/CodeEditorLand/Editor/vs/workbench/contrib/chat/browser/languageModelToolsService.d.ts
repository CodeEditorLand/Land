import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IChatService } from '../common/chatService.js';
import { CountTokensCallback, ILanguageModelToolsService, IToolData, IToolImpl, IToolInvocation, IToolResult } from '../common/languageModelToolsService.js';
export declare class LanguageModelToolsService extends Disposable implements ILanguageModelToolsService {
    private readonly _extensionService;
    private readonly _contextKeyService;
    private readonly _chatService;
    private readonly _dialogService;
    _serviceBrand: undefined;
    private _onDidChangeTools;
    readonly onDidChangeTools: import("../../../workbench.web.main.internal.js").Event<void>;
    /** Throttle tools updates because it sends all tools and runs on context key updates */
    private _onDidChangeToolsScheduler;
    private _tools;
    private _toolContextKeys;
    constructor(_extensionService: IExtensionService, _contextKeyService: IContextKeyService, _chatService: IChatService, _dialogService: IDialogService);
    registerToolData(toolData: IToolData): IDisposable;
    private _refreshAllToolContextKeys;
    registerToolImplementation(id: string, tool: IToolImpl): IDisposable;
    getTools(): Iterable<Readonly<IToolData>>;
    getTool(id: string): IToolData | undefined;
    private _getToolEntry;
    getToolByName(name: string): IToolData | undefined;
    invokeTool(dto: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
