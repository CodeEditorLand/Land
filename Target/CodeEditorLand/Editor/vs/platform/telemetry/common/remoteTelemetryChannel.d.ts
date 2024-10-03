import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ITelemetryAppender } from './telemetryUtils.js';
import { IServerTelemetryService } from './serverTelemetryService.js';
export declare class ServerTelemetryChannel extends Disposable implements IServerChannel {
    private readonly telemetryService;
    private readonly telemetryAppender;
    constructor(telemetryService: IServerTelemetryService, telemetryAppender: ITelemetryAppender | null);
    call(_: any, command: string, arg?: any): Promise<any>;
    listen(_: any, event: string, arg: any): Event<any>;
    dispose(): void;
}
