"use strict";
(function () {
    const { ipcRenderer, webFrame, contextBridge, webUtils } = require('electron');
    function validateIPC(channel) {
        if (!channel || !channel.startsWith('vscode:')) {
            throw new Error(`Unsupported event IPC channel '${channel}'`);
        }
        return true;
    }
    function parseArgv(key) {
        for (const arg of process.argv) {
            if (arg.indexOf(`--${key}=`) === 0) {
                return arg.split('=')[1];
            }
        }
        return undefined;
    }
    let configuration = undefined;
    const resolveConfiguration = (async () => {
        const windowConfigIpcChannel = parseArgv('vscode-window-config');
        if (!windowConfigIpcChannel) {
            throw new Error('Preload: did not find expected vscode-window-config in renderer process arguments list.');
        }
        try {
            validateIPC(windowConfigIpcChannel);
            const resolvedConfiguration = configuration = await ipcRenderer.invoke(windowConfigIpcChannel);
            Object.assign(process.env, resolvedConfiguration.userEnv);
            webFrame.setZoomLevel(resolvedConfiguration.zoomLevel ?? 0);
            return resolvedConfiguration;
        }
        catch (error) {
            throw new Error(`Preload: unable to fetch vscode-window-config: ${error}`);
        }
    })();
    const resolveShellEnv = (async () => {
        const [userEnv, shellEnv] = await Promise.all([
            (async () => (await resolveConfiguration).userEnv)(),
            ipcRenderer.invoke('vscode:fetchShellEnv')
        ]);
        return { ...process.env, ...shellEnv, ...userEnv };
    })();
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
            },
            on(channel, listener) {
                validateIPC(channel);
                ipcRenderer.on(channel, listener);
                return this;
            },
            once(channel, listener) {
                validateIPC(channel);
                ipcRenderer.once(channel, listener);
                return this;
            },
            removeListener(channel, listener) {
                validateIPC(channel);
                ipcRenderer.removeListener(channel, listener);
                return this;
            }
        },
        ipcMessagePort: {
            acquire(responseChannel, nonce) {
                if (validateIPC(responseChannel)) {
                    const responseListener = (e, responseNonce) => {
                        if (nonce === responseNonce) {
                            ipcRenderer.off(responseChannel, responseListener);
                            window.postMessage(nonce, '*', e.ports);
                        }
                    };
                    ipcRenderer.on(responseChannel, responseListener);
                }
            }
        },
        webFrame: {
            setZoomLevel(level) {
                if (typeof level === 'number') {
                    webFrame.setZoomLevel(level);
                }
            }
        },
        webUtils: {
            getPathForFile(file) {
                return webUtils.getPathForFile(file);
            }
        },
        process: {
            get platform() { return process.platform; },
            get arch() { return process.arch; },
            get env() { return { ...process.env }; },
            get versions() { return process.versions; },
            get type() { return 'renderer'; },
            get execPath() { return process.execPath; },
            cwd() {
                return process.env['VSCODE_CWD'] || process.execPath.substr(0, process.execPath.lastIndexOf(process.platform === 'win32' ? '\\' : '/'));
            },
            shellEnv() {
                return resolveShellEnv;
            },
            getProcessMemoryInfo() {
                return process.getProcessMemoryInfo();
            },
            on(type, callback) {
                process.on(type, callback);
            }
        },
        context: {
            configuration() {
                return configuration;
            },
            async resolveConfiguration() {
                return resolveConfiguration;
            }
        }
    };
    if (process.contextIsolated) {
        try {
            contextBridge.exposeInMainWorld('vscode', globals);
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        window.vscode = globals;
    }
}());
