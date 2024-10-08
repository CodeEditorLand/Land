import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IPreparedToolInvocation, IToolInvocation, IToolResult } from '../../contrib/chat/common/languageModelToolsService.js';
import { ExtHostLanguageModelToolsShape, IMainContext, IToolDataDto } from './extHost.protocol.js';
export declare class ExtHostLanguageModelTools implements ExtHostLanguageModelToolsShape {
    /** A map of tools that were registered in this EH */
    private readonly _registeredTools;
    private readonly _proxy;
    private readonly _tokenCountFuncs;
    /** A map of all known tools, from other EHs or registered in vscode core */
    private readonly _allTools;
    constructor(mainContext: IMainContext);
    $countTokensForInvocation(callId: string, input: string, token: CancellationToken): Promise<number>;
    invokeTool(toolId: string, options: vscode.LanguageModelToolInvocationOptions<any>, token: CancellationToken): Promise<vscode.LanguageModelToolResult>;
    $onDidChangeTools(tools: IToolDataDto[]): void;
    get tools(): vscode.LanguageModelToolDescription[];
    $invokeTool(dto: IToolInvocation, token: CancellationToken): Promise<IToolResult>;
    $prepareToolInvocation(toolId: string, participantName: string, parameters: any, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    registerTool(extension: IExtensionDescription, id: string, tool: vscode.LanguageModelTool<any>): IDisposable;
}
