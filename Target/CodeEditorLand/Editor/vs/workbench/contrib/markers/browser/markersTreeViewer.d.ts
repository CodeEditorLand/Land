import { CountBadge } from '../../../../base/browser/ui/countBadge/countBadge.js';
import { ResourceLabels, IResourceLabel } from '../../../browser/labels.js';
import { HighlightedLabel } from '../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { ResourceMarkers, Marker, RelatedInformation, MarkerElement, MarkerTableItem } from './markersModel.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { QuickFixAction } from './markersViewActions.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { ITreeFilter, TreeVisibility, TreeFilterResult, ITreeRenderer, ITreeNode } from '../../../../base/browser/ui/tree/tree.js';
import { FilterOptions } from './markersFilterOptions.js';
import { IMatch } from '../../../../base/common/filters.js';
import { Event } from '../../../../base/common/event.js';
import { IListAccessibilityProvider } from '../../../../base/browser/ui/list/listWidget.js';
import { URI } from '../../../../base/common/uri.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { MarkersViewMode } from '../common/markers.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
interface IResourceMarkersTemplateData {
    readonly resourceLabel: IResourceLabel;
    readonly count: CountBadge;
}
interface IMarkerTemplateData {
    markerWidget: MarkerWidget;
}
interface IRelatedInformationTemplateData {
    resourceLabel: HighlightedLabel;
    lnCol: HTMLElement;
    description: HighlightedLabel;
}
export declare class MarkersWidgetAccessibilityProvider implements IListAccessibilityProvider<MarkerElement | MarkerTableItem> {
    private readonly labelService;
    constructor(labelService: ILabelService);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: MarkerElement | MarkerTableItem): string | null;
}
declare const enum TemplateId {
    ResourceMarkers = "rm",
    Marker = "m",
    RelatedInformation = "ri"
}
export declare class VirtualDelegate implements IListVirtualDelegate<MarkerElement> {
    private readonly markersViewState;
    static LINE_HEIGHT: number;
    constructor(markersViewState: MarkersViewModel);
    getHeight(element: MarkerElement): number;
    getTemplateId(element: MarkerElement): string;
}
declare const enum FilterDataType {
    ResourceMarkers = 0,
    Marker = 1,
    RelatedInformation = 2
}
interface ResourceMarkersFilterData {
    type: FilterDataType.ResourceMarkers;
    uriMatches: IMatch[];
}
interface MarkerFilterData {
    type: FilterDataType.Marker;
    lineMatches: IMatch[][];
    sourceMatches: IMatch[];
    codeMatches: IMatch[];
}
interface RelatedInformationFilterData {
    type: FilterDataType.RelatedInformation;
    uriMatches: IMatch[];
    messageMatches: IMatch[];
}
export type FilterData = ResourceMarkersFilterData | MarkerFilterData | RelatedInformationFilterData;
export declare class ResourceMarkersRenderer implements ITreeRenderer<ResourceMarkers, ResourceMarkersFilterData, IResourceMarkersTemplateData> {
    private labels;
    private renderedNodes;
    private readonly disposables;
    constructor(labels: ResourceLabels, onDidChangeRenderNodeCount: Event<ITreeNode<ResourceMarkers, ResourceMarkersFilterData>>);
    templateId: TemplateId;
    renderTemplate(container: HTMLElement): IResourceMarkersTemplateData;
    renderElement(node: ITreeNode<ResourceMarkers, ResourceMarkersFilterData>, _: number, templateData: IResourceMarkersTemplateData): void;
    disposeElement(node: ITreeNode<ResourceMarkers, ResourceMarkersFilterData>, index: number, templateData: IResourceMarkersTemplateData): void;
    disposeTemplate(templateData: IResourceMarkersTemplateData): void;
    private onDidChangeRenderNodeCount;
    private updateCount;
    dispose(): void;
}
export declare class FileResourceMarkersRenderer extends ResourceMarkersRenderer {
}
export declare class MarkerRenderer implements ITreeRenderer<Marker, MarkerFilterData, IMarkerTemplateData> {
    private readonly markersViewState;
    protected hoverService: IHoverService;
    protected instantiationService: IInstantiationService;
    protected openerService: IOpenerService;
    constructor(markersViewState: MarkersViewModel, hoverService: IHoverService, instantiationService: IInstantiationService, openerService: IOpenerService);
    templateId: TemplateId;
    renderTemplate(container: HTMLElement): IMarkerTemplateData;
    renderElement(node: ITreeNode<Marker, MarkerFilterData>, _: number, templateData: IMarkerTemplateData): void;
    disposeTemplate(templateData: IMarkerTemplateData): void;
}
declare class MarkerWidget extends Disposable {
    private parent;
    private readonly markersViewModel;
    private readonly _hoverService;
    private readonly _openerService;
    private readonly actionBar;
    private readonly icon;
    private readonly iconContainer;
    private readonly messageAndDetailsContainer;
    private readonly messageAndDetailsContainerHover;
    private readonly disposables;
    constructor(parent: HTMLElement, markersViewModel: MarkersViewModel, _hoverService: IHoverService, _openerService: IOpenerService, _instantiationService: IInstantiationService);
    render(element: Marker, filterData: MarkerFilterData | undefined): void;
    private renderQuickfixActionbar;
    private renderMultilineActionbar;
    private renderMessageAndDetails;
    private renderDetails;
}
export declare class RelatedInformationRenderer implements ITreeRenderer<RelatedInformation, RelatedInformationFilterData, IRelatedInformationTemplateData> {
    private readonly labelService;
    constructor(labelService: ILabelService);
    templateId: TemplateId;
    renderTemplate(container: HTMLElement): IRelatedInformationTemplateData;
    renderElement(node: ITreeNode<RelatedInformation, RelatedInformationFilterData>, _: number, templateData: IRelatedInformationTemplateData): void;
    disposeTemplate(templateData: IRelatedInformationTemplateData): void;
}
export declare class Filter implements ITreeFilter<MarkerElement, FilterData> {
    options: FilterOptions;
    constructor(options: FilterOptions);
    filter(element: MarkerElement, parentVisibility: TreeVisibility): TreeFilterResult<FilterData>;
    private filterResourceMarkers;
    private filterMarker;
    private filterRelatedInformation;
}
export declare class MarkerViewModel extends Disposable {
    private readonly marker;
    private modelService;
    private instantiationService;
    private readonly editorService;
    private readonly languageFeaturesService;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private modelPromise;
    private codeActionsPromise;
    constructor(marker: Marker, modelService: IModelService, instantiationService: IInstantiationService, editorService: IEditorService, languageFeaturesService: ILanguageFeaturesService);
    private _multiline;
    get multiline(): boolean;
    set multiline(value: boolean);
    private _quickFixAction;
    get quickFixAction(): QuickFixAction;
    showLightBulb(): void;
    private setQuickFixes;
    private getCodeActions;
    private toActions;
    private openFileAtMarker;
    private getModel;
}
export declare class MarkersViewModel extends Disposable {
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly _onDidChange;
    readonly onDidChange: Event<Marker | undefined>;
    private readonly _onDidChangeViewMode;
    readonly onDidChangeViewMode: Event<MarkersViewMode>;
    private readonly markersViewStates;
    private readonly markersPerResource;
    private bulkUpdate;
    private hoveredMarker;
    private hoverDelayer;
    private viewModeContextKey;
    constructor(multiline: boolean | undefined, viewMode: MarkersViewMode | undefined, contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    add(marker: Marker): void;
    remove(resource: URI): void;
    getViewModel(marker: Marker): MarkerViewModel | null;
    onMarkerMouseHover(marker: Marker): void;
    onMarkerMouseLeave(marker: Marker): void;
    private _multiline;
    get multiline(): boolean;
    set multiline(value: boolean);
    private _viewMode;
    get viewMode(): MarkersViewMode;
    set viewMode(value: MarkersViewMode);
    dispose(): void;
}
export {};
