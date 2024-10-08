/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createCancelablePromise, promiseWithResolvers } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { CancellationToken, CancellationTokenSource } from '../../../base/common/cancellation.js';
import { isCancellationError, onUnexpectedError } from '../../../base/common/errors.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { RemoteAuthorities } from '../../../base/common/network.js';
import * as performance from '../../../base/common/performance.js';
import { StopWatch } from '../../../base/common/stopwatch.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { Client, PersistentProtocol } from '../../../base/parts/ipc/common/ipc.net.js';
import { RemoteAuthorityResolverError } from './remoteAuthorityResolver.js';
const RECONNECT_TIMEOUT = 30 * 1000 /* 30s */;
function connectionTypeToString(connectionType) {
    switch (connectionType) {
        case 1 /* ConnectionType.Management */:
            return 'Management';
        case 2 /* ConnectionType.ExtensionHost */:
            return 'ExtensionHost';
        case 3 /* ConnectionType.Tunnel */:
            return 'Tunnel';
    }
}
function createTimeoutCancellation(millis) {
    const source = new CancellationTokenSource();
    setTimeout(() => source.cancel(), millis);
    return source.token;
}
function combineTimeoutCancellation(a, b) {
    if (a.isCancellationRequested || b.isCancellationRequested) {
        return CancellationToken.Cancelled;
    }
    const source = new CancellationTokenSource();
    a.onCancellationRequested(() => source.cancel());
    b.onCancellationRequested(() => source.cancel());
    return source.token;
}
class PromiseWithTimeout {
    get didTimeout() {
        return (this._state === 'timedout');
    }
    constructor(timeoutCancellationToken) {
        this._state = 'pending';
        this._disposables = new DisposableStore();
        ({ promise: this.promise, resolve: this._resolvePromise, reject: this._rejectPromise } = promiseWithResolvers());
        if (timeoutCancellationToken.isCancellationRequested) {
            this._timeout();
        }
        else {
            this._disposables.add(timeoutCancellationToken.onCancellationRequested(() => this._timeout()));
        }
    }
    registerDisposable(disposable) {
        if (this._state === 'pending') {
            this._disposables.add(disposable);
        }
        else {
            disposable.dispose();
        }
    }
    _timeout() {
        if (this._state !== 'pending') {
            return;
        }
        this._disposables.dispose();
        this._state = 'timedout';
        this._rejectPromise(this._createTimeoutError());
    }
    _createTimeoutError() {
        const err = new Error('Time limit reached');
        err.code = 'ETIMEDOUT';
        err.syscall = 'connect';
        return err;
    }
    resolve(value) {
        if (this._state !== 'pending') {
            return;
        }
        this._disposables.dispose();
        this._state = 'resolved';
        this._resolvePromise(value);
    }
    reject(err) {
        if (this._state !== 'pending') {
            return;
        }
        this._disposables.dispose();
        this._state = 'rejected';
        this._rejectPromise(err);
    }
}
function readOneControlMessage(protocol, timeoutCancellationToken) {
    const result = new PromiseWithTimeout(timeoutCancellationToken);
    result.registerDisposable(protocol.onControlMessage(raw => {
        const msg = JSON.parse(raw.toString());
        const error = getErrorFromMessage(msg);
        if (error) {
            result.reject(error);
        }
        else {
            result.resolve(msg);
        }
    }));
    return result.promise;
}
function createSocket(logService, remoteSocketFactoryService, connectTo, path, query, debugConnectionType, debugLabel, timeoutCancellationToken) {
    const result = new PromiseWithTimeout(timeoutCancellationToken);
    const sw = StopWatch.create(false);
    logService.info(`Creating a socket (${debugLabel})...`);
    performance.mark(`code/willCreateSocket/${debugConnectionType}`);
    remoteSocketFactoryService.connect(connectTo, path, query, debugLabel).then((socket) => {
        if (result.didTimeout) {
            performance.mark(`code/didCreateSocketError/${debugConnectionType}`);
            logService.info(`Creating a socket (${debugLabel}) finished after ${sw.elapsed()} ms, but this is too late and has timed out already.`);
            socket?.dispose();
        }
        else {
            performance.mark(`code/didCreateSocketOK/${debugConnectionType}`);
            logService.info(`Creating a socket (${debugLabel}) was successful after ${sw.elapsed()} ms.`);
            result.resolve(socket);
        }
    }, (err) => {
        performance.mark(`code/didCreateSocketError/${debugConnectionType}`);
        logService.info(`Creating a socket (${debugLabel}) returned an error after ${sw.elapsed()} ms.`);
        logService.error(err);
        result.reject(err);
    });
    return result.promise;
}
function raceWithTimeoutCancellation(promise, timeoutCancellationToken) {
    const result = new PromiseWithTimeout(timeoutCancellationToken);
    promise.then((res) => {
        if (!result.didTimeout) {
            result.resolve(res);
        }
    }, (err) => {
        if (!result.didTimeout) {
            result.reject(err);
        }
    });
    return result.promise;
}
async function connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken) {
    const logPrefix = connectLogPrefix(options, connectionType);
    options.logService.trace(`${logPrefix} 1/6. invoking socketFactory.connect().`);
    let socket;
    try {
        socket = await createSocket(options.logService, options.remoteSocketFactoryService, options.connectTo, RemoteAuthorities.getServerRootPath(), `reconnectionToken=${options.reconnectionToken}&reconnection=${options.reconnectionProtocol ? 'true' : 'false'}`, connectionTypeToString(connectionType), `renderer-${connectionTypeToString(connectionType)}-${options.reconnectionToken}`, timeoutCancellationToken);
    }
    catch (error) {
        options.logService.error(`${logPrefix} socketFactory.connect() failed or timed out. Error:`);
        options.logService.error(error);
        throw error;
    }
    options.logService.trace(`${logPrefix} 2/6. socketFactory.connect() was successful.`);
    let protocol;
    let ownsProtocol;
    if (options.reconnectionProtocol) {
        options.reconnectionProtocol.beginAcceptReconnection(socket, null);
        protocol = options.reconnectionProtocol;
        ownsProtocol = false;
    }
    else {
        protocol = new PersistentProtocol({ socket });
        ownsProtocol = true;
    }
    options.logService.trace(`${logPrefix} 3/6. sending AuthRequest control message.`);
    const message = await raceWithTimeoutCancellation(options.signService.createNewMessage(generateUuid()), timeoutCancellationToken);
    const authRequest = {
        type: 'auth',
        auth: options.connectionToken || '00000000000000000000',
        data: message.data
    };
    protocol.sendControl(VSBuffer.fromString(JSON.stringify(authRequest)));
    try {
        const msg = await readOneControlMessage(protocol, combineTimeoutCancellation(timeoutCancellationToken, createTimeoutCancellation(10000)));
        if (msg.type !== 'sign' || typeof msg.data !== 'string') {
            const error = new Error('Unexpected handshake message');
            error.code = 'VSCODE_CONNECTION_ERROR';
            throw error;
        }
        options.logService.trace(`${logPrefix} 4/6. received SignRequest control message.`);
        const isValid = await raceWithTimeoutCancellation(options.signService.validate(message, msg.signedData), timeoutCancellationToken);
        if (!isValid) {
            const error = new Error('Refused to connect to unsupported server');
            error.code = 'VSCODE_CONNECTION_ERROR';
            throw error;
        }
        const signed = await raceWithTimeoutCancellation(options.signService.sign(msg.data), timeoutCancellationToken);
        const connTypeRequest = {
            type: 'connectionType',
            commit: options.commit,
            signedData: signed,
            desiredConnectionType: connectionType
        };
        if (args) {
            connTypeRequest.args = args;
        }
        options.logService.trace(`${logPrefix} 5/6. sending ConnectionTypeRequest control message.`);
        protocol.sendControl(VSBuffer.fromString(JSON.stringify(connTypeRequest)));
        return { protocol, ownsProtocol };
    }
    catch (error) {
        if (error && error.code === 'ETIMEDOUT') {
            options.logService.error(`${logPrefix} the handshake timed out. Error:`);
            options.logService.error(error);
        }
        if (error && error.code === 'VSCODE_CONNECTION_ERROR') {
            options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
            options.logService.error(error);
        }
        if (ownsProtocol) {
            safeDisposeProtocolAndSocket(protocol);
        }
        throw error;
    }
}
async function connectToRemoteExtensionHostAgentAndReadOneMessage(options, connectionType, args, timeoutCancellationToken) {
    const startTime = Date.now();
    const logPrefix = connectLogPrefix(options, connectionType);
    const { protocol, ownsProtocol } = await connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken);
    const result = new PromiseWithTimeout(timeoutCancellationToken);
    result.registerDisposable(protocol.onControlMessage(raw => {
        const msg = JSON.parse(raw.toString());
        const error = getErrorFromMessage(msg);
        if (error) {
            options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
            options.logService.error(error);
            if (ownsProtocol) {
                safeDisposeProtocolAndSocket(protocol);
            }
            result.reject(error);
        }
        else {
            options.reconnectionProtocol?.endAcceptReconnection();
            options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
            result.resolve({ protocol, firstMessage: msg });
        }
    }));
    return result.promise;
}
async function doConnectRemoteAgentManagement(options, timeoutCancellationToken) {
    const { protocol } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 1 /* ConnectionType.Management */, undefined, timeoutCancellationToken);
    return { protocol };
}
async function doConnectRemoteAgentExtensionHost(options, startArguments, timeoutCancellationToken) {
    const { protocol, firstMessage } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 2 /* ConnectionType.ExtensionHost */, startArguments, timeoutCancellationToken);
    const debugPort = firstMessage && firstMessage.debugPort;
    return { protocol, debugPort };
}
async function doConnectRemoteAgentTunnel(options, startParams, timeoutCancellationToken) {
    const startTime = Date.now();
    const logPrefix = connectLogPrefix(options, 3 /* ConnectionType.Tunnel */);
    const { protocol } = await connectToRemoteExtensionHostAgent(options, 3 /* ConnectionType.Tunnel */, startParams, timeoutCancellationToken);
    options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
    return protocol;
}
async function resolveConnectionOptions(options, reconnectionToken, reconnectionProtocol) {
    const { connectTo, connectionToken } = await options.addressProvider.getAddress();
    return {
        commit: options.commit,
        quality: options.quality,
        connectTo,
        connectionToken: connectionToken,
        reconnectionToken: reconnectionToken,
        reconnectionProtocol: reconnectionProtocol,
        remoteSocketFactoryService: options.remoteSocketFactoryService,
        signService: options.signService,
        logService: options.logService
    };
}
export async function connectRemoteAgentManagement(options, remoteAuthority, clientId) {
    return createInitialConnection(options, async (simpleOptions) => {
        const { protocol } = await doConnectRemoteAgentManagement(simpleOptions, CancellationToken.None);
        return new ManagementPersistentConnection(options, remoteAuthority, clientId, simpleOptions.reconnectionToken, protocol);
    });
}
export async function connectRemoteAgentExtensionHost(options, startArguments) {
    return createInitialConnection(options, async (simpleOptions) => {
        const { protocol, debugPort } = await doConnectRemoteAgentExtensionHost(simpleOptions, startArguments, CancellationToken.None);
        return new ExtensionHostPersistentConnection(options, startArguments, simpleOptions.reconnectionToken, protocol, debugPort);
    });
}
/**
 * Will attempt to connect 5 times. If it fails 5 consecutive times, it will give up.
 */
