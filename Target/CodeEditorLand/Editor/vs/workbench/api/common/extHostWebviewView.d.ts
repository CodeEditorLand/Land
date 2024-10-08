import { CancellationToken } from '../../../base/common/cancellation.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostWebviews } from './extHostWebview.js';
import type * as vscode from 'vscode';
import * as extHostProtocol from './extHost.protocol.js';
export declare class ExtHostWebviewViews implements extHostProtocol.ExtHostWebviewViewsShape {
    private readonly _extHostWebview;
    private readonly _proxy;
    private readonly _viewProviders;
    private readonly _webviewViews;
    constructor(mainContext: extHostProtocol.IMainContext, _extHostWebview: ExtHostWebviews);
    registerWebviewViewProvider(extension: IExtensionDescription, viewType: string, provider: vscode.WebviewViewProvider, webviewOptions?: {
        retainContextWhenHidden?: boolean;
    }): vscode.Disposable;
    $resolveWebviewView(webviewHandle: string, viewType: string, title: string | undefined, state: any, cancellation: CancellationToken): Promise<void>;
    $onDidChangeWebviewViewVisibility(webviewHandle: string, visible: boolean): Promise<void>;
    $disposeWebviewView(webviewHandle: string): Promise<void>;
    private getWebviewView;
}
