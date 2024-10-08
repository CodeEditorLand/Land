import { Event } from '../../../../base/common/event.js';
import { IMatch } from '../../../../base/common/filters.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { IMarker, IRelatedInformation } from '../../../../platform/markers/common/markers.js';
export type MarkerElement = ResourceMarkers | Marker | RelatedInformation;
export declare function compareMarkersByUri(a: IMarker, b: IMarker): number;
export declare class ResourceMarkers {
    readonly id: string;
    readonly resource: URI;
    readonly path: string;
    readonly name: string;
    private _markersMap;
    private _cachedMarkers;
    private _total;
    constructor(id: string, resource: URI);
    get markers(): readonly Marker[];
    has(uri: URI): boolean;
    set(uri: URI, marker: Marker[]): void;
    delete(uri: URI): void;
    get total(): number;
    private static _compareMarkers;
}
export declare class Marker {
    readonly id: string;
    readonly marker: IMarker;
    readonly relatedInformation: RelatedInformation[];
    get resource(): URI;
    get range(): IRange;
    private _lines;
    get lines(): string[];
    constructor(id: string, marker: IMarker, relatedInformation?: RelatedInformation[]);
    toString(): string;
}
export declare class MarkerTableItem extends Marker {
    readonly sourceMatches?: IMatch[] | undefined;
    readonly codeMatches?: IMatch[] | undefined;
    readonly messageMatches?: IMatch[] | undefined;
    readonly fileMatches?: IMatch[] | undefined;
    readonly ownerMatches?: IMatch[] | undefined;
    constructor(marker: Marker, sourceMatches?: IMatch[] | undefined, codeMatches?: IMatch[] | undefined, messageMatches?: IMatch[] | undefined, fileMatches?: IMatch[] | undefined, ownerMatches?: IMatch[] | undefined);
}
export declare class RelatedInformation {
    readonly id: string;
    readonly marker: IMarker;
    readonly raw: IRelatedInformation;
    constructor(id: string, marker: IMarker, raw: IRelatedInformation);
}
export interface MarkerChangesEvent {
    readonly added: Set<ResourceMarkers>;
    readonly removed: Set<ResourceMarkers>;
    readonly updated: Set<ResourceMarkers>;
}
export declare class MarkersModel {
    private cachedSortedResources;
    private readonly _onDidChange;
    readonly onDidChange: Event<MarkerChangesEvent>;
    get resourceMarkers(): ResourceMarkers[];
    private resourcesByUri;
    constructor();
    reset(): void;
    private _total;
    get total(): number;
    getResourceMarkers(resource: URI): ResourceMarkers | null;
    setResourceMarkers(resourcesMarkers: [URI, IMarker[]][]): void;
    private id;
    dispose(): void;
}
