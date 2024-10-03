import { DisposableStore } from '../../../base/common/lifecycle.js';
import { ITelemetryService } from './telemetry.js';
export interface ErrorEvent {
    callstack: string;
    msg?: string;
    file?: string;
    line?: number;
    column?: number;
    uncaught_error_name?: string;
    uncaught_error_msg?: string;
    count?: number;
}
export declare namespace ErrorEvent {
    function compare(a: ErrorEvent, b: ErrorEvent): 0 | 1 | -1;
}
export default abstract class BaseErrorTelemetry {
    static ERROR_FLUSH_TIMEOUT: number;
    private _telemetryService;
    private _flushDelay;
    private _flushHandle;
    private _buffer;
    protected readonly _disposables: DisposableStore;
    constructor(telemetryService: ITelemetryService, flushDelay?: number);
    dispose(): void;
    protected installErrorListeners(): void;
    private _onErrorEvent;
    protected _enqueue(e: ErrorEvent): void;
    private _flushBuffer;
}
