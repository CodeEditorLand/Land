/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../base/common/event.js';
import { URI } from '../../../base/common/uri.js';
export class ExtHostNotebookDocuments {
    constructor(_notebooksAndEditors) {
        this._notebooksAndEditors = _notebooksAndEditors;
        this._onDidSaveNotebookDocument = new Emitter();
        this.onDidSaveNotebookDocument = this._onDidSaveNotebookDocument.event;
        this._onDidChangeNotebookDocument = new Emitter();
        this.onDidChangeNotebookDocument = this._onDidChangeNotebookDocument.event;
    }
    $acceptModelChanged(uri, event, isDirty, newMetadata) {
        const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
        const e = document.acceptModelChanged(event.value, isDirty, newMetadata);
        this._onDidChangeNotebookDocument.fire(e);
    }
    $acceptDirtyStateChanged(uri, isDirty) {
        const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
        document.acceptDirty(isDirty);
    }
    $acceptModelSaved(uri) {
        const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
        this._onDidSaveNotebookDocument.fire(document.apiNotebook);
    }
}
