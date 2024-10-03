import { isLinux } from './platform.js';
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
export function removeDangerousEnvVariables(env) {
    if (!env) {
        return;
    }
    delete env['DEBUG'];
    if (isLinux) {
        delete env['LD_PRELOAD'];
    }
}
