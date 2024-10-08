/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CellContentPart } from '../../cellPart.js';
export class CellChatPart extends CellContentPart {
    // private _controller: NotebookCellChatController | undefined;
    get activeCell() {
        return this.currentCell;
    }
    constructor(_notebookEditor, _partContainer) {
        super();
    }
    didRenderCell(element) {
        super.didRenderCell(element);
    }
    unrenderCell(element) {
        super.unrenderCell(element);
    }
    updateInternalLayoutNow(element) {
    }
    dispose() {
        super.dispose();
    }
}
