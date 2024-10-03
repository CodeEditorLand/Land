import { Emitter } from '../../../base/common/event.js';
import { State } from './update.js';
export class UpdateChannel {
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        switch (event) {
            case 'onStateChange': return this.service.onStateChange;
        }
        throw new Error(`Event not found: ${event}`);
    }
    call(_, command, arg) {
        switch (command) {
            case 'checkForUpdates': return this.service.checkForUpdates(arg);
            case 'downloadUpdate': return this.service.downloadUpdate();
            case 'applyUpdate': return this.service.applyUpdate();
            case 'quitAndInstall': return this.service.quitAndInstall();
            case '_getInitialState': return Promise.resolve(this.service.state);
            case 'isLatestVersion': return this.service.isLatestVersion();
            case '_applySpecificUpdate': return this.service._applySpecificUpdate(arg);
        }
        throw new Error(`Call not found: ${command}`);
    }
}
export class UpdateChannelClient {
    get state() { return this._state; }
    set state(state) {
        this._state = state;
        this._onStateChange.fire(state);
    }
    constructor(channel) {
        this.channel = channel;
        this._onStateChange = new Emitter();
        this.onStateChange = this._onStateChange.event;
        this._state = State.Uninitialized;
        this.channel.listen('onStateChange')(state => this.state = state);
        this.channel.call('_getInitialState').then(state => this.state = state);
    }
    checkForUpdates(explicit) {
        return this.channel.call('checkForUpdates', explicit);
    }
    downloadUpdate() {
        return this.channel.call('downloadUpdate');
    }
    applyUpdate() {
        return this.channel.call('applyUpdate');
    }
    quitAndInstall() {
        return this.channel.call('quitAndInstall');
    }
    isLatestVersion() {
        return this.channel.call('isLatestVersion');
    }
    _applySpecificUpdate(packagePath) {
        return this.channel.call('_applySpecificUpdate', packagePath);
    }
}
