import { OffsetEdit } from './core/offsetEdit.js';
export class LineEditWithAdditionalLines {
    static replace(range, text) {
        return new LineEditWithAdditionalLines(OffsetEdit.replace(range, text), null);
    }
    constructor(lineEdit, additionalLines) {
        this.lineEdit = lineEdit;
        this.additionalLines = additionalLines;
    }
}
