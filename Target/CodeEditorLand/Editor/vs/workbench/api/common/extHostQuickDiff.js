/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import { asPromise } from '../../../base/common/async.js';
import { DocumentSelector } from './extHostTypeConverters.js';
export class ExtHostQuickDiff {
    static { this.handlePool = 0; }
    constructor(mainContext, uriTransformer) {
        this.uriTransformer = uriTransformer;
        this.providers = new Map();
        this.proxy = mainContext.getProxy(MainContext.MainThreadQuickDiff);
    }
    $provideOriginalResource(handle, uriComponents, token) {
        const uri = URI.revive(uriComponents);
        const provider = this.providers.get(handle);
        if (!provider) {
            return Promise.resolve(null);
        }
        return asPromise(() => provider.provideOriginalResource(uri, token))
            .then(r => r || null);
    }
    registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
        const handle = ExtHostQuickDiff.handlePool++;
        this.providers.set(handle, quickDiffProvider);
        this.proxy.$registerQuickDiffProvider(handle, DocumentSelector.from(selector, this.uriTransformer), label, rootUri);
        return {
            dispose: () => {
                this.proxy.$unregisterQuickDiffProvider(handle);
                this.providers.delete(handle);
            }
        };
    }
}
