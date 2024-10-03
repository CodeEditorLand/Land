import { isUtilityProcess } from '../../sandbox/node/electronTypes.js';
import { VSBuffer } from '../../../common/buffer.js';
import { IPCServer } from '../common/ipc.js';
import { Emitter, Event } from '../../../common/event.js';
import { assertType } from '../../../common/types.js';
class Protocol {
    constructor(port) {
        this.port = port;
        this.onMessage = Event.fromNodeEventEmitter(this.port, 'message', (e) => {
            if (e.data) {
                return VSBuffer.wrap(e.data);
            }
            return VSBuffer.alloc(0);
        });
        port.start();
    }
    send(message) {
        this.port.postMessage(message.buffer);
    }
    disconnect() {
        this.port.close();
    }
}
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
