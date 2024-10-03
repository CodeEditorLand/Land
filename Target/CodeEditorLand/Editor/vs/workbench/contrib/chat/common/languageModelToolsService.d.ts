import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IJSONSchema } from '../../../../base/common/jsonSchema.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { ContextKeyExpression, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IChatService } from './chatService.js';
export interface IToolData {
    id: string;
    name?: string;
    icon?: {
        dark: URI;
        light?: URI;
    } | ThemeIcon;
    when?: ContextKeyExpression;
    displayName?: string;
    userDescription?: string;
    modelDescription: string;
    parametersSchema?: IJSONSchema;
    canBeInvokedManually?: boolean;
    supportedContentTypes: string[];
    requiresConfirmation?: boolean;
}
export interface IToolInvocation {
    callId: string;
    toolId: string;
    parameters: any;
    tokenBudget?: number;
    context: IToolInvocationContext | undefined;
    requestedContentTypes: string[];
}
export interface IToolInvocationContext {
    sessionId: string;
}
export interface IToolResult {
    [contentType: string]: any;
}
export interface IToolConfirmationMessages {
    title: string;
    message: string | IMarkdownString;
}
export interface IToolImpl {
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
    provideToolConfirmationMessages(participantName: string, parameters: any, token: CancellationToken): Promise<IToolConfirmationMessages | undefined>;
    provideToolInvocationMessage(parameters: any, token: CancellationToken): Promise<string | undefined>;
}
export declare const ILanguageModelToolsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelToolsService>;
export type CountTokensCallback = (input: string, token: CancellationToken) => Promise<number>;
export interface ILanguageModelToolsService {
    _serviceBrand: undefined;
    onDidChangeTools: Event<void>;
    registerToolData(toolData: IToolData): IDisposable;
    registerToolImplementation(id: string, tool: IToolImpl): IDisposable;
    getTools(): Iterable<Readonly<IToolData>>;
    getTool(id: string): IToolData | undefined;
    getToolByName(name: string): IToolData | undefined;
    invokeTool(invocation: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
export declare class LanguageModelToolsService extends Disposable implements ILanguageModelToolsService {
    private readonly _extensionService;
    private readonly _contextKeyService;
    private readonly _chatService;
    _serviceBrand: undefined;
    private _onDidChangeTools;
    readonly onDidChangeTools: Event<void>;
    private _onDidChangeToolsScheduler;
    private _tools;
    private _toolContextKeys;
    constructor(_extensionService: IExtensionService, _contextKeyService: IContextKeyService, _chatService: IChatService);
    registerToolData(toolData: IToolData): IDisposable;
    private _refreshAllToolContextKeys;
    registerToolImplementation(id: string, tool: IToolImpl): IDisposable;
    getTools(): Iterable<Readonly<IToolData>>;
    getTool(id: string): IToolData | undefined;
    private _getToolEntry;
    getToolByName(name: string): IToolData | undefined;
    invokeTool(dto: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
