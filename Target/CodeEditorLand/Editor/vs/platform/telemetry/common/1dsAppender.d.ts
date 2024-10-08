import type { IExtendedTelemetryItem, ITelemetryItem, ITelemetryUnloadState } from '@microsoft/1ds-core-js';
import { ITelemetryAppender } from './telemetryUtils.js';
export interface IAppInsightsCore {
    pluginVersionString: string;
    track(item: ITelemetryItem | IExtendedTelemetryItem): void;
    unload(isAsync: boolean, unloadComplete: (unloadState: ITelemetryUnloadState) => void): void;
}
export declare abstract class AbstractOneDataSystemAppender implements ITelemetryAppender {
    private readonly _isInternalTelemetry;
    private _eventPrefix;
    private _defaultData;
    private _xhrOverride?;
    protected _aiCoreOrKey: IAppInsightsCore | string | undefined;
    private _asyncAiCore;
    protected readonly endPointUrl = "https://mobile.events.data.microsoft.com/OneCollector/1.0";
    protected readonly endPointHealthUrl = "https://mobile.events.data.microsoft.com/ping";
    constructor(_isInternalTelemetry: boolean, _eventPrefix: string, _defaultData: {
        [key: string]: any;
    } | null, iKeyOrClientFactory: string | (() => IAppInsightsCore), // allow factory function for testing
    _xhrOverride?: any);
    private _withAIClient;
    log(eventName: string, data?: any): void;
    flush(): Promise<void>;
}
