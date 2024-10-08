/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from '../../../base/browser/dom.js';
import { RunOnceScheduler } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { SocketDiagnostics } from '../../../base/parts/ipc/common/ipc.net.js';
import { RemoteAuthorityResolverError, RemoteAuthorityResolverErrorCode } from '../common/remoteAuthorityResolver.js';
import { mainWindow } from '../../../base/browser/window.js';
class BrowserWebSocket extends Disposable {
    traceSocketEvent(type, data) {
        SocketDiagnostics.traceSocketEvent(this._socket, this._debugLabel, type, data);
    }
    constructor(url, debugLabel) {
        super();
        this._onData = new Emitter();
        this.onData = this._onData.event;
        this._onOpen = this._register(new Emitter());
        this.onOpen = this._onOpen.event;
        this._onClose = this._register(new Emitter());
        this.onClose = this._onClose.event;
        this._onError = this._register(new Emitter());
        this.onError = this._onError.event;
        this._debugLabel = debugLabel;
        this._socket = new WebSocket(url);
        this.traceSocketEvent("created" /* SocketDiagnosticsEventType.Created */, { type: 'BrowserWebSocket', url });
        this._fileReader = new FileReader();
        this._queue = [];
        this._isReading = false;
        this._isClosed = false;
        this._fileReader.onload = (event) => {
            this._isReading = false;
            const buff = event.target.result;
            this.traceSocketEvent("read" /* SocketDiagnosticsEventType.Read */, buff);
            this._onData.fire(buff);
            if (this._queue.length > 0) {
                enqueue(this._queue.shift());
            }
        };
        const enqueue = (blob) => {
            if (this._isReading) {
                this._queue.push(blob);
                return;
            }
            this._isReading = true;
            this._fileReader.readAsArrayBuffer(blob);
        };
        this._socketMessageListener = (ev) => {
            const blob = ev.data;
            this.traceSocketEvent("browserWebSocketBlobReceived" /* SocketDiagnosticsEventType.BrowserWebSocketBlobReceived */, { type: blob.type, size: blob.size });
            enqueue(blob);
        };
        this._socket.addEventListener('message', this._socketMessageListener);
        this._register(dom.addDisposableListener(this._socket, 'open', (e) => {
            this.traceSocketEvent("open" /* SocketDiagnosticsEventType.Open */);
            this._onOpen.fire();
        }));
        // WebSockets emit error events that do not contain any real information
        // Our only chance of getting to the root cause of an error is to
        // listen to the close event which gives out some real information:
        // - https://www.w3.org/TR/websockets/#closeevent
        // - https://tools.ietf.org/html/rfc6455#section-11.7
        //
        // But the error event is emitted before the close event, so we therefore
        // delay the error event processing in the hope of receiving a close event
        // with more information
        let pendingErrorEvent = null;
        const sendPendingErrorNow = () => {
            const err = pendingErrorEvent;
            pendingErrorEvent = null;
            this._onError.fire(err);
        };
        const errorRunner = this._register(new RunOnceScheduler(sendPendingErrorNow, 0));
        const sendErrorSoon = (err) => {
            errorRunner.cancel();
            pendingErrorEvent = err;
            errorRunner.schedule();
        };
        const sendErrorNow = (err) => {
            errorRunner.cancel();
            pendingErrorEvent = err;
            sendPendingErrorNow();
        };
        this._register(dom.addDisposableListener(this._socket, 'close', (e) => {
            this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */, { code: e.code, reason: e.reason, wasClean: e.wasClean });
            this._isClosed = true;
            if (pendingErrorEvent) {
                if (!navigator.onLine) {
                    // The browser is offline => this is a temporary error which might resolve itself
                    sendErrorNow(new RemoteAuthorityResolverError('Browser is offline', RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
                }
                else {
                    // An error event is pending
                    // The browser appears to be online...
                    if (!e.wasClean) {
                        // Let's be optimistic and hope that perhaps the server could not be reached or something
                        sendErrorNow(new RemoteAuthorityResolverError(e.reason || `WebSocket close with status code ${e.code}`, RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable, e));
                    }
                    else {
                        // this was a clean close => send existing error
                        errorRunner.cancel();
                        sendPendingErrorNow();
                    }
                }
            }
            this._onClose.fire({ code: e.code, reason: e.reason, wasClean: e.wasClean, event: e });
        }));
        this._register(dom.addDisposableListener(this._socket, 'error', (err) => {
            this.traceSocketEvent("error" /* SocketDiagnosticsEventType.Error */, { message: err?.message });
            sendErrorSoon(err);
        }));
    }
    send(data) {
        if (this._isClosed) {
            // Refuse to write data to closed WebSocket...
            return;
        }
        this.traceSocketEvent("write" /* SocketDiagnosticsEventType.Write */, data);
        this._socket.send(data);
    }
    close() {
        this._isClosed = true;
        this.traceSocketEvent("close" /* SocketDiagnosticsEventType.Close */);
        this._socket.close();
        this._socket.removeEventListener('message', this._socketMessageListener);
        this.dispose();
    }
}
const defaultWebSocketFactory = new class {
    create(url, debugLabel) {
        return new BrowserWebSocket(url, debugLabel);
    }
};
class BrowserSocket {
    traceSocketEvent(type, data) {
        if (typeof this.socket.traceSocketEvent === 'function') {
            this.socket.traceSocketEvent(type, data);
        }
        else {
            SocketDiagnostics.traceSocketEvent(this.socket, this.debugLabel, type, data);
        }
    }
    constructor(socket, debugLabel) {
        this.socket = socket;
        this.debugLabel = debugLabel;
    }
    dispose() {
        this.socket.close();
    }
    onData(listener) {
        return this.socket.onData((data) => listener(VSBuffer.wrap(new Uint8Array(data))));
    }
    onClose(listener) {
        const adapter = (e) => {
            if (typeof e === 'undefined') {
                listener(e);
            }
            else {
                listener({
                    type: 1 /* SocketCloseEventType.WebSocketCloseEvent */,
                    code: e.code,
                    reason: e.reason,
                    wasClean: e.wasClean,
                    event: e.event
                });
            }
        };
        return this.socket.onClose(adapter);
    }
    onEnd(listener) {
        return Disposable.None;
    }
    write(buffer) {
        this.socket.send(buffer.buffer);
    }
    end() {
        this.socket.close();
    }
    drain() {
        return Promise.resolve();
    }
}
export class BrowserSocketFactory {
    constructor(webSocketFactory) {
        this._webSocketFactory = webSocketFactory || defaultWebSocketFactory;
    }
    supports(connectTo) {
        return true;
    }
    connect({ host, port }, path, query, debugLabel) {
        return new Promise((resolve, reject) => {
            const webSocketSchema = (/^https:/.test(mainWindow.location.href) ? 'wss' : 'ws');
            const socket = this._webSocketFactory.create(`${webSocketSchema}://${(/:/.test(host) && !/\[/.test(host)) ? `[${host}]` : host}:${port}${path}?${query}&skipWebSocketFrames=false`, debugLabel);
            const errorListener = socket.onError(reject);
            socket.onOpen(() => {
                errorListener.dispose();
                resolve(new BrowserSocket(socket, debugLabel));
            });
        });
    }
}
