import { CellContentPart } from '../../cellPart.js';
export class CellChatPart extends CellContentPart {
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
