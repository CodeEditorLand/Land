import { Event } from '../../../base/common/event.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ITelemetryAppender } from './telemetryUtils.js';
export interface ITelemetryLog {
    eventName: string;
    data?: any;
}
export declare class TelemetryAppenderChannel implements IServerChannel {
    private appenders;
    constructor(appenders: ITelemetryAppender[]);
    listen<T>(_: unknown, event: string): Event<T>;
    call(_: unknown, command: string, { eventName, data }: ITelemetryLog): Promise<any>;
}
export declare class TelemetryAppenderClient implements ITelemetryAppender {
    private channel;
    constructor(channel: IChannel);
    log(eventName: string, data?: any): any;
    flush(): Promise<void>;
}
