import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IProcessDataEvent } from './terminal.js';
export declare class TerminalDataBufferer implements IDisposable {
    private readonly _callback;
    private readonly _terminalBufferMap;
    constructor(_callback: (id: number, data: string) => void);
    dispose(): void;
    startBuffering(id: number, event: Event<string | IProcessDataEvent>, throttleBy?: number): IDisposable;
    stopBuffering(id: number): void;
    flushBuffer(id: number): void;
}
