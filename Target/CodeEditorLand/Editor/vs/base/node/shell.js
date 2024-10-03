import { userInfo } from 'os';
import * as platform from '../common/platform.js';
import { getFirstAvailablePowerShellInstallation } from './powershell.js';
import * as processes from './processes.js';
export async function getSystemShell(os, env) {
    if (os === 1) {
        if (platform.isWindows) {
            return getSystemShellWindows();
        }
        return processes.getWindowsShell(env);
    }
    return getSystemShellUnixLike(os, env);
}
let _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = null;
function getSystemShellUnixLike(os, env) {
    if (platform.isLinux && os === 2 || platform.isMacintosh && os === 3) {
        return '/bin/bash';
    }
    if (!_TERMINAL_DEFAULT_SHELL_UNIX_LIKE) {
        let unixLikeTerminal;
        if (platform.isWindows) {
            unixLikeTerminal = '/bin/bash';
        }
        else {
            unixLikeTerminal = env['SHELL'];
            if (!unixLikeTerminal) {
                try {
                    unixLikeTerminal = userInfo().shell;
                }
                catch (err) { }
            }
            if (!unixLikeTerminal) {
                unixLikeTerminal = 'sh';
            }
            if (unixLikeTerminal === '/bin/false') {
                unixLikeTerminal = '/bin/bash';
            }
        }
        _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = unixLikeTerminal;
    }
    return _TERMINAL_DEFAULT_SHELL_UNIX_LIKE;
}
let _TERMINAL_DEFAULT_SHELL_WINDOWS = null;
async function getSystemShellWindows() {
    if (!_TERMINAL_DEFAULT_SHELL_WINDOWS) {
        _TERMINAL_DEFAULT_SHELL_WINDOWS = (await getFirstAvailablePowerShellInstallation()).exePath;
    }
    return _TERMINAL_DEFAULT_SHELL_WINDOWS;
}
