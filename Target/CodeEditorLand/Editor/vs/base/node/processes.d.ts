import * as cp from 'child_process';
import * as Platform from '../common/platform.js';
import { CommandOptions, ForkOptions, Source, SuccessData, TerminateResponse, TerminateResponseCode } from '../common/processes.js';
export { type CommandOptions, type ForkOptions, type SuccessData, Source, type TerminateResponse, TerminateResponseCode };
export type ValueCallback<T> = (value: T | Promise<T>) => void;
export type ErrorCallback = (error?: any) => void;
export type ProgressCallback<T> = (progress: T) => void;
export declare function getWindowsShell(env?: Platform.IProcessEnvironment): string;
export interface IQueuedSender {
    send: (msg: any) => void;
}
export declare function createQueuedSender(childProcess: cp.ChildProcess): IQueuedSender;
export declare namespace win32 {
    function findExecutable(command: string, cwd?: string, paths?: string[]): Promise<string>;
}
