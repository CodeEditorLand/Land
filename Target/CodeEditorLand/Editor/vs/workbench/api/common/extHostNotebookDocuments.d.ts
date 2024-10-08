import { UriComponents } from '../../../base/common/uri.js';
import * as extHostProtocol from './extHost.protocol.js';
import { ExtHostNotebookController } from './extHostNotebook.js';
import { NotebookDocumentMetadata } from '../../contrib/notebook/common/notebookCommon.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';
import type * as vscode from 'vscode';
export declare class ExtHostNotebookDocuments implements extHostProtocol.ExtHostNotebookDocumentsShape {
    private readonly _notebooksAndEditors;
    private readonly _onDidSaveNotebookDocument;
    readonly onDidSaveNotebookDocument: import("../../workbench.web.main.internal.js").Event<vscode.NotebookDocument>;
    private readonly _onDidChangeNotebookDocument;
    readonly onDidChangeNotebookDocument: import("../../workbench.web.main.internal.js").Event<vscode.NotebookDocumentChangeEvent>;
    constructor(_notebooksAndEditors: ExtHostNotebookController);
    $acceptModelChanged(uri: UriComponents, event: SerializableObjectWithBuffers<extHostProtocol.NotebookCellsChangedEventDto>, isDirty: boolean, newMetadata?: NotebookDocumentMetadata): void;
    $acceptDirtyStateChanged(uri: UriComponents, isDirty: boolean): void;
    $acceptModelSaved(uri: UriComponents): void;
}
