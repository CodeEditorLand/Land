import { spawn } from 'child_process';
import { basename } from '../../../base/common/path.js';
import { localize } from '../../../nls.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../base/common/errorMessage.js';
import { CancellationError, isCancellationError } from '../../../base/common/errors.js';
import { isWindows, OS } from '../../../base/common/platform.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { getSystemShell } from '../../../base/node/shell.js';
import { isLaunchedFromCli } from '../../environment/node/argvHelper.js';
import { Promises } from '../../../base/common/async.js';
import { clamp } from '../../../base/common/numbers.js';
let unixShellEnvPromise = undefined;
export async function getResolvedShellEnv(configurationService, logService, args, env) {
    if (args['force-disable-user-env']) {
        logService.trace('resolveShellEnv(): skipped (--force-disable-user-env)');
        return {};
    }
    else if (isWindows) {
        logService.trace('resolveShellEnv(): skipped (Windows)');
        return {};
    }
    else if (isLaunchedFromCli(env) && !args['force-user-env']) {
        logService.trace('resolveShellEnv(): skipped (VSCODE_CLI is set)');
        return {};
    }
    else {
        if (isLaunchedFromCli(env)) {
            logService.trace('resolveShellEnv(): running (--force-user-env)');
        }
        else {
            logService.trace('resolveShellEnv(): running (macOS/Linux)');
        }
        if (!unixShellEnvPromise) {
            unixShellEnvPromise = Promises.withAsyncBody(async (resolve, reject) => {
                const cts = new CancellationTokenSource();
                let timeoutValue = 10000;
                const configuredTimeoutValue = configurationService.getValue('application.shellEnvironmentResolutionTimeout');
                if (typeof configuredTimeoutValue === 'number') {
                    timeoutValue = clamp(configuredTimeoutValue, 1, 120) * 1000;
                }
                const timeout = setTimeout(() => {
                    cts.dispose(true);
                    reject(new Error(localize('resolveShellEnvTimeout', "Unable to resolve your shell environment in a reasonable time. Please review your shell configuration and restart.")));
                }, timeoutValue);
                try {
                    resolve(await doResolveUnixShellEnv(logService, cts.token));
                }
                catch (error) {
                    if (!isCancellationError(error) && !cts.token.isCancellationRequested) {
                        reject(new Error(localize('resolveShellEnvError', "Unable to resolve your shell environment: {0}", toErrorMessage(error))));
                    }
                    else {
                        resolve({});
                    }
                }
                finally {
                    clearTimeout(timeout);
                    cts.dispose();
                }
            });
        }
        return unixShellEnvPromise;
    }
}
async function doResolveUnixShellEnv(logService, token) {
    const runAsNode = process.env['ELECTRON_RUN_AS_NODE'];
    logService.trace('getUnixShellEnvironment#runAsNode', runAsNode);
    const noAttach = process.env['ELECTRON_NO_ATTACH_CONSOLE'];
    logService.trace('getUnixShellEnvironment#noAttach', noAttach);
    const mark = generateUuid().replace(/-/g, '').substr(0, 12);
    const regex = new RegExp(mark + '({.*})' + mark);
    const env = {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        ELECTRON_NO_ATTACH_CONSOLE: '1',
        VSCODE_RESOLVING_ENVIRONMENT: '1'
    };
    logService.trace('getUnixShellEnvironment#env', env);
    const systemShellUnix = await getSystemShell(OS, env);
    logService.trace('getUnixShellEnvironment#shell', systemShellUnix);
    return new Promise((resolve, reject) => {
        if (token.isCancellationRequested) {
            return reject(new CancellationError());
        }
        const name = basename(systemShellUnix);
        let command, shellArgs;
        const extraArgs = '';
        if (/^pwsh(-preview)?$/.test(name)) {
            command = `& '${process.execPath}' ${extraArgs} -p '''${mark}'' + JSON.stringify(process.env) + ''${mark}'''`;
            shellArgs = ['-Login', '-Command'];
        }
        else if (name === 'nu') {
            command = `^'${process.execPath}' ${extraArgs} -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
            shellArgs = ['-i', '-l', '-c'];
        }
        else if (name === 'xonsh') {
            command = `import os, json; print("${mark}", json.dumps(dict(os.environ)), "${mark}")`;
            shellArgs = ['-i', '-l', '-c'];
        }
        else {
            command = `'${process.execPath}' ${extraArgs} -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
            if (name === 'tcsh' || name === 'csh') {
                shellArgs = ['-ic'];
            }
            else {
                shellArgs = ['-i', '-l', '-c'];
            }
        }
        logService.trace('getUnixShellEnvironment#spawn', JSON.stringify(shellArgs), command);
        const child = spawn(systemShellUnix, [...shellArgs, command], {
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env
        });
        token.onCancellationRequested(() => {
            child.kill();
            return reject(new CancellationError());
        });
        child.on('error', err => {
            logService.error('getUnixShellEnvironment#errorChildProcess', toErrorMessage(err));
            reject(err);
        });
        const buffers = [];
        child.stdout.on('data', b => buffers.push(b));
        const stderr = [];
        child.stderr.on('data', b => stderr.push(b));
        child.on('close', (code, signal) => {
            const raw = Buffer.concat(buffers).toString('utf8');
            logService.trace('getUnixShellEnvironment#raw', raw);
            const stderrStr = Buffer.concat(stderr).toString('utf8');
            if (stderrStr.trim()) {
                logService.trace('getUnixShellEnvironment#stderr', stderrStr);
            }
            if (code || signal) {
                return reject(new Error(localize('resolveShellEnvExitError', "Unexpected exit code from spawned shell (code {0}, signal {1})", code, signal)));
            }
            const match = regex.exec(raw);
            const rawStripped = match ? match[1] : '{}';
            try {
                const env = JSON.parse(rawStripped);
                if (runAsNode) {
                    env['ELECTRON_RUN_AS_NODE'] = runAsNode;
                }
                else {
                    delete env['ELECTRON_RUN_AS_NODE'];
                }
                if (noAttach) {
                    env['ELECTRON_NO_ATTACH_CONSOLE'] = noAttach;
                }
                else {
                    delete env['ELECTRON_NO_ATTACH_CONSOLE'];
                }
                delete env['VSCODE_RESOLVING_ENVIRONMENT'];
                delete env['XDG_RUNTIME_DIR'];
                logService.trace('getUnixShellEnvironment#result', env);
                resolve(env);
            }
            catch (err) {
                logService.error('getUnixShellEnvironment#errorCaught', toErrorMessage(err));
                reject(err);
            }
        });
    });
}
