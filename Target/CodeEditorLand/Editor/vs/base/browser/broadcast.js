import { mainWindow } from './window.js';
import { getErrorMessage } from '../common/errors.js';
import { Emitter } from '../common/event.js';
import { Disposable, toDisposable } from '../common/lifecycle.js';
export class BroadcastDataChannel extends Disposable {
    constructor(channelName) {
        super();
        this.channelName = channelName;
        this._onDidReceiveData = this._register(new Emitter());
        this.onDidReceiveData = this._onDidReceiveData.event;
        if ('BroadcastChannel' in mainWindow) {
            try {
                this.broadcastChannel = new BroadcastChannel(channelName);
                const listener = (event) => {
                    this._onDidReceiveData.fire(event.data);
                };
                this.broadcastChannel.addEventListener('message', listener);
                this._register(toDisposable(() => {
                    if (this.broadcastChannel) {
                        this.broadcastChannel.removeEventListener('message', listener);
                        this.broadcastChannel.close();
                    }
                }));
            }
            catch (error) {
                console.warn('Error while creating broadcast channel. Falling back to localStorage.', getErrorMessage(error));
            }
        }
        if (!this.broadcastChannel) {
            this.channelName = `BroadcastDataChannel.${channelName}`;
            this.createBroadcastChannel();
        }
    }
    createBroadcastChannel() {
        const listener = (event) => {
            if (event.key === this.channelName && event.newValue) {
                this._onDidReceiveData.fire(JSON.parse(event.newValue));
            }
        };
        mainWindow.addEventListener('storage', listener);
        this._register(toDisposable(() => mainWindow.removeEventListener('storage', listener)));
    }
    postData(data) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(data);
        }
        else {
            localStorage.removeItem(this.channelName);
            localStorage.setItem(this.channelName, JSON.stringify(data));
        }
    }
}
