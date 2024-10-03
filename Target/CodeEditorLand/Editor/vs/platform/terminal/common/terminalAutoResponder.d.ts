import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { ITerminalChildProcess } from './terminal.js';
export declare class TerminalAutoResponder extends Disposable {
    private _pointer;
    private _paused;
    private _throttled;
    constructor(proc: ITerminalChildProcess, matchWord: string, response: string, logService: ILogService);
    private _reset;
    handleResize(): void;
    handleInput(): void;
}
