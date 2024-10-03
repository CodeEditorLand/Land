import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ICodeMapperResult } from '../../contrib/chat/common/chatCodeMapperService.js';
import * as extHostProtocol from './extHost.protocol.js';
export declare class ExtHostCodeMapper implements extHostProtocol.ExtHostCodeMapperShape {
    private static _providerHandlePool;
    private readonly _proxy;
    private readonly providers;
    constructor(mainContext: extHostProtocol.IMainContext);
    $mapCode(handle: number, internalRequest: extHostProtocol.ICodeMapperRequestDto, token: CancellationToken): Promise<ICodeMapperResult | null>;
    registerMappedEditsProvider(extension: IExtensionDescription, provider: vscode.MappedEditsProvider2): vscode.Disposable;
}
