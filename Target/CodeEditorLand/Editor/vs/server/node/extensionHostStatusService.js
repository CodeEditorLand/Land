/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../platform/instantiation/common/instantiation.js';
export const IExtensionHostStatusService = createDecorator('extensionHostStatusService');
export class ExtensionHostStatusService {
    constructor() {
        this._exitInfo = new Map();
    }
    setExitInfo(reconnectionToken, info) {
        this._exitInfo.set(reconnectionToken, info);
    }
    getExitInfo(reconnectionToken) {
        return this._exitInfo.get(reconnectionToken) || null;
    }
}
