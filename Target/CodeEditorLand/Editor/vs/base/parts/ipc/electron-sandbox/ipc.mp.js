/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { mainWindow } from '../../../browser/window.js';
import { Event } from '../../../common/event.js';
import { generateUuid } from '../../../common/uuid.js';
import { ipcMessagePort, ipcRenderer } from '../../sandbox/electron-sandbox/globals.js';
export async function acquirePort(requestChannel, responseChannel, nonce = generateUuid()) {
    // Get ready to acquire the message port from the
    // provided `responseChannel` via preload helper.
    ipcMessagePort.acquire(responseChannel, nonce);
    // If a `requestChannel` is provided, we are in charge
    // to trigger acquisition of the message port from main
    if (typeof requestChannel === 'string') {
        ipcRenderer.send(requestChannel, nonce);
    }
    // Wait until the main side has returned the `MessagePort`
    // We need to filter by the `nonce` to ensure we listen
    // to the right response.
    const onMessageChannelResult = Event.fromDOMEventEmitter(mainWindow, 'message', (e) => ({ nonce: e.data, port: e.ports[0], source: e.source }));
    const { port } = await Event.toPromise(Event.once(Event.filter(onMessageChannelResult, e => e.nonce === nonce && e.source === mainWindow)));
    return port;
}
