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
var CellDiffPlaceholderRenderer_1, NotebookDocumentMetadataDiffRenderer_1, CellDiffSingleSideRenderer_1, CellDiffSideBySideRenderer_1;
import './notebookDiff.css';
import * as DOM from '../../../../../base/browser/dom.js';
import { isMonacoEditor, MouseController } from '../../../../../base/browser/ui/list/listWidget.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IListService, WorkbenchList } from '../../../../../platform/list/browser/listService.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { DIFF_CELL_MARGIN } from './notebookDiffEditorBrowser.js';
import { CellDiffPlaceholderElement, CollapsedCellOverlayWidget, DeletedElement, getOptimizedNestedCodeEditorWidgetOptions, InsertElement, ModifiedElement, NotebookDocumentMetadataElement, UnchangedCellOverlayWidget } from './diffComponents.js';
import { CodeEditorWidget } from '../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { DiffEditorWidget } from '../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js';
import { IMenuService, MenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { CodiconActionViewItem } from '../view/cellParts/cellActionView.js';
import { BareFontInfo } from '../../../../../editor/common/config/fontInfo.js';
import { PixelRatio } from '../../../../../base/browser/pixelRatio.js';
import { WorkbenchToolBar } from '../../../../../platform/actions/browser/toolbar.js';
import { fixedDiffEditorOptions, fixedEditorOptions } from './diffCellEditorOptions.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { localize } from '../../../../../nls.js';
import { EditorExtensionsRegistry } from '../../../../../editor/browser/editorExtensions.js';
let NotebookCellTextDiffListDelegate = class NotebookCellTextDiffListDelegate {
    constructor(targetWindow, configurationService) {
        this.configurationService = configurationService;
        const editorOptions = this.configurationService.getValue('editor');
        this.lineHeight = BareFontInfo.createFromRawSettings(editorOptions, PixelRatio.getInstance(targetWindow).value).lineHeight;
    }
    getHeight(element) {
        return element.getHeight(this.lineHeight);
    }
    hasDynamicHeight(element) {
        return false;
    }
    getTemplateId(element) {
        switch (element.type) {
            case 'delete':
            case 'insert':
                return CellDiffSingleSideRenderer.TEMPLATE_ID;
            case 'modified':
            case 'unchanged':
                return CellDiffSideBySideRenderer.TEMPLATE_ID;
            case 'placeholder':
                return CellDiffPlaceholderRenderer.TEMPLATE_ID;
            case 'modifiedMetadata':
            case 'unchangedMetadata':
                return NotebookDocumentMetadataDiffRenderer.TEMPLATE_ID;
        }
    }
};
NotebookCellTextDiffListDelegate = __decorate([
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Window, Object])
], NotebookCellTextDiffListDelegate);
export { NotebookCellTextDiffListDelegate };
let CellDiffPlaceholderRenderer = class CellDiffPlaceholderRenderer {
    static { CellDiffPlaceholderRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'cell_diff_placeholder'; }
    constructor(notebookEditor, instantiationService) {
        this.notebookEditor = notebookEditor;
        this.instantiationService = instantiationService;
    }
    get templateId() {
        return CellDiffPlaceholderRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const body = DOM.$('.cell-placeholder-body');
        DOM.append(container, body);
        const elementDisposables = new DisposableStore();
        const marginOverlay = new CollapsedCellOverlayWidget(body);
        const contents = DOM.append(body, DOM.$('.contents'));
        const placeholder = DOM.append(contents, DOM.$('span.text', { title: localize('notebook.diff.hiddenCells.expandAll', 'Double click to show') }));
        return {
            body,
            container,
            placeholder,
            marginOverlay,
            elementDisposables
        };
    }
    renderElement(element, index, templateData, height) {
        templateData.body.classList.remove('left', 'right', 'full');
        templateData.elementDisposables.add(this.instantiationService.createInstance(CellDiffPlaceholderElement, element, templateData));
    }
    disposeTemplate(templateData) {
        templateData.container.innerText = '';
    }
    disposeElement(element, index, templateData) {
        templateData.elementDisposables.clear();
    }
};
CellDiffPlaceholderRenderer = CellDiffPlaceholderRenderer_1 = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], CellDiffPlaceholderRenderer);
export { CellDiffPlaceholderRenderer };
let NotebookDocumentMetadataDiffRenderer = class NotebookDocumentMetadataDiffRenderer {
    static { NotebookDocumentMetadataDiffRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'notebook_metadata_diff_side_by_side'; }
    constructor(notebookEditor, instantiationService, contextMenuService, keybindingService, menuService, contextKeyService, notificationService, themeService, accessibilityService) {
        this.notebookEditor = notebookEditor;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.keybindingService = keybindingService;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.notificationService = notificationService;
        this.themeService = themeService;
        this.accessibilityService = accessibilityService;
    }
    get templateId() {
        return NotebookDocumentMetadataDiffRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const body = DOM.$('.cell-body');
        DOM.append(container, body);
        const diffEditorContainer = DOM.$('.cell-diff-editor-container');
        DOM.append(body, diffEditorContainer);
        const cellHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.input-header-container'));
        const sourceContainer = DOM.append(diffEditorContainer, DOM.$('.source-container'));
        const { editor, editorContainer } = this._buildSourceEditor(sourceContainer);
        const inputToolbarContainer = DOM.append(sourceContainer, DOM.$('.editor-input-toolbar-container'));
        const cellToolbarContainer = DOM.append(inputToolbarContainer, DOM.$('div.property-toolbar'));
        const toolbar = this.instantiationService.createInstance(WorkbenchToolBar, cellToolbarContainer, {
            actionViewItemProvider: (action, options) => {
                if (action instanceof MenuItemAction) {
                    const item = new CodiconActionViewItem(action, { hoverDelegate: options.hoverDelegate }, this.keybindingService, this.notificationService, this.contextKeyService, this.themeService, this.contextMenuService, this.accessibilityService);
                    return item;
                }
                return undefined;
            },
            highlightToggledItems: true
        });
        const borderContainer = DOM.append(body, DOM.$('.border-container'));
        const leftBorder = DOM.append(borderContainer, DOM.$('.left-border'));
        const rightBorder = DOM.append(borderContainer, DOM.$('.right-border'));
        const topBorder = DOM.append(borderContainer, DOM.$('.top-border'));
        const bottomBorder = DOM.append(borderContainer, DOM.$('.bottom-border'));
        const marginOverlay = new UnchangedCellOverlayWidget(body);
        const elementDisposables = new DisposableStore();
        return {
            body,
            container,
            diffEditorContainer,
            cellHeaderContainer,
            sourceEditor: editor,
            editorContainer,
            inputToolbarContainer,
            toolbar,
            leftBorder,
            rightBorder,
            topBorder,
            bottomBorder,
            marginOverlay,
            elementDisposables
        };
    }
    _buildSourceEditor(sourceContainer) {
        return buildDiffEditorWidget(this.instantiationService, this.notebookEditor, sourceContainer, { readOnly: true });
    }
    renderElement(element, index, templateData, height) {
        templateData.body.classList.remove('full');
        templateData.elementDisposables.add(this.instantiationService.createInstance(NotebookDocumentMetadataElement, this.notebookEditor, element, templateData));
    }
    disposeTemplate(templateData) {
        templateData.container.innerText = '';
        templateData.sourceEditor.dispose();
        templateData.toolbar?.dispose();
        templateData.elementDisposables.dispose();
    }
    disposeElement(element, index, templateData) {
        if (templateData.toolbar) {
            templateData.toolbar.context = undefined;
        }
        templateData.elementDisposables.clear();
    }
};
NotebookDocumentMetadataDiffRenderer = NotebookDocumentMetadataDiffRenderer_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IContextMenuService),
    __param(3, IKeybindingService),
    __param(4, IMenuService),
    __param(5, IContextKeyService),
    __param(6, INotificationService),
    __param(7, IThemeService),
    __param(8, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NotebookDocumentMetadataDiffRenderer);
