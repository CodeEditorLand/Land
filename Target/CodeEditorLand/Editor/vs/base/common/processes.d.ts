import { IProcessEnvironment } from './platform.js';
/**
 * Options to be passed to the external program or shell.
 */
export interface CommandOptions {
    /**
     * The current working directory of the executed program or shell.
     * If omitted VSCode's current workspace root is used.
     */
    cwd?: string;
    /**
     * The environment of the executed program or shell. If omitted
     * the parent process' environment is used.
     */
    env?: {
        [key: string]: string;
    };
}
export interface Executable {
    /**
     * The command to be executed. Can be an external program or a shell
     * command.
     */
    command: string;
    /**
     * Specifies whether the command is a shell command and therefore must
     * be executed in a shell interpreter (e.g. cmd.exe, bash, ...).
     */
    isShellCommand: boolean;
    /**
     * The arguments passed to the command.
     */
    args: string[];
    /**
     * The command options used when the command is executed. Can be omitted.
     */
    options?: CommandOptions;
}
export interface ForkOptions extends CommandOptions {
    execArgv?: string[];
}
export declare const enum Source {
    stdout = 0,
    stderr = 1
}
/**
 * The data send via a success callback
 */
export interface SuccessData {
    error?: Error;
    cmdCode?: number;
    terminated?: boolean;
}
/**
 * The data send via a error callback
 */
export interface ErrorData {
    error?: Error;
    terminated?: boolean;
    stdout?: string;
    stderr?: string;
}
export interface TerminateResponse {
    success: boolean;
    code?: TerminateResponseCode;
    error?: any;
}
export declare const enum TerminateResponseCode {
    Success = 0,
    Unknown = 1,
    AccessDenied = 2,
    ProcessNotFound = 3
}
export interface ProcessItem {
    name: string;
    cmd: string;
    pid: number;
    ppid: number;
    load: number;
    mem: number;
    children?: ProcessItem[];
}
/**
 * Sanitizes a VS Code process environment by removing all Electron/VS Code-related values.
 */
export declare function sanitizeProcessEnvironment(env: IProcessEnvironment, ...preserve: string[]): void;
/**
 * Remove dangerous environment variables that have caused crashes
 * in forked processes (i.e. in ELECTRON_RUN_AS_NODE processes)
 *
 * @param env The env object to change
 */
export declare function removeDangerousEnvVariables(env: IProcessEnvironment | undefined): void;
