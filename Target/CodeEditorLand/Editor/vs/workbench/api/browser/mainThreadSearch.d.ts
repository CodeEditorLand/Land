import { UriComponents } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IRawFileMatch2, ISearchService } from '../../services/search/common/search.js';
import { MainThreadSearchShape } from '../common/extHost.protocol.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
export declare class MainThreadSearch implements MainThreadSearchShape {
    private readonly _searchService;
    private readonly _telemetryService;
    protected contextKeyService: IContextKeyService;
    private readonly _proxy;
    private readonly _searchProvider;
    constructor(extHostContext: IExtHostContext, _searchService: ISearchService, _telemetryService: ITelemetryService, _configurationService: IConfigurationService, contextKeyService: IContextKeyService);
    dispose(): void;
    $registerTextSearchProvider(handle: number, scheme: string): void;
    $registerAITextSearchProvider(handle: number, scheme: string): void;
    $registerFileSearchProvider(handle: number, scheme: string): void;
    $unregisterProvider(handle: number): void;
    $handleFileMatch(handle: number, session: number, data: UriComponents[]): void;
    $handleTextMatch(handle: number, session: number, data: IRawFileMatch2[]): void;
    $handleTelemetry(eventName: string, data: any): void;
}