async function createInitialConnection(options, connectionFactory) {
    const MAX_ATTEMPTS = 5;
    for (let attempt = 1;; attempt++) {
        try {
            const reconnectionToken = generateUuid();
            const simpleOptions = await resolveConnectionOptions(options, reconnectionToken, null);
            const result = await connectionFactory(simpleOptions);
            return result;
        }
        catch (err) {
            if (attempt < MAX_ATTEMPTS) {
                options.logService.error(`[remote-connection][attempt ${attempt}] An error occurred in initial connection! Will retry... Error:`);
                options.logService.error(err);
            }
            else {
                options.logService.error(`[remote-connection][attempt ${attempt}]  An error occurred in initial connection! It will be treated as a permanent error. Error:`);
                options.logService.error(err);
                PersistentConnection.triggerPermanentFailure(0, 0, RemoteAuthorityResolverError.isHandled(err));
                throw err;
            }
        }
    }
}
export async function connectRemoteAgentTunnel(options, tunnelRemoteHost, tunnelRemotePort) {
    const simpleOptions = await resolveConnectionOptions(options, generateUuid(), null);
    const protocol = await doConnectRemoteAgentTunnel(simpleOptions, { host: tunnelRemoteHost, port: tunnelRemotePort }, CancellationToken.None);
    return protocol;
}
function sleep(seconds) {
    return createCancelablePromise(token => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, seconds * 1000);
            token.onCancellationRequested(() => {
                clearTimeout(timeout);
                resolve();
            });
        });
    });
}
export class ConnectionLostEvent {
    constructor(reconnectionToken, millisSinceLastIncomingData) {
        this.reconnectionToken = reconnectionToken;
        this.millisSinceLastIncomingData = millisSinceLastIncomingData;
        this.type = 0 /* PersistentConnectionEventType.ConnectionLost */;
    }
}
export class ReconnectionWaitEvent {
    constructor(reconnectionToken, millisSinceLastIncomingData, durationSeconds, cancellableTimer) {
        this.reconnectionToken = reconnectionToken;
        this.millisSinceLastIncomingData = millisSinceLastIncomingData;
        this.durationSeconds = durationSeconds;
        this.cancellableTimer = cancellableTimer;
        this.type = 1 /* PersistentConnectionEventType.ReconnectionWait */;
    }
    skipWait() {
        this.cancellableTimer.cancel();
    }
}
export class ReconnectionRunningEvent {
    constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
        this.reconnectionToken = reconnectionToken;
        this.millisSinceLastIncomingData = millisSinceLastIncomingData;
        this.attempt = attempt;
        this.type = 2 /* PersistentConnectionEventType.ReconnectionRunning */;
    }
}
export class ConnectionGainEvent {
    constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
        this.reconnectionToken = reconnectionToken;
        this.millisSinceLastIncomingData = millisSinceLastIncomingData;
        this.attempt = attempt;
        this.type = 4 /* PersistentConnectionEventType.ConnectionGain */;
    }
}
export class ReconnectionPermanentFailureEvent {
    constructor(reconnectionToken, millisSinceLastIncomingData, attempt, handled) {
        this.reconnectionToken = reconnectionToken;
        this.millisSinceLastIncomingData = millisSinceLastIncomingData;
        this.attempt = attempt;
        this.handled = handled;
        this.type = 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */;
    }
}
export class PersistentConnection extends Disposable {
    static triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
        this._permanentFailure = true;
        this._permanentFailureMillisSinceLastIncomingData = millisSinceLastIncomingData;
        this._permanentFailureAttempt = attempt;
        this._permanentFailureHandled = handled;
        this._instances.forEach(instance => instance._gotoPermanentFailure(this._permanentFailureMillisSinceLastIncomingData, this._permanentFailureAttempt, this._permanentFailureHandled));
    }
    static debugTriggerReconnection() {
        this._instances.forEach(instance => instance._beginReconnecting());
    }
    static debugPauseSocketWriting() {
        this._instances.forEach(instance => instance._pauseSocketWriting());
    }
    static { this._permanentFailure = false; }
    static { this._permanentFailureMillisSinceLastIncomingData = 0; }
    static { this._permanentFailureAttempt = 0; }
    static { this._permanentFailureHandled = false; }
    static { this._instances = []; }
    get _isPermanentFailure() {
        return this._permanentFailure || PersistentConnection._permanentFailure;
    }
    constructor(_connectionType, _options, reconnectionToken, protocol, _reconnectionFailureIsFatal) {
        super();
        this._connectionType = _connectionType;
        this._options = _options;
        this.reconnectionToken = reconnectionToken;
        this.protocol = protocol;
        this._reconnectionFailureIsFatal = _reconnectionFailureIsFatal;
        this._onDidStateChange = this._register(new Emitter());
        this.onDidStateChange = this._onDidStateChange.event;
        this._permanentFailure = false;
        this._isReconnecting = false;
        this._isDisposed = false;
        this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, 0, 0));
        this._register(protocol.onSocketClose((e) => {
            const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
            if (!e) {
                this._options.logService.info(`${logPrefix} received socket close event.`);
            }
            else if (e.type === 0 /* SocketCloseEventType.NodeSocketCloseEvent */) {
                this._options.logService.info(`${logPrefix} received socket close event (hadError: ${e.hadError}).`);
                if (e.error) {
                    this._options.logService.error(e.error);
                }
            }
            else {
                this._options.logService.info(`${logPrefix} received socket close event (wasClean: ${e.wasClean}, code: ${e.code}, reason: ${e.reason}).`);
                if (e.event) {
                    this._options.logService.error(e.event);
                }
            }
            this._beginReconnecting();
        }));
        this._register(protocol.onSocketTimeout((e) => {
            const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
            this._options.logService.info(`${logPrefix} received socket timeout event (unacknowledgedMsgCount: ${e.unacknowledgedMsgCount}, timeSinceOldestUnacknowledgedMsg: ${e.timeSinceOldestUnacknowledgedMsg}, timeSinceLastReceivedSomeData: ${e.timeSinceLastReceivedSomeData}).`);
            this._beginReconnecting();
        }));
        PersistentConnection._instances.push(this);
        this._register(toDisposable(() => {
            const myIndex = PersistentConnection._instances.indexOf(this);
            if (myIndex >= 0) {
                PersistentConnection._instances.splice(myIndex, 1);
            }
        }));
        if (this._isPermanentFailure) {
            this._gotoPermanentFailure(PersistentConnection._permanentFailureMillisSinceLastIncomingData, PersistentConnection._permanentFailureAttempt, PersistentConnection._permanentFailureHandled);
        }
    }
    dispose() {
        super.dispose();
        this._isDisposed = true;
    }
    async _beginReconnecting() {
        // Only have one reconnection loop active at a time.
        if (this._isReconnecting) {
            return;
        }
        try {
            this._isReconnecting = true;
            await this._runReconnectingLoop();
        }
        finally {
            this._isReconnecting = false;
        }
    }
    async _runReconnectingLoop() {
        if (this._isPermanentFailure || this._isDisposed) {
            // no more attempts!
            return;
        }
        const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
        this._options.logService.info(`${logPrefix} starting reconnecting loop. You can get more information with the trace log level.`);
        this._onDidStateChange.fire(new ConnectionLostEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData()));
        const TIMES = [0, 5, 5, 10, 10, 10, 10, 10, 30];
        let attempt = -1;
        do {
            attempt++;
            const waitTime = (attempt < TIMES.length ? TIMES[attempt] : TIMES[TIMES.length - 1]);
            try {
                if (waitTime > 0) {
                    const sleepPromise = sleep(waitTime);
                    this._onDidStateChange.fire(new ReconnectionWaitEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), waitTime, sleepPromise));
                    this._options.logService.info(`${logPrefix} waiting for ${waitTime} seconds before reconnecting...`);
                    try {
                        await sleepPromise;
                    }
                    catch { } // User canceled timer
                }
                if (this._isPermanentFailure) {
                    this._options.logService.error(`${logPrefix} permanent failure occurred while running the reconnecting loop.`);
                    break;
                }
                // connection was lost, let's try to re-establish it
                this._onDidStateChange.fire(new ReconnectionRunningEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                this._options.logService.info(`${logPrefix} resolving connection...`);
                const simpleOptions = await resolveConnectionOptions(this._options, this.reconnectionToken, this.protocol);
                this._options.logService.info(`${logPrefix} connecting to ${simpleOptions.connectTo}...`);
                await this._reconnect(simpleOptions, createTimeoutCancellation(RECONNECT_TIMEOUT));
                this._options.logService.info(`${logPrefix} reconnected!`);
                this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                break;
            }
            catch (err) {
                if (err.code === 'VSCODE_CONNECTION_ERROR') {
                    this._options.logService.error(`${logPrefix} A permanent error occurred in the reconnecting loop! Will give up now! Error:`);
                    this._options.logService.error(err);
                    this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                    break;
                }
                if (attempt > 360) {
                    // ReconnectionGraceTime is 3hrs, with 30s between attempts that yields a maximum of 360 attempts
                    this._options.logService.error(`${logPrefix} An error occurred while reconnecting, but it will be treated as a permanent error because the reconnection grace time has expired! Will give up now! Error:`);
                    this._options.logService.error(err);
                    this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                    break;
                }
                if (RemoteAuthorityResolverError.isTemporarilyNotAvailable(err)) {
                    this._options.logService.info(`${logPrefix} A temporarily not available error occurred while trying to reconnect, will try again...`);
                    this._options.logService.trace(err);
                    // try again!
                    continue;
                }
                if ((err.code === 'ETIMEDOUT' || err.code === 'ENETUNREACH' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') && err.syscall === 'connect') {
                    this._options.logService.info(`${logPrefix} A network error occurred while trying to reconnect, will try again...`);
                    this._options.logService.trace(err);
                    // try again!
                    continue;
                }
                if (isCancellationError(err)) {
                    this._options.logService.info(`${logPrefix} A promise cancelation error occurred while trying to reconnect, will try again...`);
                    this._options.logService.trace(err);
                    // try again!
                    continue;
                }
                if (err instanceof RemoteAuthorityResolverError) {
                    this._options.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Will give up now! Error:`);
                    this._options.logService.error(err);
                    this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, RemoteAuthorityResolverError.isHandled(err));
                    break;
                }
                this._options.logService.error(`${logPrefix} An unknown error occurred while trying to reconnect, since this is an unknown case, it will be treated as a permanent error! Will give up now! Error:`);
                this._options.logService.error(err);
                this._onReconnectionPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                break;
            }
        } while (!this._isPermanentFailure && !this._isDisposed);
    }
    _onReconnectionPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
        if (this._reconnectionFailureIsFatal) {
            PersistentConnection.triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled);
        }
        else {
            this._gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled);
        }
    }
    _gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
        this._onDidStateChange.fire(new ReconnectionPermanentFailureEvent(this.reconnectionToken, millisSinceLastIncomingData, attempt, handled));
        safeDisposeProtocolAndSocket(this.protocol);
    }
    _pauseSocketWriting() {
        this.protocol.pauseSocketWriting();
    }
}
export class ManagementPersistentConnection extends PersistentConnection {
    constructor(options, remoteAuthority, clientId, reconnectionToken, protocol) {
        super(1 /* ConnectionType.Management */, options, reconnectionToken, protocol, /*reconnectionFailureIsFatal*/ true);
        this.client = this._register(new Client(protocol, {
            remoteAuthority: remoteAuthority,
            clientId: clientId
        }, options.ipcLogger));
    }
    async _reconnect(options, timeoutCancellationToken) {
        await doConnectRemoteAgentManagement(options, timeoutCancellationToken);
    }
}
export class ExtensionHostPersistentConnection extends PersistentConnection {
    constructor(options, startArguments, reconnectionToken, protocol, debugPort) {
        super(2 /* ConnectionType.ExtensionHost */, options, reconnectionToken, protocol, /*reconnectionFailureIsFatal*/ false);
        this._startArguments = startArguments;
        this.debugPort = debugPort;
    }
    async _reconnect(options, timeoutCancellationToken) {
        await doConnectRemoteAgentExtensionHost(options, this._startArguments, timeoutCancellationToken);
    }
}
function safeDisposeProtocolAndSocket(protocol) {
    try {
        protocol.acceptDisconnect();
        const socket = protocol.getSocket();
        protocol.dispose();
        socket.dispose();
    }
    catch (err) {
        onUnexpectedError(err);
    }
}
function getErrorFromMessage(msg) {
    if (msg && msg.type === 'error') {
        const error = new Error(`Connection error: ${msg.reason}`);
        error.code = 'VSCODE_CONNECTION_ERROR';
        return error;
    }
    return null;
}
function stringRightPad(str, len) {
    while (str.length < len) {
        str += ' ';
    }
    return str;
}
function _commonLogPrefix(connectionType, reconnectionToken) {
    return `[remote-connection][${stringRightPad(connectionTypeToString(connectionType), 13)}][${reconnectionToken.substr(0, 5)}…]`;
}
function commonLogPrefix(connectionType, reconnectionToken, isReconnect) {
    return `${_commonLogPrefix(connectionType, reconnectionToken)}[${isReconnect ? 'reconnect' : 'initial'}]`;
}
function connectLogPrefix(options, connectionType) {
    return `${commonLogPrefix(connectionType, options.reconnectionToken, !!options.reconnectionProtocol)}[${options.connectTo}]`;
}
function logElapsed(startTime) {
    return `${Date.now() - startTime} ms`;
}
