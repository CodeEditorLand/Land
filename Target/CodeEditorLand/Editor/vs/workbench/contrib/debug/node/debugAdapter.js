import * as cp from 'child_process';
import * as net from 'net';
import * as objects from '../../../../base/common/objects.js';
import * as path from '../../../../base/common/path.js';
import * as platform from '../../../../base/common/platform.js';
import * as strings from '../../../../base/common/strings.js';
import { Promises } from '../../../../base/node/pfs.js';
import * as nls from '../../../../nls.js';
import { AbstractDebugAdapter } from '../common/abstractDebugAdapter.js';
export class StreamDebugAdapter extends AbstractDebugAdapter {
    static { this.TWO_CRLF = '\r\n\r\n'; }
    static { this.HEADER_LINESEPARATOR = /\r?\n/; }
    static { this.HEADER_FIELDSEPARATOR = /: */; }
    constructor() {
        super();
        this.rawData = Buffer.allocUnsafe(0);
        this.contentLength = -1;
    }
    connect(readable, writable) {
        this.outputStream = writable;
        this.rawData = Buffer.allocUnsafe(0);
        this.contentLength = -1;
        readable.on('data', (data) => this.handleData(data));
    }
    sendMessage(message) {
        if (this.outputStream) {
            const json = JSON.stringify(message);
            this.outputStream.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}${StreamDebugAdapter.TWO_CRLF}${json}`, 'utf8');
        }
    }
    handleData(data) {
        this.rawData = Buffer.concat([this.rawData, data]);
        while (true) {
            if (this.contentLength >= 0) {
                if (this.rawData.length >= this.contentLength) {
                    const message = this.rawData.toString('utf8', 0, this.contentLength);
                    this.rawData = this.rawData.slice(this.contentLength);
                    this.contentLength = -1;
                    if (message.length > 0) {
                        try {
                            this.acceptMessage(JSON.parse(message));
                        }
                        catch (e) {
                            this._onError.fire(new Error((e.message || e) + '\n' + message));
                        }
                    }
                    continue;
                }
            }
            else {
                const idx = this.rawData.indexOf(StreamDebugAdapter.TWO_CRLF);
                if (idx !== -1) {
                    const header = this.rawData.toString('utf8', 0, idx);
                    const lines = header.split(StreamDebugAdapter.HEADER_LINESEPARATOR);
                    for (const h of lines) {
                        const kvPair = h.split(StreamDebugAdapter.HEADER_FIELDSEPARATOR);
                        if (kvPair[0] === 'Content-Length') {
                            this.contentLength = Number(kvPair[1]);
                        }
                    }
                    this.rawData = this.rawData.slice(idx + StreamDebugAdapter.TWO_CRLF.length);
                    continue;
                }
            }
            break;
        }
    }
}
export class NetworkDebugAdapter extends StreamDebugAdapter {
    startSession() {
        return new Promise((resolve, reject) => {
            let connected = false;
            this.socket = this.createConnection(() => {
                this.connect(this.socket, this.socket);
                resolve();
                connected = true;
            });
            this.socket.on('close', () => {
                if (connected) {
                    this._onError.fire(new Error('connection closed'));
                }
                else {
                    reject(new Error('connection closed'));
                }
            });
            this.socket.on('error', error => {
                if (connected) {
                    this._onError.fire(error);
                }
                else {
                    reject(error);
                }
            });
        });
    }
    async stopSession() {
        await this.cancelPendingRequests();
        if (this.socket) {
            this.socket.end();
            this.socket = undefined;
        }
    }
}
export class SocketDebugAdapter extends NetworkDebugAdapter {
    constructor(adapterServer) {
        super();
        this.adapterServer = adapterServer;
    }
    createConnection(connectionListener) {
        return net.createConnection(this.adapterServer.port, this.adapterServer.host || '127.0.0.1', connectionListener);
    }
}
export class NamedPipeDebugAdapter extends NetworkDebugAdapter {
    constructor(adapterServer) {
        super();
        this.adapterServer = adapterServer;
    }
    createConnection(connectionListener) {
        return net.createConnection(this.adapterServer.path, connectionListener);
    }
}
export class ExecutableDebugAdapter extends StreamDebugAdapter {
    constructor(adapterExecutable, debugType) {
        super();
        this.adapterExecutable = adapterExecutable;
        this.debugType = debugType;
    }
    async startSession() {
        const command = this.adapterExecutable.command;
        const args = this.adapterExecutable.args;
        const options = this.adapterExecutable.options || {};
        try {
            if (command) {
                if (path.isAbsolute(command)) {
                    const commandExists = await Promises.exists(command);
                    if (!commandExists) {
                        throw new Error(nls.localize('debugAdapterBinNotFound', "Debug adapter executable '{0}' does not exist.", command));
                    }
                }
                else {
                    if (command.indexOf('/') < 0 && command.indexOf('\\') < 0) {
                    }
                }
            }
            else {
                throw new Error(nls.localize({ key: 'debugAdapterCannotDetermineExecutable', comment: ['Adapter executable file not found'] }, "Cannot determine executable for debug adapter '{0}'.", this.debugType));
            }
            let env = process.env;
            if (options.env && Object.keys(options.env).length > 0) {
                env = objects.mixin(objects.deepClone(process.env), options.env);
            }
            if (command === 'node') {
                if (Array.isArray(args) && args.length > 0) {
                    const isElectron = !!process.env['ELECTRON_RUN_AS_NODE'] || !!process.versions['electron'];
                    const forkOptions = {
                        env: env,
                        execArgv: isElectron ? ['-e', 'delete process.env.ELECTRON_RUN_AS_NODE;require(process.argv[1])'] : [],
                        silent: true
                    };
                    if (options.cwd) {
                        forkOptions.cwd = options.cwd;
                    }
                    const child = cp.fork(args[0], args.slice(1), forkOptions);
                    if (!child.pid) {
                        throw new Error(nls.localize('unableToLaunchDebugAdapter', "Unable to launch debug adapter from '{0}'.", args[0]));
                    }
                    this.serverProcess = child;
                }
                else {
                    throw new Error(nls.localize('unableToLaunchDebugAdapterNoArgs', "Unable to launch debug adapter."));
                }
            }
            else {
                let spawnCommand = command;
                let spawnArgs = args;
                const spawnOptions = {
                    env: env
                };
                if (options.cwd) {
                    spawnOptions.cwd = options.cwd;
                }
                if (platform.isWindows && (command.endsWith('.bat') || command.endsWith('.cmd'))) {
                    spawnOptions.shell = true;
                    spawnCommand = `"${command}"`;
                    spawnArgs = args.map(a => {
                        a = a.replace(/"/g, '\\"');
                        return `"${a}"`;
                    });
                }
                this.serverProcess = cp.spawn(spawnCommand, spawnArgs, spawnOptions);
            }
            this.serverProcess.on('error', err => {
                this._onError.fire(err);
            });
            this.serverProcess.on('exit', (code, signal) => {
                this._onExit.fire(code);
            });
            this.serverProcess.stdout.on('close', () => {
                this._onError.fire(new Error('read error'));
            });
            this.serverProcess.stdout.on('error', error => {
                this._onError.fire(error);
            });
            this.serverProcess.stdin.on('error', error => {
                this._onError.fire(error);
            });
            this.serverProcess.stderr.resume();
            this.connect(this.serverProcess.stdout, this.serverProcess.stdin);
        }
        catch (err) {
            this._onError.fire(err);
        }
    }
    async stopSession() {
        if (!this.serverProcess) {
            return Promise.resolve(undefined);
        }
        await this.cancelPendingRequests();
        if (platform.isWindows) {
            return new Promise((c, e) => {
                const killer = cp.exec(`taskkill /F /T /PID ${this.serverProcess.pid}`, function (err, stdout, stderr) {
                    if (err) {
                        return e(err);
                    }
                });
                killer.on('exit', c);
                killer.on('error', e);
            });
        }
        else {
            this.serverProcess.kill('SIGTERM');
            return Promise.resolve(undefined);
        }
    }
    static extract(platformContribution, extensionFolderPath) {
        if (!platformContribution) {
            return undefined;
        }
        const result = Object.create(null);
        if (platformContribution.runtime) {
            if (platformContribution.runtime.indexOf('./') === 0) {
                result.runtime = path.join(extensionFolderPath, platformContribution.runtime);
            }
            else {
                result.runtime = platformContribution.runtime;
            }
        }
        if (platformContribution.runtimeArgs) {
            result.runtimeArgs = platformContribution.runtimeArgs;
        }
        if (platformContribution.program) {
            if (!path.isAbsolute(platformContribution.program)) {
                result.program = path.join(extensionFolderPath, platformContribution.program);
            }
            else {
                result.program = platformContribution.program;
            }
        }
        if (platformContribution.args) {
            result.args = platformContribution.args;
        }
        const contribution = platformContribution;
        if (contribution.win) {
            result.win = ExecutableDebugAdapter.extract(contribution.win, extensionFolderPath);
        }
        if (contribution.winx86) {
            result.winx86 = ExecutableDebugAdapter.extract(contribution.winx86, extensionFolderPath);
        }
        if (contribution.windows) {
            result.windows = ExecutableDebugAdapter.extract(contribution.windows, extensionFolderPath);
        }
        if (contribution.osx) {
            result.osx = ExecutableDebugAdapter.extract(contribution.osx, extensionFolderPath);
        }
        if (contribution.linux) {
            result.linux = ExecutableDebugAdapter.extract(contribution.linux, extensionFolderPath);
        }
        return result;
    }
    static platformAdapterExecutable(extensionDescriptions, debugType) {
        let result = Object.create(null);
        debugType = debugType.toLowerCase();
        for (const ed of extensionDescriptions) {
            if (ed.contributes) {
                const debuggers = ed.contributes['debuggers'];
                if (debuggers && debuggers.length > 0) {
                    debuggers.filter(dbg => typeof dbg.type === 'string' && strings.equalsIgnoreCase(dbg.type, debugType)).forEach(dbg => {
                        const extractedDbg = ExecutableDebugAdapter.extract(dbg, ed.extensionLocation.fsPath);
                        result = objects.mixin(result, extractedDbg, ed.isBuiltin);
                    });
                }
            }
        }
        let platformInfo;
        if (platform.isWindows && !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
            platformInfo = result.winx86 || result.win || result.windows;
        }
        else if (platform.isWindows) {
            platformInfo = result.win || result.windows;
        }
        else if (platform.isMacintosh) {
            platformInfo = result.osx;
        }
        else if (platform.isLinux) {
            platformInfo = result.linux;
        }
        platformInfo = platformInfo || result;
        const program = platformInfo.program || result.program;
        const args = platformInfo.args || result.args;
        const runtime = platformInfo.runtime || result.runtime;
        const runtimeArgs = platformInfo.runtimeArgs || result.runtimeArgs;
        if (runtime) {
            return {
                type: 'executable',
                command: runtime,
                args: (runtimeArgs || []).concat(typeof program === 'string' ? [program] : []).concat(args || [])
            };
        }
        else if (program) {
            return {
                type: 'executable',
                command: program,
                args: args || []
            };
        }
        return undefined;
    }
}
