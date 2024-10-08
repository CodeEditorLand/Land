/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * The extension host will connect via named pipe / domain socket to its renderer.
 */
export class IPCExtHostConnection {
    static { this.ENV_KEY = 'VSCODE_EXTHOST_IPC_HOOK'; }
    constructor(pipeName) {
        this.pipeName = pipeName;
        this.type = 1 /* ExtHostConnectionType.IPC */;
    }
    serialize(env) {
        env[IPCExtHostConnection.ENV_KEY] = this.pipeName;
    }
}
/**
 * The extension host will receive via nodejs IPC the socket to its renderer.
 */
export class SocketExtHostConnection {
    constructor() {
        this.type = 2 /* ExtHostConnectionType.Socket */;
    }
    static { this.ENV_KEY = 'VSCODE_EXTHOST_WILL_SEND_SOCKET'; }
    serialize(env) {
        env[SocketExtHostConnection.ENV_KEY] = '1';
    }
}
/**
 * The extension host will receive via nodejs IPC the MessagePort to its renderer.
 */
export class MessagePortExtHostConnection {
    constructor() {
        this.type = 3 /* ExtHostConnectionType.MessagePort */;
    }
    static { this.ENV_KEY = 'VSCODE_WILL_SEND_MESSAGE_PORT'; }
    serialize(env) {
        env[MessagePortExtHostConnection.ENV_KEY] = '1';
    }
}
function clean(env) {
    delete env[IPCExtHostConnection.ENV_KEY];
    delete env[SocketExtHostConnection.ENV_KEY];
    delete env[MessagePortExtHostConnection.ENV_KEY];
}
/**
 * Write `connection` into `env` and clean up `env`.
 */
export function writeExtHostConnection(connection, env) {
    // Avoid having two different keys that might introduce amiguity or problems.
    clean(env);
    connection.serialize(env);
}
/**
 * Read `connection` from `env` and clean up `env`.
 */
export function readExtHostConnection(env) {
    if (env[IPCExtHostConnection.ENV_KEY]) {
        return cleanAndReturn(env, new IPCExtHostConnection(env[IPCExtHostConnection.ENV_KEY]));
    }
    if (env[SocketExtHostConnection.ENV_KEY]) {
        return cleanAndReturn(env, new SocketExtHostConnection());
    }
    if (env[MessagePortExtHostConnection.ENV_KEY]) {
        return cleanAndReturn(env, new MessagePortExtHostConnection());
    }
    throw new Error(`No connection information defined in environment!`);
}
function cleanAndReturn(env, result) {
    clean(env);
    return result;
}
