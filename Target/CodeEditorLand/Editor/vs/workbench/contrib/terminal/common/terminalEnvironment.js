import * as path from '../../../../base/common/path.js';
import { URI } from '../../../../base/common/uri.js';
import { sanitizeProcessEnvironment } from '../../../../base/common/processes.js';
import { isWindows, isMacintosh, language } from '../../../../base/common/platform.js';
import { escapeNonWindowsPath, sanitizeCwd } from '../../../../platform/terminal/common/terminalEnvironment.js';
import { isString } from '../../../../base/common/types.js';
export function mergeEnvironments(parent, other) {
    if (!other) {
        return;
    }
    if (isWindows) {
        for (const configKey in other) {
            let actualKey = configKey;
            for (const envKey in parent) {
                if (configKey.toLowerCase() === envKey.toLowerCase()) {
                    actualKey = envKey;
                    break;
                }
            }
            const value = other[configKey];
            if (value !== undefined) {
                _mergeEnvironmentValue(parent, actualKey, value);
            }
        }
    }
    else {
        Object.keys(other).forEach((key) => {
            const value = other[key];
            if (value !== undefined) {
                _mergeEnvironmentValue(parent, key, value);
            }
        });
    }
}
function _mergeEnvironmentValue(env, key, value) {
    if (typeof value === 'string') {
        env[key] = value;
    }
    else {
        delete env[key];
    }
}
export function addTerminalEnvironmentKeys(env, version, locale, detectLocale) {
    env['TERM_PROGRAM'] = 'vscode';
    if (version) {
        env['TERM_PROGRAM_VERSION'] = version;
    }
    if (shouldSetLangEnvVariable(env, detectLocale)) {
        env['LANG'] = getLangEnvVariable(locale);
    }
    env['COLORTERM'] = 'truecolor';
}
function mergeNonNullKeys(env, other) {
    if (!other) {
        return;
    }
    for (const key of Object.keys(other)) {
        const value = other[key];
        if (value !== undefined && value !== null) {
            env[key] = value;
        }
    }
}
async function resolveConfigurationVariables(variableResolver, env) {
    await Promise.all(Object.entries(env).map(async ([key, value]) => {
        if (typeof value === 'string') {
            try {
                env[key] = await variableResolver(value);
            }
            catch (e) {
                env[key] = value;
            }
        }
    }));
    return env;
}
export function shouldSetLangEnvVariable(env, detectLocale) {
    if (detectLocale === 'on') {
        return true;
    }
    if (detectLocale === 'auto') {
        const lang = env['LANG'];
        return !lang || (lang.search(/\.UTF\-8$/) === -1 && lang.search(/\.utf8$/) === -1 && lang.search(/\.euc.+/) === -1);
    }
    return false;
}
export function getLangEnvVariable(locale) {
    const parts = locale ? locale.split('-') : [];
    const n = parts.length;
    if (n === 0) {
        return 'en_US.UTF-8';
    }
    if (n === 1) {
        const languageVariants = {
            af: 'ZA',
            am: 'ET',
            be: 'BY',
            bg: 'BG',
            ca: 'ES',
            cs: 'CZ',
            da: 'DK',
            de: 'DE',
            el: 'GR',
            en: 'US',
            es: 'ES',
            et: 'EE',
            eu: 'ES',
            fi: 'FI',
            fr: 'FR',
            he: 'IL',
            hr: 'HR',
            hu: 'HU',
            hy: 'AM',
            is: 'IS',
            it: 'IT',
            ja: 'JP',
            kk: 'KZ',
            ko: 'KR',
            lt: 'LT',
            nl: 'NL',
            no: 'NO',
            pl: 'PL',
            pt: 'BR',
            ro: 'RO',
            ru: 'RU',
            sk: 'SK',
            sl: 'SI',
            sr: 'YU',
            sv: 'SE',
            tr: 'TR',
            uk: 'UA',
            zh: 'CN',
        };
        if (parts[0] in languageVariants) {
            parts.push(languageVariants[parts[0]]);
        }
    }
    else {
        parts[1] = parts[1].toUpperCase();
    }
    return parts.join('_') + '.UTF-8';
}
export async function getCwd(shell, userHome, variableResolver, root, customCwd, logService) {
    if (shell.cwd) {
        const unresolved = (typeof shell.cwd === 'object') ? shell.cwd.fsPath : shell.cwd;
        const resolved = await _resolveCwd(unresolved, variableResolver);
        return sanitizeCwd(resolved || unresolved);
    }
    let cwd;
    if (!shell.ignoreConfigurationCwd && customCwd) {
        if (variableResolver) {
            customCwd = await _resolveCwd(customCwd, variableResolver, logService);
        }
        if (customCwd) {
            if (path.isAbsolute(customCwd)) {
                cwd = customCwd;
            }
            else if (root) {
                cwd = path.join(root.fsPath, customCwd);
            }
        }
    }
    if (!cwd) {
        cwd = root ? root.fsPath : userHome || '';
    }
    return sanitizeCwd(cwd);
}
async function _resolveCwd(cwd, variableResolver, logService) {
    if (variableResolver) {
        try {
            return await variableResolver(cwd);
        }
        catch (e) {
            logService?.error('Could not resolve terminal cwd', e);
            return undefined;
        }
    }
    return cwd;
}
export function createVariableResolver(lastActiveWorkspace, env, configurationResolverService) {
    if (!configurationResolverService) {
        return undefined;
    }
    return (str) => configurationResolverService.resolveWithEnvironment(env, lastActiveWorkspace, str);
}
export async function createTerminalEnvironment(shellLaunchConfig, envFromConfig, variableResolver, version, detectLocale, baseEnv) {
    const env = {};
    if (shellLaunchConfig.strictEnv) {
        mergeNonNullKeys(env, shellLaunchConfig.env);
    }
    else {
        mergeNonNullKeys(env, baseEnv);
        const allowedEnvFromConfig = { ...envFromConfig };
        if (variableResolver) {
            if (allowedEnvFromConfig) {
                await resolveConfigurationVariables(variableResolver, allowedEnvFromConfig);
            }
            if (shellLaunchConfig.env) {
                await resolveConfigurationVariables(variableResolver, shellLaunchConfig.env);
            }
        }
        if (isMacintosh) {
            if (env['VSCODE_NODE_OPTIONS']) {
                env['NODE_OPTIONS'] = env['VSCODE_NODE_OPTIONS'];
                delete env['VSCODE_NODE_OPTIONS'];
            }
            if (env['VSCODE_NODE_REPL_EXTERNAL_MODULE']) {
                env['NODE_REPL_EXTERNAL_MODULE'] = env['VSCODE_NODE_REPL_EXTERNAL_MODULE'];
                delete env['VSCODE_NODE_REPL_EXTERNAL_MODULE'];
            }
        }
        sanitizeProcessEnvironment(env, 'VSCODE_IPC_HOOK_CLI');
        mergeEnvironments(env, allowedEnvFromConfig);
        mergeEnvironments(env, shellLaunchConfig.env);
        addTerminalEnvironmentKeys(env, version, language, detectLocale);
    }
    return env;
}
export async function preparePathForShell(resource, executable, title, shellType, backend, os, isWindowsFrontend = isWindows) {
    let originalPath;
    if (isString(resource)) {
        originalPath = resource;
    }
    else {
        originalPath = resource.fsPath;
        if (isWindowsFrontend && os !== 1) {
            originalPath = originalPath.replace(/\\/g, '\/');
        }
        else if (!isWindowsFrontend && os === 1) {
            originalPath = originalPath.replace(/\//g, '\\');
        }
    }
    if (!executable) {
        return originalPath;
    }
    const hasSpace = originalPath.includes(' ');
    const hasParens = originalPath.includes('(') || originalPath.includes(')');
    const pathBasename = path.basename(executable, '.exe');
    const isPowerShell = pathBasename === 'pwsh' ||
        title === 'pwsh' ||
        pathBasename === 'powershell' ||
        title === 'powershell';
    if (isPowerShell && (hasSpace || originalPath.includes('\''))) {
        return `& '${originalPath.replace(/'/g, '\'\'')}'`;
    }
    if (hasParens && isPowerShell) {
        return `& '${originalPath}'`;
    }
    if (os === 1) {
        if (shellType !== undefined) {
            if (shellType === "gitbash") {
                return escapeNonWindowsPath(originalPath.replace(/\\/g, '/'));
            }
            else if (shellType === "wsl") {
                return backend?.getWslPath(originalPath, 'win-to-unix') || originalPath;
            }
            else if (hasSpace) {
                return `"${originalPath}"`;
            }
            return originalPath;
        }
        const lowerExecutable = executable.toLowerCase();
        if (lowerExecutable.includes('wsl') || (lowerExecutable.includes('bash.exe') && !lowerExecutable.toLowerCase().includes('git'))) {
            return backend?.getWslPath(originalPath, 'win-to-unix') || originalPath;
        }
        else if (hasSpace) {
            return `"${originalPath}"`;
        }
        return originalPath;
    }
    return escapeNonWindowsPath(originalPath);
}
export function getWorkspaceForTerminal(cwd, workspaceContextService, historyService) {
    const cwdUri = typeof cwd === 'string' ? URI.parse(cwd) : cwd;
    let workspaceFolder = cwdUri ? workspaceContextService.getWorkspaceFolder(cwdUri) ?? undefined : undefined;
    if (!workspaceFolder) {
        const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot();
        workspaceFolder = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
    }
    return workspaceFolder;
}
