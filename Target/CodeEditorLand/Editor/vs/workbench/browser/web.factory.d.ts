import { ITunnel, ITunnelOptions, IWorkbenchConstructionOptions } from './web.api.js';
import { URI } from '../../base/common/uri.js';
import { IDisposable } from '../../base/common/lifecycle.js';
import { PerformanceMark } from '../../base/common/performance.js';
import { IProgress, IProgressCompositeOptions, IProgressDialogOptions, IProgressNotificationOptions, IProgressOptions, IProgressStep, IProgressWindowOptions } from '../../platform/progress/common/progress.js';
import { LogLevel } from '../../platform/log/common/log.js';
import { IEmbedderTerminalOptions } from '../services/terminal/common/embedderTerminalService.js';
export declare function create(domElement: HTMLElement, options: IWorkbenchConstructionOptions): IDisposable;
export declare namespace commands {
    function executeCommand(command: string, ...args: any[]): Promise<unknown>;
}
export declare namespace logger {
    function log(level: LogLevel, message: string): void;
}
export declare namespace env {
    function retrievePerformanceMarks(): Promise<[string, readonly PerformanceMark[]][]>;
    function getUriScheme(): Promise<string>;
    function openUri(target: URI): Promise<boolean>;
}
export declare namespace window {
    function withProgress<R>(options: IProgressOptions | IProgressDialogOptions | IProgressNotificationOptions | IProgressWindowOptions | IProgressCompositeOptions, task: (progress: IProgress<IProgressStep>) => Promise<R>): Promise<R>;
    function createTerminal(options: IEmbedderTerminalOptions): Promise<void>;
    function showInformationMessage<T extends string>(message: string, ...items: T[]): Promise<T | undefined>;
}
export declare namespace workspace {
    function didResolveRemoteAuthority(): Promise<void>;
    function openTunnel(tunnelOptions: ITunnelOptions): Promise<ITunnel>;
}
