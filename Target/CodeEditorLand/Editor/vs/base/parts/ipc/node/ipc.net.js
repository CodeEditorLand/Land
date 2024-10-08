/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createHash } from 'crypto';
import { createServer, createConnection } from 'net';
import { tmpdir } from 'os';
import { createDeflateRaw, createInflateRaw } from 'zlib';
import { VSBuffer } from '../../../common/buffer.js';
import { onUnexpectedError } from '../../../common/errors.js';
import { Emitter, Event } from '../../../common/event.js';
import { Disposable } from '../../../common/lifecycle.js';
import { join } from '../../../common/path.js';
import { platform } from '../../../common/platform.js';
import { generateUuid } from '../../../common/uuid.js';
import { IPCServer } from '../common/ipc.js';
import { ChunkStream, Client, Protocol, SocketDiagnostics } from '../common/ipc.net.js';
/**
 * Maximum time to wait for a 'close' event to fire after the socket stream
 * ends. For unix domain sockets, the close event may not fire consistently
 * due to what appears to be a Node.js bug.
 *
 * @see https://github.com/microsoft/vscode/issues/211462#issuecomment-2155471996
 */
const socketEndTimeoutMs = 30_000;
export class NodeSocket {
    traceSocketEvent(type, data) {
        SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
    }
    constructor(socket, debugLabel = '') {
        this._canWrite = true;
        this.debugLabel = debugLabel;
        this.socket = socket;
        this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'NodeSocket' });
        this._errorListener = (err) => {
            this.traceSocketEvent("error" /* SocketDiagnosticsEventType.Error */, { code: err?.code, message: err?.message });
            if (err) {
                if (err.code === 'EPIPE') {
                    // An EPIPE exception at the wrong time can lead to a renderer process crash
                    // so ignore the error since the socket will fire the close event soon anyways:
                    // > https://nodejs.org/api/errors.html#errors_common_system_errors
                    // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                    // > process to read the data. Commonly encountered at the net and http layers,
                    // > indicative that the remote side of the stream being written to has been closed.
                    return;
                }
                onUnexpectedError(err);
            }
        };
        this.socket.on('error', this._errorListener);
        let endTimeoutHandle;
        this._closeListener = (hadError) => {
            this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */, { hadError });
            this._canWrite = false;
            if (endTimeoutHandle) {
                clearTimeout(endTimeoutHandle);
            }
        };
        this.socket.on('close', this._closeListener);
        this._endListener = () => {
            this.traceSocketEvent("nodeEndReceived" /* SocketDiagnosticsEventType.NodeEndReceived */);
            this._canWrite = false;
            endTimeoutHandle = setTimeout(() => socket.destroy(), socketEndTimeoutMs);
        };
        this.socket.on('end', this._endListener);
    }
    dispose() {
        this.socket.off('error', this._errorListener);
        this.socket.off('close', this._closeListener);
        this.socket.off('end', this._endListener);
        this.socket.destroy();
    }
    onData(_listener) {
        const listener = (buff) => {
            this.traceSocketEvent("read" /* SocketDiagnosticsEventType.Read */, buff);
            _listener(VSBuffer.wrap(buff));
        };
        this.socket.on('data', listener);
        return {
            dispose: () => this.socket.off('data', listener)
        };
    }
    onClose(listener) {
        const adapter = (hadError) => {
            listener({
                type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                hadError: hadError,
                error: undefined
            });
        };
        this.socket.on('close', adapter);
        return {
            dispose: () => this.socket.off('close', adapter)
        };
    }
    onEnd(listener) {
        const adapter = () => {
            listener();
        };
        this.socket.on('end', adapter);
        return {
            dispose: () => this.socket.off('end', adapter)
        };
    }
    write(buffer) {
        // return early if socket has been destroyed in the meantime
        if (this.socket.destroyed || !this._canWrite) {
            return;
        }
        // we ignore the returned value from `write` because we would have to cached the data
        // anyways and nodejs is already doing that for us:
        // > https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
        // > However, the false return value is only advisory and the writable stream will unconditionally
        // > accept and buffer chunk even if it has not been allowed to drain.
        try {
            this.traceSocketEvent("write" /* SocketDiagnosticsEventType.Write */, buffer);
            this.socket.write(buffer.buffer, (err) => {
                if (err) {
                    if (err.code === 'EPIPE') {
                        // An EPIPE exception at the wrong time can lead to a renderer process crash
                        // so ignore the error since the socket will fire the close event soon anyways:
                        // > https://nodejs.org/api/errors.html#errors_common_system_errors
                        // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                        // > process to read the data. Commonly encountered at the net and http layers,
                        // > indicative that the remote side of the stream being written to has been closed.
                        return;
                    }
                    onUnexpectedError(err);
                }
            });
        }
        catch (err) {
            if (err.code === 'EPIPE') {
                // An EPIPE exception at the wrong time can lead to a renderer process crash
                // so ignore the error since the socket will fire the close event soon anyways:
                // > https://nodejs.org/api/errors.html#errors_common_system_errors
                // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                // > process to read the data. Commonly encountered at the net and http layers,
                // > indicative that the remote side of the stream being written to has been closed.
                return;
            }
            onUnexpectedError(err);
        }
    }
    end() {
        this.traceSocketEvent("nodeEndSent" /* SocketDiagnosticsEventType.NodeEndSent */);
        this.socket.end();
    }
    drain() {
        this.traceSocketEvent("nodeDrainBegin" /* SocketDiagnosticsEventType.NodeDrainBegin */);
        return new Promise((resolve, reject) => {
            if (this.socket.bufferSize === 0) {
                this.traceSocketEvent("nodeDrainEnd" /* SocketDiagnosticsEventType.NodeDrainEnd */);
                resolve();
                return;
            }
            const finished = () => {
                this.socket.off('close', finished);
                this.socket.off('end', finished);
                this.socket.off('error', finished);
                this.socket.off('timeout', finished);
                this.socket.off('drain', finished);
                this.traceSocketEvent("nodeDrainEnd" /* SocketDiagnosticsEventType.NodeDrainEnd */);
                resolve();
            };
            this.socket.on('close', finished);
            this.socket.on('end', finished);
            this.socket.on('error', finished);
            this.socket.on('timeout', finished);
            this.socket.on('drain', finished);
        });
    }
}
/**
 * See https://tools.ietf.org/html/rfc6455#section-5.2
 */
