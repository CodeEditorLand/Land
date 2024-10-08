/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as net from 'net';
import { NodeSocket } from '../../../base/parts/ipc/node/ipc.net.js';
import { makeRawSocketHeaders } from '../common/managedSocket.js';
export const nodeSocketFactory = new class {
    supports(connectTo) {
        return true;
    }
    connect({ host, port }, path, query, debugLabel) {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection({ host: host, port: port }, () => {
                socket.removeListener('error', reject);
                socket.write(makeRawSocketHeaders(path, query, debugLabel));
                const onData = (data) => {
                    const strData = data.toString();
                    if (strData.indexOf('\r\n\r\n') >= 0) {
                        // headers received OK
                        socket.off('data', onData);
                        resolve(new NodeSocket(socket, debugLabel));
                    }
                };
                socket.on('data', onData);
            });
            // Disable Nagle's algorithm.
            socket.setNoDelay(true);
            socket.once('error', reject);
        });
    }
};
