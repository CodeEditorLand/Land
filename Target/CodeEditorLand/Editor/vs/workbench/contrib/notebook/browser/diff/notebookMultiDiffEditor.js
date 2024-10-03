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
var NotebookMultiTextDiffEditor_1;
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { INotebookEditorWorkerService } from '../../common/services/notebookWorkerService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { BareFontInfo } from '../../../../../editor/common/config/fontInfo.js';
import { PixelRatio } from '../../../../../base/browser/pixelRatio.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { EditorPane } from '../../../../browser/parts/editor/editorPane.js';
import { CellUri, NOTEBOOK_MULTI_DIFF_EDITOR_ID } from '../../common/notebookCommon.js';
import { FontMeasurements } from '../../../../../editor/browser/config/fontMeasurements.js';
import { NotebookOptions } from '../notebookOptions.js';
import { INotebookService } from '../../common/notebookService.js';
import { NotebookMultiDiffEditorWidgetInput } from './notebookMultiDiffEditorInput.js';
import { MultiDiffEditorWidget } from '../../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.js';
import { ResourceLabel } from '../../../../browser/labels.js';
import { INotebookDocumentService } from '../../../../services/notebook/common/notebookDocumentService.js';
import { localize } from '../../../../../nls.js';
import { Schemas } from '../../../../../base/common/network.js';
import { getIconClassesForLanguageId } from '../../../../../editor/common/services/getIconClasses.js';
import { NotebookDiffViewModel } from './notebookDiffViewModel.js';
import { NotebookDiffEditorEventDispatcher } from './eventDispatcher.js';
import { NOTEBOOK_DIFF_CELLS_COLLAPSED, NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS, NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN } from './notebookDiffEditorBrowser.js';
import { autorun, transaction } from '../../../../../base/common/observable.js';
import { DiffEditorHeightCalculatorService } from './editorHeightCalculator.js';
let NotebookMultiTextDiffEditor = class NotebookMultiTextDiffEditor extends EditorPane {
    static { NotebookMultiTextDiffEditor_1 = this; }
    static { this.ID = NOTEBOOK_MULTI_DIFF_EDITOR_ID; }
    get textModel() {
        return this._model?.modified.notebook;
    }
    get notebookOptions() {
        return this._notebookOptions;
    }
    constructor(group, instantiationService, themeService, _parentContextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookService) {
        super(NotebookMultiTextDiffEditor_1.ID, group, telemetryService, themeService, storageService);
        this.instantiationService = instantiationService;
        this._parentContextKeyService = _parentContextKeyService;
        this.notebookEditorWorkerService = notebookEditorWorkerService;
        this.configurationService = configurationService;
        this.notebookService = notebookService;
        this.modelSpecificResources = this._register(new DisposableStore());
        this.ctxAllCollapsed = this._parentContextKeyService.createKey(NOTEBOOK_DIFF_CELLS_COLLAPSED.key, false);
        this.ctxHasUnchangedCells = this._parentContextKeyService.createKey(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key, false);
        this.ctxHiddenUnchangedCells = this._parentContextKeyService.createKey(NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN.key, true);
        this._notebookOptions = instantiationService.createInstance(NotebookOptions, this.window, false, undefined);
        this._register(this._notebookOptions);
    }
    get fontInfo() {
        if (!this._fontInfo) {
            this._fontInfo = this.createFontInfo();
        }
        return this._fontInfo;
    }
    layout(dimension, position) {
        this._multiDiffEditorWidget.layout(dimension);
    }
    createFontInfo() {
        const editorOptions = this.configurationService.getValue('editor');
        return FontMeasurements.readFontInfo(this.window, BareFontInfo.createFromRawSettings(editorOptions, PixelRatio.getInstance(this.window).value));
    }
    createEditor(parent) {
        this._multiDiffEditorWidget = this._register(this.instantiationService.createInstance(MultiDiffEditorWidget, parent, this.instantiationService.createInstance(WorkbenchUIElementFactory)));
        this._register(this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
            this._onDidChangeControl.fire();
        }));
    }
    async setInput(input, options, context, token) {
        super.setInput(input, options, context, token);
        const model = await input.resolve();
        if (this._model !== model) {
            this._detachModel();
            this._model = model;
        }
        const eventDispatcher = this.modelSpecificResources.add(new NotebookDiffEditorEventDispatcher());
        const diffEditorHeightCalculator = this.instantiationService.createInstance(DiffEditorHeightCalculatorService, this.fontInfo.lineHeight);
        this.viewModel = this.modelSpecificResources.add(new NotebookDiffViewModel(model, this.notebookEditorWorkerService, this.configurationService, eventDispatcher, this.notebookService, diffEditorHeightCalculator, undefined, true));
        await this.viewModel.computeDiff(this.modelSpecificResources.add(new CancellationTokenSource()).token);
        this.ctxHasUnchangedCells.set(this.viewModel.hasUnchangedCells);
        this.ctxHasUnchangedCells.set(this.viewModel.hasUnchangedCells);
        const widgetInput = this.modelSpecificResources.add(NotebookMultiDiffEditorWidgetInput.createInput(this.viewModel, this.instantiationService));
        this.widgetViewModel = this.modelSpecificResources.add(await widgetInput.getViewModel());
        const itemsWeHaveSeen = new WeakSet();
        this.modelSpecificResources.add(autorun(reader => {
            if (!this.widgetViewModel || !this.viewModel) {
                return;
            }
            const items = this.widgetViewModel.items.read(reader);
            const diffItems = this.viewModel.value;
            if (items.length !== diffItems.length) {
                return;
            }
            transaction((tx) => {
                items.forEach(item => {
                    if (itemsWeHaveSeen.has(item)) {
                        return;
                    }
                    itemsWeHaveSeen.add(item);
                    const diffItem = diffItems.find(d => d.modifiedUri?.toString() === item.modifiedUri?.toString() && d.originalUri?.toString() === item.originalUri?.toString());
                    if (diffItem && diffItem.type === 'unchanged') {
                        item.collapsed.set(true, tx);
                    }
                });
            });
        }));
        this._multiDiffEditorWidget.setViewModel(this.widgetViewModel);
    }
    _detachModel() {
        this.viewModel = undefined;
        this.modelSpecificResources.clear();
    }
    _generateFontFamily() {
        return this.fontInfo.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
    }
    setOptions(options) {
        super.setOptions(options);
    }
    getControl() {
        return this._multiDiffEditorWidget.getActiveControl();
    }
    focus() {
        super.focus();
        this._multiDiffEditorWidget?.getActiveControl()?.focus();
    }
    hasFocus() {
        return this._multiDiffEditorWidget?.getActiveControl()?.hasTextFocus() || super.hasFocus();
    }
    clearInput() {
        super.clearInput();
        this._multiDiffEditorWidget.setViewModel(undefined);
        this.modelSpecificResources.clear();
        this.viewModel = undefined;
        this.widgetViewModel = undefined;
    }
    expandAll() {
        if (this.widgetViewModel) {
            this.widgetViewModel.expandAll();
            this.ctxAllCollapsed.set(false);
        }
    }
    collapseAll() {
        if (this.widgetViewModel) {
            this.widgetViewModel.collapseAll();
            this.ctxAllCollapsed.set(true);
        }
    }
    hideUnchanged() {
        if (this.viewModel) {
            this.viewModel.includeUnchanged = false;
            this.ctxHiddenUnchangedCells.set(true);
        }
    }
    showUnchanged() {
        if (this.viewModel) {
            this.viewModel.includeUnchanged = true;
            this.ctxHiddenUnchangedCells.set(false);
        }
    }
    getDiffElementViewModel(uri) {
        if (uri.scheme === Schemas.vscodeNotebookCellOutput || uri.scheme === Schemas.vscodeNotebookCellOutputDiff ||
            uri.scheme === Schemas.vscodeNotebookCellMetadata || uri.scheme === Schemas.vscodeNotebookCellMetadataDiff) {
            const data = CellUri.parseCellPropertyUri(uri, uri.scheme);
            if (data) {
                uri = CellUri.generate(data.notebook, data.handle);
            }
        }
        if (uri.scheme === Schemas.vscodeNotebookMetadata) {
            return this.viewModel?.items.find(item => item.type === 'modifiedMetadata' ||
                item.type === 'unchangedMetadata');
        }
        return this.viewModel?.items.find(c => {
            switch (c.type) {
                case 'delete':
                    return c.original?.uri.toString() === uri.toString();
                case 'insert':
                    return c.modified?.uri.toString() === uri.toString();
                case 'modified':
                case 'unchanged':
                    return c.modified?.uri.toString() === uri.toString() || c.original?.uri.toString() === uri.toString();
                default:
                    return;
            }
        });
    }
};
NotebookMultiTextDiffEditor = NotebookMultiTextDiffEditor_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IThemeService),
    __param(3, IContextKeyService),
    __param(4, INotebookEditorWorkerService),
    __param(5, IConfigurationService),
    __param(6, ITelemetryService),
    __param(7, IStorageService),
    __param(8, INotebookService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NotebookMultiTextDiffEditor);
