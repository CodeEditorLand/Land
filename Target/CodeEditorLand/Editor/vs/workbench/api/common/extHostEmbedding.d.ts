import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostEmbeddingsShape, IMainContext } from './extHost.protocol.js';
import type * as vscode from 'vscode';
export declare class ExtHostEmbeddings implements ExtHostEmbeddingsShape {
    private readonly _proxy;
    private readonly _provider;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private _allKnownModels;
    private _handlePool;
    constructor(mainContext: IMainContext);
    registerEmbeddingsProvider(_extension: IExtensionDescription, embeddingsModel: string, provider: vscode.EmbeddingsProvider): IDisposable;
    computeEmbeddings(embeddingsModel: string, input: string, token?: vscode.CancellationToken): Promise<vscode.Embedding>;
    computeEmbeddings(embeddingsModel: string, input: string[], token?: vscode.CancellationToken): Promise<vscode.Embedding[]>;
    $provideEmbeddings(handle: number, input: string[], token: CancellationToken): Promise<{
        values: number[];
    }[]>;
    get embeddingsModels(): string[];
    $acceptEmbeddingModels(models: string[]): void;
}
