import { MainContext } from './extHost.protocol.js';
import { Disposable } from './extHostTypes.js';
export class ExtHostAiEmbeddingVector {
    constructor(mainContext) {
        this._AiEmbeddingVectorProviders = new Map();
        this._nextHandle = 0;
        this._proxy = mainContext.getProxy(MainContext.MainThreadAiEmbeddingVector);
    }
    async $provideAiEmbeddingVector(handle, strings, token) {
        if (this._AiEmbeddingVectorProviders.size === 0) {
            throw new Error('No embedding vector providers registered');
        }
        const provider = this._AiEmbeddingVectorProviders.get(handle);
        if (!provider) {
            throw new Error('Embedding vector provider not found');
        }
        const result = await provider.provideEmbeddingVector(strings, token);
        if (!result) {
            throw new Error('Embedding vector provider returned undefined');
        }
        return result;
    }
    registerEmbeddingVectorProvider(extension, model, provider) {
        const handle = this._nextHandle;
        this._nextHandle++;
        this._AiEmbeddingVectorProviders.set(handle, provider);
        this._proxy.$registerAiEmbeddingVectorProvider(model, handle);
        return new Disposable(() => {
            this._proxy.$unregisterAiEmbeddingVectorProvider(handle);
            this._AiEmbeddingVectorProviders.delete(handle);
        });
    }
}
