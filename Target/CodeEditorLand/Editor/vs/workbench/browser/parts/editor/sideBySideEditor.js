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
var SideBySideEditor_1;
import './media/sidebysideeditor.css';
import { localize } from '../../../../nls.js';
import { Dimension, $, clearNode, multibyteAwareBtoa } from '../../../../base/browser/dom.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorExtensions, SIDE_BY_SIDE_EDITOR_ID, SideBySideEditor as Side, isEditorPaneWithSelection } from '../../../common/editor.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { SplitView, Sizing } from '../../../../base/browser/ui/splitview/splitview.js';
import { Event, Relay, Emitter } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { DEFAULT_EDITOR_MIN_DIMENSIONS } from './editor.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER, SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER } from '../../../common/theme.js';
import { AbstractEditorWithViewState } from './editorWithViewState.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { isEqual } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
function isSideBySideEditorViewState(thing) {
    const candidate = thing;
    return typeof candidate?.primary === 'object' && typeof candidate.secondary === 'object';
}
let SideBySideEditor = class SideBySideEditor extends AbstractEditorWithViewState {
    static { SideBySideEditor_1 = this; }
    static { this.ID = SIDE_BY_SIDE_EDITOR_ID; }
    static { this.SIDE_BY_SIDE_LAYOUT_SETTING = 'workbench.editor.splitInGroupLayout'; }
    static { this.VIEW_STATE_PREFERENCE_KEY = 'sideBySideEditorViewState'; }
    get minimumPrimaryWidth() { return this.primaryEditorPane ? this.primaryEditorPane.minimumWidth : 0; }
    get maximumPrimaryWidth() { return this.primaryEditorPane ? this.primaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY; }
    get minimumPrimaryHeight() { return this.primaryEditorPane ? this.primaryEditorPane.minimumHeight : 0; }
    get maximumPrimaryHeight() { return this.primaryEditorPane ? this.primaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY; }
    get minimumSecondaryWidth() { return this.secondaryEditorPane ? this.secondaryEditorPane.minimumWidth : 0; }
    get maximumSecondaryWidth() { return this.secondaryEditorPane ? this.secondaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY; }
    get minimumSecondaryHeight() { return this.secondaryEditorPane ? this.secondaryEditorPane.minimumHeight : 0; }
    get maximumSecondaryHeight() { return this.secondaryEditorPane ? this.secondaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY; }
    set minimumWidth(value) { }
    set maximumWidth(value) { }
    set minimumHeight(value) { }
    set maximumHeight(value) { }
    get minimumWidth() { return this.minimumPrimaryWidth + this.minimumSecondaryWidth; }
    get maximumWidth() { return this.maximumPrimaryWidth + this.maximumSecondaryWidth; }
    get minimumHeight() { return this.minimumPrimaryHeight + this.minimumSecondaryHeight; }
    get maximumHeight() { return this.maximumPrimaryHeight + this.maximumSecondaryHeight; }
    constructor(group, telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService) {
        super(SideBySideEditor_1.ID, group, SideBySideEditor_1.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
        this.configurationService = configurationService;
        this.onDidCreateEditors = this._register(new Emitter());
        this._onDidChangeSizeConstraints = this._register(new Relay());
        this.onDidChangeSizeConstraints = Event.any(this.onDidCreateEditors.event, this._onDidChangeSizeConstraints.event);
        this._onDidChangeSelection = this._register(new Emitter());
        this.onDidChangeSelection = this._onDidChangeSelection.event;
        this.primaryEditorPane = undefined;
        this.secondaryEditorPane = undefined;
        this.splitviewDisposables = this._register(new DisposableStore());
        this.editorDisposables = this._register(new DisposableStore());
        this.orientation = this.configurationService.getValue(SideBySideEditor_1.SIDE_BY_SIDE_LAYOUT_SETTING) === 'vertical' ? 0 : 1;
        this.dimension = new Dimension(0, 0);
        this.lastFocusedSide = undefined;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
    }
    onConfigurationUpdated(event) {
        if (event.affectsConfiguration(SideBySideEditor_1.SIDE_BY_SIDE_LAYOUT_SETTING)) {
            this.orientation = this.configurationService.getValue(SideBySideEditor_1.SIDE_BY_SIDE_LAYOUT_SETTING) === 'vertical' ? 0 : 1;
            if (this.splitview) {
                this.recreateSplitview();
            }
        }
    }
    recreateSplitview() {
        const container = assertIsDefined(this.getContainer());
        const ratio = this.getSplitViewRatio();
        if (this.splitview) {
            this.splitview.el.remove();
            this.splitviewDisposables.clear();
        }
        this.createSplitView(container, ratio);
        this.layout(this.dimension);
    }
    getSplitViewRatio() {
        let ratio = undefined;
        if (this.splitview) {
            const leftViewSize = this.splitview.getViewSize(0);
            const rightViewSize = this.splitview.getViewSize(1);
            if (Math.abs(leftViewSize - rightViewSize) > 1) {
                const totalSize = this.splitview.orientation === 1 ? this.dimension.width : this.dimension.height;
                ratio = leftViewSize / totalSize;
            }
        }
        return ratio;
    }
    createEditor(parent) {
        parent.classList.add('side-by-side-editor');
        this.secondaryEditorContainer = $('.side-by-side-editor-container.editor-instance');
        this.primaryEditorContainer = $('.side-by-side-editor-container.editor-instance');
        this.createSplitView(parent);
    }
    createSplitView(parent, ratio) {
        this.splitview = this.splitviewDisposables.add(new SplitView(parent, { orientation: this.orientation }));
        this.splitviewDisposables.add(this.splitview.onDidSashReset(() => this.splitview?.distributeViewSizes()));
        if (this.orientation === 1) {
            this.splitview.orthogonalEndSash = this._boundarySashes?.bottom;
        }
        else {
            this.splitview.orthogonalStartSash = this._boundarySashes?.left;
            this.splitview.orthogonalEndSash = this._boundarySashes?.right;
        }
        let leftSizing = Sizing.Distribute;
        let rightSizing = Sizing.Distribute;
        if (ratio) {
            const totalSize = this.splitview.orientation === 1 ? this.dimension.width : this.dimension.height;
            leftSizing = Math.round(totalSize * ratio);
            rightSizing = totalSize - leftSizing;
            this.splitview.layout(this.orientation === 1 ? this.dimension.width : this.dimension.height);
        }
        const secondaryEditorContainer = assertIsDefined(this.secondaryEditorContainer);
        this.splitview.addView({
            element: secondaryEditorContainer,
            layout: size => this.layoutPane(this.secondaryEditorPane, size),
            minimumSize: this.orientation === 1 ? DEFAULT_EDITOR_MIN_DIMENSIONS.width : DEFAULT_EDITOR_MIN_DIMENSIONS.height,
            maximumSize: Number.POSITIVE_INFINITY,
            onDidChange: Event.None
        }, leftSizing);
        const primaryEditorContainer = assertIsDefined(this.primaryEditorContainer);
        this.splitview.addView({
            element: primaryEditorContainer,
            layout: size => this.layoutPane(this.primaryEditorPane, size),
            minimumSize: this.orientation === 1 ? DEFAULT_EDITOR_MIN_DIMENSIONS.width : DEFAULT_EDITOR_MIN_DIMENSIONS.height,
            maximumSize: Number.POSITIVE_INFINITY,
            onDidChange: Event.None
        }, rightSizing);
        this.updateStyles();
    }
    getTitle() {
        if (this.input) {
            return this.input.getName();
        }
        return localize('sideBySideEditor', "Side by Side Editor");
    }
    async setInput(input, options, context, token) {
        const oldInput = this.input;
        await super.setInput(input, options, context, token);
        if (!oldInput || !input.matches(oldInput)) {
            if (oldInput) {
                this.disposeEditors();
            }
            this.createEditors(input);
        }
        const { primary, secondary, viewState } = this.loadViewState(input, options, context);
        this.lastFocusedSide = viewState?.focus;
        if (typeof viewState?.ratio === 'number' && this.splitview) {
            const totalSize = this.splitview.orientation === 1 ? this.dimension.width : this.dimension.height;
            this.splitview.resizeView(0, Math.round(totalSize * viewState.ratio));
        }
        else {
            this.splitview?.distributeViewSizes();
        }
        await Promise.all([
            this.secondaryEditorPane?.setInput(input.secondary, secondary, context, token),
            this.primaryEditorPane?.setInput(input.primary, primary, context, token)
        ]);
        if (typeof options?.target === 'number') {
            this.lastFocusedSide = options.target;
        }
    }
    loadViewState(input, options, context) {
        const viewState = isSideBySideEditorViewState(options?.viewState) ? options?.viewState : this.loadEditorViewState(input, context);
        let primaryOptions = Object.create(null);
        let secondaryOptions = undefined;
        if (options?.target === Side.SECONDARY) {
            secondaryOptions = { ...options };
        }
        else {
            primaryOptions = { ...options };
        }
        primaryOptions.viewState = viewState?.primary;
        if (viewState?.secondary) {
            if (!secondaryOptions) {
                secondaryOptions = { viewState: viewState.secondary };
            }
            else {
                secondaryOptions.viewState = viewState?.secondary;
            }
        }
        return { primary: primaryOptions, secondary: secondaryOptions, viewState };
    }
    createEditors(newInput) {
        this.secondaryEditorPane = this.doCreateEditor(newInput.secondary, assertIsDefined(this.secondaryEditorContainer));
        this.primaryEditorPane = this.doCreateEditor(newInput.primary, assertIsDefined(this.primaryEditorContainer));
        this.layout(this.dimension);
        this._onDidChangeSizeConstraints.input = Event.any(Event.map(this.secondaryEditorPane.onDidChangeSizeConstraints, () => undefined), Event.map(this.primaryEditorPane.onDidChangeSizeConstraints, () => undefined));
        this.onDidCreateEditors.fire(undefined);
        this.editorDisposables.add(this.primaryEditorPane.onDidFocus(() => this.onDidFocusChange(Side.PRIMARY)));
        this.editorDisposables.add(this.secondaryEditorPane.onDidFocus(() => this.onDidFocusChange(Side.SECONDARY)));
    }
    doCreateEditor(editorInput, container) {
        const editorPaneDescriptor = Registry.as(EditorExtensions.EditorPane).getEditorPane(editorInput);
        if (!editorPaneDescriptor) {
            throw new Error('No editor pane descriptor for editor found');
        }
        const editorPane = editorPaneDescriptor.instantiate(this.instantiationService, this.group);
        editorPane.create(container);
        editorPane.setVisible(this.isVisible());
        if (isEditorPaneWithSelection(editorPane)) {
            this.editorDisposables.add(editorPane.onDidChangeSelection(e => this._onDidChangeSelection.fire(e)));
        }
        this.editorDisposables.add(editorPane);
        return editorPane;
    }
    onDidFocusChange(side) {
        this.lastFocusedSide = side;
        this._onDidChangeControl.fire();
    }
    getSelection() {
        const lastFocusedEditorPane = this.getLastFocusedEditorPane();
        if (isEditorPaneWithSelection(lastFocusedEditorPane)) {
            const selection = lastFocusedEditorPane.getSelection();
            if (selection) {
                return new SideBySideAwareEditorPaneSelection(selection, lastFocusedEditorPane === this.primaryEditorPane ? Side.PRIMARY : Side.SECONDARY);
            }
        }
        return undefined;
    }
    setOptions(options) {
        super.setOptions(options);
        if (typeof options?.target === 'number') {
            this.lastFocusedSide = options.target;
        }
        this.getLastFocusedEditorPane()?.setOptions(options);
    }
    setEditorVisible(visible) {
        this.primaryEditorPane?.setVisible(visible);
        this.secondaryEditorPane?.setVisible(visible);
        super.setEditorVisible(visible);
    }
    clearInput() {
        super.clearInput();
        this.primaryEditorPane?.clearInput();
        this.secondaryEditorPane?.clearInput();
        this.disposeEditors();
    }
    focus() {
        super.focus();
        this.getLastFocusedEditorPane()?.focus();
    }
    getLastFocusedEditorPane() {
        if (this.lastFocusedSide === Side.SECONDARY) {
            return this.secondaryEditorPane;
        }
        return this.primaryEditorPane;
    }
    layout(dimension) {
        this.dimension = dimension;
        const splitview = assertIsDefined(this.splitview);
        splitview.layout(this.orientation === 1 ? dimension.width : dimension.height);
    }
    setBoundarySashes(sashes) {
        this._boundarySashes = sashes;
        if (this.splitview) {
            this.splitview.orthogonalEndSash = sashes.bottom;
        }
    }
    layoutPane(pane, size) {
        pane?.layout(this.orientation === 1 ? new Dimension(size, this.dimension.height) : new Dimension(this.dimension.width, size));
    }
    getControl() {
        return this.getLastFocusedEditorPane()?.getControl();
    }
    getPrimaryEditorPane() {
        return this.primaryEditorPane;
    }
    getSecondaryEditorPane() {
        return this.secondaryEditorPane;
    }
    tracksEditorViewState(input) {
        return input instanceof SideBySideEditorInput;
    }
    computeEditorViewState(resource) {
        if (!this.input || !isEqual(resource, this.toEditorViewStateResource(this.input))) {
            return;
        }
        const primarViewState = this.primaryEditorPane?.getViewState();
        const secondaryViewState = this.secondaryEditorPane?.getViewState();
        if (!primarViewState || !secondaryViewState) {
            return;
        }
        return {
            primary: primarViewState,
            secondary: secondaryViewState,
            focus: this.lastFocusedSide,
            ratio: this.getSplitViewRatio()
        };
    }
    toEditorViewStateResource(input) {
        let primary;
        let secondary;
        if (input instanceof SideBySideEditorInput) {
            primary = input.primary.resource;
            secondary = input.secondary.resource;
        }
        if (!secondary || !primary) {
            return undefined;
        }
        return URI.from({ scheme: 'sideBySide', path: `${multibyteAwareBtoa(secondary.toString())}${multibyteAwareBtoa(primary.toString())}` });
    }
    updateStyles() {
        super.updateStyles();
        if (this.primaryEditorContainer) {
            if (this.orientation === 1) {
                this.primaryEditorContainer.style.borderLeftWidth = '1px';
                this.primaryEditorContainer.style.borderLeftStyle = 'solid';
                this.primaryEditorContainer.style.borderLeftColor = this.getColor(SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER) ?? '';
                this.primaryEditorContainer.style.borderTopWidth = '0';
            }
            else {
                this.primaryEditorContainer.style.borderTopWidth = '1px';
                this.primaryEditorContainer.style.borderTopStyle = 'solid';
                this.primaryEditorContainer.style.borderTopColor = this.getColor(SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER) ?? '';
                this.primaryEditorContainer.style.borderLeftWidth = '0';
            }
        }
    }
    dispose() {
        this.disposeEditors();
        super.dispose();
    }
    disposeEditors() {
        this.editorDisposables.clear();
        this.secondaryEditorPane = undefined;
        this.primaryEditorPane = undefined;
        this.lastFocusedSide = undefined;
        if (this.secondaryEditorContainer) {
            clearNode(this.secondaryEditorContainer);
        }
        if (this.primaryEditorContainer) {
            clearNode(this.primaryEditorContainer);
        }
    }
};
SideBySideEditor = SideBySideEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IInstantiationService),
    __param(3, IThemeService),
    __param(4, IStorageService),
    __param(5, IConfigurationService),
    __param(6, ITextResourceConfigurationService),
    __param(7, IEditorService),
    __param(8, IEditorGroupsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SideBySideEditor);
export { SideBySideEditor };
class SideBySideAwareEditorPaneSelection {
    constructor(selection, side) {
        this.selection = selection;
        this.side = side;
    }
    compare(other) {
        if (!(other instanceof SideBySideAwareEditorPaneSelection)) {
            return 3;
        }
        if (this.side !== other.side) {
            return 3;
        }
        return this.selection.compare(other.selection);
    }
    restore(options) {
        const sideBySideEditorOptions = {
            ...options,
            target: this.side
        };
        return this.selection.restore(sideBySideEditorOptions);
    }
}
