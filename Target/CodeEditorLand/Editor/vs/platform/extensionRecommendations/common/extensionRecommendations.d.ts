import { URI } from '../../../base/common/uri.js';
export declare const enum RecommendationSource {
    FILE = 1,
    WORKSPACE = 2,
    EXE = 3
}
export interface IExtensionRecommendations {
    source: RecommendationSource;
    extensions: string[];
    name: string;
    searchValue?: string;
}
export declare function RecommendationSourceToString(source: RecommendationSource): "workspace" | "file" | "exe";
export declare const enum RecommendationsNotificationResult {
    Ignored = "ignored",
    Cancelled = "cancelled",
    TooMany = "toomany",
    IncompatibleWindow = "incompatibleWindow",
    Accepted = "reacted"
}
export declare const IExtensionRecommendationNotificationService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionRecommendationNotificationService>;
export interface IExtensionRecommendationNotificationService {
    readonly _serviceBrand: undefined;
    readonly ignoredRecommendations: string[];
    hasToIgnoreRecommendationNotifications(): boolean;
    promptImportantExtensionsInstallNotification(recommendations: IExtensionRecommendations): Promise<RecommendationsNotificationResult>;
    promptWorkspaceRecommendations(recommendations: Array<string | URI>): Promise<void>;
}
