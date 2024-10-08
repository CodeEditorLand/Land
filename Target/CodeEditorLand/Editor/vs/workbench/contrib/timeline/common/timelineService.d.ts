import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITimelineService, TimelineChangeEvent, TimelineOptions, TimelineProvidersChangeEvent, TimelineProvider } from './timeline.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const TimelineHasProviderContext: RawContextKey<boolean>;
export declare class TimelineService implements ITimelineService {
    private readonly logService;
    protected viewsService: IViewsService;
    protected configurationService: IConfigurationService;
    protected contextKeyService: IContextKeyService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: Event<TimelineProvidersChangeEvent>;
    private readonly _onDidChangeTimeline;
    readonly onDidChangeTimeline: Event<TimelineChangeEvent>;
    private readonly _onDidChangeUri;
    readonly onDidChangeUri: Event<URI>;
    private readonly hasProviderContext;
    private readonly providers;
    private readonly providerSubscriptions;
    constructor(logService: ILogService, viewsService: IViewsService, configurationService: IConfigurationService, contextKeyService: IContextKeyService);
    getSources(): {
        id: string;
        label: string;
    }[];
    getTimeline(id: string, uri: URI, options: TimelineOptions, tokenSource: CancellationTokenSource): {
        result: Promise<import("./timeline.js").Timeline | undefined>;
        options: TimelineOptions;
        source: string;
        tokenSource: CancellationTokenSource;
        uri: URI;
    } | undefined;
    registerTimelineProvider(provider: TimelineProvider): IDisposable;
    unregisterTimelineProvider(id: string): void;
    setUri(uri: URI): void;
    private updateHasProviderContext;
}
