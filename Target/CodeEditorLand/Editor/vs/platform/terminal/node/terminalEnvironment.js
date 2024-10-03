import * as os from 'os';
import { FileAccess } from '../../../base/common/network.js';
import { getCaseInsensitive } from '../../../base/common/objects.js';
import * as path from '../../../base/common/path.js';
import { isMacintosh, isWindows } from '../../../base/common/platform.js';
import * as process from '../../../base/common/process.js';
import { format } from '../../../base/common/strings.js';
import { isString } from '../../../base/common/types.js';
import * as pfs from '../../../base/node/pfs.js';
import { EnvironmentVariableMutatorType } from '../common/environmentVariable.js';
import { deserializeEnvironmentVariableCollections } from '../common/environmentVariableShared.js';
import { MergedEnvironmentVariableCollection } from '../common/environmentVariableCollection.js';
export function getWindowsBuildNumber() {
    const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(os.release());
    let buildNumber = 0;
    if (osVersion && osVersion.length === 4) {
        buildNumber = parseInt(osVersion[3]);
    }
    return buildNumber;
}
export async function findExecutable(command, cwd, paths, env = process.env, exists = pfs.Promises.exists) {
    if (path.isAbsolute(command)) {
        return await exists(command) ? command : undefined;
    }
    if (cwd === undefined) {
        cwd = process.cwd();
    }
    const dir = path.dirname(command);
    if (dir !== '.') {
        const fullPath = path.join(cwd, command);
        return await exists(fullPath) ? fullPath : undefined;
    }
    const envPath = getCaseInsensitive(env, 'PATH');
    if (paths === undefined && isString(envPath)) {
        paths = envPath.split(path.delimiter);
    }
    if (paths === undefined || paths.length === 0) {
        const fullPath = path.join(cwd, command);
        return await exists(fullPath) ? fullPath : undefined;
    }
    for (const pathEntry of paths) {
        let fullPath;
        if (path.isAbsolute(pathEntry)) {
            fullPath = path.join(pathEntry, command);
        }
        else {
            fullPath = path.join(cwd, pathEntry, command);
        }
        if (await exists(fullPath)) {
            return fullPath;
        }
        if (isWindows) {
            let withExtension = fullPath + '.com';
            if (await exists(withExtension)) {
                return withExtension;
            }
            withExtension = fullPath + '.exe';
            if (await exists(withExtension)) {
                return withExtension;
            }
        }
    }
    const fullPath = path.join(cwd, command);
    return await exists(fullPath) ? fullPath : undefined;
}
export function getShellIntegrationInjection(shellLaunchConfig, options, env, logService, productService) {
    const useWinpty = isWindows && (!options.windowsEnableConpty || getWindowsBuildNumber() < 18309);
    if (!options.shellIntegration.enabled ||
        !shellLaunchConfig.executable ||
        (shellLaunchConfig.isFeatureTerminal && !shellLaunchConfig.forceShellIntegration) ||
        shellLaunchConfig.ignoreShellIntegration ||
        useWinpty) {
        return undefined;
    }
    const originalArgs = shellLaunchConfig.args;
    const shell = process.platform === 'win32' ? path.basename(shellLaunchConfig.executable).toLowerCase() : path.basename(shellLaunchConfig.executable);
    const appRoot = path.dirname(FileAccess.asFileUri('').fsPath);
    let newArgs;
    const envMixin = {
        'VSCODE_INJECTION': '1'
    };
    if (options.shellIntegration.nonce) {
        envMixin['VSCODE_NONCE'] = options.shellIntegration.nonce;
    }
    if (isWindows) {
        if (shell === 'pwsh.exe' || shell === 'powershell.exe') {
            if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.WindowsPwsh);
            }
            else if (arePwshLoginArgs(originalArgs)) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.WindowsPwshLogin);
            }
            if (!newArgs) {
                return undefined;
            }
            newArgs = [...newArgs];
            newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot, '');
            envMixin['VSCODE_STABLE'] = productService.quality === 'stable' ? '1' : '0';
            if (options.shellIntegration.suggestEnabled) {
                envMixin['VSCODE_SUGGEST'] = '1';
            }
            return { newArgs, envMixin };
        }
        else if (shell === 'bash.exe') {
            if (!originalArgs || originalArgs.length === 0) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
            }
            else if (areZshBashLoginArgs(originalArgs)) {
                envMixin['VSCODE_SHELL_LOGIN'] = '1';
                addEnvMixinPathPrefix(options, envMixin);
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
            }
            if (!newArgs) {
                return undefined;
            }
            newArgs = [...newArgs];
            newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot);
            envMixin['VSCODE_STABLE'] = productService.quality === 'stable' ? '1' : '0';
            return { newArgs, envMixin };
        }
        logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
        return undefined;
    }
    switch (shell) {
        case 'bash': {
            if (!originalArgs || originalArgs.length === 0) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
            }
            else if (areZshBashLoginArgs(originalArgs)) {
                envMixin['VSCODE_SHELL_LOGIN'] = '1';
                addEnvMixinPathPrefix(options, envMixin);
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
            }
            if (!newArgs) {
                return undefined;
            }
            newArgs = [...newArgs];
            newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot);
            envMixin['VSCODE_STABLE'] = productService.quality === 'stable' ? '1' : '0';
            return { newArgs, envMixin };
        }
        case 'fish': {
            const oldDataDirs = env?.XDG_DATA_DIRS ?? '/usr/local/share:/usr/share';
            const newDataDir = path.join(appRoot, 'out/vs/workbench/contrib/terminal/common/scripts/fish_xdg_data');
            envMixin['XDG_DATA_DIRS'] = `${oldDataDirs}:${newDataDir}`;
            addEnvMixinPathPrefix(options, envMixin);
            return { newArgs: undefined, envMixin };
        }
        case 'pwsh': {
            if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Pwsh);
            }
            else if (arePwshLoginArgs(originalArgs)) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.PwshLogin);
            }
            if (!newArgs) {
                return undefined;
            }
            if (options.shellIntegration.suggestEnabled) {
                envMixin['VSCODE_SUGGEST'] = '1';
            }
            newArgs = [...newArgs];
            newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot, '');
            envMixin['VSCODE_STABLE'] = productService.quality === 'stable' ? '1' : '0';
            return { newArgs, envMixin };
        }
        case 'zsh': {
            if (!originalArgs || originalArgs.length === 0) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Zsh);
            }
            else if (areZshBashLoginArgs(originalArgs)) {
                newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.ZshLogin);
                addEnvMixinPathPrefix(options, envMixin);
            }
            else if (originalArgs === shellIntegrationArgs.get(ShellIntegrationExecutable.Zsh) || originalArgs === shellIntegrationArgs.get(ShellIntegrationExecutable.ZshLogin)) {
                newArgs = originalArgs;
            }
            if (!newArgs) {
                return undefined;
            }
            newArgs = [...newArgs];
            newArgs[newArgs.length - 1] = format(newArgs[newArgs.length - 1], appRoot);
            let username;
            try {
                username = os.userInfo().username;
            }
            catch {
                username = 'unknown';
            }
            const zdotdir = path.join(os.tmpdir(), `${username}-${productService.applicationName}-zsh`);
            envMixin['ZDOTDIR'] = zdotdir;
            const userZdotdir = env?.ZDOTDIR ?? os.homedir() ?? `~`;
            envMixin['USER_ZDOTDIR'] = userZdotdir;
            const filesToCopy = [];
            filesToCopy.push({
                source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-rc.zsh'),
                dest: path.join(zdotdir, '.zshrc')
            });
            filesToCopy.push({
                source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-profile.zsh'),
                dest: path.join(zdotdir, '.zprofile')
            });
            filesToCopy.push({
                source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-env.zsh'),
                dest: path.join(zdotdir, '.zshenv')
            });
            filesToCopy.push({
                source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-login.zsh'),
                dest: path.join(zdotdir, '.zlogin')
            });
            return { newArgs, envMixin, filesToCopy };
        }
    }
    logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
    return undefined;
}
function addEnvMixinPathPrefix(options, envMixin) {
    if (isMacintosh && options.environmentVariableCollections) {
        const deserialized = deserializeEnvironmentVariableCollections(options.environmentVariableCollections);
        const merged = new MergedEnvironmentVariableCollection(deserialized);
        const pathEntry = merged.getVariableMap({ workspaceFolder: options.workspaceFolder }).get('PATH');
        const prependToPath = [];
        if (pathEntry) {
            for (const mutator of pathEntry) {
                if (mutator.type === EnvironmentVariableMutatorType.Prepend) {
                    prependToPath.push(mutator.value);
                }
            }
        }
        if (prependToPath.length > 0) {
            envMixin['VSCODE_PATH_PREFIX'] = prependToPath.join('');
        }
    }
}
var ShellIntegrationExecutable;
(function (ShellIntegrationExecutable) {
    ShellIntegrationExecutable["WindowsPwsh"] = "windows-pwsh";
    ShellIntegrationExecutable["WindowsPwshLogin"] = "windows-pwsh-login";
    ShellIntegrationExecutable["Pwsh"] = "pwsh";
    ShellIntegrationExecutable["PwshLogin"] = "pwsh-login";
    ShellIntegrationExecutable["Zsh"] = "zsh";
    ShellIntegrationExecutable["ZshLogin"] = "zsh-login";
    ShellIntegrationExecutable["Bash"] = "bash";
})(ShellIntegrationExecutable || (ShellIntegrationExecutable = {}));
const shellIntegrationArgs = new Map();
shellIntegrationArgs.set(ShellIntegrationExecutable.WindowsPwsh, ['-noexit', '-command', 'try { . \"{0}\\out\\vs\\workbench\\contrib\\terminal\\common\\scripts\\shellIntegration.ps1\" } catch {}{1}']);
shellIntegrationArgs.set(ShellIntegrationExecutable.WindowsPwshLogin, ['-l', '-noexit', '-command', 'try { . \"{0}\\out\\vs\\workbench\\contrib\\terminal\\common\\scripts\\shellIntegration.ps1\" } catch {}{1}']);
shellIntegrationArgs.set(ShellIntegrationExecutable.Pwsh, ['-noexit', '-command', '. "{0}/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration.ps1"{1}']);
shellIntegrationArgs.set(ShellIntegrationExecutable.PwshLogin, ['-l', '-noexit', '-command', '. "{0}/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration.ps1"']);
shellIntegrationArgs.set(ShellIntegrationExecutable.Zsh, ['-i']);
shellIntegrationArgs.set(ShellIntegrationExecutable.ZshLogin, ['-il']);
shellIntegrationArgs.set(ShellIntegrationExecutable.Bash, ['--init-file', '{0}/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-bash.sh']);
const pwshLoginArgs = ['-login', '-l'];
const shLoginArgs = ['--login', '-l'];
const shInteractiveArgs = ['-i', '--interactive'];
const pwshImpliedArgs = ['-nol', '-nologo'];
function arePwshLoginArgs(originalArgs) {
    if (typeof originalArgs === 'string') {
        return pwshLoginArgs.includes(originalArgs.toLowerCase());
    }
    else {
        return originalArgs.length === 1 && pwshLoginArgs.includes(originalArgs[0].toLowerCase()) ||
            (originalArgs.length === 2 &&
                (((pwshLoginArgs.includes(originalArgs[0].toLowerCase())) || pwshLoginArgs.includes(originalArgs[1].toLowerCase())))
                && ((pwshImpliedArgs.includes(originalArgs[0].toLowerCase())) || pwshImpliedArgs.includes(originalArgs[1].toLowerCase())));
    }
}
function arePwshImpliedArgs(originalArgs) {
    if (typeof originalArgs === 'string') {
        return pwshImpliedArgs.includes(originalArgs.toLowerCase());
    }
    else {
        return originalArgs.length === 0 || originalArgs?.length === 1 && pwshImpliedArgs.includes(originalArgs[0].toLowerCase());
    }
}
function areZshBashLoginArgs(originalArgs) {
    if (typeof originalArgs !== 'string') {
        originalArgs = originalArgs.filter(arg => !shInteractiveArgs.includes(arg.toLowerCase()));
    }
    return originalArgs === 'string' && shLoginArgs.includes(originalArgs.toLowerCase())
        || typeof originalArgs !== 'string' && originalArgs.length === 1 && shLoginArgs.includes(originalArgs[0].toLowerCase());
}
