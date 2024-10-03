import { createServer } from 'net';
import { ExtensionHostDebugBroadcastChannel } from '../common/extensionHostDebugIpc.js';
import { OPTIONS, parseArgs } from '../../environment/node/argv.js';
export class ElectronExtensionHostDebugBroadcastChannel extends ExtensionHostDebugBroadcastChannel {
    constructor(windowsMainService) {
        super();
        this.windowsMainService = windowsMainService;
    }
    call(ctx, command, arg) {
        if (command === 'openExtensionDevelopmentHostWindow') {
            return this.openExtensionDevelopmentHostWindow(arg[0], arg[1]);
        }
        else {
            return super.call(ctx, command, arg);
        }
    }
    async openExtensionDevelopmentHostWindow(args, debugRenderer) {
        const pargs = parseArgs(args, OPTIONS);
        pargs.debugRenderer = debugRenderer;
        const extDevPaths = pargs.extensionDevelopmentPath;
        if (!extDevPaths) {
            return { success: false };
        }
        const [codeWindow] = await this.windowsMainService.openExtensionDevelopmentHostWindow(extDevPaths, {
            context: 5,
            cli: pargs,
            forceProfile: pargs.profile,
            forceTempProfile: pargs['profile-temp']
        });
        if (!debugRenderer) {
            return { success: true };
        }
        const win = codeWindow.win;
        if (!win) {
            return { success: true };
        }
        const debug = win.webContents.debugger;
        let listeners = debug.isAttached() ? Infinity : 0;
        const server = createServer(listener => {
            if (listeners++ === 0) {
                debug.attach();
            }
            let closed = false;
            const writeMessage = (message) => {
                if (!closed) {
                    listener.write(JSON.stringify(message) + '\0');
                }
            };
            const onMessage = (_event, method, params, sessionId) => writeMessage(({ method, params, sessionId }));
            win.on('close', () => {
                debug.removeListener('message', onMessage);
                listener.end();
                closed = true;
            });
            debug.addListener('message', onMessage);
            let buf = Buffer.alloc(0);
            listener.on('data', data => {
                buf = Buffer.concat([buf, data]);
                for (let delimiter = buf.indexOf(0); delimiter !== -1; delimiter = buf.indexOf(0)) {
                    let data;
                    try {
                        const contents = buf.slice(0, delimiter).toString('utf8');
                        buf = buf.slice(delimiter + 1);
                        data = JSON.parse(contents);
                    }
                    catch (e) {
                        console.error('error reading cdp line', e);
                    }
                    debug.sendCommand(data.method, data.params, data.sessionId)
                        .then((result) => writeMessage({ id: data.id, sessionId: data.sessionId, result }))
                        .catch((error) => writeMessage({ id: data.id, sessionId: data.sessionId, error: { code: 0, message: error.message } }));
                }
            });
            listener.on('error', err => {
                console.error('error on cdp pipe:', err);
            });
            listener.on('close', () => {
                closed = true;
                if (--listeners === 0) {
                    debug.detach();
                }
            });
        });
        await new Promise(r => server.listen(0, r));
        win.on('close', () => server.close());
        return { rendererDebugPort: server.address().port, success: true };
    }
}
