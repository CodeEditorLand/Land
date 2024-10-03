import { Event } from '../../../base/common/event.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IExtensionRecommendationNotificationService, IExtensionRecommendations, RecommendationsNotificationResult } from './extensionRecommendations.js';
export declare class ExtensionRecommendationNotificationServiceChannelClient implements IExtensionRecommendationNotificationService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel);
    get ignoredRecommendations(): string[];
    promptImportantExtensionsInstallNotification(extensionRecommendations: IExtensionRecommendations): Promise<RecommendationsNotificationResult>;
    promptWorkspaceRecommendations(recommendations: string[]): Promise<void>;
    hasToIgnoreRecommendationNotifications(): boolean;
}
export declare class ExtensionRecommendationNotificationServiceChannel implements IServerChannel {
    private service;
    constructor(service: IExtensionRecommendationNotificationService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, args?: any): Promise<any>;
}
