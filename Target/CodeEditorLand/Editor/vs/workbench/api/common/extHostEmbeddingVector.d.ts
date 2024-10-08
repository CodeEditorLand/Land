import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostAiEmbeddingVectorShape, IMainContext } from './extHost.protocol.js';
import type { CancellationToken, EmbeddingVectorProvider } from 'vscode';
import { Disposable } from './extHostTypes.js';
export declare class ExtHostAiEmbeddingVector implements ExtHostAiEmbeddingVectorShape {
    private _AiEmbeddingVectorProviders;
    private _nextHandle;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $provideAiEmbeddingVector(handle: number, strings: string[], token: CancellationToken): Promise<number[][]>;
    registerEmbeddingVectorProvider(extension: IExtensionDescription, model: string, provider: EmbeddingVectorProvider): Disposable;
}
