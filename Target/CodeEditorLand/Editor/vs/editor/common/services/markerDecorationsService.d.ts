import { IMarkerService, IMarker } from '../../../platform/markers/common/markers.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ITextModel, IModelDecoration } from '../model.js';
import { IModelService } from './model.js';
import { Range } from '../core/range.js';
import { IMarkerDecorationsService } from './markerDecorations.js';
import { Event } from '../../../base/common/event.js';
export declare class MarkerDecorationsService extends Disposable implements IMarkerDecorationsService {
    private readonly _markerService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeMarker;
    readonly onDidChangeMarker: Event<ITextModel>;
    private readonly _markerDecorations;
    constructor(modelService: IModelService, _markerService: IMarkerService);
    dispose(): void;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [Range, IMarker][];
    private _handleMarkerChange;
    private _onModelAdded;
    private _onModelRemoved;
    private _updateDecorations;
}
