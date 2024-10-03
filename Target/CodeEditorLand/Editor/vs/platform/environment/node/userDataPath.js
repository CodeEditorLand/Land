import * as os from 'os';
import * as path from 'path';
const cwd = process.env['VSCODE_CWD'] || process.cwd();
export function getUserDataPath(cliArgs, productName) {
    const userDataPath = doGetUserDataPath(cliArgs, productName);
    const pathsToResolve = [userDataPath];
    if (!path.isAbsolute(userDataPath)) {
        pathsToResolve.unshift(cwd);
    }
    return path.resolve(...pathsToResolve);
}
function doGetUserDataPath(cliArgs, productName) {
    if (process.env['VSCODE_DEV']) {
        productName = 'code-oss-dev';
    }
    const portablePath = process.env['VSCODE_PORTABLE'];
    if (portablePath) {
        return path.join(portablePath, 'user-data');
    }
    let appDataPath = process.env['VSCODE_APPDATA'];
    if (appDataPath) {
        return path.join(appDataPath, productName);
    }
    const cliPath = cliArgs['user-data-dir'];
    if (cliPath) {
        return cliPath;
    }
    switch (process.platform) {
        case 'win32':
            appDataPath = process.env['APPDATA'];
            if (!appDataPath) {
                const userProfile = process.env['USERPROFILE'];
                if (typeof userProfile !== 'string') {
                    throw new Error('Windows: Unexpected undefined %USERPROFILE% environment variable');
                }
                appDataPath = path.join(userProfile, 'AppData', 'Roaming');
            }
            break;
        case 'darwin':
            appDataPath = path.join(os.homedir(), 'Library', 'Application Support');
            break;
        case 'linux':
            appDataPath = process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
            break;
        default:
            throw new Error('Platform not supported');
    }
    return path.join(appDataPath, productName);
}
