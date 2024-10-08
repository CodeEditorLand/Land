/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as resources from '../../../../base/common/resources.js';
export class TMScopeRegistry {
    constructor() {
        this._scopeNameToLanguageRegistration = Object.create(null);
    }
    reset() {
        this._scopeNameToLanguageRegistration = Object.create(null);
    }
    register(def) {
        if (this._scopeNameToLanguageRegistration[def.scopeName]) {
            const existingRegistration = this._scopeNameToLanguageRegistration[def.scopeName];
            if (!resources.isEqual(existingRegistration.location, def.location)) {
                console.warn(`Overwriting grammar scope name to file mapping for scope ${def.scopeName}.\n` +
                    `Old grammar file: ${existingRegistration.location.toString()}.\n` +
                    `New grammar file: ${def.location.toString()}`);
            }
        }
        this._scopeNameToLanguageRegistration[def.scopeName] = def;
    }
    getGrammarDefinition(scopeName) {
        return this._scopeNameToLanguageRegistration[scopeName] || null;
    }
}
