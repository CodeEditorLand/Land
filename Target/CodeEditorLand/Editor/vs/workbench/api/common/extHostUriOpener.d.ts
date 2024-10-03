import { CancellationToken } from '../../../base/common/cancellation.js';
import { UriComponents } from '../../../base/common/uri.js';
import * as languages from '../../../editor/common/languages.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import type * as vscode from 'vscode';
import { ExtHostUriOpenersShape, IMainContext } from './extHost.protocol.js';
export declare class ExtHostUriOpeners implements ExtHostUriOpenersShape {
    private static readonly supportedSchemes;
    private readonly _proxy;
    private readonly _openers;
    constructor(mainContext: IMainContext);
    registerExternalUriOpener(extensionId: ExtensionIdentifier, id: string, opener: vscode.ExternalUriOpener, metadata: vscode.ExternalUriOpenerMetadata): vscode.Disposable;
    $canOpenUri(id: string, uriComponents: UriComponents, token: CancellationToken): Promise<languages.ExternalUriOpenerPriority>;
    $openUri(id: string, context: {
        resolvedUri: UriComponents;
        sourceUri: UriComponents;
    }, token: CancellationToken): Promise<void>;
}
