/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { registerMainProcessRemoteService } from '../../ipc/electron-sandbox/services.js';
export const IExternalTerminalService = createDecorator('externalTerminal');
registerMainProcessRemoteService(IExternalTerminalService, 'externalTerminal');
