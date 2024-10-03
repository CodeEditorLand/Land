import type * as vscode from 'vscode';
import { IMainContext, ExtHostUrlsShape } from './extHost.protocol.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
export declare class ExtHostUrls implements ExtHostUrlsShape {
    private static HandlePool;
    private readonly _proxy;
    private handles;
    private handlers;
    constructor(mainContext: IMainContext);
    registerUriHandler(extension: IExtensionDescription, handler: vscode.UriHandler): vscode.Disposable;
    $handleExternalUri(handle: number, uri: UriComponents): Promise<void>;
    createAppUri(uri: URI): Promise<vscode.Uri>;
}
