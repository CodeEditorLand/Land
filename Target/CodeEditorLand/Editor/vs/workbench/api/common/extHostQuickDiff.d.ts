import type * as vscode from 'vscode';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { UriComponents } from '../../../base/common/uri.js';
import { ExtHostQuickDiffShape, IMainContext } from './extHost.protocol.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
export declare class ExtHostQuickDiff implements ExtHostQuickDiffShape {
    private readonly uriTransformer;
    private static handlePool;
    private proxy;
    private providers;
    constructor(mainContext: IMainContext, uriTransformer: IURITransformer | undefined);
    $provideOriginalResource(handle: number, uriComponents: UriComponents, token: CancellationToken): Promise<UriComponents | null>;
    registerQuickDiffProvider(selector: vscode.DocumentSelector, quickDiffProvider: vscode.QuickDiffProvider, label: string, rootUri?: vscode.Uri): vscode.Disposable;
}
