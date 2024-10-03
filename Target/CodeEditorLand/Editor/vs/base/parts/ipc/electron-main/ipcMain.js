import electron from 'electron';
import { onUnexpectedError } from '../../../common/errors.js';
import { VSCODE_AUTHORITY } from '../../../common/network.js';
class ValidatedIpcMain {
    constructor() {
        this.mapListenerToWrapper = new WeakMap();
    }
    on(channel, listener) {
        const wrappedListener = (event, ...args) => {
            if (this.validateEvent(channel, event)) {
                listener(event, ...args);
            }
        };
        this.mapListenerToWrapper.set(listener, wrappedListener);
        electron.ipcMain.on(channel, wrappedListener);
        return this;
    }
    once(channel, listener) {
        electron.ipcMain.once(channel, (event, ...args) => {
            if (this.validateEvent(channel, event)) {
                listener(event, ...args);
            }
        });
        return this;
    }
    handle(channel, listener) {
        electron.ipcMain.handle(channel, (event, ...args) => {
            if (this.validateEvent(channel, event)) {
                return listener(event, ...args);
            }
            return Promise.reject(`Invalid channel '${channel}' or sender for ipcMain.handle() usage.`);
        });
        return this;
    }
    removeHandler(channel) {
        electron.ipcMain.removeHandler(channel);
        return this;
    }
    removeListener(channel, listener) {
        const wrappedListener = this.mapListenerToWrapper.get(listener);
        if (wrappedListener) {
            electron.ipcMain.removeListener(channel, wrappedListener);
            this.mapListenerToWrapper.delete(listener);
        }
        return this;
    }
    validateEvent(channel, event) {
        if (!channel || !channel.startsWith('vscode:')) {
            onUnexpectedError(`Refused to handle ipcMain event for channel '${channel}' because the channel is unknown.`);
            return false;
        }
        const sender = event.senderFrame;
        const url = sender.url;
        if (!url || url === 'about:blank') {
            return true;
        }
        let host = 'unknown';
        try {
            host = new URL(url).host;
        }
        catch (error) {
            onUnexpectedError(`Refused to handle ipcMain event for channel '${channel}' because of a malformed URL '${url}'.`);
            return false;
        }
        if (host !== VSCODE_AUTHORITY) {
            onUnexpectedError(`Refused to handle ipcMain event for channel '${channel}' because of a bad origin of '${host}'.`);
            return false;
        }
        if (sender.parent !== null) {
            onUnexpectedError(`Refused to handle ipcMain event for channel '${channel}' because sender of origin '${host}' is not a main frame.`);
            return false;
        }
        return true;
    }
}
export const validatedIpcMain = new ValidatedIpcMain();
