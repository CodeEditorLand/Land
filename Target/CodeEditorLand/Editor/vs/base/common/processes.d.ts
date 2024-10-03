import { IProcessEnvironment } from './platform.js';
export interface CommandOptions {
    cwd?: string;
    env?: {
        [key: string]: string;
    };
}
export interface Executable {
    command: string;
    isShellCommand: boolean;
    args: string[];
    options?: CommandOptions;
}
export interface ForkOptions extends CommandOptions {
    execArgv?: string[];
}
export declare const enum Source {
    stdout = 0,
    stderr = 1
}
export interface SuccessData {
    error?: Error;
    cmdCode?: number;
    terminated?: boolean;
}
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
export declare function sanitizeProcessEnvironment(env: IProcessEnvironment, ...preserve: string[]): void;
export declare function removeDangerousEnvVariables(env: IProcessEnvironment | undefined): void;
