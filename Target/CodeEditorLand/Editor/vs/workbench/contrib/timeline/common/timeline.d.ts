import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { Command } from '../../../../editor/common/languages.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IAccessibilityInformation } from '../../../../platform/accessibility/common/accessibility.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
export declare function toKey(extension: ExtensionIdentifier | string, source: string): string;
export declare const TimelinePaneId = "timeline";
export interface TimelineItem {
    handle: string;
    source: string;
    id?: string;
    label: string;
    description?: string;
    tooltip?: string | IMarkdownString | undefined;
    timestamp: number;
    accessibilityInformation?: IAccessibilityInformation;
    icon?: URI;
    iconDark?: URI;
    themeIcon?: ThemeIcon;
    command?: Command;
    contextValue?: string;
    relativeTime?: string;
    relativeTimeFullWord?: string;
    hideRelativeTime?: boolean;
}
export interface TimelineChangeEvent {
    id: string;
    uri: URI | undefined;
    reset: boolean;
}
export interface TimelineOptions {
    cursor?: string;
    limit?: number | {
        timestamp: number;
        id?: string;
    };
    resetCache?: boolean;
    cacheResults?: boolean;
}
export interface Timeline {
    source: string;
    items: TimelineItem[];
    paging?: {
        cursor: string | undefined;
    };
}
export interface TimelineProvider extends TimelineProviderDescriptor, IDisposable {
    onDidChange?: Event<TimelineChangeEvent>;
    provideTimeline(uri: URI, options: TimelineOptions, token: CancellationToken): Promise<Timeline | undefined>;
}
export interface TimelineSource {
    id: string;
    label: string;
}
export interface TimelineProviderDescriptor {
    id: string;
    label: string;
    scheme: string | string[];
}
export interface TimelineProvidersChangeEvent {
    readonly added?: string[];
    readonly removed?: string[];
}
export interface TimelineRequest {
    readonly result: Promise<Timeline | undefined>;
    readonly options: TimelineOptions;
    readonly source: string;
    readonly tokenSource: CancellationTokenSource;
    readonly uri: URI;
}
export interface ITimelineService {
    readonly _serviceBrand: undefined;
    onDidChangeProviders: Event<TimelineProvidersChangeEvent>;
    onDidChangeTimeline: Event<TimelineChangeEvent>;
    onDidChangeUri: Event<URI>;
    registerTimelineProvider(provider: TimelineProvider): IDisposable;
    unregisterTimelineProvider(id: string): void;
    getSources(): TimelineSource[];
    getTimeline(id: string, uri: URI, options: TimelineOptions, tokenSource: CancellationTokenSource): TimelineRequest | undefined;
    setUri(uri: URI): void;
}
export declare const ITimelineService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITimelineService>;
