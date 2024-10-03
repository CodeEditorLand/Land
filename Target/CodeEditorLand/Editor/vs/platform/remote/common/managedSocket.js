import { VSBuffer, encodeBase64 } from '../../../base/common/buffer.js';
import { Emitter, PauseableEmitter } from '../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { SocketDiagnostics } from '../../../base/parts/ipc/common/ipc.net.js';
export const makeRawSocketHeaders = (path, query, deubgLabel) => {
    const buffer = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        buffer[i] = Math.round(Math.random() * 256);
    }
    const nonce = encodeBase64(VSBuffer.wrap(buffer));
    const headers = [
        `GET ws://localhost${path}?${query}&skipWebSocketFrames=true HTTP/1.1`,
        `Connection: Upgrade`,
        `Upgrade: websocket`,
        `Sec-WebSocket-Key: ${nonce}`
    ];
    return headers.join('\r\n') + '\r\n\r\n';
};
export const socketRawEndHeaderSequence = VSBuffer.fromString('\r\n\r\n');
export async function connectManagedSocket(socket, path, query, debugLabel, half) {
    socket.write(VSBuffer.fromString(makeRawSocketHeaders(path, query, debugLabel)));
    const d = new DisposableStore();
    try {
        return await new Promise((resolve, reject) => {
            let dataSoFar;
            d.add(socket.onData(d_1 => {
                if (!dataSoFar) {
                    dataSoFar = d_1;
                }
                else {
                    dataSoFar = VSBuffer.concat([dataSoFar, d_1], dataSoFar.byteLength + d_1.byteLength);
                }
                const index = dataSoFar.indexOf(socketRawEndHeaderSequence);
                if (index === -1) {
                    return;
                }
                resolve(socket);
                socket.pauseData();
                const rest = dataSoFar.slice(index + socketRawEndHeaderSequence.byteLength);
                if (rest.byteLength) {
                    half.onData.fire(rest);
                }
            }));
            d.add(socket.onClose(err => reject(err ?? new Error('socket closed'))));
            d.add(socket.onEnd(() => reject(new Error('socket ended'))));
        });
    }
    catch (e) {
        socket.dispose();
        throw e;
    }
    finally {
        d.dispose();
    }
}
export class ManagedSocket extends Disposable {
    constructor(debugLabel, half) {
        super();
        this.debugLabel = debugLabel;
        this.pausableDataEmitter = this._register(new PauseableEmitter());
        this.onData = (...args) => {
            if (this.pausableDataEmitter.isPaused) {
                queueMicrotask(() => this.pausableDataEmitter.resume());
            }
            return this.pausableDataEmitter.event(...args);
        };
        this.didDisposeEmitter = this._register(new Emitter());
        this.onDidDispose = this.didDisposeEmitter.event;
        this.ended = false;
        this._register(half.onData);
        this._register(half.onData.event(data => this.pausableDataEmitter.fire(data)));
        this.onClose = this._register(half.onClose).event;
        this.onEnd = this._register(half.onEnd).event;
    }
    pauseData() {
        this.pausableDataEmitter.pause();
    }
    drain() {
        return Promise.resolve();
    }
    end() {
        this.ended = true;
        this.closeRemote();
    }
    traceSocketEvent(type, data) {
        SocketDiagnostics.traceSocketEvent(this, this.debugLabel, type, data);
    }
    dispose() {
        if (!this.ended) {
            this.closeRemote();
        }
        this.didDisposeEmitter.fire();
        super.dispose();
    }
}
