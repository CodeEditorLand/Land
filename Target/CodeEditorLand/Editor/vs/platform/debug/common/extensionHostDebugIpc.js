/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export class ExtensionHostDebugBroadcastChannel {
    constructor() {
        this._onCloseEmitter = new Emitter();
        this._onReloadEmitter = new Emitter();
        this._onTerminateEmitter = new Emitter();
        this._onAttachEmitter = new Emitter();
    }
    static { this.ChannelName = 'extensionhostdebugservice'; }
    call(ctx, command, arg) {
        switch (command) {
            case 'close':
                return Promise.resolve(this._onCloseEmitter.fire({ sessionId: arg[0] }));
            case 'reload':
                return Promise.resolve(this._onReloadEmitter.fire({ sessionId: arg[0] }));
            case 'terminate':
                return Promise.resolve(this._onTerminateEmitter.fire({ sessionId: arg[0] }));
            case 'attach':
                return Promise.resolve(this._onAttachEmitter.fire({ sessionId: arg[0], port: arg[1], subId: arg[2] }));
        }
        throw new Error('Method not implemented.');
    }
    listen(ctx, event, arg) {
        switch (event) {
            case 'close':
                return this._onCloseEmitter.event;
            case 'reload':
                return this._onReloadEmitter.event;
            case 'terminate':
                return this._onTerminateEmitter.event;
            case 'attach':
                return this._onAttachEmitter.event;
        }
        throw new Error('Method not implemented.');
    }
}
export class ExtensionHostDebugChannelClient extends Disposable {
    constructor(channel) {
        super();
        this.channel = channel;
    }
    reload(sessionId) {
        this.channel.call('reload', [sessionId]);
    }
    get onReload() {
        return this.channel.listen('reload');
    }
    close(sessionId) {
        this.channel.call('close', [sessionId]);
    }
    get onClose() {
        return this.channel.listen('close');
    }
    attachSession(sessionId, port, subId) {
        this.channel.call('attach', [sessionId, port, subId]);
    }
    get onAttachSession() {
        return this.channel.listen('attach');
    }
    terminateSession(sessionId, subId) {
        this.channel.call('terminate', [sessionId, subId]);
    }
    get onTerminateSession() {
        return this.channel.listen('terminate');
    }
    openExtensionDevelopmentHostWindow(args, debugRenderer) {
        return this.channel.call('openExtensionDevelopmentHostWindow', [args, debugRenderer]);
    }
}
