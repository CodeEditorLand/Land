import * as cp from 'child_process';
import { getDriveLetter } from '../../../../base/common/extpath.js';
import * as platform from '../../../../base/common/platform.js';
function spawnAsPromised(command, args) {
    return new Promise((resolve, reject) => {
        let stdout = '';
        const child = cp.spawn(command, args);
        if (child.pid) {
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
        }
        child.on('error', err => {
            reject(err);
        });
        child.on('close', code => {
            resolve(stdout);
        });
    });
}
export async function hasChildProcesses(processId) {
    if (processId) {
        if (platform.isWindows) {
            const windowsProcessTree = await import('@vscode/windows-process-tree');
            return new Promise(resolve => {
                windowsProcessTree.getProcessTree(processId, processTree => {
                    resolve(!!processTree && processTree.children.length > 0);
                });
            });
        }
        else {
            return spawnAsPromised('/usr/bin/pgrep', ['-lP', String(processId)]).then(stdout => {
                const r = stdout.trim();
                if (r.length === 0 || r.indexOf(' tmux') >= 0) {
                    return false;
                }
                else {
                    return true;
                }
            }, error => {
                return true;
            });
        }
    }
    return Promise.resolve(true);
}
export function prepareCommand(shell, args, argsCanBeInterpretedByShell, cwd, env) {
    shell = shell.trim().toLowerCase();
    let shellType;
    if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0) {
        shellType = 1;
    }
    else if (shell.indexOf('cmd.exe') >= 0) {
        shellType = 0;
    }
    else if (shell.indexOf('bash') >= 0) {
        shellType = 2;
    }
    else if (platform.isWindows) {
        shellType = 0;
    }
    else {
        shellType = 2;
    }
    let quote;
    let command = ' ';
    switch (shellType) {
        case 1:
            quote = (s) => {
                s = s.replace(/\'/g, '\'\'');
                if (s.length > 0 && s.charAt(s.length - 1) === '\\') {
                    return `'${s}\\'`;
                }
                return `'${s}'`;
            };
            if (cwd) {
                const driveLetter = getDriveLetter(cwd);
                if (driveLetter) {
                    command += `${driveLetter}:; `;
                }
                command += `cd ${quote(cwd)}; `;
            }
            if (env) {
                for (const key in env) {
                    const value = env[key];
                    if (value === null) {
                        command += `Remove-Item env:${key}; `;
                    }
                    else {
                        command += `\${env:${key}}='${value}'; `;
                    }
                }
            }
            if (args.length > 0) {
                const arg = args.shift();
                const cmd = argsCanBeInterpretedByShell ? arg : quote(arg);
                command += (cmd[0] === '\'') ? `& ${cmd} ` : `${cmd} `;
                for (const a of args) {
                    command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                    command += ' ';
                }
            }
            break;
        case 0:
            quote = (s) => {
                s = s.replace(/\"/g, '""');
                s = s.replace(/([><!^&|])/g, '^$1');
                return (' "'.split('').some(char => s.includes(char)) || s.length === 0) ? `"${s}"` : s;
            };
            if (cwd) {
                const driveLetter = getDriveLetter(cwd);
                if (driveLetter) {
                    command += `${driveLetter}: && `;
                }
                command += `cd ${quote(cwd)} && `;
            }
            if (env) {
                command += 'cmd /C "';
                for (const key in env) {
                    let value = env[key];
                    if (value === null) {
                        command += `set "${key}=" && `;
                    }
                    else {
                        value = value.replace(/[&^|<>]/g, s => `^${s}`);
                        command += `set "${key}=${value}" && `;
                    }
                }
            }
            for (const a of args) {
                command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                command += ' ';
            }
            if (env) {
                command += '"';
            }
            break;
        case 2: {
            quote = (s) => {
                s = s.replace(/(["'\\\$!><#()\[\]*&^| ;{}?`])/g, '\\$1');
                return s.length === 0 ? `""` : s;
            };
            const hardQuote = (s) => {
                return /[^\w@%\/+=,.:^-]/.test(s) ? `'${s.replace(/'/g, '\'\\\'\'')}'` : s;
            };
            if (cwd) {
                command += `cd ${quote(cwd)} ; `;
            }
            if (env) {
                command += '/usr/bin/env';
                for (const key in env) {
                    const value = env[key];
                    if (value === null) {
                        command += ` -u ${hardQuote(key)}`;
                    }
                    else {
                        command += ` ${hardQuote(`${key}=${value}`)}`;
                    }
                }
                command += ' ';
            }
            for (const a of args) {
                command += (a === '<' || a === '>' || argsCanBeInterpretedByShell) ? a : quote(a);
                command += ' ';
            }
            break;
        }
    }
    return command;
}
