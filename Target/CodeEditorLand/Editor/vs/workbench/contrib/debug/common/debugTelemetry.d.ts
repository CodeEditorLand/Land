import { IDebugModel, IDebugSession, AdapterEndEvent } from './debug.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { Debugger } from './debugger.js';
export declare class DebugTelemetry {
    private readonly model;
    private readonly telemetryService;
    constructor(model: IDebugModel, telemetryService: ITelemetryService);
    logDebugSessionStart(dbgr: Debugger, launchJsonExists: boolean): void;
    logDebugSessionStop(session: IDebugSession, adapterExitEvent: AdapterEndEvent): void;
}
