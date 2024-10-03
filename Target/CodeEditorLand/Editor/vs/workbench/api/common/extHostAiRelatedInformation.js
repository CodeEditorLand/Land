import { MainContext } from './extHost.protocol.js';
import { Disposable } from './extHostTypes.js';
export class ExtHostRelatedInformation {
    constructor(mainContext) {
        this._relatedInformationProviders = new Map();
        this._nextHandle = 0;
        this._proxy = mainContext.getProxy(MainContext.MainThreadAiRelatedInformation);
    }
    async $provideAiRelatedInformation(handle, query, token) {
        if (this._relatedInformationProviders.size === 0) {
            throw new Error('No related information providers registered');
        }
        const provider = this._relatedInformationProviders.get(handle);
        if (!provider) {
            throw new Error('related information provider not found');
        }
        const result = await provider.provideRelatedInformation(query, token) ?? [];
        return result;
    }
    getRelatedInformation(extension, query, types) {
        return this._proxy.$getAiRelatedInformation(query, types);
    }
    registerRelatedInformationProvider(extension, type, provider) {
        const handle = this._nextHandle;
        this._nextHandle++;
        this._relatedInformationProviders.set(handle, provider);
        this._proxy.$registerAiRelatedInformationProvider(handle, type);
        return new Disposable(() => {
            this._proxy.$unregisterAiRelatedInformationProvider(handle);
            this._relatedInformationProviders.delete(handle);
        });
    }
}
