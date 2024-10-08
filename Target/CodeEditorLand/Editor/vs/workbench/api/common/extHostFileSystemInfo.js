/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Schemas } from '../../../base/common/network.js';
import { ExtUri } from '../../../base/common/resources.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
export class ExtHostFileSystemInfo {
    constructor() {
        this._systemSchemes = new Set(Object.keys(Schemas));
        this._providerInfo = new Map();
        this.extUri = new ExtUri(uri => {
            const capabilities = this._providerInfo.get(uri.scheme);
            if (capabilities === undefined) {
                // default: not ignore
                return false;
            }
            if (capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */) {
                // configured as case sensitive
                return false;
            }
            return true;
        });
    }
    $acceptProviderInfos(uri, capabilities) {
        if (capabilities === null) {
            this._providerInfo.delete(uri.scheme);
        }
        else {
            this._providerInfo.set(uri.scheme, capabilities);
        }
    }
    isFreeScheme(scheme) {
        return !this._providerInfo.has(scheme) && !this._systemSchemes.has(scheme);
    }
    getCapabilities(scheme) {
        return this._providerInfo.get(scheme);
    }
}
export const IExtHostFileSystemInfo = createDecorator('IExtHostFileSystemInfo');
