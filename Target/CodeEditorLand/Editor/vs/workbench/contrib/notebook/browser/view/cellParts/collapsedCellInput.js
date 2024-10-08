/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as DOM from '../../../../../../base/browser/dom.js';
import { CellContentPart } from '../cellPart.js';
export class CollapsedCellInput extends CellContentPart {
    constructor(notebookEditor, cellInputCollapsedContainer) {
        super();
        this.notebookEditor = notebookEditor;
        this._register(DOM.addDisposableListener(cellInputCollapsedContainer, DOM.EventType.DBLCLICK, e => {
            if (!this.currentCell || !this.notebookEditor.hasModel()) {
                return;
            }
            if (this.currentCell.isInputCollapsed) {
                this.currentCell.isInputCollapsed = false;
            }
            else {
                this.currentCell.isOutputCollapsed = false;
            }
        }));
        this._register(DOM.addDisposableListener(cellInputCollapsedContainer, DOM.EventType.CLICK, e => {
            if (!this.currentCell || !this.notebookEditor.hasModel()) {
                return;
            }
            const element = e.target;
            if (element && element.classList && element.classList.contains('expandInputIcon')) {
                // clicked on the expand icon
                this.currentCell.isInputCollapsed = false;
            }
        }));
    }
}