export { NotebookDocumentMetadataDiffRenderer };
let CellDiffSingleSideRenderer = class CellDiffSingleSideRenderer {
    static { CellDiffSingleSideRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'cell_diff_single'; }
    constructor(notebookEditor, instantiationService) {
        this.notebookEditor = notebookEditor;
        this.instantiationService = instantiationService;
    }
    get templateId() {
        return CellDiffSingleSideRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const body = DOM.$('.cell-body');
        DOM.append(container, body);
        const diffEditorContainer = DOM.$('.cell-diff-editor-container');
        DOM.append(body, diffEditorContainer);
        const diagonalFill = DOM.append(body, DOM.$('.diagonal-fill'));
        const cellHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.input-header-container'));
        const sourceContainer = DOM.append(diffEditorContainer, DOM.$('.source-container'));
        const { editor, editorContainer } = this._buildSourceEditor(sourceContainer);
        const metadataHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-header-container'));
        const metadataInfoContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-info-container'));
        const outputHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.output-header-container'));
        const outputInfoContainer = DOM.append(diffEditorContainer, DOM.$('.output-info-container'));
        const borderContainer = DOM.append(body, DOM.$('.border-container'));
        const leftBorder = DOM.append(borderContainer, DOM.$('.left-border'));
        const rightBorder = DOM.append(borderContainer, DOM.$('.right-border'));
        const topBorder = DOM.append(borderContainer, DOM.$('.top-border'));
        const bottomBorder = DOM.append(borderContainer, DOM.$('.bottom-border'));
        return {
            body,
            container,
            editorContainer,
            diffEditorContainer,
            diagonalFill,
            cellHeaderContainer,
            sourceEditor: editor,
            metadataHeaderContainer,
            metadataInfoContainer,
            outputHeaderContainer,
            outputInfoContainer,
            leftBorder,
            rightBorder,
            topBorder,
            bottomBorder,
            elementDisposables: new DisposableStore()
        };
    }
    _buildSourceEditor(sourceContainer) {
        return buildSourceEditor(this.instantiationService, this.notebookEditor, sourceContainer);
    }
    renderElement(element, index, templateData, height) {
        templateData.body.classList.remove('left', 'right', 'full');
        switch (element.type) {
            case 'delete':
                templateData.elementDisposables.add(this.instantiationService.createInstance(DeletedElement, this.notebookEditor, element, templateData));
                return;
            case 'insert':
                templateData.elementDisposables.add(this.instantiationService.createInstance(InsertElement, this.notebookEditor, element, templateData));
                return;
            default:
                break;
        }
    }
    disposeTemplate(templateData) {
        templateData.container.innerText = '';
        templateData.sourceEditor.dispose();
        templateData.elementDisposables.dispose();
    }
    disposeElement(element, index, templateData) {
        templateData.elementDisposables.clear();
    }
};
CellDiffSingleSideRenderer = CellDiffSingleSideRenderer_1 = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], CellDiffSingleSideRenderer);
export { CellDiffSingleSideRenderer };
let CellDiffSideBySideRenderer = class CellDiffSideBySideRenderer {
    static { CellDiffSideBySideRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'cell_diff_side_by_side'; }
    constructor(notebookEditor, instantiationService, contextMenuService, keybindingService, menuService, contextKeyService, notificationService, themeService, accessibilityService) {
        this.notebookEditor = notebookEditor;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.keybindingService = keybindingService;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.notificationService = notificationService;
        this.themeService = themeService;
        this.accessibilityService = accessibilityService;
    }
    get templateId() {
        return CellDiffSideBySideRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(container) {
        const body = DOM.$('.cell-body');
        DOM.append(container, body);
        const diffEditorContainer = DOM.$('.cell-diff-editor-container');
        DOM.append(body, diffEditorContainer);
        const cellHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.input-header-container'));
        const sourceContainer = DOM.append(diffEditorContainer, DOM.$('.source-container'));
        const { editor, editorContainer } = this._buildSourceEditor(sourceContainer);
        const inputToolbarContainer = DOM.append(sourceContainer, DOM.$('.editor-input-toolbar-container'));
        const cellToolbarContainer = DOM.append(inputToolbarContainer, DOM.$('div.property-toolbar'));
        const toolbar = this.instantiationService.createInstance(WorkbenchToolBar, cellToolbarContainer, {
            actionViewItemProvider: (action, options) => {
                if (action instanceof MenuItemAction) {
                    const item = new CodiconActionViewItem(action, { hoverDelegate: options.hoverDelegate }, this.keybindingService, this.notificationService, this.contextKeyService, this.themeService, this.contextMenuService, this.accessibilityService);
                    return item;
                }
                return undefined;
            },
            highlightToggledItems: true
        });
        const metadataHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-header-container'));
        const metadataInfoContainer = DOM.append(diffEditorContainer, DOM.$('.metadata-info-container'));
        const outputHeaderContainer = DOM.append(diffEditorContainer, DOM.$('.output-header-container'));
        const outputInfoContainer = DOM.append(diffEditorContainer, DOM.$('.output-info-container'));
        const borderContainer = DOM.append(body, DOM.$('.border-container'));
        const leftBorder = DOM.append(borderContainer, DOM.$('.left-border'));
        const rightBorder = DOM.append(borderContainer, DOM.$('.right-border'));
        const topBorder = DOM.append(borderContainer, DOM.$('.top-border'));
        const bottomBorder = DOM.append(borderContainer, DOM.$('.bottom-border'));
        const marginOverlay = new UnchangedCellOverlayWidget(body);
        const elementDisposables = new DisposableStore();
        return {
            body,
            container,
            diffEditorContainer,
            cellHeaderContainer,
            sourceEditor: editor,
            editorContainer,
            inputToolbarContainer,
            toolbar,
            metadataHeaderContainer,
            metadataInfoContainer,
            outputHeaderContainer,
            outputInfoContainer,
            leftBorder,
            rightBorder,
            topBorder,
            bottomBorder,
            marginOverlay,
            elementDisposables
        };
    }
    _buildSourceEditor(sourceContainer) {
        return buildDiffEditorWidget(this.instantiationService, this.notebookEditor, sourceContainer);
    }
    renderElement(element, index, templateData, height) {
        templateData.body.classList.remove('left', 'right', 'full');
        switch (element.type) {
            case 'unchanged':
                templateData.elementDisposables.add(this.instantiationService.createInstance(ModifiedElement, this.notebookEditor, element, templateData));
                return;
            case 'modified':
                templateData.elementDisposables.add(this.instantiationService.createInstance(ModifiedElement, this.notebookEditor, element, templateData));
                return;
            default:
                break;
        }
    }
    disposeTemplate(templateData) {
        templateData.container.innerText = '';
        templateData.sourceEditor.dispose();
        templateData.toolbar?.dispose();
        templateData.elementDisposables.dispose();
    }
    disposeElement(element, index, templateData) {
        if (templateData.toolbar) {
            templateData.toolbar.context = undefined;
        }
        templateData.elementDisposables.clear();
    }
};
CellDiffSideBySideRenderer = CellDiffSideBySideRenderer_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IContextMenuService),
    __param(3, IKeybindingService),
    __param(4, IMenuService),
    __param(5, IContextKeyService),
    __param(6, INotificationService),
    __param(7, IThemeService),
    __param(8, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], CellDiffSideBySideRenderer);
