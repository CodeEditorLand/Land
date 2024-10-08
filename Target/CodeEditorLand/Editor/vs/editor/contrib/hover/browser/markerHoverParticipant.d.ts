import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { Range } from '../../../common/core/range.js';
import { IModelDecoration } from '../../../common/model.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { IMarkerDecorationsService } from '../../../common/services/markerDecorations.js';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from './hoverTypes.js';
import { IMarker } from '../../../../platform/markers/common/markers.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
export declare class MarkerHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<MarkerHover>;
    readonly range: Range;
    readonly marker: IMarker;
    constructor(owner: IEditorHoverParticipant<MarkerHover>, range: Range, marker: IMarker);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class MarkerHoverParticipant implements IEditorHoverParticipant<MarkerHover> {
    private readonly _editor;
    private readonly _markerDecorationsService;
    private readonly _openerService;
    private readonly _languageFeaturesService;
    readonly hoverOrdinal: number;
    private recentMarkerCodeActionsInfo;
    constructor(_editor: ICodeEditor, _markerDecorationsService: IMarkerDecorationsService, _openerService: IOpenerService, _languageFeaturesService: ILanguageFeaturesService);
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkerHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkerHover[]): IRenderedHoverParts<MarkerHover>;
    getAccessibleContent(hoverPart: MarkerHover): string;
    private _renderMarkerHover;
    private renderMarkerStatusbar;
    private getCodeActions;
}
