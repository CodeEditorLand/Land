"use strict";
(function () {
    const { ipcRenderer, webFrame, contextBridge } = require('electron');
    function validateIPC(channel) {
        if (!channel || !channel.startsWith('vscode:')) {
            throw new Error(`Unsupported event IPC channel '${channel}'`);
        }
        return true;
    }
    const globals = {
        ipcRenderer: {
            send(channel, ...args) {
                if (validateIPC(channel)) {
                    ipcRenderer.send(channel, ...args);
                }
            },
            invoke(channel, ...args) {
                validateIPC(channel);
                return ipcRenderer.invoke(channel, ...args);
            }
        },
        webFrame: {
            setZoomLevel(level) {
                if (typeof level === 'number') {
                    webFrame.setZoomLevel(level);
                }
            }
        }
    };
    try {
        contextBridge.exposeInMainWorld('vscode', globals);
    }
    catch (error) {
        console.error(error);
    }
}());
