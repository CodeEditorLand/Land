/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from '../../../../base/common/buffer.js';
export var UIKind;
(function (UIKind) {
    UIKind[UIKind["Desktop"] = 1] = "Desktop";
    UIKind[UIKind["Web"] = 2] = "Web";
})(UIKind || (UIKind = {}));
export function createMessageOfType(type) {
    const result = VSBuffer.alloc(1);
    switch (type) {
        case 0 /* MessageType.Initialized */:
            result.writeUInt8(1, 0);
            break;
        case 1 /* MessageType.Ready */:
            result.writeUInt8(2, 0);
            break;
        case 2 /* MessageType.Terminate */:
            result.writeUInt8(3, 0);
            break;
    }
    return result;
}
export function isMessageOfType(message, type) {
    if (message.byteLength !== 1) {
        return false;
    }
    switch (message.readUInt8(0)) {
        case 1: return type === 0 /* MessageType.Initialized */;
        case 2: return type === 1 /* MessageType.Ready */;
        case 3: return type === 2 /* MessageType.Terminate */;
        default: return false;
    }
}
