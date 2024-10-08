/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IEditSessionIdentityService = createDecorator('editSessionIdentityService');
export var EditSessionIdentityMatch;
(function (EditSessionIdentityMatch) {
    EditSessionIdentityMatch[EditSessionIdentityMatch["Complete"] = 100] = "Complete";
    EditSessionIdentityMatch[EditSessionIdentityMatch["Partial"] = 50] = "Partial";
    EditSessionIdentityMatch[EditSessionIdentityMatch["None"] = 0] = "None";
})(EditSessionIdentityMatch || (EditSessionIdentityMatch = {}));
