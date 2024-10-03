import { promises } from 'fs';
import * as path from '../common/path.js';
import * as Platform from '../common/platform.js';
import * as process from '../common/process.js';
import * as Types from '../common/types.js';
import * as pfs from './pfs.js';
export function getWindowsShell(env = process.env) {
    return env['comspec'] || 'cmd.exe';
}
export function createQueuedSender(childProcess) {
    let msgQueue = [];
    let useQueue = false;
    const send = function (msg) {
        if (useQueue) {
            msgQueue.push(msg);
            return;
        }
        const result = childProcess.send(msg, (error) => {
            if (error) {
                console.error(error);
            }
            useQueue = false;
            if (msgQueue.length > 0) {
                const msgQueueCopy = msgQueue.slice(0);
                msgQueue = [];
                msgQueueCopy.forEach(entry => send(entry));
            }
        });
        if (!result || Platform.isWindows) {
            useQueue = true;
        }
    };
    return { send };
}
export var win32;
(function (win32) {
    async function findExecutable(command, cwd, paths) {
        if (path.isAbsolute(command)) {
            return command;
        }
        if (cwd === undefined) {
            cwd = process.cwd();
        }
        const dir = path.dirname(command);
        if (dir !== '.') {
            return path.join(cwd, command);
        }
        if (paths === undefined && Types.isString(process.env['PATH'])) {
            paths = process.env['PATH'].split(path.delimiter);
        }
        if (paths === undefined || paths.length === 0) {
            return path.join(cwd, command);
        }
        async function fileExists(path) {
            if (await pfs.Promises.exists(path)) {
                let statValue;
                try {
                    statValue = await promises.stat(path);
                }
                catch (e) {
                    if (e.message.startsWith('EACCES')) {
                        statValue = await promises.lstat(path);
                    }
                }
                return statValue ? !statValue.isDirectory() : false;
            }
            return false;
        }
        for (const pathEntry of paths) {
            let fullPath;
            if (path.isAbsolute(pathEntry)) {
                fullPath = path.join(pathEntry, command);
            }
            else {
                fullPath = path.join(cwd, pathEntry, command);
            }
            if (await fileExists(fullPath)) {
                return fullPath;
            }
            let withExtension = fullPath + '.com';
            if (await fileExists(withExtension)) {
                return withExtension;
            }
            withExtension = fullPath + '.exe';
            if (await fileExists(withExtension)) {
                return withExtension;
            }
        }
        return path.join(cwd, command);
    }
    win32.findExecutable = findExecutable;
})(win32 || (win32 = {}));
