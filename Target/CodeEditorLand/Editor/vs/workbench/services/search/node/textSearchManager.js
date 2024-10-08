/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { toCanonicalName } from '../../textfile/common/encoding.js';
import * as pfs from '../../../../base/node/pfs.js';
import { TextSearchManager } from '../common/textSearchManager.js';
export class NativeTextSearchManager extends TextSearchManager {
    constructor(query, provider, _pfs = pfs, processType = 'searchProcess') {
        super({ query, provider }, {
            readdir: resource => _pfs.Promises.readdir(resource.fsPath),
            toCanonicalName: name => toCanonicalName(name)
        }, processType);
    }
}
