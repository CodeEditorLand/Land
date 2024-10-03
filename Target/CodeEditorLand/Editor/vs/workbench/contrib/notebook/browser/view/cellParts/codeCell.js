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
import { localize } from '../../../../../../nls.js';
import * as DOM from '../../../../../../base/browser/dom.js';
import { raceCancellation } from '../../../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../../../base/common/cancellation.js';
import { Codicon } from '../../../../../../base/common/codicons.js';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../../../base/common/lifecycle.js';
import { clamp } from '../../../../../../base/common/numbers.js';
import * as strings from '../../../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { ILanguageService } from '../../../../../../editor/common/languages/language.js';
import { tokenizeToStringSync } from '../../../../../../editor/common/languages/textToHtmlTokenizer.js';
import { CodeActionController } from '../../../../../../editor/contrib/codeAction/browser/codeActionController.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { CellFocusMode, EXPAND_CELL_INPUT_COMMAND_ID } from '../../notebookBrowser.js';
import { CodeCellViewModel, outputDisplayLimit } from '../../viewModel/codeCellViewModel.js';
import { NotebookCellEditorPool } from '../notebookCellEditorPool.js';
import { CellEditorOptions } from './cellEditorOptions.js';
import { CellOutputContainer } from './cellOutput.js';
import { CollapsedCodeCellExecutionIcon } from './codeCellExecutionIcon.js';
let CodeCell = class CodeCell extends Disposable {
    constructor(notebookEditor, viewCell, templateData, editorPool, instantiationService, keybindingService, openerService, languageService, configurationService, notebookExecutionStateService) {
        super();
        this.notebookEditor = notebookEditor;
        this.viewCell = viewCell;
        this.templateData = templateData;
        this.editorPool = editorPool;
        this.instantiationService = instantiationService;
        this.keybindingService = keybindingService;
        this.languageService = languageService;
        this.configurationService = configurationService;
        this._isDisposed = false;
        this._cellEditorOptions = this._register(new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(viewCell.language), this.notebookEditor.notebookOptions, this.configurationService));
        this._outputContainerRenderer = this.instantiationService.createInstance(CellOutputContainer, notebookEditor, viewCell, templateData, { limit: outputDisplayLimit });
        this.cellParts = this._register(templateData.cellParts.concatContentPart([this._cellEditorOptions, this._outputContainerRenderer], DOM.getWindow(notebookEditor.getDomNode())));
        const editorHeight = this.calculateInitEditorHeight();
        this.initializeEditor(editorHeight);
        this._renderedInputCollapseState = false;
        this.registerNotebookEditorListeners();
        this.registerViewCellLayoutChange();
        this.registerCellEditorEventListeners();
        this.registerMouseListener();
        this._register(Event.any(this.viewCell.onDidStartExecution, this.viewCell.onDidStopExecution)((e) => {
            this.cellParts.updateForExecutionState(this.viewCell, e);
        }));
        this._register(this.viewCell.onDidChangeState(e => {
            this.cellParts.updateState(this.viewCell, e);
            if (e.outputIsHoveredChanged) {
                this.updateForOutputHover();
            }
            if (e.outputIsFocusedChanged) {
                this.updateForOutputFocus();
            }
            if (e.metadataChanged || e.internalMetadataChanged) {
                this.updateEditorOptions();
            }
            if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
                this.viewCell.pauseLayout();
                const updated = this.updateForCollapseState();
                this.viewCell.resumeLayout();
                if (updated) {
                    this.relayoutCell();
                }
            }
            if (e.focusModeChanged) {
                this.updateEditorForFocusModeChange(true);
            }
        }));
        this.cellParts.scheduleRenderCell(this.viewCell);
        this._register(toDisposable(() => {
            this.cellParts.unrenderCell(this.viewCell);
        }));
        this.updateEditorOptions();
        this.updateEditorForFocusModeChange(false);
        this.updateForOutputHover();
        this.updateForOutputFocus();
        this.viewCell.editorHeight = editorHeight;
        this._outputContainerRenderer.render();
        this._renderedOutputCollapseState = false;
        this.initialViewUpdateExpanded();
        this._register(this.viewCell.onLayoutInfoRead(() => {
            this.cellParts.prepareLayout();
        }));
        const executionItemElement = DOM.append(this.templateData.cellInputCollapsedContainer, DOM.$('.collapsed-execution-icon'));
        this._register(toDisposable(() => {
            executionItemElement.remove();
        }));
        this._collapsedExecutionIcon = this._register(this.instantiationService.createInstance(CollapsedCodeCellExecutionIcon, this.notebookEditor, this.viewCell, executionItemElement));
        this.updateForCollapseState();
        this._register(Event.runAndSubscribe(viewCell.onDidChangeOutputs, this.updateForOutputs.bind(this)));
        this._register(Event.runAndSubscribe(viewCell.onDidChangeLayout, this.updateForLayout.bind(this)));
        this._cellEditorOptions.setLineNumbers(this.viewCell.lineNumbers);
        templateData.editor.updateOptions(this._cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
    }
    updateCodeCellOptions(templateData) {
        templateData.editor.updateOptions(this._cellEditorOptions.getUpdatedValue(this.viewCell.internalMetadata, this.viewCell.uri));
        const cts = new CancellationTokenSource();
        this._register({ dispose() { cts.dispose(true); } });
        raceCancellation(this.viewCell.resolveTextModel(), cts.token).then(model => {
            if (this._isDisposed) {
                return;
            }
            if (model) {
                model.updateOptions({
                    indentSize: this._cellEditorOptions.indentSize,
                    tabSize: this._cellEditorOptions.tabSize,
                    insertSpaces: this._cellEditorOptions.insertSpaces,
                });
            }
        });
    }
    updateForLayout() {
        this._pendingLayout?.dispose();
        this._pendingLayout = DOM.modify(DOM.getWindow(this.notebookEditor.getDomNode()), () => {
            this.cellParts.updateInternalLayoutNow(this.viewCell);
        });
    }
    updateForOutputHover() {
        this.templateData.container.classList.toggle('cell-output-hover', this.viewCell.outputIsHovered);
    }
    updateForOutputFocus() {
        this.templateData.container.classList.toggle('cell-output-focus', this.viewCell.outputIsFocused);
    }
    calculateInitEditorHeight() {
        const lineNum = this.viewCell.lineCount;
        const lineHeight = this.viewCell.layoutInfo.fontInfo?.lineHeight || 17;
        const editorPadding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
        const editorHeight = this.viewCell.layoutInfo.editorHeight === 0
            ? lineNum * lineHeight + editorPadding.top + editorPadding.bottom
            : this.viewCell.layoutInfo.editorHeight;
        return editorHeight;
    }
    initializeEditor(initEditorHeight) {
        const width = this.viewCell.layoutInfo.editorWidth;
        this.layoutEditor({
            width: width,
            height: initEditorHeight
        });
        const cts = new CancellationTokenSource();
        this._register({ dispose() { cts.dispose(true); } });
        raceCancellation(this.viewCell.resolveTextModel(), cts.token).then(model => {
            if (this._isDisposed) {
                return;
            }
            if (model && this.templateData.editor) {
                this._reigsterModelListeners(model);
                this.templateData.editor.setModel(model);
                if (this._isDisposed) {
                    return;
                }
                model.updateOptions({
                    indentSize: this._cellEditorOptions.indentSize,
                    tabSize: this._cellEditorOptions.tabSize,
                    insertSpaces: this._cellEditorOptions.insertSpaces,
                });
                this.viewCell.attachTextEditor(this.templateData.editor, this.viewCell.layoutInfo.estimatedHasHorizontalScrolling);
                const focusEditorIfNeeded = () => {
                    if (this.notebookEditor.getActiveCell() === this.viewCell &&
                        this.viewCell.focusMode === CellFocusMode.Editor &&
                        (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body)) {
                        this.templateData.editor?.focus();
                    }
                };
                focusEditorIfNeeded();
                const realContentHeight = this.templateData.editor?.getContentHeight();
                if (realContentHeight !== undefined && realContentHeight !== initEditorHeight) {
                    this.onCellEditorHeightChange(realContentHeight);
                }
                if (this._isDisposed) {
                    return;
                }
                focusEditorIfNeeded();
            }
            this._register(this._cellEditorOptions.onDidChange(() => this.updateCodeCellOptions(this.templateData)));
        });
    }
    updateForOutputs() {
        DOM.setVisibility(this.viewCell.outputsViewModels.length > 0, this.templateData.focusSinkElement);
    }
    updateEditorOptions() {
        const editor = this.templateData.editor;
        if (!editor) {
            return;
        }
        const isReadonly = this.notebookEditor.isReadOnly;
        const padding = this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri);
        const options = editor.getOptions();
        if (options.get(94) !== isReadonly || options.get(86) !== padding) {
            editor.updateOptions({ readOnly: this.notebookEditor.isReadOnly, padding: this.notebookEditor.notebookOptions.computeEditorPadding(this.viewCell.internalMetadata, this.viewCell.uri) });
        }
    }
    registerNotebookEditorListeners() {
        this._register(this.notebookEditor.onDidScroll(() => {
            this.adjustEditorPosition();
        }));
        this._register(this.notebookEditor.onDidChangeLayout(() => {
            this.adjustEditorPosition();
            this.onCellWidthChange();
        }));
    }
    adjustEditorPosition() {
        const extraOffset = -6 - 1;
        const min = 0;
        const scrollTop = this.notebookEditor.scrollTop;
        const elementTop = this.notebookEditor.getAbsoluteTopOfElement(this.viewCell);
        const diff = scrollTop - elementTop + extraOffset;
        const notebookEditorLayout = this.notebookEditor.getLayoutInfo();
        const editorMaxHeight = notebookEditorLayout.height
            - notebookEditorLayout.stickyHeight
            - 26;
        const maxTop = this.viewCell.layoutInfo.editorHeight
            - editorMaxHeight;
        const top = maxTop > 20 ?
            clamp(min, diff, maxTop) :
            min;
        this.templateData.editorPart.style.top = `${top}px`;
        this.templateData.editor?.setScrollTop(top);
    }
    registerViewCellLayoutChange() {
        this._register(this.viewCell.onDidChangeLayout((e) => {
            if (e.outerWidth !== undefined) {
                const layoutInfo = this.templateData.editor.getLayoutInfo();
                if (layoutInfo.width !== this.viewCell.layoutInfo.editorWidth) {
                    this.onCellWidthChange();
                    this.adjustEditorPosition();
                }
            }
        }));
    }
    registerCellEditorEventListeners() {
        this._register(this.templateData.editor.onDidContentSizeChange((e) => {
            if (e.contentHeightChanged) {
                if (this.viewCell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.onCellEditorHeightChange(e.contentHeight);
                    this.adjustEditorPosition();
                }
            }
        }));
        this._register(this.templateData.editor.onDidChangeCursorSelection((e) => {
            if (e.source === 'restoreState' || e.oldModelVersionId === 0) {
                return;
            }
            const selections = this.templateData.editor.getSelections();
            if (selections?.length) {
                const contentHeight = this.templateData.editor.getContentHeight();
                const layoutContentHeight = this.viewCell.layoutInfo.editorHeight;
                if (contentHeight !== layoutContentHeight) {
                    this.onCellEditorHeightChange(contentHeight);
                    if (this._isDisposed) {
                        return;
                    }
                }
                const lastSelection = selections[selections.length - 1];
                this.notebookEditor.revealRangeInViewAsync(this.viewCell, lastSelection);
            }
        }));
        this._register(this.templateData.editor.onDidBlurEditorWidget(() => {
            CodeActionController.get(this.templateData.editor)?.hideCodeActions();
            CodeActionController.get(this.templateData.editor)?.hideLightBulbWidget();
        }));
    }
    _reigsterModelListeners(model) {
        this._register(model.onDidChangeTokens(() => {
            if (this.viewCell.isInputCollapsed && this._inputCollapseElement) {
                const content = this._getRichTextFromLineTokens(model);
                DOM.safeInnerHtml(this._inputCollapseElement, content);
                this._attachInputExpandButton(this._inputCollapseElement);
            }
        }));
    }
    registerMouseListener() {
        this._register(this.templateData.editor.onMouseDown(e => {
            if (e.event.rightButton) {
                e.event.preventDefault();
            }
        }));
    }
    shouldPreserveEditor() {
        return this.notebookEditor.getActiveCell() === this.viewCell
            && this.viewCell.focusMode === CellFocusMode.Editor
            && (this.notebookEditor.hasEditorFocus() || this.notebookEditor.getDomNode().ownerDocument.activeElement === this.notebookEditor.getDomNode().ownerDocument.body);
    }
    updateEditorForFocusModeChange(sync) {
        if (this.shouldPreserveEditor()) {
            if (sync) {
                this.templateData.editor?.focus();
            }
            else {
                this._register(DOM.runAtThisOrScheduleAtNextAnimationFrame(DOM.getWindow(this.templateData.container), () => {
                    this.templateData.editor?.focus();
                }));
            }
        }
        this.templateData.container.classList.toggle('cell-editor-focus', this.viewCell.focusMode === CellFocusMode.Editor);
        this.templateData.container.classList.toggle('cell-output-focus', this.viewCell.focusMode === CellFocusMode.Output);
    }
    updateForCollapseState() {
        if (this.viewCell.isOutputCollapsed === this._renderedOutputCollapseState &&
            this.viewCell.isInputCollapsed === this._renderedInputCollapseState) {
            return false;
        }
        this.viewCell.layoutChange({ editorHeight: true });
        if (this.viewCell.isInputCollapsed) {
            this._collapseInput();
        }
        else {
            this._showInput();
        }
        if (this.viewCell.isOutputCollapsed) {
            this._collapseOutput();
        }
        else {
            this._showOutput(false);
        }
        this.relayoutCell();
        this._renderedOutputCollapseState = this.viewCell.isOutputCollapsed;
        this._renderedInputCollapseState = this.viewCell.isInputCollapsed;
        return true;
    }
    _collapseInput() {
        DOM.hide(this.templateData.editorPart);
        this.templateData.container.classList.toggle('input-collapsed', true);
        this._removeInputCollapsePreview();
        this._collapsedExecutionIcon.setVisibility(true);
        const richEditorText = this.templateData.editor.hasModel() ? this._getRichTextFromLineTokens(this.templateData.editor.getModel()) : this._getRichText(this.viewCell.textBuffer, this.viewCell.language);
        const element = DOM.$('div.cell-collapse-preview');
        DOM.safeInnerHtml(element, richEditorText);
        this._inputCollapseElement = element;
        this.templateData.cellInputCollapsedContainer.appendChild(element);
        this._attachInputExpandButton(element);
        DOM.show(this.templateData.cellInputCollapsedContainer);
    }
    _attachInputExpandButton(element) {
        const expandIcon = DOM.$('span.expandInputIcon');
        const keybinding = this.keybindingService.lookupKeybinding(EXPAND_CELL_INPUT_COMMAND_ID);
        if (keybinding) {
            element.title = localize('cellExpandInputButtonLabelWithDoubleClick', "Double-click to expand cell input ({0})", keybinding.getLabel());
            expandIcon.title = localize('cellExpandInputButtonLabel', "Expand Cell Input ({0})", keybinding.getLabel());
        }
        expandIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.more));
        element.appendChild(expandIcon);
    }
    _showInput() {
        this._collapsedExecutionIcon.setVisibility(false);
        DOM.show(this.templateData.editorPart);
        DOM.hide(this.templateData.cellInputCollapsedContainer);
    }
    _getRichText(buffer, language) {
        return tokenizeToStringSync(this.languageService, buffer.getLineContent(1), language);
    }
    _getRichTextFromLineTokens(model) {
        let result = `<div class="monaco-tokenized-source">`;
        const firstLineTokens = model.tokenization.getLineTokens(1);
        const viewLineTokens = firstLineTokens.inflate();
        const line = model.getLineContent(1);
        let startOffset = 0;
        for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
            const type = viewLineTokens.getClassName(j);
            const endIndex = viewLineTokens.getEndOffset(j);
            result += `<span class="${type}">${strings.escape(line.substring(startOffset, endIndex))}</span>`;
            startOffset = endIndex;
        }
        result += `</div>`;
        return result;
    }
    _removeInputCollapsePreview() {
        const children = this.templateData.cellInputCollapsedContainer.children;
        const elements = [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].classList.contains('cell-collapse-preview')) {
                elements.push(children[i]);
            }
        }
        elements.forEach(element => {
            element.remove();
        });
    }
    _updateOutputInnerContainer(hide) {
        const children = this.templateData.outputContainer.domNode.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].classList.contains('output-inner-container')) {
                DOM.setVisibility(!hide, children[i]);
            }
        }
    }
    _collapseOutput() {
        this.templateData.container.classList.toggle('output-collapsed', true);
        DOM.show(this.templateData.cellOutputCollapsedContainer);
        this._updateOutputInnerContainer(true);
        this._outputContainerRenderer.viewUpdateHideOuputs();
    }
    _showOutput(initRendering) {
        this.templateData.container.classList.toggle('output-collapsed', false);
        DOM.hide(this.templateData.cellOutputCollapsedContainer);
        this._updateOutputInnerContainer(false);
        this._outputContainerRenderer.viewUpdateShowOutputs(initRendering);
    }
    initialViewUpdateExpanded() {
        this.templateData.container.classList.toggle('input-collapsed', false);
        DOM.show(this.templateData.editorPart);
        DOM.hide(this.templateData.cellInputCollapsedContainer);
        this.templateData.container.classList.toggle('output-collapsed', false);
        this._showOutput(true);
    }
    layoutEditor(dimension) {
        const editorLayout = this.notebookEditor.getLayoutInfo();
        const maxHeight = Math.min(editorLayout.height
            - editorLayout.stickyHeight
            - 26, dimension.height);
        this.templateData.editor?.layout({
            width: dimension.width,
            height: maxHeight
        }, true);
    }
    onCellWidthChange() {
        if (!this.templateData.editor.hasModel()) {
            return;
        }
        const realContentHeight = this.templateData.editor.getContentHeight();
        this.viewCell.editorHeight = realContentHeight;
        this.relayoutCell();
        this.layoutEditor({
            width: this.viewCell.layoutInfo.editorWidth,
            height: realContentHeight
        });
    }
    onCellEditorHeightChange(newHeight) {
        const viewLayout = this.templateData.editor.getLayoutInfo();
        this.viewCell.editorHeight = newHeight;
        this.relayoutCell();
        this.layoutEditor({
            width: viewLayout.width,
            height: newHeight
        });
    }
    relayoutCell() {
        this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
    }
    dispose() {
        this._isDisposed = true;
        if (this.shouldPreserveEditor()) {
            this.editorPool.preserveFocusedEditor(this.viewCell);
        }
        this.viewCell.detachTextEditor();
        this._removeInputCollapsePreview();
        this._outputContainerRenderer.dispose();
        this._pendingLayout?.dispose();
        super.dispose();
    }
};
CodeCell = __decorate([
    __param(4, IInstantiationService),
    __param(5, IKeybindingService),
    __param(6, IOpenerService),
    __param(7, ILanguageService),
    __param(8, IConfigurationService),
    __param(9, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, CodeCellViewModel, Object, NotebookCellEditorPool, Object, Object, Object, Object, Object, Object])
], CodeCell);
export { CodeCell };
