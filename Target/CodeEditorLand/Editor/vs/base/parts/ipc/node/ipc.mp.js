/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isUtilityProcess } from '../../sandbox/node/electronTypes.js';
import { VSBuffer } from '../../../common/buffer.js';
import { IPCServer } from '../common/ipc.js';
import { Emitter, Event } from '../../../common/event.js';
import { assertType } from '../../../common/types.js';
/**
 * The MessagePort `Protocol` leverages MessagePortMain style IPC communication
 * for the implementation of the `IMessagePassingProtocol`.
 */
class Protocol {
    constructor(port) {
        this.port = port;
        this.onMessage = Event.fromNodeEventEmitter(this.port, 'message', (e) => {
            if (e.data) {
                return VSBuffer.wrap(e.data);
            }
            return VSBuffer.alloc(0);
        });
        // we must call start() to ensure messages are flowing
        port.start();
    }
    send(message) {
        this.port.postMessage(message.buffer);
    }
    disconnect() {
        this.port.close();
    }
}
/**
 * An implementation of a `IPCServer` on top of MessagePort style IPC communication.
 * The clients register themselves via Electron Utility Process IPC transfer.
 */
export class Server extends IPCServer {
    static getOnDidClientConnect(filter) {
        assertType(isUtilityProcess(process), 'Electron Utility Process');
        const onCreateMessageChannel = new Emitter();
        process.parentPort.on('message', (e) => {
            if (filter?.handledClientConnection(e)) {
                return;
            }
            const port = e.ports.at(0);
            if (port) {
                onCreateMessageChannel.fire(port);
            }
        });
        return Event.map(onCreateMessageChannel.event, port => {
            const protocol = new Protocol(port);
            const result = {
                protocol,
                // Not part of the standard spec, but in Electron we get a `close` event
                // when the other side closes. We can use this to detect disconnects
                // (https://github.com/electron/electron/blob/11-x-y/docs/api/message-port-main.md#event-close)
                onDidClientDisconnect: Event.fromNodeEventEmitter(port, 'close')
            };
            return result;
        });
    }
    constructor(filter) {
        super(Server.getOnDidClientConnect(filter));
    }
}
export function once(port, message, callback) {
    const listener = (e) => {
        if (e.data === message) {
            port.removeListener('message', listener);
            callback();
        }
    };
    port.on('message', listener);
}
