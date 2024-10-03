import * as DOM from '../../../../../../base/browser/dom.js';
import { FastDomNode } from '../../../../../../base/browser/fastDomNode.js';
import { CellContentPart } from '../cellPart.js';
import { CellKind } from '../../../common/notebookCommon.js';
export class CellFocusIndicator extends CellContentPart {
    constructor(notebookEditor, titleToolbar, top, left, right, bottom) {
        super();
        this.notebookEditor = notebookEditor;
        this.titleToolbar = titleToolbar;
        this.top = top;
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.codeFocusIndicator = new FastDomNode(DOM.append(this.left.domNode, DOM.$('.codeOutput-focus-indicator-container', undefined, DOM.$('.codeOutput-focus-indicator.code-focus-indicator'))));
        this.outputFocusIndicator = new FastDomNode(DOM.append(this.left.domNode, DOM.$('.codeOutput-focus-indicator-container', undefined, DOM.$('.codeOutput-focus-indicator.output-focus-indicator'))));
        this._register(DOM.addDisposableListener(this.codeFocusIndicator.domNode, DOM.EventType.CLICK, () => {
            if (this.currentCell) {
                this.currentCell.isInputCollapsed = !this.currentCell.isInputCollapsed;
            }
        }));
        this._register(DOM.addDisposableListener(this.outputFocusIndicator.domNode, DOM.EventType.CLICK, () => {
            if (this.currentCell) {
                this.currentCell.isOutputCollapsed = !this.currentCell.isOutputCollapsed;
            }
        }));
        this._register(DOM.addDisposableListener(this.left.domNode, DOM.EventType.DBLCLICK, e => {
            if (!this.currentCell || !this.notebookEditor.hasModel()) {
                return;
            }
            if (e.target !== this.left.domNode) {
                return;
            }
            const clickedOnInput = e.offsetY < this.currentCell.layoutInfo.outputContainerOffset;
            if (clickedOnInput) {
                this.currentCell.isInputCollapsed = !this.currentCell.isInputCollapsed;
            }
            else {
                this.currentCell.isOutputCollapsed = !this.currentCell.isOutputCollapsed;
            }
        }));
        this._register(this.titleToolbar.onDidUpdateActions(() => {
            this.updateFocusIndicatorsForTitleMenu();
        }));
    }
    updateInternalLayoutNow(element) {
        if (element.cellKind === CellKind.Markup) {
            const indicatorPostion = this.notebookEditor.notebookOptions.computeIndicatorPosition(element.layoutInfo.totalHeight, element.layoutInfo.foldHintHeight, this.notebookEditor.textModel?.viewType);
            this.bottom.domNode.style.transform = `translateY(${indicatorPostion.bottomIndicatorTop + 6}px)`;
            this.left.setHeight(indicatorPostion.verticalIndicatorHeight);
            this.right.setHeight(indicatorPostion.verticalIndicatorHeight);
            this.codeFocusIndicator.setHeight(indicatorPostion.verticalIndicatorHeight - this.getIndicatorTopMargin() * 2 - element.layoutInfo.chatHeight);
        }
        else {
            const cell = element;
            const layoutInfo = this.notebookEditor.notebookOptions.getLayoutConfiguration();
            const bottomToolbarDimensions = this.notebookEditor.notebookOptions.computeBottomToolbarDimensions(this.notebookEditor.textModel?.viewType);
            const indicatorHeight = cell.layoutInfo.codeIndicatorHeight + cell.layoutInfo.outputIndicatorHeight + cell.layoutInfo.commentHeight;
            this.left.setHeight(indicatorHeight);
            this.right.setHeight(indicatorHeight);
            this.codeFocusIndicator.setHeight(cell.layoutInfo.codeIndicatorHeight);
            this.outputFocusIndicator.setHeight(Math.max(cell.layoutInfo.outputIndicatorHeight - cell.viewContext.notebookOptions.getLayoutConfiguration().focusIndicatorGap, 0));
            this.bottom.domNode.style.transform = `translateY(${cell.layoutInfo.totalHeight - bottomToolbarDimensions.bottomToolbarGap - layoutInfo.cellBottomMargin}px)`;
        }
        this.updateFocusIndicatorsForTitleMenu();
    }
    updateFocusIndicatorsForTitleMenu() {
        const y = (this.currentCell?.layoutInfo.chatHeight ?? 0) + this.getIndicatorTopMargin();
        this.left.domNode.style.transform = `translateY(${y}px)`;
        this.right.domNode.style.transform = `translateY(${y}px)`;
    }
    getIndicatorTopMargin() {
        const layoutInfo = this.notebookEditor.notebookOptions.getLayoutConfiguration();
        if (this.titleToolbar.hasActions) {
            return layoutInfo.editorToolbarHeight + layoutInfo.cellTopMargin;
        }
        else {
            return layoutInfo.cellTopMargin;
        }
    }
}
