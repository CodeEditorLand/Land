/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ICanonicalUriService } from '../../../../platform/workspace/common/canonicalUri.js';
export class CanonicalUriService {
    constructor() {
        this._providers = new Map();
    }
    registerCanonicalUriProvider(provider) {
        this._providers.set(provider.scheme, provider);
        return {
            dispose: () => this._providers.delete(provider.scheme)
        };
    }
    async provideCanonicalUri(uri, targetScheme, token) {
        const provider = this._providers.get(uri.scheme);
        if (provider) {
            return provider.provideCanonicalUri(uri, targetScheme, token);
        }
        return undefined;
    }
}
registerSingleton(ICanonicalUriService, CanonicalUriService, 1 /* InstantiationType.Delayed */);
