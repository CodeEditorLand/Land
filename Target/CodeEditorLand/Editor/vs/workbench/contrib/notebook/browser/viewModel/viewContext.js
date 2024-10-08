/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class ViewContext {
    constructor(notebookOptions, eventDispatcher, getBaseCellEditorOptions) {
        this.notebookOptions = notebookOptions;
        this.eventDispatcher = eventDispatcher;
        this.getBaseCellEditorOptions = getBaseCellEditorOptions;
    }
}
