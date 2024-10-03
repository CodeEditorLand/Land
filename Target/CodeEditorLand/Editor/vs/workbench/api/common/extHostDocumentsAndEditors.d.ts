import * as vscode from 'vscode';
import { Event } from '../../../base/common/event.js';
import { URI } from '../../../base/common/uri.js';
import { ExtHostDocumentsAndEditorsShape, IDocumentsAndEditorsDelta } from './extHost.protocol.js';
import { ExtHostDocumentData } from './extHostDocumentData.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ExtHostTextEditor } from './extHostTextEditor.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class ExtHostDocumentsAndEditors implements ExtHostDocumentsAndEditorsShape {
    private readonly _extHostRpc;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _activeEditorId;
    private readonly _editors;
    private readonly _documents;
    private readonly _onDidAddDocuments;
    private readonly _onDidRemoveDocuments;
    private readonly _onDidChangeVisibleTextEditors;
    private readonly _onDidChangeActiveTextEditor;
    readonly onDidAddDocuments: Event<readonly ExtHostDocumentData[]>;
    readonly onDidRemoveDocuments: Event<readonly ExtHostDocumentData[]>;
    readonly onDidChangeVisibleTextEditors: Event<readonly vscode.TextEditor[]>;
    readonly onDidChangeActiveTextEditor: Event<vscode.TextEditor | undefined>;
    constructor(_extHostRpc: IExtHostRpcService, _logService: ILogService);
    $acceptDocumentsAndEditorsDelta(delta: IDocumentsAndEditorsDelta): void;
    acceptDocumentsAndEditorsDelta(delta: IDocumentsAndEditorsDelta): void;
    getDocument(uri: URI): ExtHostDocumentData | undefined;
    allDocuments(): Iterable<ExtHostDocumentData>;
    getEditor(id: string): ExtHostTextEditor | undefined;
    activeEditor(): vscode.TextEditor | undefined;
    activeEditor(internal: true): ExtHostTextEditor | undefined;
    allEditors(): ExtHostTextEditor[];
}
export interface IExtHostDocumentsAndEditors extends ExtHostDocumentsAndEditors {
}
export declare const IExtHostDocumentsAndEditors: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostDocumentsAndEditors>;
