/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { Emitter } from '../../../../../base/common/event.js';
import * as UUID from '../../../../../base/common/uuid.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { CellEditState, CellLayoutContext, CellLayoutState } from '../notebookBrowser.js';
import { BaseCellViewModel } from './baseCellViewModel.js';
import { NotebookCellTextModel } from '../../common/model/notebookCellTextModel.js';
import { CellKind } from '../../common/notebookCommon.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { ViewContext } from './viewContext.js';
import { IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { NotebookCellStateChangedEvent } from '../notebookViewEvents.js';
let MarkupCellViewModel = class MarkupCellViewModel extends BaseCellViewModel {
    get renderedHtml() { return this._renderedHtml; }
    set renderedHtml(value) {
        if (this._renderedHtml !== value) {
            this._renderedHtml = value;
            this._onDidChangeState.fire({ contentChanged: true });
        }
    }
    get layoutInfo() {
        return this._layoutInfo;
    }
    set renderedMarkdownHeight(newHeight) {
        this._previewHeight = newHeight;
        this._updateTotalHeight(this._computeTotalHeight());
    }
    set chatHeight(newHeight) {
        this._chatHeight = newHeight;
        this._updateTotalHeight(this._computeTotalHeight());
    }
    get chatHeight() {
        return this._chatHeight;
    }
    set editorHeight(newHeight) {
        this._editorHeight = newHeight;
        this._statusBarHeight = this.viewContext.notebookOptions.computeStatusBarHeight();
        this._updateTotalHeight(this._computeTotalHeight());
    }
    get editorHeight() {
        throw new Error('MarkdownCellViewModel.editorHeight is write only');
    }
    get foldingState() {
        return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this));
    }
    get outputIsHovered() {
        return this._hoveringOutput;
    }
    set outputIsHovered(v) {
        this._hoveringOutput = v;
    }
    get outputIsFocused() {
        return this._focusOnOutput;
    }
    set outputIsFocused(v) {
        this._focusOnOutput = v;
    }
    get inputInOutputIsFocused() {
        return false;
    }
    set inputInOutputIsFocused(_) {
        //
    }
    get cellIsHovered() {
        return this._hoveringCell;
    }
    set cellIsHovered(v) {
        this._hoveringCell = v;
        this._onDidChangeState.fire({ cellIsHoveredChanged: true });
    }
    constructor(viewType, model, initialNotebookLayoutInfo, foldingDelegate, viewContext, configurationService, textModelService, undoRedoService, codeEditorService) {
        super(viewType, model, UUID.generateUuid(), viewContext, configurationService, textModelService, undoRedoService, codeEditorService);
        this.foldingDelegate = foldingDelegate;
        this.viewContext = viewContext;
        this.cellKind = CellKind.Markup;
        this._previewHeight = 0;
        this._chatHeight = 0;
        this._editorHeight = 0;
        this._statusBarHeight = 0;
        this._onDidChangeLayout = this._register(new Emitter());
        this.onDidChangeLayout = this._onDidChangeLayout.event;
        this._hoveringOutput = false;
        this._focusOnOutput = false;
        this._hoveringCell = false;
        /**
         * we put outputs stuff here to make compiler happy
         */
        this.outputsViewModels = [];
        this._hasFindResult = this._register(new Emitter());
        this.hasFindResult = this._hasFindResult.event;
        const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
        this._layoutInfo = {
            chatHeight: 0,
            editorHeight: 0,
            previewHeight: 0,
            fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
            editorWidth: initialNotebookLayoutInfo?.width
                ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(initialNotebookLayoutInfo.width)
                : 0,
            commentOffset: 0,
            commentHeight: 0,
            bottomToolbarOffset: bottomToolbarGap,
            totalHeight: 100,
            layoutState: CellLayoutState.Uninitialized,
            foldHintHeight: 0,
            statusBarHeight: 0
        };
        this._register(this.onDidChangeState(e => {
            this.viewContext.eventDispatcher.emit([new NotebookCellStateChangedEvent(e, this.model)]);
            if (e.foldingStateChanged) {
                this._updateTotalHeight(this._computeTotalHeight(), CellLayoutContext.Fold);
            }
        }));
    }
    _computeTotalHeight() {
        const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
        const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
        const foldHintHeight = this._computeFoldHintHeight();
        if (this.getEditState() === CellEditState.Editing) {
            return this._editorHeight
                + layoutConfiguration.markdownCellTopMargin
                + layoutConfiguration.markdownCellBottomMargin
                + bottomToolbarGap
                + this._statusBarHeight
                + this._commentHeight;
        }
        else {
            // @rebornix
            // On file open, the previewHeight + bottomToolbarGap for a cell out of viewport can be 0
            // When it's 0, the list view will never try to render it anymore even if we scroll the cell into view.
            // Thus we make sure it's greater than 0
            return Math.max(1, this._previewHeight + bottomToolbarGap + foldHintHeight + this._commentHeight);
        }
    }
    _computeFoldHintHeight() {
        return (this.getEditState() === CellEditState.Editing || this.foldingState !== 2 /* CellFoldingState.Collapsed */) ?
            0 : this.viewContext.notebookOptions.getLayoutConfiguration().markdownFoldHintHeight;
    }
    updateOptions(e) {
        super.updateOptions(e);
        if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
            this._updateTotalHeight(this._computeTotalHeight());
        }
    }
    getOutputOffset(index) {
        // throw new Error('Method not implemented.');
        return -1;
    }
    updateOutputHeight(index, height) {
        // throw new Error('Method not implemented.');
    }
    triggerFoldingStateChange() {
        this._onDidChangeState.fire({ foldingStateChanged: true });
    }
    _updateTotalHeight(newHeight, context) {
        if (newHeight !== this.layoutInfo.totalHeight) {
            this.layoutChange({ totalHeight: newHeight, context });
        }
    }
    layoutChange(state) {
        let totalHeight;
        let foldHintHeight;
        if (!this.isInputCollapsed) {
            totalHeight = state.totalHeight === undefined ?
                (this._layoutInfo.layoutState ===
                    CellLayoutState.Uninitialized ?
                    100 :
                    this._layoutInfo.totalHeight) :
                state.totalHeight;
            // recompute
            foldHintHeight = this._computeFoldHintHeight();
        }
        else {
            totalHeight =
                this.viewContext.notebookOptions
                    .computeCollapsedMarkdownCellHeight(this.viewType);
            state.totalHeight = totalHeight;
            foldHintHeight = 0;
        }
        let commentOffset;
        if (this.getEditState() === CellEditState.Editing) {
            const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
            commentOffset = notebookLayoutConfiguration.editorToolbarHeight
                + notebookLayoutConfiguration.cellTopMargin // CELL_TOP_MARGIN
                + this._chatHeight
                + this._editorHeight
                + this._statusBarHeight;
        }
        else {
            commentOffset = this._previewHeight;
        }
        this._layoutInfo = {
            fontInfo: state.font || this._layoutInfo.fontInfo,
            editorWidth: state.outerWidth !== undefined ?
                this.viewContext.notebookOptions
                    .computeMarkdownCellEditorWidth(state.outerWidth) :
                this._layoutInfo.editorWidth,
            chatHeight: this._chatHeight,
            editorHeight: this._editorHeight,
            statusBarHeight: this._statusBarHeight,
            previewHeight: this._previewHeight,
            bottomToolbarOffset: this.viewContext.notebookOptions
                .computeBottomToolbarOffset(totalHeight, this.viewType),
            totalHeight,
            layoutState: CellLayoutState.Measured,
            foldHintHeight,
            commentOffset,
            commentHeight: state.commentHeight ?
                this._commentHeight :
                this._layoutInfo.commentHeight,
        };
        this._onDidChangeLayout.fire(state);
    }
    restoreEditorViewState(editorViewStates, totalHeight) {
        super.restoreEditorViewState(editorViewStates);
        // we might already warmup the viewport so the cell has a total height computed
        if (totalHeight !== undefined && this.layoutInfo.layoutState === CellLayoutState.Uninitialized) {
            this._layoutInfo = {
                ...this.layoutInfo,
                totalHeight: totalHeight,
                chatHeight: this._chatHeight,
                editorHeight: this._editorHeight,
                statusBarHeight: this._statusBarHeight,
                layoutState: CellLayoutState.FromCache,
            };
            this.layoutChange({});
        }
    }
    getDynamicHeight() {
        return null;
    }
    getHeight(lineHeight) {
        if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
            return 100;
        }
        else {
            return this._layoutInfo.totalHeight;
        }
    }
    onDidChangeTextModelContent() {
        this._onDidChangeState.fire({ contentChanged: true });
    }
    onDeselect() {
    }
    startFind(value, options) {
        const matches = super.cellStartFind(value, options);
        if (matches === null) {
            return null;
        }
        return {
            cell: this,
            contentMatches: matches
        };
    }
    dispose() {
        super.dispose();
        this.foldingDelegate = null;
    }
};
MarkupCellViewModel = __decorate([
    __param(5, IConfigurationService),
    __param(6, ITextModelService),
    __param(7, IUndoRedoService),
    __param(8, ICodeEditorService),
    __metadata("design:paramtypes", [String, NotebookCellTextModel, Object, Object, ViewContext, Object, Object, Object, Object])
], MarkupCellViewModel);
export { MarkupCellViewModel };
