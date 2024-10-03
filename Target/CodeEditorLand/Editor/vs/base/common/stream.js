import { onUnexpectedError } from './errors.js';
import { DisposableStore, toDisposable } from './lifecycle.js';
export function isReadable(obj) {
    const candidate = obj;
    if (!candidate) {
        return false;
    }
    return typeof candidate.read === 'function';
}
export function isReadableStream(obj) {
    const candidate = obj;
    if (!candidate) {
        return false;
    }
    return [candidate.on, candidate.pause, candidate.resume, candidate.destroy].every(fn => typeof fn === 'function');
}
export function isReadableBufferedStream(obj) {
    const candidate = obj;
    if (!candidate) {
        return false;
    }
    return isReadableStream(candidate.stream) && Array.isArray(candidate.buffer) && typeof candidate.ended === 'boolean';
}
export function newWriteableStream(reducer, options) {
    return new WriteableStreamImpl(reducer, options);
}
class WriteableStreamImpl {
    constructor(reducer, options) {
        this.reducer = reducer;
        this.options = options;
        this.state = {
            flowing: false,
            ended: false,
            destroyed: false
        };
        this.buffer = {
            data: [],
            error: []
        };
        this.listeners = {
            data: [],
            error: [],
            end: []
        };
        this.pendingWritePromises = [];
    }
    pause() {
        if (this.state.destroyed) {
            return;
        }
        this.state.flowing = false;
    }
    resume() {
        if (this.state.destroyed) {
            return;
        }
        if (!this.state.flowing) {
            this.state.flowing = true;
            this.flowData();
            this.flowErrors();
            this.flowEnd();
        }
    }
    write(data) {
        if (this.state.destroyed) {
            return;
        }
        if (this.state.flowing) {
            this.emitData(data);
        }
        else {
            this.buffer.data.push(data);
            if (typeof this.options?.highWaterMark === 'number' && this.buffer.data.length > this.options.highWaterMark) {
                return new Promise(resolve => this.pendingWritePromises.push(resolve));
            }
        }
    }
    error(error) {
        if (this.state.destroyed) {
            return;
        }
        if (this.state.flowing) {
            this.emitError(error);
        }
        else {
            this.buffer.error.push(error);
        }
    }
    end(result) {
        if (this.state.destroyed) {
            return;
        }
        if (typeof result !== 'undefined') {
            this.write(result);
        }
        if (this.state.flowing) {
            this.emitEnd();
            this.destroy();
        }
        else {
            this.state.ended = true;
        }
    }
    emitData(data) {
        this.listeners.data.slice(0).forEach(listener => listener(data));
    }
    emitError(error) {
        if (this.listeners.error.length === 0) {
            onUnexpectedError(error);
        }
        else {
            this.listeners.error.slice(0).forEach(listener => listener(error));
        }
    }
    emitEnd() {
        this.listeners.end.slice(0).forEach(listener => listener());
    }
    on(event, callback) {
        if (this.state.destroyed) {
            return;
        }
        switch (event) {
            case 'data':
                this.listeners.data.push(callback);
                this.resume();
                break;
            case 'end':
                this.listeners.end.push(callback);
                if (this.state.flowing && this.flowEnd()) {
                    this.destroy();
                }
                break;
            case 'error':
                this.listeners.error.push(callback);
                if (this.state.flowing) {
                    this.flowErrors();
                }
                break;
        }
    }
    removeListener(event, callback) {
        if (this.state.destroyed) {
            return;
        }
        let listeners = undefined;
        switch (event) {
            case 'data':
                listeners = this.listeners.data;
                break;
            case 'end':
                listeners = this.listeners.end;
                break;
            case 'error':
                listeners = this.listeners.error;
                break;
        }
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        }
    }
    flowData() {
        if (this.buffer.data.length > 0) {
            const fullDataBuffer = this.reducer(this.buffer.data);
            this.emitData(fullDataBuffer);
            this.buffer.data.length = 0;
            const pendingWritePromises = [...this.pendingWritePromises];
            this.pendingWritePromises.length = 0;
            pendingWritePromises.forEach(pendingWritePromise => pendingWritePromise());
        }
    }
    flowErrors() {
        if (this.listeners.error.length > 0) {
            for (const error of this.buffer.error) {
                this.emitError(error);
            }
            this.buffer.error.length = 0;
        }
    }
    flowEnd() {
        if (this.state.ended) {
            this.emitEnd();
            return this.listeners.end.length > 0;
        }
        return false;
    }
    destroy() {
        if (!this.state.destroyed) {
            this.state.destroyed = true;
            this.state.ended = true;
            this.buffer.data.length = 0;
            this.buffer.error.length = 0;
            this.listeners.data.length = 0;
            this.listeners.error.length = 0;
            this.listeners.end.length = 0;
            this.pendingWritePromises.length = 0;
        }
    }
}
export function consumeReadable(readable, reducer) {
    const chunks = [];
    let chunk;
    while ((chunk = readable.read()) !== null) {
        chunks.push(chunk);
    }
    return reducer(chunks);
}
export function peekReadable(readable, reducer, maxChunks) {
    const chunks = [];
    let chunk = undefined;
    while ((chunk = readable.read()) !== null && chunks.length < maxChunks) {
        chunks.push(chunk);
    }
    if (chunk === null && chunks.length > 0) {
        return reducer(chunks);
    }
    return {
        read: () => {
            if (chunks.length > 0) {
                return chunks.shift();
            }
            if (typeof chunk !== 'undefined') {
                const lastReadChunk = chunk;
                chunk = undefined;
                return lastReadChunk;
            }
            return readable.read();
        }
    };
}
export function consumeStream(stream, reducer) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        listenStream(stream, {
            onData: chunk => {
                if (reducer) {
                    chunks.push(chunk);
                }
            },
            onError: error => {
                if (reducer) {
                    reject(error);
                }
                else {
                    resolve(undefined);
                }
            },
            onEnd: () => {
                if (reducer) {
                    resolve(reducer(chunks));
                }
                else {
                    resolve(undefined);
                }
            }
        });
    });
}
export function listenStream(stream, listener, token) {
    stream.on('error', error => {
        if (!token?.isCancellationRequested) {
            listener.onError(error);
        }
    });
    stream.on('end', () => {
        if (!token?.isCancellationRequested) {
            listener.onEnd();
        }
    });
    stream.on('data', data => {
        if (!token?.isCancellationRequested) {
            listener.onData(data);
        }
    });
}
export function peekStream(stream, maxChunks) {
    return new Promise((resolve, reject) => {
        const streamListeners = new DisposableStore();
        const buffer = [];
        const dataListener = (chunk) => {
            buffer.push(chunk);
            if (buffer.length > maxChunks) {
                streamListeners.dispose();
                stream.pause();
                return resolve({ stream, buffer, ended: false });
            }
        };
        const errorListener = (error) => {
            streamListeners.dispose();
            return reject(error);
        };
        const endListener = () => {
            streamListeners.dispose();
            return resolve({ stream, buffer, ended: true });
        };
        streamListeners.add(toDisposable(() => stream.removeListener('error', errorListener)));
        stream.on('error', errorListener);
        streamListeners.add(toDisposable(() => stream.removeListener('end', endListener)));
        stream.on('end', endListener);
        streamListeners.add(toDisposable(() => stream.removeListener('data', dataListener)));
        stream.on('data', dataListener);
    });
}
export function toStream(t, reducer) {
    const stream = newWriteableStream(reducer);
    stream.end(t);
    return stream;
}
export function emptyStream() {
    const stream = newWriteableStream(() => { throw new Error('not supported'); });
    stream.end();
    return stream;
}
export function toReadable(t) {
    let consumed = false;
    return {
        read: () => {
            if (consumed) {
                return null;
            }
            consumed = true;
            return t;
        }
    };
}
export function transform(stream, transformer, reducer) {
    const target = newWriteableStream(reducer);
    listenStream(stream, {
        onData: data => target.write(transformer.data(data)),
        onError: error => target.error(transformer.error ? transformer.error(error) : error),
        onEnd: () => target.end()
    });
    return target;
}
export function prefixedReadable(prefix, readable, reducer) {
    let prefixHandled = false;
    return {
        read: () => {
            const chunk = readable.read();
            if (!prefixHandled) {
                prefixHandled = true;
                if (chunk !== null) {
                    return reducer([prefix, chunk]);
                }
                return prefix;
            }
            return chunk;
        }
    };
}
export function prefixedStream(prefix, stream, reducer) {
    let prefixHandled = false;
    const target = newWriteableStream(reducer);
    listenStream(stream, {
        onData: data => {
            if (!prefixHandled) {
                prefixHandled = true;
                return target.write(reducer([prefix, data]));
            }
            return target.write(data);
        },
        onError: error => target.error(error),
        onEnd: () => {
            if (!prefixHandled) {
                prefixHandled = true;
                target.write(prefix);
            }
            target.end();
        }
    });
    return target;
}
