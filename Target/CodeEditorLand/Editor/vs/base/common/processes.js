/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isLinux } from './platform.js';
/**
 * Sanitizes a VS Code process environment by removing all Electron/VS Code-related values.
 */
export function sanitizeProcessEnvironment(env, ...preserve) {
    const set = preserve.reduce((set, key) => {
        set[key] = true;
        return set;
    }, {});
    const keysToRemove = [
        /^ELECTRON_.+$/,
        /^VSCODE_(?!(PORTABLE|SHELL_LOGIN|ENV_REPLACE|ENV_APPEND|ENV_PREPEND)).+$/,
        /^SNAP(|_.*)$/,
        /^GDK_PIXBUF_.+$/,
    ];
    const envKeys = Object.keys(env);
    envKeys
        .filter(key => !set[key])
        .forEach(envKey => {
        for (let i = 0; i < keysToRemove.length; i++) {
            if (envKey.search(keysToRemove[i]) !== -1) {
                delete env[envKey];
                break;
            }
        }
    });
}
/**
 * Remove dangerous environment variables that have caused crashes
 * in forked processes (i.e. in ELECTRON_RUN_AS_NODE processes)
 *
 * @param env The env object to change
 */
export function removeDangerousEnvVariables(env) {
    if (!env) {
        return;
    }
    // Unset `DEBUG`, as an invalid value might lead to process crashes
    // See https://github.com/microsoft/vscode/issues/130072
    delete env['DEBUG'];
    if (isLinux) {
        // Unset `LD_PRELOAD`, as it might lead to process crashes
        // See https://github.com/microsoft/vscode/issues/134177
        delete env['LD_PRELOAD'];
    }
}