export { NotebookMultiTextDiffEditor };
let WorkbenchUIElementFactory = class WorkbenchUIElementFactory {
    constructor(_instantiationService, notebookDocumentService, notebookService) {
        this._instantiationService = _instantiationService;
        this.notebookDocumentService = notebookDocumentService;
        this.notebookService = notebookService;
    }
    createResourceLabel(element) {
        const label = this._instantiationService.createInstance(ResourceLabel, element, {});
        const that = this;
        return {
            setUri(uri, options = {}) {
                if (!uri) {
                    label.element.clear();
                }
                else {
                    let name = '';
                    let description = '';
                    let extraClasses = undefined;
                    if (uri.scheme === Schemas.vscodeNotebookCell) {
                        const notebookDocument = uri.scheme === Schemas.vscodeNotebookCell ? that.notebookDocumentService.getNotebook(uri) : undefined;
                        const cellIndex = Schemas.vscodeNotebookCell ? that.notebookDocumentService.getNotebook(uri)?.getCellIndex(uri) : undefined;
                        if (notebookDocument && cellIndex !== undefined) {
                            name = localize('notebookCellLabel', "Cell {0}", `${cellIndex + 1}`);
                            const nb = notebookDocument ? that.notebookService.getNotebookTextModel(notebookDocument?.uri) : undefined;
                            const cellLanguage = nb && cellIndex !== undefined ? nb.cells[cellIndex].language : undefined;
                            extraClasses = cellLanguage ? getIconClassesForLanguageId(cellLanguage) : undefined;
                        }
                    }
                    else if (uri.scheme === Schemas.vscodeNotebookCellMetadata || uri.scheme === Schemas.vscodeNotebookCellMetadataDiff) {
                        description = localize('notebookCellMetadataLabel', "Metadata");
                    }
                    else if (uri.scheme === Schemas.vscodeNotebookCellOutput || uri.scheme === Schemas.vscodeNotebookCellOutputDiff) {
                        description = localize('notebookCellOutputLabel', "Output");
                    }
                    label.element.setResource({ name, description }, { strikethrough: options.strikethrough, forceLabel: true, hideIcon: !extraClasses, extraClasses });
                }
            },
            dispose() {
                label.dispose();
            }
        };
    }
};
WorkbenchUIElementFactory = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookDocumentService),
    __param(2, INotebookService),
    __metadata("design:paramtypes", [Object, Object, Object])
], WorkbenchUIElementFactory);
