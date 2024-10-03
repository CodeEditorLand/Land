import { IRemoteConsoleLog } from '../../../../base/common/console.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare function logRemoteEntry(logService: ILogService, entry: IRemoteConsoleLog, label?: string | null): void;
export declare function logRemoteEntryIfError(logService: ILogService, entry: IRemoteConsoleLog, label: string): void;
