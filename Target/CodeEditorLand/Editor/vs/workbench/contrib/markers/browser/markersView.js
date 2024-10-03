var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import './media/markers.css';
import * as dom from '../../../../base/browser/dom.js';
import { Separator } from '../../../../base/common/actions.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IEditorService, SIDE_GROUP, ACTIVE_GROUP } from '../../../services/editor/common/editorService.js';
import { Marker, ResourceMarkers, RelatedInformation, MarkersModel, compareMarkersByUri, MarkerTableItem } from './markersModel.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { MarkersFilters } from './markersViewActions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import Messages from './messages.js';
import { RangeHighlightDecorations } from '../../../browser/codeeditor.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { localize } from '../../../../nls.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Relay, Event } from '../../../../base/common/event.js';
import { WorkbenchObjectTree, IListService } from '../../../../platform/list/browser/listService.js';
import { FilterOptions } from './markersFilterOptions.js';
import { deepClone } from '../../../../base/common/objects.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Filter, VirtualDelegate, ResourceMarkersRenderer, MarkerRenderer, RelatedInformationRenderer, MarkersWidgetAccessibilityProvider, MarkersViewModel } from './markersTreeViewer.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { ResourceLabels } from '../../../browser/labels.js';
import { IMarkerService, MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { Memento } from '../../../common/memento.js';
import { FilterViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IOpenerService, withSelection } from '../../../../platform/opener/common/opener.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { groupBy } from '../../../../base/common/arrays.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { ResourceListDnDHandler } from '../../../browser/dnd.js';
import { MarkersTable } from './markersTable.js';
import { Markers, MarkersContextKeys } from '../common/markers.js';
import { registerNavigableContainer } from '../../../browser/actions/widgetNavigationCommands.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
function createResourceMarkersIterator(resourceMarkers) {
    return Iterable.map(resourceMarkers.markers, m => {
        const relatedInformationIt = Iterable.from(m.relatedInformation);
        const children = Iterable.map(relatedInformationIt, r => ({ element: r }));
        return { element: m, children };
    });
}
let MarkersView = class MarkersView extends FilterViewPane {
    constructor(options, instantiationService, viewDescriptorService, editorService, configurationService, telemetryService, markerService, contextKeyService, workspaceContextService, contextMenuService, uriIdentityService, keybindingService, storageService, openerService, themeService, hoverService) {
        const memento = new Memento(Markers.MARKERS_VIEW_STORAGE_ID, storageService);
        const panelState = memento.getMemento(1, 1);
        super({
            ...options,
            filterOptions: {
                ariaLabel: Messages.MARKERS_PANEL_FILTER_ARIA_LABEL,
                placeholder: Messages.MARKERS_PANEL_FILTER_PLACEHOLDER,
                focusContextKey: MarkersContextKeys.MarkerViewFilterFocusContextKey.key,
                text: panelState['filter'] || '',
                history: panelState['filterHistory'] || []
            }
        }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.editorService = editorService;
        this.markerService = markerService;
        this.workspaceContextService = workspaceContextService;
        this.uriIdentityService = uriIdentityService;
        this.lastSelectedRelativeTop = 0;
        this.currentActiveResource = null;
        this.onVisibleDisposables = this._register(new DisposableStore());
        this.widgetDisposables = this._register(new DisposableStore());
        this.currentHeight = 0;
        this.currentWidth = 0;
        this.cachedFilterStats = undefined;
        this.currentResourceGotAddedToMarkersData = false;
        this.onDidChangeVisibility = this.onDidChangeBodyVisibility;
        this.memento = memento;
        this.panelState = panelState;
        this.markersModel = this._register(instantiationService.createInstance(MarkersModel));
        this.markersViewModel = this._register(instantiationService.createInstance(MarkersViewModel, this.panelState['multiline'], this.panelState['viewMode'] ?? this.getDefaultViewMode()));
        this._register(this.onDidChangeVisibility(visible => this.onDidChangeMarkersViewVisibility(visible)));
        this._register(this.markersViewModel.onDidChangeViewMode(_ => this.onDidChangeViewMode()));
        this.widgetAccessibilityProvider = instantiationService.createInstance(MarkersWidgetAccessibilityProvider);
        this.widgetIdentityProvider = { getId(element) { return element.id; } };
        this.setCurrentActiveEditor();
        this.filter = new Filter(FilterOptions.EMPTY(uriIdentityService));
        this.rangeHighlightDecorations = this._register(this.instantiationService.createInstance(RangeHighlightDecorations));
        this.filters = this._register(new MarkersFilters({
            filterHistory: this.panelState['filterHistory'] || [],
            showErrors: this.panelState['showErrors'] !== false,
            showWarnings: this.panelState['showWarnings'] !== false,
            showInfos: this.panelState['showInfos'] !== false,
            excludedFiles: !!this.panelState['useFilesExclude'],
            activeFile: !!this.panelState['activeFile'],
        }, this.contextKeyService));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (this.filters.excludedFiles && e.affectsConfiguration('files.exclude')) {
                this.updateFilter();
            }
        }));
    }
    render() {
        super.render();
        this._register(registerNavigableContainer({
            name: 'markersView',
            focusNotifiers: [this, this.filterWidget],
            focusNextWidget: () => {
                if (this.filterWidget.hasFocus()) {
                    this.focus();
                }
            },
            focusPreviousWidget: () => {
                if (!this.filterWidget.hasFocus()) {
                    this.focusFilter();
                }
            }
        }));
    }
    renderBody(parent) {
        super.renderBody(parent);
        parent.classList.add('markers-panel');
        this._register(dom.addDisposableListener(parent, 'keydown', e => {
            const event = new StandardKeyboardEvent(e);
            if (!this.keybindingService.mightProducePrintableCharacter(event)) {
                return;
            }
            const result = this.keybindingService.softDispatch(event, event.target);
            if (result.kind === 1 || result.kind === 2) {
                return;
            }
            this.focusFilter();
        }));
        const panelContainer = dom.append(parent, dom.$('.markers-panel-container'));
        this.createArialLabelElement(panelContainer);
        this.createMessageBox(panelContainer);
        this.widgetContainer = dom.append(panelContainer, dom.$('.widget-container'));
        this.createWidget(this.widgetContainer);
        this.updateFilter();
        this.renderContent();
    }
    getTitle() {
        return Messages.MARKERS_PANEL_TITLE_PROBLEMS.value;
    }
    layoutBodyContent(height = this.currentHeight, width = this.currentWidth) {
        if (this.messageBoxContainer) {
            this.messageBoxContainer.style.height = `${height}px`;
        }
        this.widget.layout(height, width);
        this.currentHeight = height;
        this.currentWidth = width;
    }
    focus() {
        super.focus();
        if (dom.isActiveElement(this.widget.getHTMLElement())) {
            return;
        }
        if (this.hasNoProblems()) {
            this.messageBoxContainer.focus();
        }
        else {
            this.widget.domFocus();
            this.widget.setMarkerSelection();
        }
    }
    focusFilter() {
        this.filterWidget.focus();
    }
    updateBadge(total, filtered) {
        this.filterWidget.updateBadge(total === filtered || total === 0 ? undefined : localize('showing filtered problems', "Showing {0} of {1}", filtered, total));
    }
    checkMoreFilters() {
        this.filterWidget.checkMoreFilters(!this.filters.showErrors || !this.filters.showWarnings || !this.filters.showInfos || this.filters.excludedFiles || this.filters.activeFile);
    }
    clearFilterText() {
        this.filterWidget.setFilterText('');
    }
    showQuickFixes(marker) {
        const viewModel = this.markersViewModel.getViewModel(marker);
        if (viewModel) {
            viewModel.quickFixAction.run();
        }
    }
    openFileAtElement(element, preserveFocus, sideByside, pinned) {
        const { resource, selection } = element instanceof Marker ? { resource: element.resource, selection: element.range } :
            element instanceof RelatedInformation ? { resource: element.raw.resource, selection: element.raw } :
                'marker' in element ? { resource: element.marker.resource, selection: element.marker.range } :
                    { resource: null, selection: null };
        if (resource && selection) {
            this.editorService.openEditor({
                resource,
                options: {
                    selection,
                    preserveFocus,
                    pinned,
                    revealIfVisible: true
                },
            }, sideByside ? SIDE_GROUP : ACTIVE_GROUP).then(editor => {
                if (editor && preserveFocus) {
                    this.rangeHighlightDecorations.highlightRange({ resource, range: selection }, editor.getControl());
                }
                else {
                    this.rangeHighlightDecorations.removeHighlightRange();
                }
            });
            return true;
        }
        else {
            this.rangeHighlightDecorations.removeHighlightRange();
        }
        return false;
    }
    refreshPanel(markerOrChange) {
        if (this.isVisible()) {
            const hasSelection = this.widget.getSelection().length > 0;
            if (markerOrChange) {
                if (markerOrChange instanceof Marker) {
                    this.widget.updateMarker(markerOrChange);
                }
                else {
                    if (markerOrChange.added.size || markerOrChange.removed.size) {
                        this.resetWidget();
                    }
                    else {
                        this.widget.update([...markerOrChange.updated]);
                    }
                }
            }
            else {
                this.resetWidget();
            }
            if (hasSelection) {
                this.widget.setMarkerSelection();
            }
            this.cachedFilterStats = undefined;
            const { total, filtered } = this.getFilterStats();
            this.toggleVisibility(total === 0 || filtered === 0);
            this.renderMessage();
            this.updateBadge(total, filtered);
            this.checkMoreFilters();
        }
    }
    onDidChangeViewState(marker) {
        this.refreshPanel(marker);
    }
    resetWidget() {
        this.widget.reset(this.getResourceMarkers());
    }
    updateFilter() {
        this.filter.options = new FilterOptions(this.filterWidget.getFilterText(), this.getFilesExcludeExpressions(), this.filters.showWarnings, this.filters.showErrors, this.filters.showInfos, this.uriIdentityService);
        this.widget.filterMarkers(this.getResourceMarkers(), this.filter.options);
        this.cachedFilterStats = undefined;
        const { total, filtered } = this.getFilterStats();
        this.toggleVisibility(total === 0 || filtered === 0);
        this.renderMessage();
        this.updateBadge(total, filtered);
        this.checkMoreFilters();
    }
    getDefaultViewMode() {
        switch (this.configurationService.getValue('problems.defaultViewMode')) {
            case 'table':
                return "table";
            case 'tree':
                return "tree";
            default:
                return "tree";
        }
    }
    getFilesExcludeExpressions() {
        if (!this.filters.excludedFiles) {
            return [];
        }
        const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
        return workspaceFolders.length
            ? workspaceFolders.map(workspaceFolder => ({ root: workspaceFolder.uri, expression: this.getFilesExclude(workspaceFolder.uri) }))
            : this.getFilesExclude();
    }
    getFilesExclude(resource) {
        return deepClone(this.configurationService.getValue('files.exclude', { resource })) || {};
    }
    getResourceMarkers() {
        if (!this.filters.activeFile) {
            return this.markersModel.resourceMarkers;
        }
        let resourceMarkers = [];
        if (this.currentActiveResource) {
            const activeResourceMarkers = this.markersModel.getResourceMarkers(this.currentActiveResource);
            if (activeResourceMarkers) {
                resourceMarkers = [activeResourceMarkers];
            }
        }
        return resourceMarkers;
    }
    createMessageBox(parent) {
        this.messageBoxContainer = dom.append(parent, dom.$('.message-box-container'));
        this.messageBoxContainer.setAttribute('aria-labelledby', 'markers-panel-arialabel');
    }
    createArialLabelElement(parent) {
        this.ariaLabelElement = dom.append(parent, dom.$(''));
        this.ariaLabelElement.setAttribute('id', 'markers-panel-arialabel');
    }
    createWidget(parent) {
        this.widget = this.markersViewModel.viewMode === "table" ? this.createTable(parent) : this.createTree(parent);
        this.widgetDisposables.add(this.widget);
        const markerFocusContextKey = MarkersContextKeys.MarkerFocusContextKey.bindTo(this.widget.contextKeyService);
        const relatedInformationFocusContextKey = MarkersContextKeys.RelatedInformationFocusContextKey.bindTo(this.widget.contextKeyService);
        this.widgetDisposables.add(this.widget.onDidChangeFocus(focus => {
            markerFocusContextKey.set(focus.elements.some(e => e instanceof Marker));
            relatedInformationFocusContextKey.set(focus.elements.some(e => e instanceof RelatedInformation));
        }));
        this.widgetDisposables.add(Event.debounce(this.widget.onDidOpen, (last, event) => event, 75, true)(options => {
            this.openFileAtElement(options.element, !!options.editorOptions.preserveFocus, options.sideBySide, !!options.editorOptions.pinned);
        }));
        this.widgetDisposables.add(Event.any(this.widget.onDidChangeSelection, this.widget.onDidChangeFocus)(() => {
            const elements = [...this.widget.getSelection(), ...this.widget.getFocus()];
            for (const element of elements) {
                if (element instanceof Marker) {
                    const viewModel = this.markersViewModel.getViewModel(element);
                    viewModel?.showLightBulb();
                }
            }
        }));
        this.widgetDisposables.add(this.widget.onContextMenu(this.onContextMenu, this));
        this.widgetDisposables.add(this.widget.onDidChangeSelection(this.onSelected, this));
    }
    createTable(parent) {
        const table = this.instantiationService.createInstance(MarkersTable, dom.append(parent, dom.$('.markers-table-container')), this.markersViewModel, this.getResourceMarkers(), this.filter.options, {
            accessibilityProvider: this.widgetAccessibilityProvider,
            dnd: this.instantiationService.createInstance(ResourceListDnDHandler, (element) => {
                if (element instanceof MarkerTableItem) {
                    return withSelection(element.resource, element.range);
                }
                return null;
            }),
            horizontalScrolling: false,
            identityProvider: this.widgetIdentityProvider,
            multipleSelectionSupport: true,
            selectionNavigation: true
        });
        return table;
    }
    createTree(parent) {
        const onDidChangeRenderNodeCount = new Relay();
        const treeLabels = this.instantiationService.createInstance(ResourceLabels, this);
        const virtualDelegate = new VirtualDelegate(this.markersViewModel);
        const renderers = [
            this.instantiationService.createInstance(ResourceMarkersRenderer, treeLabels, onDidChangeRenderNodeCount.event),
            this.instantiationService.createInstance(MarkerRenderer, this.markersViewModel),
            this.instantiationService.createInstance(RelatedInformationRenderer)
        ];
        const tree = this.instantiationService.createInstance(MarkersTree, 'MarkersView', dom.append(parent, dom.$('.tree-container.show-file-icons')), virtualDelegate, renderers, {
            filter: this.filter,
            accessibilityProvider: this.widgetAccessibilityProvider,
            identityProvider: this.widgetIdentityProvider,
            dnd: this.instantiationService.createInstance(ResourceListDnDHandler, (element) => {
                if (element instanceof ResourceMarkers) {
                    return element.resource;
                }
                if (element instanceof Marker) {
                    return withSelection(element.resource, element.range);
                }
                if (element instanceof RelatedInformation) {
                    return withSelection(element.raw.resource, element.raw);
                }
                return null;
            }),
            expandOnlyOnTwistieClick: (e) => e instanceof Marker && e.relatedInformation.length > 0,
            overrideStyles: this.getLocationBasedColors().listOverrideStyles,
            selectionNavigation: true,
            multipleSelectionSupport: true,
        });
        onDidChangeRenderNodeCount.input = tree.onDidChangeRenderNodeCount;
        return tree;
    }
    collapseAll() {
        this.widget.collapseMarkers();
    }
    setMultiline(multiline) {
        this.markersViewModel.multiline = multiline;
    }
    setViewMode(viewMode) {
        this.markersViewModel.viewMode = viewMode;
    }
    onDidChangeMarkersViewVisibility(visible) {
        this.onVisibleDisposables.clear();
        if (visible) {
            for (const disposable of this.reInitialize()) {
                this.onVisibleDisposables.add(disposable);
            }
            this.refreshPanel();
        }
    }
    reInitialize() {
        const disposables = [];
        const readMarkers = (resource) => this.markerService.read({ resource, severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info });
        this.markersModel.setResourceMarkers(groupBy(readMarkers(), compareMarkersByUri).map(group => [group[0].resource, group]));
        disposables.push(Event.debounce(this.markerService.onMarkerChanged, (resourcesMap, resources) => {
            resourcesMap = resourcesMap || new ResourceMap();
            resources.forEach(resource => resourcesMap.set(resource, resource));
            return resourcesMap;
        }, 64)(resourcesMap => {
            this.markersModel.setResourceMarkers([...resourcesMap.values()].map(resource => [resource, readMarkers(resource)]));
        }));
        disposables.push(Event.any(this.markersModel.onDidChange, this.editorService.onDidActiveEditorChange)(changes => {
            if (changes) {
                this.onDidChangeModel(changes);
            }
            else {
                this.onActiveEditorChanged();
            }
        }));
        disposables.push(toDisposable(() => this.markersModel.reset()));
        this.markersModel.resourceMarkers.forEach(resourceMarker => resourceMarker.markers.forEach(marker => this.markersViewModel.add(marker)));
        disposables.push(this.markersViewModel.onDidChange(marker => this.onDidChangeViewState(marker)));
        disposables.push(toDisposable(() => this.markersModel.resourceMarkers.forEach(resourceMarker => this.markersViewModel.remove(resourceMarker.resource))));
        disposables.push(this.filters.onDidChange((event) => {
            if (event.activeFile) {
                this.refreshPanel();
            }
            else if (event.excludedFiles || event.showWarnings || event.showErrors || event.showInfos) {
                this.updateFilter();
            }
        }));
        disposables.push(this.filterWidget.onDidChangeFilterText(e => this.updateFilter()));
        disposables.push(toDisposable(() => { this.cachedFilterStats = undefined; }));
        disposables.push(toDisposable(() => this.rangeHighlightDecorations.removeHighlightRange()));
        return disposables;
    }
    onDidChangeModel(change) {
        const resourceMarkers = [...change.added, ...change.removed, ...change.updated];
        const resources = [];
        for (const { resource } of resourceMarkers) {
            this.markersViewModel.remove(resource);
            const resourceMarkers = this.markersModel.getResourceMarkers(resource);
            if (resourceMarkers) {
                for (const marker of resourceMarkers.markers) {
                    this.markersViewModel.add(marker);
                }
            }
            resources.push(resource);
        }
        this.currentResourceGotAddedToMarkersData = this.currentResourceGotAddedToMarkersData || this.isCurrentResourceGotAddedToMarkersData(resources);
        this.refreshPanel(change);
        this.updateRangeHighlights();
        if (this.currentResourceGotAddedToMarkersData) {
            this.autoReveal();
            this.currentResourceGotAddedToMarkersData = false;
        }
    }
    onDidChangeViewMode() {
        if (this.widgetContainer && this.widget) {
            this.widgetContainer.textContent = '';
            this.widgetDisposables.clear();
        }
        const selection = new Set();
        for (const marker of this.widget.getSelection()) {
            if (marker instanceof ResourceMarkers) {
                marker.markers.forEach(m => selection.add(m));
            }
            else if (marker instanceof Marker || marker instanceof MarkerTableItem) {
                selection.add(marker);
            }
        }
        const focus = new Set();
        for (const marker of this.widget.getFocus()) {
            if (marker instanceof Marker || marker instanceof MarkerTableItem) {
                focus.add(marker);
            }
        }
        this.createWidget(this.widgetContainer);
        this.refreshPanel();
        if (selection.size > 0) {
            this.widget.setMarkerSelection(Array.from(selection), Array.from(focus));
            this.widget.domFocus();
        }
    }
    isCurrentResourceGotAddedToMarkersData(changedResources) {
        const currentlyActiveResource = this.currentActiveResource;
        if (!currentlyActiveResource) {
            return false;
        }
        const resourceForCurrentActiveResource = this.getResourceForCurrentActiveResource();
        if (resourceForCurrentActiveResource) {
            return false;
        }
        return changedResources.some(r => r.toString() === currentlyActiveResource.toString());
    }
    onActiveEditorChanged() {
        this.setCurrentActiveEditor();
        if (this.filters.activeFile) {
            this.refreshPanel();
        }
        this.autoReveal();
    }
    setCurrentActiveEditor() {
        const activeEditor = this.editorService.activeEditor;
        this.currentActiveResource = activeEditor ? EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY }) ?? null : null;
    }
    onSelected() {
        const selection = this.widget.getSelection();
        if (selection && selection.length > 0) {
            this.lastSelectedRelativeTop = this.widget.getRelativeTop(selection[0]) || 0;
        }
    }
    hasNoProblems() {
        const { total, filtered } = this.getFilterStats();
        return total === 0 || filtered === 0;
    }
    renderContent() {
        this.cachedFilterStats = undefined;
        this.resetWidget();
        this.toggleVisibility(this.hasNoProblems());
        this.renderMessage();
    }
    renderMessage() {
        if (!this.messageBoxContainer || !this.ariaLabelElement) {
            return;
        }
        dom.clearNode(this.messageBoxContainer);
        const { total, filtered } = this.getFilterStats();
        if (filtered === 0) {
            this.messageBoxContainer.style.display = 'block';
            this.messageBoxContainer.setAttribute('tabIndex', '0');
            if (this.filters.activeFile) {
                this.renderFilterMessageForActiveFile(this.messageBoxContainer);
            }
            else {
                if (total > 0) {
                    this.renderFilteredByFilterMessage(this.messageBoxContainer);
                }
                else {
                    this.renderNoProblemsMessage(this.messageBoxContainer);
                }
            }
        }
        else {
            this.messageBoxContainer.style.display = 'none';
            if (filtered === total) {
                this.setAriaLabel(localize('No problems filtered', "Showing {0} problems", total));
            }
            else {
                this.setAriaLabel(localize('problems filtered', "Showing {0} of {1} problems", filtered, total));
            }
            this.messageBoxContainer.removeAttribute('tabIndex');
        }
    }
    renderFilterMessageForActiveFile(container) {
        if (this.currentActiveResource && this.markersModel.getResourceMarkers(this.currentActiveResource)) {
            this.renderFilteredByFilterMessage(container);
        }
        else {
            this.renderNoProblemsMessageForActiveFile(container);
        }
    }
    renderFilteredByFilterMessage(container) {
        const span1 = dom.append(container, dom.$('span'));
        span1.textContent = Messages.MARKERS_PANEL_NO_PROBLEMS_FILTERS;
        const link = dom.append(container, dom.$('a.messageAction'));
        link.textContent = localize('clearFilter', "Clear Filters");
        link.setAttribute('tabIndex', '0');
        const span2 = dom.append(container, dom.$('span'));
        span2.textContent = '.';
        dom.addStandardDisposableListener(link, dom.EventType.CLICK, () => this.clearFilters());
        dom.addStandardDisposableListener(link, dom.EventType.KEY_DOWN, (e) => {
            if (e.equals(3) || e.equals(10)) {
                this.clearFilters();
                e.stopPropagation();
            }
        });
        this.setAriaLabel(Messages.MARKERS_PANEL_NO_PROBLEMS_FILTERS);
    }
    renderNoProblemsMessageForActiveFile(container) {
        const span = dom.append(container, dom.$('span'));
        span.textContent = Messages.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT;
        this.setAriaLabel(Messages.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT);
    }
    renderNoProblemsMessage(container) {
        const span = dom.append(container, dom.$('span'));
        span.textContent = Messages.MARKERS_PANEL_NO_PROBLEMS_BUILT;
        this.setAriaLabel(Messages.MARKERS_PANEL_NO_PROBLEMS_BUILT);
    }
    setAriaLabel(label) {
        this.widget.setAriaLabel(label);
        this.ariaLabelElement.setAttribute('aria-label', label);
    }
    clearFilters() {
        this.filterWidget.setFilterText('');
        this.filters.excludedFiles = false;
        this.filters.showErrors = true;
        this.filters.showWarnings = true;
        this.filters.showInfos = true;
    }
    autoReveal(focus = false) {
        if (this.filters.activeFile) {
            return;
        }
        const autoReveal = this.configurationService.getValue('problems.autoReveal');
        if (typeof autoReveal === 'boolean' && autoReveal) {
            const currentActiveResource = this.getResourceForCurrentActiveResource();
            this.widget.revealMarkers(currentActiveResource, focus, this.lastSelectedRelativeTop);
        }
    }
    getResourceForCurrentActiveResource() {
        return this.currentActiveResource ? this.markersModel.getResourceMarkers(this.currentActiveResource) : null;
    }
    updateRangeHighlights() {
        this.rangeHighlightDecorations.removeHighlightRange();
        if (dom.isActiveElement(this.widget.getHTMLElement())) {
            this.highlightCurrentSelectedMarkerRange();
        }
    }
    highlightCurrentSelectedMarkerRange() {
        const selections = this.widget.getSelection() ?? [];
        if (selections.length !== 1) {
            return;
        }
        const selection = selections[0];
        if (!(selection instanceof Marker)) {
            return;
        }
        this.rangeHighlightDecorations.highlightRange(selection);
    }
    onContextMenu(e) {
        const element = e.element;
        if (!element) {
            return;
        }
        e.browserEvent.preventDefault();
        e.browserEvent.stopPropagation();
        this.contextMenuService.showContextMenu({
            getAnchor: () => e.anchor,
            menuId: MenuId.ProblemsPanelContext,
            contextKeyService: this.widget.contextKeyService,
            getActions: () => this.getMenuActions(element),
            getActionViewItem: (action) => {
                const keybinding = this.keybindingService.lookupKeybinding(action.id);
                if (keybinding) {
                    return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                }
                return undefined;
            },
            onHide: (wasCancelled) => {
                if (wasCancelled) {
                    this.widget.domFocus();
                }
            }
        });
    }
    getMenuActions(element) {
        const result = [];
        if (element instanceof Marker) {
            const viewModel = this.markersViewModel.getViewModel(element);
            if (viewModel) {
                const quickFixActions = viewModel.quickFixAction.quickFixes;
                if (quickFixActions.length) {
                    result.push(...quickFixActions);
                    result.push(new Separator());
                }
            }
        }
        return result;
    }
    getFocusElement() {
        return this.widget.getFocus()[0] ?? undefined;
    }
    getFocusedSelectedElements() {
        const focus = this.getFocusElement();
        if (!focus) {
            return null;
        }
        const selection = this.widget.getSelection();
        if (selection.includes(focus)) {
            const result = [];
            for (const selected of selection) {
                if (selected) {
                    result.push(selected);
                }
            }
            return result;
        }
        else {
            return [focus];
        }
    }
    getAllResourceMarkers() {
        return this.markersModel.resourceMarkers;
    }
    getFilterStats() {
        if (!this.cachedFilterStats) {
            this.cachedFilterStats = {
                total: this.markersModel.total,
                filtered: this.widget?.getVisibleItemCount() ?? 0
            };
        }
        return this.cachedFilterStats;
    }
    toggleVisibility(hide) {
        this.widget.toggleVisibility(hide);
        this.layoutBodyContent();
    }
    saveState() {
        this.panelState['filter'] = this.filterWidget.getFilterText();
        this.panelState['filterHistory'] = this.filters.filterHistory;
        this.panelState['showErrors'] = this.filters.showErrors;
        this.panelState['showWarnings'] = this.filters.showWarnings;
        this.panelState['showInfos'] = this.filters.showInfos;
        this.panelState['useFilesExclude'] = this.filters.excludedFiles;
        this.panelState['activeFile'] = this.filters.activeFile;
        this.panelState['multiline'] = this.markersViewModel.multiline;
        this.panelState['viewMode'] = this.markersViewModel.viewMode;
        this.memento.saveMemento();
        super.saveState();
    }
    dispose() {
        super.dispose();
    }
};
MarkersView = __decorate([
    __param(1, IInstantiationService),
    __param(2, IViewDescriptorService),
    __param(3, IEditorService),
    __param(4, IConfigurationService),
    __param(5, ITelemetryService),
    __param(6, IMarkerService),
    __param(7, IContextKeyService),
    __param(8, IWorkspaceContextService),
    __param(9, IContextMenuService),
    __param(10, IUriIdentityService),
    __param(11, IKeybindingService),
    __param(12, IStorageService),
    __param(13, IOpenerService),
    __param(14, IThemeService),
    __param(15, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MarkersView);
export { MarkersView };
let MarkersTree = class MarkersTree extends WorkbenchObjectTree {
    constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, themeService, configurationService) {
        super(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService);
        this.container = container;
        this.visibilityContextKey = MarkersContextKeys.MarkersTreeVisibilityContextKey.bindTo(contextKeyService);
    }
    collapseMarkers() {
        this.collapseAll();
        this.setSelection([]);
        this.setFocus([]);
        this.getHTMLElement().focus();
        this.focusFirst();
    }
    filterMarkers() {
        this.refilter();
    }
    getVisibleItemCount() {
        let filtered = 0;
        const root = this.getNode();
        for (const resourceMarkerNode of root.children) {
            for (const markerNode of resourceMarkerNode.children) {
                if (resourceMarkerNode.visible && markerNode.visible) {
                    filtered++;
                }
            }
        }
        return filtered;
    }
    isVisible() {
        return !this.container.classList.contains('hidden');
    }
    toggleVisibility(hide) {
        this.visibilityContextKey.set(!hide);
        this.container.classList.toggle('hidden', hide);
    }
    reset(resourceMarkers) {
        this.setChildren(null, Iterable.map(resourceMarkers, m => ({ element: m, children: createResourceMarkersIterator(m) })));
    }
    revealMarkers(activeResource, focus, lastSelectedRelativeTop) {
        if (activeResource) {
            if (this.hasElement(activeResource)) {
                if (!this.isCollapsed(activeResource) && this.hasSelectedMarkerFor(activeResource)) {
                    this.reveal(this.getSelection()[0], lastSelectedRelativeTop);
                    if (focus) {
                        this.setFocus(this.getSelection());
                    }
                }
                else {
                    this.expand(activeResource);
                    this.reveal(activeResource, 0);
                    if (focus) {
                        this.setFocus([activeResource]);
                        this.setSelection([activeResource]);
                    }
                }
            }
        }
        else if (focus) {
            this.setSelection([]);
            this.focusFirst();
        }
    }
    setAriaLabel(label) {
        this.ariaLabel = label;
    }
    setMarkerSelection(selection, focus) {
        if (this.isVisible()) {
            if (selection && selection.length > 0) {
                this.setSelection(selection.map(m => this.findMarkerNode(m)));
                if (focus && focus.length > 0) {
                    this.setFocus(focus.map(f => this.findMarkerNode(f)));
                }
                else {
                    this.setFocus([this.findMarkerNode(selection[0])]);
                }
                this.reveal(this.findMarkerNode(selection[0]));
            }
            else if (this.getSelection().length === 0) {
                const firstVisibleElement = this.firstVisibleElement;
                const marker = firstVisibleElement ?
                    firstVisibleElement instanceof ResourceMarkers ? firstVisibleElement.markers[0] :
                        firstVisibleElement instanceof Marker ? firstVisibleElement : undefined
                    : undefined;
                if (marker) {
                    this.setSelection([marker]);
                    this.setFocus([marker]);
                    this.reveal(marker);
                }
            }
        }
    }
    update(resourceMarkers) {
        for (const resourceMarker of resourceMarkers) {
            if (this.hasElement(resourceMarker)) {
                this.setChildren(resourceMarker, createResourceMarkersIterator(resourceMarker));
                this.rerender(resourceMarker);
            }
        }
    }
    updateMarker(marker) {
        this.rerender(marker);
    }
    findMarkerNode(marker) {
        for (const resourceNode of this.getNode().children) {
            for (const markerNode of resourceNode.children) {
                if (markerNode.element instanceof Marker && markerNode.element.marker === marker.marker) {
                    return markerNode.element;
                }
            }
        }
        return null;
    }
    hasSelectedMarkerFor(resource) {
        const selectedElement = this.getSelection();
        if (selectedElement && selectedElement.length > 0) {
            if (selectedElement[0] instanceof Marker) {
                if (resource.has(selectedElement[0].marker.resource)) {
                    return true;
                }
            }
        }
        return false;
    }
    dispose() {
        super.dispose();
    }
    layout(height, width) {
        this.container.style.height = `${height}px`;
        super.layout(height, width);
    }
};
MarkersTree = __decorate([
    __param(5, IInstantiationService),
    __param(6, IContextKeyService),
    __param(7, IListService),
    __param(8, IThemeService),
    __param(9, IConfigurationService),
    __metadata("design:paramtypes", [String, HTMLElement, Object, Array, Object, Object, Object, Object, Object, Object])
], MarkersTree);
