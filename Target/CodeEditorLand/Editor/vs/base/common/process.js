import { isMacintosh, isWindows } from './platform.js';
let safeProcess;
const vscodeGlobal = globalThis.vscode;
if (typeof vscodeGlobal !== 'undefined' && typeof vscodeGlobal.process !== 'undefined') {
    const sandboxProcess = vscodeGlobal.process;
    safeProcess = {
        get platform() { return sandboxProcess.platform; },
        get arch() { return sandboxProcess.arch; },
        get env() { return sandboxProcess.env; },
        cwd() { return sandboxProcess.cwd(); }
    };
}
else if (typeof process !== 'undefined' && typeof process?.versions?.node === 'string') {
    safeProcess = {
        get platform() { return process.platform; },
        get arch() { return process.arch; },
        get env() { return process.env; },
        cwd() { return process.env['VSCODE_CWD'] || process.cwd(); }
    };
}
else {
    safeProcess = {
        get platform() { return isWindows ? 'win32' : isMacintosh ? 'darwin' : 'linux'; },
        get arch() { return undefined; },
        get env() { return {}; },
        cwd() { return '/'; }
    };
}
export const cwd = safeProcess.cwd;
export const env = safeProcess.env;
export const platform = safeProcess.platform;
export const arch = safeProcess.arch;
