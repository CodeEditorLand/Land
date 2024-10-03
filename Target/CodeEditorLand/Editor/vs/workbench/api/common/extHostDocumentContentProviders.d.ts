import { UriComponents } from '../../../base/common/uri.js';
import type * as vscode from 'vscode';
import { ExtHostDocumentContentProvidersShape, IMainContext } from './extHost.protocol.js';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class ExtHostDocumentContentProvider implements ExtHostDocumentContentProvidersShape {
    private readonly _documentsAndEditors;
    private readonly _logService;
    private static _handlePool;
    private readonly _documentContentProviders;
    private readonly _proxy;
    constructor(mainContext: IMainContext, _documentsAndEditors: ExtHostDocumentsAndEditors, _logService: ILogService);
    registerTextDocumentContentProvider(scheme: string, provider: vscode.TextDocumentContentProvider): vscode.Disposable;
    $provideTextDocumentContent(handle: number, uri: UriComponents): Promise<string | null | undefined>;
}