export class WebSocketNodeSocket extends Disposable {
    get permessageDeflate() {
        return this._flowManager.permessageDeflate;
    }
    get recordedInflateBytes() {
        return this._flowManager.recordedInflateBytes;
    }
    traceSocketEvent(type, data) {
        this.socket.traceSocketEvent(type, data);
    }
    /**
     * Create a socket which can communicate using WebSocket frames.
     *
     * **NOTE**: When using the permessage-deflate WebSocket extension, if parts of inflating was done
     *  in a different zlib instance, we need to pass all those bytes into zlib, otherwise the inflate
     *  might hit an inflated portion referencing a distance too far back.
     *
     * @param socket The underlying socket
     * @param permessageDeflate Use the permessage-deflate WebSocket extension
     * @param inflateBytes "Seed" zlib inflate with these bytes.
     * @param recordInflateBytes Record all bytes sent to inflate
     */
    constructor(socket, permessageDeflate, inflateBytes, recordInflateBytes) {
        super();
        this._onData = this._register(new Emitter());
        this._onClose = this._register(new Emitter());
        this._isEnded = false;
        this._state = {
            state: 1 /* ReadState.PeekHeader */,
            readLen: 2 /* Constants.MinHeaderByteSize */,
            fin: 0,
            compressed: false,
            firstFrameOfMessage: true,
            mask: 0,
            opcode: 0
        };
        this.socket = socket;
        this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'WebSocketNodeSocket', permessageDeflate, inflateBytesLength: inflateBytes?.byteLength || 0, recordInflateBytes });
        this._flowManager = this._register(new WebSocketFlowManager(this, permessageDeflate, inflateBytes, recordInflateBytes, this._onData, (data, options) => this._write(data, options)));
        this._register(this._flowManager.onError((err) => {
            // zlib errors are fatal, since we have no idea how to recover
            console.error(err);
            onUnexpectedError(err);
            this._onClose.fire({
                type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                hadError: true,
                error: err
            });
        }));
        this._incomingData = new ChunkStream();
        this._register(this.socket.onData(data => this._acceptChunk(data)));
        this._register(this.socket.onClose(async (e) => {
            // Delay surfacing the close event until the async inflating is done
            // and all data has been emitted
            if (this._flowManager.isProcessingReadQueue()) {
                await Event.toPromise(this._flowManager.onDidFinishProcessingReadQueue);
            }
            this._onClose.fire(e);
        }));
    }
    dispose() {
        if (this._flowManager.isProcessingWriteQueue()) {
            // Wait for any outstanding writes to finish before disposing
            this._register(this._flowManager.onDidFinishProcessingWriteQueue(() => {
                this.dispose();
            }));
        }
        else {
            this.socket.dispose();
            super.dispose();
        }
    }
    onData(listener) {
        return this._onData.event(listener);
    }
    onClose(listener) {
        return this._onClose.event(listener);
    }
    onEnd(listener) {
        return this.socket.onEnd(listener);
    }
    write(buffer) {
        // If we write many logical messages (let's say 1000 messages of 100KB) during a single process tick, we do
        // this thing where we install a process.nextTick timer and group all of them together and we then issue a
        // single WebSocketNodeSocket.write with a 100MB buffer.
        //
        // The first problem is that the actual writing to the underlying node socket will only happen after all of
        // the 100MB have been deflated (due to waiting on zlib flush). The second problem is on the reading side,
        // where we will get a single WebSocketNodeSocket.onData event fired when all the 100MB have arrived,
        // delaying processing the 1000 received messages until all have arrived, instead of processing them as each
        // one arrives.
        //
        // We therefore split the buffer into chunks, and issue a write for each chunk.
        let start = 0;
        while (start < buffer.byteLength) {
            this._flowManager.writeMessage(buffer.slice(start, Math.min(start + 262144 /* Constants.MaxWebSocketMessageLength */, buffer.byteLength)), { compressed: true, opcode: 0x02 /* Binary frame */ });
            start += 262144 /* Constants.MaxWebSocketMessageLength */;
        }
    }
    _write(buffer, { compressed, opcode }) {
        if (this._isEnded) {
            // Avoid ERR_STREAM_WRITE_AFTER_END
            return;
        }
        this.traceSocketEvent("webSocketNodeSocketWrite" /* SocketDiagnosticsEventType.WebSocketNodeSocketWrite */, buffer);
        let headerLen = 2 /* Constants.MinHeaderByteSize */;
        if (buffer.byteLength < 126) {
            headerLen += 0;
        }
        else if (buffer.byteLength < 2 ** 16) {
            headerLen += 2;
        }
        else {
            headerLen += 8;
        }
        const header = VSBuffer.alloc(headerLen);
        // The RSV1 bit indicates a compressed frame
        const compressedFlag = compressed ? 0b01000000 : 0;
        const opcodeFlag = opcode & 0b00001111;
        header.writeUInt8(0b10000000 | compressedFlag | opcodeFlag, 0);
        if (buffer.byteLength < 126) {
            header.writeUInt8(buffer.byteLength, 1);
        }
        else if (buffer.byteLength < 2 ** 16) {
            header.writeUInt8(126, 1);
            let offset = 1;
            header.writeUInt8((buffer.byteLength >>> 8) & 0b11111111, ++offset);
            header.writeUInt8((buffer.byteLength >>> 0) & 0b11111111, ++offset);
        }
        else {
            header.writeUInt8(127, 1);
            let offset = 1;
            header.writeUInt8(0, ++offset);
            header.writeUInt8(0, ++offset);
            header.writeUInt8(0, ++offset);
            header.writeUInt8(0, ++offset);
            header.writeUInt8((buffer.byteLength >>> 24) & 0b11111111, ++offset);
            header.writeUInt8((buffer.byteLength >>> 16) & 0b11111111, ++offset);
            header.writeUInt8((buffer.byteLength >>> 8) & 0b11111111, ++offset);
            header.writeUInt8((buffer.byteLength >>> 0) & 0b11111111, ++offset);
        }
        this.socket.write(VSBuffer.concat([header, buffer]));
    }
    end() {
        this._isEnded = true;
        this.socket.end();
    }
    _acceptChunk(data) {
        if (data.byteLength === 0) {
            return;
        }
        this._incomingData.acceptChunk(data);
        while (this._incomingData.byteLength >= this._state.readLen) {
            if (this._state.state === 1 /* ReadState.PeekHeader */) {
                // peek to see if we can read the entire header
                const peekHeader = this._incomingData.peek(this._state.readLen);
                const firstByte = peekHeader.readUInt8(0);
                const finBit = (firstByte & 0b10000000) >>> 7;
                const rsv1Bit = (firstByte & 0b01000000) >>> 6;
                const opcode = (firstByte & 0b00001111);
                const secondByte = peekHeader.readUInt8(1);
                const hasMask = (secondByte & 0b10000000) >>> 7;
                const len = (secondByte & 0b01111111);
                this._state.state = 2 /* ReadState.ReadHeader */;
                this._state.readLen = 2 /* Constants.MinHeaderByteSize */ + (hasMask ? 4 : 0) + (len === 126 ? 2 : 0) + (len === 127 ? 8 : 0);
                this._state.fin = finBit;
                if (this._state.firstFrameOfMessage) {
                    // if the frame is compressed, the RSV1 bit is set only for the first frame of the message
                    this._state.compressed = Boolean(rsv1Bit);
                }
                this._state.firstFrameOfMessage = Boolean(finBit);
                this._state.mask = 0;
                this._state.opcode = opcode;
                this.traceSocketEvent("webSocketNodeSocketPeekedHeader" /* SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader */, { headerSize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin, opcode: this._state.opcode });
            }
            else if (this._state.state === 2 /* ReadState.ReadHeader */) {
                // read entire header
                const header = this._incomingData.read(this._state.readLen);
                const secondByte = header.readUInt8(1);
                const hasMask = (secondByte & 0b10000000) >>> 7;
                let len = (secondByte & 0b01111111);
                let offset = 1;
                if (len === 126) {
                    len = (header.readUInt8(++offset) * 2 ** 8
                        + header.readUInt8(++offset));
                }
                else if (len === 127) {
                    len = (header.readUInt8(++offset) * 0
                        + header.readUInt8(++offset) * 0
                        + header.readUInt8(++offset) * 0
                        + header.readUInt8(++offset) * 0
                        + header.readUInt8(++offset) * 2 ** 24
                        + header.readUInt8(++offset) * 2 ** 16
                        + header.readUInt8(++offset) * 2 ** 8
                        + header.readUInt8(++offset));
                }
                let mask = 0;
                if (hasMask) {
                    mask = (header.readUInt8(++offset) * 2 ** 24
                        + header.readUInt8(++offset) * 2 ** 16
                        + header.readUInt8(++offset) * 2 ** 8
                        + header.readUInt8(++offset));
                }
                this._state.state = 3 /* ReadState.ReadBody */;
                this._state.readLen = len;
                this._state.mask = mask;
                this.traceSocketEvent("webSocketNodeSocketPeekedHeader" /* SocketDiagnosticsEventType.WebSocketNodeSocketPeekedHeader */, { bodySize: this._state.readLen, compressed: this._state.compressed, fin: this._state.fin, mask: this._state.mask, opcode: this._state.opcode });
            }
            else if (this._state.state === 3 /* ReadState.ReadBody */) {
                // read body
                const body = this._incomingData.read(this._state.readLen);
                this.traceSocketEvent("webSocketNodeSocketReadData" /* SocketDiagnosticsEventType.WebSocketNodeSocketReadData */, body);
                unmask(body, this._state.mask);
                this.traceSocketEvent("webSocketNodeSocketUnmaskedData" /* SocketDiagnosticsEventType.WebSocketNodeSocketUnmaskedData */, body);
                this._state.state = 1 /* ReadState.PeekHeader */;
                this._state.readLen = 2 /* Constants.MinHeaderByteSize */;
                this._state.mask = 0;
                if (this._state.opcode <= 0x02 /* Continuation frame or Text frame or binary frame */) {
                    this._flowManager.acceptFrame(body, this._state.compressed, !!this._state.fin);
                }
                else if (this._state.opcode === 0x09 /* Ping frame */) {
                    // Ping frames could be send by some browsers e.g. Firefox
                    this._flowManager.writeMessage(body, { compressed: false, opcode: 0x0A /* Pong frame */ });
                }
            }
        }
    }
    async drain() {
        this.traceSocketEvent("webSocketNodeSocketDrainBegin" /* SocketDiagnosticsEventType.WebSocketNodeSocketDrainBegin */);
        if (this._flowManager.isProcessingWriteQueue()) {
            await Event.toPromise(this._flowManager.onDidFinishProcessingWriteQueue);
        }
        await this.socket.drain();
        this.traceSocketEvent("webSocketNodeSocketDrainEnd" /* SocketDiagnosticsEventType.WebSocketNodeSocketDrainEnd */);
    }
}
class WebSocketFlowManager extends Disposable {
    get permessageDeflate() {
        return Boolean(this._zlibInflateStream && this._zlibDeflateStream);
    }
    get recordedInflateBytes() {
        if (this._zlibInflateStream) {
            return this._zlibInflateStream.recordedInflateBytes;
        }
        return VSBuffer.alloc(0);
    }
    constructor(_tracer, permessageDeflate, inflateBytes, recordInflateBytes, _onData, _writeFn) {
        super();
        this._tracer = _tracer;
        this._onData = _onData;
        this._writeFn = _writeFn;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this._writeQueue = [];
        this._readQueue = [];
        this._onDidFinishProcessingReadQueue = this._register(new Emitter());
        this.onDidFinishProcessingReadQueue = this._onDidFinishProcessingReadQueue.event;
        this._onDidFinishProcessingWriteQueue = this._register(new Emitter());
        this.onDidFinishProcessingWriteQueue = this._onDidFinishProcessingWriteQueue.event;
        this._isProcessingWriteQueue = false;
        this._isProcessingReadQueue = false;
        if (permessageDeflate) {
            // See https://tools.ietf.org/html/rfc7692#page-16
            // To simplify our logic, we don't negotiate the window size
            // and simply dedicate (2^15) / 32kb per web socket
            this._zlibInflateStream = this._register(new ZlibInflateStream(this._tracer, recordInflateBytes, inflateBytes, { windowBits: 15 }));
            this._zlibDeflateStream = this._register(new ZlibDeflateStream(this._tracer, { windowBits: 15 }));
            this._register(this._zlibInflateStream.onError((err) => this._onError.fire(err)));
            this._register(this._zlibDeflateStream.onError((err) => this._onError.fire(err)));
        }
        else {
            this._zlibInflateStream = null;
            this._zlibDeflateStream = null;
        }
    }
    writeMessage(data, options) {
        this._writeQueue.push({ data, options });
        this._processWriteQueue();
    }
    async _processWriteQueue() {
        if (this._isProcessingWriteQueue) {
            return;
        }
        this._isProcessingWriteQueue = true;
        while (this._writeQueue.length > 0) {
            const { data, options } = this._writeQueue.shift();
            if (this._zlibDeflateStream && options.compressed) {
                const compressedData = await this._deflateMessage(this._zlibDeflateStream, data);
                this._writeFn(compressedData, options);
            }
            else {
                this._writeFn(data, { ...options, compressed: false });
            }
        }
        this._isProcessingWriteQueue = false;
        this._onDidFinishProcessingWriteQueue.fire();
    }
    isProcessingWriteQueue() {
        return (this._isProcessingWriteQueue);
    }
    /**
     * Subsequent calls should wait for the previous `_deflateBuffer` call to complete.
     */
    _deflateMessage(zlibDeflateStream, buffer) {
        return new Promise((resolve, reject) => {
            zlibDeflateStream.write(buffer);
            zlibDeflateStream.flush(data => resolve(data));
        });
    }
    acceptFrame(data, isCompressed, isLastFrameOfMessage) {
        this._readQueue.push({ data, isCompressed, isLastFrameOfMessage });
        this._processReadQueue();
    }
    async _processReadQueue() {
        if (this._isProcessingReadQueue) {
            return;
        }
        this._isProcessingReadQueue = true;
        while (this._readQueue.length > 0) {
            const frameInfo = this._readQueue.shift();
            if (this._zlibInflateStream && frameInfo.isCompressed) {
                // See https://datatracker.ietf.org/doc/html/rfc7692#section-9.2
                // Even if permessageDeflate is negotiated, it is possible
                // that the other side might decide to send uncompressed messages
                // So only decompress messages that have the RSV 1 bit set
                const data = await this._inflateFrame(this._zlibInflateStream, frameInfo.data, frameInfo.isLastFrameOfMessage);
                this._onData.fire(data);
            }
            else {
                this._onData.fire(frameInfo.data);
            }
        }
        this._isProcessingReadQueue = false;
        this._onDidFinishProcessingReadQueue.fire();
    }
    isProcessingReadQueue() {
        return (this._isProcessingReadQueue);
    }
    /**
     * Subsequent calls should wait for the previous `transformRead` call to complete.
     */
    _inflateFrame(zlibInflateStream, buffer, isLastFrameOfMessage) {
        return new Promise((resolve, reject) => {
            // See https://tools.ietf.org/html/rfc7692#section-7.2.2
            zlibInflateStream.write(buffer);
            if (isLastFrameOfMessage) {
                zlibInflateStream.write(VSBuffer.fromByteArray([0x00, 0x00, 0xff, 0xff]));
            }
            zlibInflateStream.flush(data => resolve(data));
        });
    }
}
class ZlibInflateStream extends Disposable {
    get recordedInflateBytes() {
        if (this._recordInflateBytes) {
            return VSBuffer.concat(this._recordedInflateBytes);
        }
        return VSBuffer.alloc(0);
    }
    constructor(_tracer, _recordInflateBytes, inflateBytes, options) {
        super();
        this._tracer = _tracer;
        this._recordInflateBytes = _recordInflateBytes;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this._recordedInflateBytes = [];
        this._pendingInflateData = [];
        this._zlibInflate = createInflateRaw(options);
        this._zlibInflate.on('error', (err) => {
            this._tracer.traceSocketEvent("zlibInflateError" /* SocketDiagnosticsEventType.zlibInflateError */, { message: err?.message, code: err?.code });
            this._onError.fire(err);
        });
        this._zlibInflate.on('data', (data) => {
            this._tracer.traceSocketEvent("zlibInflateData" /* SocketDiagnosticsEventType.zlibInflateData */, data);
            this._pendingInflateData.push(VSBuffer.wrap(data));
        });
        if (inflateBytes) {
            this._tracer.traceSocketEvent("zlibInflateInitialWrite" /* SocketDiagnosticsEventType.zlibInflateInitialWrite */, inflateBytes.buffer);
            this._zlibInflate.write(inflateBytes.buffer);
            this._zlibInflate.flush(() => {
                this._tracer.traceSocketEvent("zlibInflateInitialFlushFired" /* SocketDiagnosticsEventType.zlibInflateInitialFlushFired */);
                this._pendingInflateData.length = 0;
            });
        }
    }
    write(buffer) {
        if (this._recordInflateBytes) {
            this._recordedInflateBytes.push(buffer.clone());
        }
        this._tracer.traceSocketEvent("zlibInflateWrite" /* SocketDiagnosticsEventType.zlibInflateWrite */, buffer);
        this._zlibInflate.write(buffer.buffer);
    }
    flush(callback) {
        this._zlibInflate.flush(() => {
            this._tracer.traceSocketEvent("zlibInflateFlushFired" /* SocketDiagnosticsEventType.zlibInflateFlushFired */);
            const data = VSBuffer.concat(this._pendingInflateData);
            this._pendingInflateData.length = 0;
            callback(data);
        });
    }
}
class ZlibDeflateStream extends Disposable {
    constructor(_tracer, options) {
        super();
        this._tracer = _tracer;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this._pendingDeflateData = [];
        this._zlibDeflate = createDeflateRaw({
            windowBits: 15
        });
        this._zlibDeflate.on('error', (err) => {
            this._tracer.traceSocketEvent("zlibDeflateError" /* SocketDiagnosticsEventType.zlibDeflateError */, { message: err?.message, code: err?.code });
            this._onError.fire(err);
        });
        this._zlibDeflate.on('data', (data) => {
            this._tracer.traceSocketEvent("zlibDeflateData" /* SocketDiagnosticsEventType.zlibDeflateData */, data);
            this._pendingDeflateData.push(VSBuffer.wrap(data));
        });
    }
    write(buffer) {
        this._tracer.traceSocketEvent("zlibDeflateWrite" /* SocketDiagnosticsEventType.zlibDeflateWrite */, buffer.buffer);
        this._zlibDeflate.write(buffer.buffer);
    }
    flush(callback) {
        // See https://zlib.net/manual.html#Constants
        this._zlibDeflate.flush(/*Z_SYNC_FLUSH*/ 2, () => {
            this._tracer.traceSocketEvent("zlibDeflateFlushFired" /* SocketDiagnosticsEventType.zlibDeflateFlushFired */);
            let data = VSBuffer.concat(this._pendingDeflateData);
            this._pendingDeflateData.length = 0;
            // See https://tools.ietf.org/html/rfc7692#section-7.2.1
            data = data.slice(0, data.byteLength - 4);
            callback(data);
        });
    }
}
function unmask(buffer, mask) {
    if (mask === 0) {
        return;
    }
    const cnt = buffer.byteLength >>> 2;
    for (let i = 0; i < cnt; i++) {
        const v = buffer.readUInt32BE(i * 4);
        buffer.writeUInt32BE(v ^ mask, i * 4);
    }
    const offset = cnt * 4;
    const bytesLeft = buffer.byteLength - offset;
    const m3 = (mask >>> 24) & 0b11111111;
    const m2 = (mask >>> 16) & 0b11111111;
    const m1 = (mask >>> 8) & 0b11111111;
    if (bytesLeft >= 1) {
        buffer.writeUInt8(buffer.readUInt8(offset) ^ m3, offset);
    }
    if (bytesLeft >= 2) {
        buffer.writeUInt8(buffer.readUInt8(offset + 1) ^ m2, offset + 1);
    }
    if (bytesLeft >= 3) {
        buffer.writeUInt8(buffer.readUInt8(offset + 2) ^ m1, offset + 2);
    }
}
// Read this before there's any chance it is overwritten
// Related to https://github.com/microsoft/vscode/issues/30624
export const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
const safeIpcPathLengths = {
    [2 /* Platform.Linux */]: 107,
    [1 /* Platform.Mac */]: 103
};
export function createRandomIPCHandle() {
    const randomSuffix = generateUuid();
    // Windows: use named pipe
    if (process.platform === 'win32') {
        return `\\\\.\\pipe\\vscode-ipc-${randomSuffix}-sock`;
    }
    // Mac & Unix: Use socket file
    // Unix: Prefer XDG_RUNTIME_DIR over user data path
    const basePath = process.platform !== 'darwin' && XDG_RUNTIME_DIR ? XDG_RUNTIME_DIR : tmpdir();
    const result = join(basePath, `vscode-ipc-${randomSuffix}.sock`);
    // Validate length
    validateIPCHandleLength(result);
    return result;
}
export function createStaticIPCHandle(directoryPath, type, version) {
    const scope = createHash('sha256').update(directoryPath).digest('hex');
    const scopeForSocket = scope.substr(0, 8);
    // Windows: use named pipe
    if (process.platform === 'win32') {
        return `\\\\.\\pipe\\${scopeForSocket}-${version}-${type}-sock`;
    }
    // Mac & Unix: Use socket file
    // Unix: Prefer XDG_RUNTIME_DIR over user data path, unless portable
    // Trim the version and type values for the socket to prevent too large
    // file names causing issues: https://unix.stackexchange.com/q/367008
    const versionForSocket = version.substr(0, 4);
    const typeForSocket = type.substr(0, 6);
    let result;
    if (process.platform !== 'darwin' && XDG_RUNTIME_DIR && !process.env['VSCODE_PORTABLE']) {
        result = join(XDG_RUNTIME_DIR, `vscode-${scopeForSocket}-${versionForSocket}-${typeForSocket}.sock`);
    }
    else {
        result = join(directoryPath, `${versionForSocket}-${typeForSocket}.sock`);
    }
    // Validate length
    validateIPCHandleLength(result);
    return result;
}
function validateIPCHandleLength(handle) {
    const limit = safeIpcPathLengths[platform];
    if (typeof limit === 'number' && handle.length >= limit) {
        // https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections
        console.warn(`WARNING: IPC handle "${handle}" is longer than ${limit} chars, try a shorter --user-data-dir`);
    }
}
export class Server extends IPCServer {
    static toClientConnectionEvent(server) {
        const onConnection = Event.fromNodeEventEmitter(server, 'connection');
        return Event.map(onConnection, socket => ({
            protocol: new Protocol(new NodeSocket(socket, 'ipc-server-connection')),
            onDidClientDisconnect: Event.once(Event.fromNodeEventEmitter(socket, 'close'))
        }));
    }
    constructor(server) {
        super(Server.toClientConnectionEvent(server));
        this.server = server;
    }
    dispose() {
        super.dispose();
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }
}
export function serve(hook) {
    return new Promise((c, e) => {
        const server = createServer();
        server.on('error', e);
        server.listen(hook, () => {
            server.removeListener('error', e);
            c(new Server(server));
        });
    });
}
export function connect(hook, clientId) {
    return new Promise((c, e) => {
        const socket = createConnection(hook, () => {
            socket.removeListener('error', e);
            c(Client.fromSocket(new NodeSocket(socket, `ipc-client${clientId}`), clientId));
        });
        socket.once('error', e);
    });
}
