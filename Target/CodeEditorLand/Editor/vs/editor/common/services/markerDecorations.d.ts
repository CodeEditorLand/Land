import { ITextModel, IModelDecoration } from '../model.js';
import { IMarker } from '../../../platform/markers/common/markers.js';
import { Event } from '../../../base/common/event.js';
import { Range } from '../core/range.js';
import { URI } from '../../../base/common/uri.js';
export declare const IMarkerDecorationsService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMarkerDecorationsService>;
export interface IMarkerDecorationsService {
    readonly _serviceBrand: undefined;
    onDidChangeMarker: Event<ITextModel>;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [Range, IMarker][];
}
