/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class InlineEdit {
    constructor(edit) {
        this.edit = edit;
    }
    get range() {
        return this.edit.range;
    }
    get text() {
        return this.edit.text;
    }
}
