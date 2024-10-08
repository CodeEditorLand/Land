import type * as vscode from 'vscode';
import { ExtHostDecorationsShape, DecorationRequest, DecorationReply } from './extHost.protocol.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class ExtHostDecorations implements ExtHostDecorationsShape {
    private readonly _logService;
    private static _handlePool;
    private static _maxEventSize;
    readonly _serviceBrand: undefined;
    private readonly _provider;
    private readonly _proxy;
    constructor(extHostRpc: IExtHostRpcService, _logService: ILogService);
    registerFileDecorationProvider(provider: vscode.FileDecorationProvider, extensionDescription: IExtensionDescription): vscode.Disposable;
    $provideDecorations(handle: number, requests: DecorationRequest[], token: CancellationToken): Promise<DecorationReply>;
}
export declare const IExtHostDecorations: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostDecorations>;
export interface IExtHostDecorations extends ExtHostDecorations {
}
