import type * as vscode from 'vscode';
import { ExtHostShareShape, IMainContext, IShareableItemDto } from './extHost.protocol.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { UriComponents } from '../../../base/common/uri.js';
export declare class ExtHostShare implements ExtHostShareShape {
    private readonly uriTransformer;
    private static handlePool;
    private proxy;
    private providers;
    constructor(mainContext: IMainContext, uriTransformer: IURITransformer | undefined);
    $provideShare(handle: number, shareableItem: IShareableItemDto, token: CancellationToken): Promise<UriComponents | string | undefined>;
    registerShareProvider(selector: vscode.DocumentSelector, provider: vscode.ShareProvider): vscode.Disposable;
}
