import { VSBuffer } from '../../../base/common/buffer.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtHostApiDeprecationService } from './extHostApiDeprecationService.js';
import { IExtHostWorkspace } from './extHostWorkspace.js';
import { WebviewRemoteInfo } from '../../contrib/webview/common/webview.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
import type * as vscode from 'vscode';
import * as extHostProtocol from './extHost.protocol.js';
export declare class ExtHostWebview implements vscode.Webview {
    #private;
    constructor(handle: extHostProtocol.WebviewHandle, proxy: extHostProtocol.MainThreadWebviewsShape, options: vscode.WebviewOptions, remoteInfo: WebviewRemoteInfo, workspace: IExtHostWorkspace | undefined, extension: IExtensionDescription, deprecationService: IExtHostApiDeprecationService);
    readonly _onMessageEmitter: Emitter<any>;
    readonly onDidReceiveMessage: Event<any>;
    readonly _onDidDispose: Event<void>;
    dispose(): void;
    asWebviewUri(resource: vscode.Uri): vscode.Uri;
    get cspSource(): string;
    get html(): string;
    set html(value: string);
    get options(): vscode.WebviewOptions;
    set options(newOptions: vscode.WebviewOptions);
    postMessage(message: any): Promise<boolean>;
    private assertNotDisposed;
    private rewriteOldResourceUrlsIfNeeded;
}
export declare function shouldSerializeBuffersForPostMessage(extension: IExtensionDescription): boolean;
export declare class ExtHostWebviews extends Disposable implements extHostProtocol.ExtHostWebviewsShape {
    private readonly remoteInfo;
    private readonly workspace;
    private readonly _logService;
    private readonly _deprecationService;
    private readonly _webviewProxy;
    private readonly _webviews;
    constructor(mainContext: extHostProtocol.IMainContext, remoteInfo: WebviewRemoteInfo, workspace: IExtHostWorkspace | undefined, _logService: ILogService, _deprecationService: IExtHostApiDeprecationService);
    dispose(): void;
    $onMessage(handle: extHostProtocol.WebviewHandle, jsonMessage: string, buffers: SerializableObjectWithBuffers<VSBuffer[]>): void;
    $onMissingCsp(_handle: extHostProtocol.WebviewHandle, extensionId: string): void;
    createNewWebview(handle: string, options: extHostProtocol.IWebviewContentOptions, extension: IExtensionDescription): ExtHostWebview;
    deleteWebview(handle: string): void;
    private getWebview;
}
export declare function toExtensionData(extension: IExtensionDescription): extHostProtocol.WebviewExtensionDescription;
export declare function serializeWebviewOptions(extension: IExtensionDescription, workspace: IExtHostWorkspace | undefined, options: vscode.WebviewOptions): extHostProtocol.IWebviewContentOptions;
