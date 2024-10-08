/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MainContext } from './extHost.protocol.js';
import { Emitter } from '../../../base/common/event.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
export class ExtHostStorage {
    constructor(mainContext, _logService) {
        this._logService = _logService;
        this._onDidChangeStorage = new Emitter();
        this.onDidChangeStorage = this._onDidChangeStorage.event;
        this._proxy = mainContext.getProxy(MainContext.MainThreadStorage);
    }
    registerExtensionStorageKeysToSync(extension, keys) {
        this._proxy.$registerExtensionStorageKeysToSync(extension, keys);
    }
    async initializeExtensionStorage(shared, key, defaultValue) {
        const value = await this._proxy.$initializeExtensionStorage(shared, key);
        let parsedValue;
        if (value) {
            parsedValue = this.safeParseValue(shared, key, value);
        }
        return parsedValue || defaultValue;
    }
    setValue(shared, key, value) {
        return this._proxy.$setValue(shared, key, value);
    }
    $acceptValue(shared, key, value) {
        const parsedValue = this.safeParseValue(shared, key, value);
        if (parsedValue) {
            this._onDidChangeStorage.fire({ shared, key, value: parsedValue });
        }
    }
    safeParseValue(shared, key, value) {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            // Do not fail this call but log it for diagnostics
            // https://github.com/microsoft/vscode/issues/132777
            this._logService.error(`[extHostStorage] unexpected error parsing storage contents (extensionId: ${key}, global: ${shared}): ${error}`);
        }
        return undefined;
    }
}
export const IExtHostStorage = createDecorator('IExtHostStorage');
