/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IIntegrityService } from '../common/integrity.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
export class IntegrityService {
    async isPure() {
        return { isPure: true, proof: [] };
    }
}
registerSingleton(IIntegrityService, IntegrityService, 1 /* InstantiationType.Delayed */);
