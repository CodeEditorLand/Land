import { IPtyHostProcessReplayEvent } from './capabilities/capabilities.js';
import { ReplayEntry } from './terminalProcess.js';
export interface IRemoteTerminalProcessReplayEvent {
    events: ReplayEntry[];
}
export declare class TerminalRecorder {
    private _entries;
    private _totalDataLength;
    constructor(cols: number, rows: number);
    handleResize(cols: number, rows: number): void;
    handleData(data: string): void;
    generateReplayEventSync(): IPtyHostProcessReplayEvent;
    generateReplayEvent(): Promise<IPtyHostProcessReplayEvent>;
}
