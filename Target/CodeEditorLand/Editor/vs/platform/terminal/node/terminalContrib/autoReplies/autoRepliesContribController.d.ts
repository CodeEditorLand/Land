import { ILogService } from '../../../../log/common/log.js';
import type { IPtyServiceContribution, ITerminalChildProcess } from '../../../common/terminal.js';
export declare class AutoRepliesPtyServiceContribution implements IPtyServiceContribution {
    private readonly _logService;
    private readonly _autoReplies;
    private readonly _terminalProcesses;
    private readonly _autoResponders;
    constructor(_logService: ILogService);
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
    handleProcessReady(persistentProcessId: number, process: ITerminalChildProcess): void;
    handleProcessDispose(persistentProcessId: number): void;
    handleProcessInput(persistentProcessId: number, data: string): void;
    handleProcessResize(persistentProcessId: number, cols: number, rows: number): void;
    private _processInstallAutoReply;
}
