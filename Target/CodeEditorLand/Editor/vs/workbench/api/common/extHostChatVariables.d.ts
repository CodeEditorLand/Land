import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostChatVariablesShape, IMainContext } from './extHost.protocol.js';
import { IChatRequestVariableValue } from '../../contrib/chat/common/chatVariables.js';
import type * as vscode from 'vscode';
export declare class ExtHostChatVariables implements ExtHostChatVariablesShape {
    private static _idPool;
    private readonly _resolver;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $resolveVariable(handle: number, requestId: string, messageText: string, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
    registerVariableResolver(extension: IExtensionDescription, id: string, name: string, userDescription: string, modelDescription: string | undefined, isSlow: boolean | undefined, resolver: vscode.ChatVariableResolver, fullName?: string, themeIconId?: string): IDisposable;
}
