import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
export declare const ignoreProcessNames: string[];
export declare class ChildProcessMonitor extends Disposable {
    private readonly _pid;
    private readonly _logService;
    private _hasChildProcesses;
    private set hasChildProcesses(value);
    get hasChildProcesses(): boolean;
    private readonly _onDidChangeHasChildProcesses;
    readonly onDidChangeHasChildProcesses: import("../../../workbench/workbench.web.main.internal.js").Event<boolean>;
    constructor(_pid: number, _logService: ILogService);
    handleInput(): void;
    handleOutput(): void;
    private _refreshActive;
    private _refreshInactive;
    private _processContainsChildren;
}
