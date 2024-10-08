/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const IJSONEditingService = createDecorator('jsonEditingService');
export class JSONEditingError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
