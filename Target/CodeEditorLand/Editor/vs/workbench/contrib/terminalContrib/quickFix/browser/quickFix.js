/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../../platform/instantiation/common/instantiation.js';
export const ITerminalQuickFixService = createDecorator('terminalQuickFixService');
export var TerminalQuickFixType;
(function (TerminalQuickFixType) {
    TerminalQuickFixType[TerminalQuickFixType["TerminalCommand"] = 0] = "TerminalCommand";
    TerminalQuickFixType[TerminalQuickFixType["Opener"] = 1] = "Opener";
    TerminalQuickFixType[TerminalQuickFixType["Port"] = 2] = "Port";
    TerminalQuickFixType[TerminalQuickFixType["VscodeCommand"] = 3] = "VscodeCommand";
})(TerminalQuickFixType || (TerminalQuickFixType = {}));
