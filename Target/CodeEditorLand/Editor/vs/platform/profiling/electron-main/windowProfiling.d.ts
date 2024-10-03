import { BrowserWindow } from 'electron';
import { ILogService } from '../../log/common/log.js';
import { IV8Profile } from '../common/profiling.js';
export declare class WindowProfiler {
    private readonly _window;
    private readonly _sessionId;
    private readonly _logService;
    constructor(_window: BrowserWindow, _sessionId: string, _logService: ILogService);
    inspect(duration: number): Promise<IV8Profile>;
    private _connect;
    private _disconnect;
}