export { CellDiffSideBySideRenderer };
export class NotebookMouseController extends MouseController {
    onViewPointer(e) {
        if (isMonacoEditor(e.browserEvent.target)) {
            const focus = typeof e.index === 'undefined' ? [] : [e.index];
            this.list.setFocus(focus, e.browserEvent);
        }
        else {
            super.onViewPointer(e);
        }
    }
}
let NotebookTextDiffList = class NotebookTextDiffList extends WorkbenchList {
    get rowsContainer() {
        return this.view.containerDomNode;
    }
    constructor(listUser, container, delegate, renderers, contextKeyService, options, listService, configurationService, instantiationService) {
        super(listUser, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService);
    }
    createMouseController(options) {
        return new NotebookMouseController(this);
    }
    getCellViewScrollTop(element) {
        const index = this.indexOf(element);
        return this.view.elementTop(index);
    }
    getScrollHeight() {
        return this.view.scrollHeight;
    }
    triggerScrollFromMouseWheelEvent(browserEvent) {
        this.view.delegateScrollFromMouseWheelEvent(browserEvent);
    }
    delegateVerticalScrollbarPointerDown(browserEvent) {
        this.view.delegateVerticalScrollbarPointerDown(browserEvent);
    }
    clear() {
        super.splice(0, this.length);
    }
    updateElementHeight2(element, size) {
        const viewIndex = this.indexOf(element);
        const focused = this.getFocus();
        this.view.updateElementHeight(viewIndex, size, focused.length ? focused[0] : null);
    }
    style(styles) {
        const selectorSuffix = this.view.domId;
        if (!this.styleElement) {
            this.styleElement = DOM.createStyleSheet(this.view.domNode);
        }
        const suffix = selectorSuffix && `.${selectorSuffix}`;
        const content = [];
        if (styles.listBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
        }
        if (styles.listFocusBackground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
        }
        if (styles.listFocusForeground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
        }
        if (styles.listActiveSelectionBackground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
        }
        if (styles.listActiveSelectionForeground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
        }
        if (styles.listFocusAndSelectionBackground) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
        }
        if (styles.listFocusAndSelectionForeground) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
        }
        if (styles.listInactiveFocusBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`);
        }
        if (styles.listInactiveSelectionBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`);
        }
        if (styles.listInactiveSelectionForeground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
        }
        if (styles.listHoverBackground) {
            content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
        }
        if (styles.listHoverForeground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
        }
        if (styles.listSelectionOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
        }
        if (styles.listFocusOutline) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
        }
        if (styles.listInactiveFocusOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
        }
        if (styles.listHoverOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
        }
        if (styles.listDropOverBackground) {
            content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropOverBackground} !important; color: inherit !important; }
			`);
        }
        const newStyles = content.join('\n');
        if (newStyles !== this.styleElement.textContent) {
            this.styleElement.textContent = newStyles;
        }
    }
};
NotebookTextDiffList = __decorate([
    __param(6, IListService),
    __param(7, IConfigurationService),
    __param(8, IInstantiationService),
    __metadata("design:paramtypes", [String, HTMLElement, Object, Array, Object, Object, Object, Object, Object])
], NotebookTextDiffList);
export { NotebookTextDiffList };
function buildDiffEditorWidget(instantiationService, notebookEditor, sourceContainer, options = {}) {
    const editorContainer = DOM.append(sourceContainer, DOM.$('.editor-container'));
    const editor = instantiationService.createInstance(DiffEditorWidget, editorContainer, {
        ...fixedDiffEditorOptions,
        overflowWidgetsDomNode: notebookEditor.getOverflowContainerDomNode(),
        originalEditable: false,
        ignoreTrimWhitespace: false,
        automaticLayout: false,
        dimension: {
            height: 0,
            width: 0
        },
        renderSideBySide: true,
        useInlineViewWhenSpaceIsLimited: false,
        ...options
    }, {
        originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
        modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
    });
    return {
        editor,
        editorContainer
    };
}
function buildSourceEditor(instantiationService, notebookEditor, sourceContainer, options = {}) {
    const editorContainer = DOM.append(sourceContainer, DOM.$('.editor-container'));
    const skipContributions = [
        'editor.contrib.emptyTextEditorHint'
    ];
    const editor = instantiationService.createInstance(CodeEditorWidget, editorContainer, {
        ...fixedEditorOptions,
        glyphMargin: false,
        dimension: {
            width: (notebookEditor.getLayoutInfo().width - 2 * DIFF_CELL_MARGIN) / 2 - 18,
            height: 0
        },
        automaticLayout: false,
        overflowWidgetsDomNode: notebookEditor.getOverflowContainerDomNode(),
        readOnly: true,
    }, {
        contributions: EditorExtensionsRegistry.getEditorContributions().filter(c => skipContributions.indexOf(c.id) === -1)
    });
    return { editor, editorContainer };
}
