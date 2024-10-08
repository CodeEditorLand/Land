/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { fork } from 'child_process';
import { createCancelablePromise, Delayer } from '../../../common/async.js';
import { VSBuffer } from '../../../common/buffer.js';
import { CancellationToken } from '../../../common/cancellation.js';
import { isRemoteConsoleLog, log } from '../../../common/console.js';
import * as errors from '../../../common/errors.js';
import { Emitter, Event } from '../../../common/event.js';
import { dispose, toDisposable } from '../../../common/lifecycle.js';
import { deepClone } from '../../../common/objects.js';
import { createQueuedSender } from '../../../node/processes.js';
import { removeDangerousEnvVariables } from '../../../common/processes.js';
import { ChannelClient as IPCClient, ChannelServer as IPCServer } from '../common/ipc.js';
/**
 * This implementation doesn't perform well since it uses base64 encoding for buffers.
 * We should move all implementations to use named ipc.net, so we stop depending on cp.fork.
 */
export class Server extends IPCServer {
    constructor(ctx) {
        super({
            send: r => {
                try {
                    process.send?.(r.buffer.toString('base64'));
                }
                catch (e) { /* not much to do */ }
            },
            onMessage: Event.fromNodeEventEmitter(process, 'message', msg => VSBuffer.wrap(Buffer.from(msg, 'base64')))
        }, ctx);
        process.once('disconnect', () => this.dispose());
    }
}
export class Client {
    constructor(modulePath, options) {
        this.modulePath = modulePath;
        this.options = options;
        this.activeRequests = new Set();
        this.channels = new Map();
        this._onDidProcessExit = new Emitter();
        this.onDidProcessExit = this._onDidProcessExit.event;
        const timeout = options && options.timeout ? options.timeout : 60000;
        this.disposeDelayer = new Delayer(timeout);
        this.child = null;
        this._client = null;
    }
    getChannel(channelName) {
        const that = this;
        // eslint-disable-next-line local/code-no-dangerous-type-assertions
        return {
            call(command, arg, cancellationToken) {
                return that.requestPromise(channelName, command, arg, cancellationToken);
            },
            listen(event, arg) {
                return that.requestEvent(channelName, event, arg);
            }
        };
    }
    requestPromise(channelName, name, arg, cancellationToken = CancellationToken.None) {
        if (!this.disposeDelayer) {
            return Promise.reject(new Error('disposed'));
        }
        if (cancellationToken.isCancellationRequested) {
            return Promise.reject(errors.canceled());
        }
        this.disposeDelayer.cancel();
        const channel = this.getCachedChannel(channelName);
        const result = createCancelablePromise(token => channel.call(name, arg, token));
        const cancellationTokenListener = cancellationToken.onCancellationRequested(() => result.cancel());
        const disposable = toDisposable(() => result.cancel());
        this.activeRequests.add(disposable);
        result.finally(() => {
            cancellationTokenListener.dispose();
            this.activeRequests.delete(disposable);
            if (this.activeRequests.size === 0 && this.disposeDelayer) {
                this.disposeDelayer.trigger(() => this.disposeClient());
            }
        });
        return result;
    }
    requestEvent(channelName, name, arg) {
        if (!this.disposeDelayer) {
            return Event.None;
        }
        this.disposeDelayer.cancel();
        let listener;
        const emitter = new Emitter({
            onWillAddFirstListener: () => {
                const channel = this.getCachedChannel(channelName);
                const event = channel.listen(name, arg);
                listener = event(emitter.fire, emitter);
                this.activeRequests.add(listener);
            },
            onDidRemoveLastListener: () => {
                this.activeRequests.delete(listener);
                listener.dispose();
                if (this.activeRequests.size === 0 && this.disposeDelayer) {
                    this.disposeDelayer.trigger(() => this.disposeClient());
                }
            }
        });
        return emitter.event;
    }
    get client() {
        if (!this._client) {
            const args = this.options && this.options.args ? this.options.args : [];
            const forkOpts = Object.create(null);
            forkOpts.env = { ...deepClone(process.env), 'VSCODE_PARENT_PID': String(process.pid) };
            if (this.options && this.options.env) {
                forkOpts.env = { ...forkOpts.env, ...this.options.env };
            }
            if (this.options && this.options.freshExecArgv) {
                forkOpts.execArgv = [];
            }
            if (this.options && typeof this.options.debug === 'number') {
                forkOpts.execArgv = ['--nolazy', '--inspect=' + this.options.debug];
            }
            if (this.options && typeof this.options.debugBrk === 'number') {
                forkOpts.execArgv = ['--nolazy', '--inspect-brk=' + this.options.debugBrk];
            }
            if (forkOpts.execArgv === undefined) {
                forkOpts.execArgv = process.execArgv // if not set, the forked process inherits the execArgv of the parent process
                    .filter(a => !/^--inspect(-brk)?=/.test(a)) // --inspect and --inspect-brk can not be inherited as the port would conflict
                    .filter(a => !a.startsWith('--vscode-')); // --vscode-* arguments are unsupported by node.js and thus need to remove
            }
            removeDangerousEnvVariables(forkOpts.env);
            this.child = fork(this.modulePath, args, forkOpts);
            const onMessageEmitter = new Emitter();
            const onRawMessage = Event.fromNodeEventEmitter(this.child, 'message', msg => msg);
            const rawMessageDisposable = onRawMessage(msg => {
                // Handle remote console logs specially
                if (isRemoteConsoleLog(msg)) {
                    log(msg, `IPC Library: ${this.options.serverName}`);
                    return;
                }
                // Anything else goes to the outside
                onMessageEmitter.fire(VSBuffer.wrap(Buffer.from(msg, 'base64')));
            });
            const sender = this.options.useQueue ? createQueuedSender(this.child) : this.child;
            const send = (r) => this.child && this.child.connected && sender.send(r.buffer.toString('base64'));
            const onMessage = onMessageEmitter.event;
            const protocol = { send, onMessage };
            this._client = new IPCClient(protocol);
            const onExit = () => this.disposeClient();
            process.once('exit', onExit);
            this.child.on('error', err => console.warn('IPC "' + this.options.serverName + '" errored with ' + err));
            this.child.on('exit', (code, signal) => {
                process.removeListener('exit', onExit); // https://github.com/electron/electron/issues/21475
                rawMessageDisposable.dispose();
                this.activeRequests.forEach(r => dispose(r));
                this.activeRequests.clear();
                if (code !== 0 && signal !== 'SIGTERM') {
                    console.warn('IPC "' + this.options.serverName + '" crashed with exit code ' + code + ' and signal ' + signal);
                }
                this.disposeDelayer?.cancel();
                this.disposeClient();
                this._onDidProcessExit.fire({ code, signal });
            });
        }
        return this._client;
    }
    getCachedChannel(name) {
        let channel = this.channels.get(name);
        if (!channel) {
            channel = this.client.getChannel(name);
            this.channels.set(name, channel);
        }
        return channel;
    }
    disposeClient() {
        if (this._client) {
            if (this.child) {
                this.child.kill();
                this.child = null;
            }
            this._client = null;
            this.channels.clear();
        }
    }
    dispose() {
        this._onDidProcessExit.dispose();
        this.disposeDelayer?.cancel();
        this.disposeDelayer = undefined;
        this.disposeClient();
        this.activeRequests.clear();
    }
}
