import './bootstrap-server.js';
import * as path from 'path';
import * as http from 'http';
import * as os from 'os';
import * as readline from 'readline';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { devInjectNodeModuleLookupPath } from './bootstrap-node.js';
import { bootstrapESM } from './bootstrap-esm.js';
import { resolveNLSConfiguration } from './vs/base/node/nls.js';
import { product } from './bootstrap-meta.js';
import * as perf from './vs/base/common/performance.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
perf.mark('code/server/start');
globalThis.vscodeServerStartTime = performance.now();
const parsedArgs = minimist(process.argv.slice(2), {
    boolean: ['start-server', 'list-extensions', 'print-ip-address', 'help', 'version', 'accept-server-license-terms', 'update-extensions'],
    string: ['install-extension', 'install-builtin-extension', 'uninstall-extension', 'locate-extension', 'socket-path', 'host', 'port', 'compatibility'],
    alias: { help: 'h', version: 'v' }
});
['host', 'port', 'accept-server-license-terms'].forEach(e => {
    if (!parsedArgs[e]) {
        const envValue = process.env[`VSCODE_SERVER_${e.toUpperCase().replace('-', '_')}`];
        if (envValue) {
            parsedArgs[e] = envValue;
        }
    }
});
const extensionLookupArgs = ['list-extensions', 'locate-extension'];
const extensionInstallArgs = ['install-extension', 'install-builtin-extension', 'uninstall-extension', 'update-extensions'];
const shouldSpawnCli = parsedArgs.help || parsedArgs.version || extensionLookupArgs.some(a => !!parsedArgs[a]) || (extensionInstallArgs.some(a => !!parsedArgs[a]) && !parsedArgs['start-server']);
const nlsConfiguration = await resolveNLSConfiguration({ userLocale: 'en', osLocale: 'en', commit: product.commit, userDataPath: '', nlsMetadataPath: __dirname });
if (shouldSpawnCli) {
    loadCode(nlsConfiguration).then((mod) => {
        mod.spawnCli();
    });
}
else {
    let _remoteExtensionHostAgentServer = null;
    let _remoteExtensionHostAgentServerPromise = null;
    const getRemoteExtensionHostAgentServer = () => {
        if (!_remoteExtensionHostAgentServerPromise) {
            _remoteExtensionHostAgentServerPromise = loadCode(nlsConfiguration).then(async (mod) => {
                const server = await mod.createServer(address);
                _remoteExtensionHostAgentServer = server;
                return server;
            });
        }
        return _remoteExtensionHostAgentServerPromise;
    };
    if (Array.isArray(product.serverLicense) && product.serverLicense.length) {
        console.log(product.serverLicense.join('\n'));
        if (product.serverLicensePrompt && parsedArgs['accept-server-license-terms'] !== true) {
            if (hasStdinWithoutTty()) {
                console.log('To accept the license terms, start the server with --accept-server-license-terms');
                process.exit(1);
            }
            try {
                const accept = await prompt(product.serverLicensePrompt);
                if (!accept) {
                    process.exit(1);
                }
            }
            catch (e) {
                console.log(e);
                process.exit(1);
            }
        }
    }
    let firstRequest = true;
    let firstWebSocket = true;
    let address = null;
    const server = http.createServer(async (req, res) => {
        if (firstRequest) {
            firstRequest = false;
            perf.mark('code/server/firstRequest');
        }
        const remoteExtensionHostAgentServer = await getRemoteExtensionHostAgentServer();
        return remoteExtensionHostAgentServer.handleRequest(req, res);
    });
    server.on('upgrade', async (req, socket) => {
        if (firstWebSocket) {
            firstWebSocket = false;
            perf.mark('code/server/firstWebSocket');
        }
        const remoteExtensionHostAgentServer = await getRemoteExtensionHostAgentServer();
        return remoteExtensionHostAgentServer.handleUpgrade(req, socket);
    });
    server.on('error', async (err) => {
        const remoteExtensionHostAgentServer = await getRemoteExtensionHostAgentServer();
        return remoteExtensionHostAgentServer.handleServerError(err);
    });
    const host = sanitizeStringArg(parsedArgs['host']) || (parsedArgs['compatibility'] !== '1.63' ? 'localhost' : undefined);
    const nodeListenOptions = (parsedArgs['socket-path']
        ? { path: sanitizeStringArg(parsedArgs['socket-path']) }
        : { host, port: await parsePort(host, sanitizeStringArg(parsedArgs['port'])) });
    server.listen(nodeListenOptions, async () => {
        let output = Array.isArray(product.serverGreeting) && product.serverGreeting.length ? `\n\n${product.serverGreeting.join('\n')}\n\n` : ``;
        if (typeof nodeListenOptions.port === 'number' && parsedArgs['print-ip-address']) {
            const ifaces = os.networkInterfaces();
            Object.keys(ifaces).forEach(function (ifname) {
                ifaces[ifname]?.forEach(function (iface) {
                    if (!iface.internal && iface.family === 'IPv4') {
                        output += `IP Address: ${iface.address}\n`;
                    }
                });
            });
        }
        address = server.address();
        if (address === null) {
            throw new Error('Unexpected server address');
        }
        output += `Server bound to ${typeof address === 'string' ? address : `${address.address}:${address.port} (${address.family})`}\n`;
        output += `Extension host agent listening on ${typeof address === 'string' ? address : address.port}\n`;
        console.log(output);
        perf.mark('code/server/started');
        globalThis.vscodeServerListenTime = performance.now();
        await getRemoteExtensionHostAgentServer();
    });
    process.on('exit', () => {
        server.close();
        if (_remoteExtensionHostAgentServer) {
            _remoteExtensionHostAgentServer.dispose();
        }
    });
}
function sanitizeStringArg(val) {
    if (Array.isArray(val)) {
        val = val.pop();
    }
    return typeof val === 'string' ? val : undefined;
}
async function parsePort(host, strPort) {
    if (strPort) {
        let range;
        if (strPort.match(/^\d+$/)) {
            return parseInt(strPort, 10);
        }
        else if (range = parseRange(strPort)) {
            const port = await findFreePort(host, range.start, range.end);
            if (port !== undefined) {
                return port;
            }
            console.warn(`--port: Could not find free port in range: ${range.start} - ${range.end} (inclusive).`);
            process.exit(1);
        }
        else {
            console.warn(`--port "${strPort}" is not a valid number or range. Ranges must be in the form 'from-to' with 'from' an integer larger than 0 and not larger than 'end'.`);
            process.exit(1);
        }
    }
    return 8000;
}
function parseRange(strRange) {
    const match = strRange.match(/^(\d+)-(\d+)$/);
    if (match) {
        const start = parseInt(match[1], 10), end = parseInt(match[2], 10);
        if (start > 0 && start <= end && end <= 65535) {
            return { start, end };
        }
    }
    return undefined;
}
async function findFreePort(host, start, end) {
    const testPort = (port) => {
        return new Promise((resolve) => {
            const server = http.createServer();
            server.listen(port, host, () => {
                server.close();
                resolve(true);
            }).on('error', () => {
                resolve(false);
            });
        });
    };
    for (let port = start; port <= end; port++) {
        if (await testPort(port)) {
            return port;
        }
    }
    return undefined;
}
async function loadCode(nlsConfiguration) {
    process.env['VSCODE_NLS_CONFIG'] = JSON.stringify(nlsConfiguration);
    process.env['VSCODE_HANDLES_SIGPIPE'] = 'true';
    if (process.env['VSCODE_DEV']) {
        process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH'] = process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH'] || path.join(__dirname, '..', 'remote', 'node_modules');
        devInjectNodeModuleLookupPath(process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH']);
    }
    else {
        delete process.env['VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH'];
    }
    await bootstrapESM();
    return import('./vs/server/node/server.main.js');
}
function hasStdinWithoutTty() {
    try {
        return !process.stdin.isTTY;
    }
    catch (error) {
    }
    return false;
}
function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
        rl.question(question + ' ', async function (data) {
            rl.close();
            const str = data.toString().trim().toLowerCase();
            if (str === '' || str === 'y' || str === 'yes') {
                resolve(true);
            }
            else if (str === 'n' || str === 'no') {
                resolve(false);
            }
            else {
                process.stdout.write('\nInvalid Response. Answer either yes (y, yes) or no (n, no)\n');
                resolve(await prompt(question));
            }
        });
    });
}
