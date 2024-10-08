/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { OffsetEdit } from './core/offsetEdit.js';
export class LineEditWithAdditionalLines {
    static replace(range, text) {
        return new LineEditWithAdditionalLines(OffsetEdit.replace(range, text), null);
    }
    constructor(
    /**
     * The edit for the main line.
    */
    lineEdit, 
    /**
     * Full lines appended after the main line.
    */
    additionalLines) {
        this.lineEdit = lineEdit;
        this.additionalLines = additionalLines;
    }
}
