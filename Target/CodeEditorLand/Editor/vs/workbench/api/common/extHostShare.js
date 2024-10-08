/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MainContext } from './extHost.protocol.js';
import { DocumentSelector, Range } from './extHostTypeConverters.js';
import { URI } from '../../../base/common/uri.js';
export class ExtHostShare {
    static { this.handlePool = 0; }
    constructor(mainContext, uriTransformer) {
        this.uriTransformer = uriTransformer;
        this.providers = new Map();
        this.proxy = mainContext.getProxy(MainContext.MainThreadShare);
    }
    async $provideShare(handle, shareableItem, token) {
        const provider = this.providers.get(handle);
        const result = await provider?.provideShare({ selection: Range.to(shareableItem.selection), resourceUri: URI.revive(shareableItem.resourceUri) }, token);
        return result ?? undefined;
    }
    registerShareProvider(selector, provider) {
        const handle = ExtHostShare.handlePool++;
        this.providers.set(handle, provider);
        this.proxy.$registerShareProvider(handle, DocumentSelector.from(selector, this.uriTransformer), provider.id, provider.label, provider.priority);
        return {
            dispose: () => {
                this.proxy.$unregisterShareProvider(handle);
                this.providers.delete(handle);
            }
        };
    }
}
