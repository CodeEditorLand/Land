/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
export class ExtHostDialogs {
    constructor(mainContext) {
        this._proxy = mainContext.getProxy(MainContext.MainThreadDialogs);
    }
    showOpenDialog(extension, options) {
        if (options?.allowUIResources) {
            checkProposedApiEnabled(extension, 'showLocal');
        }
        return this._proxy.$showOpenDialog(options).then(filepaths => {
            return filepaths ? filepaths.map(p => URI.revive(p)) : undefined;
        });
    }
    showSaveDialog(options) {
        return this._proxy.$showSaveDialog(options).then(filepath => {
            return filepath ? URI.revive(filepath) : undefined;
        });
    }
}
