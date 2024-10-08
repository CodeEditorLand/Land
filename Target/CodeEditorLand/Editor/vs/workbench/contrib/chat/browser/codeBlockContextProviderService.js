/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { toDisposable } from '../../../../base/common/lifecycle.js';
export class ChatCodeBlockContextProviderService {
    constructor() {
        this._providers = new Map();
    }
    get providers() {
        return [...this._providers.values()];
    }
    registerProvider(provider, id) {
        this._providers.set(id, provider);
        return toDisposable(() => this._providers.delete(id));
    }
}
