import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostLanguageModelToolsShape, IMainContext, IToolDataDto } from './extHost.protocol.js';
import { IToolConfirmationMessages, IToolInvocation, IToolResult } from '../../contrib/chat/common/languageModelToolsService.js';
import type * as vscode from 'vscode';
export declare class ExtHostLanguageModelTools implements ExtHostLanguageModelToolsShape {
    private readonly _registeredTools;
    private readonly _proxy;
    private readonly _tokenCountFuncs;
    private readonly _allTools;
    constructor(mainContext: IMainContext);
    $countTokensForInvocation(callId: string, input: string, token: CancellationToken): Promise<number>;
    invokeTool(toolId: string, options: vscode.LanguageModelToolInvocationOptions, token: CancellationToken): Promise<vscode.LanguageModelToolResult>;
    $onDidChangeTools(tools: IToolDataDto[]): void;
    get tools(): vscode.LanguageModelToolDescription[];
    $invokeTool(dto: IToolInvocation, token: CancellationToken): Promise<IToolResult>;
    $provideToolConfirmationMessages(toolId: string, participantName: string, parameters: any, token: CancellationToken): Promise<IToolConfirmationMessages | undefined>;
    $provideToolInvocationMessage(toolId: string, parameters: any, token: CancellationToken): Promise<string | undefined>;
    registerTool(extension: IExtensionDescription, id: string, tool: vscode.LanguageModelTool): IDisposable;
}
