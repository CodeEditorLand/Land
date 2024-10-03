import { MainThreadNotebookEditorsShape } from './extHost.protocol.js';
import * as vscode from 'vscode';
import { ExtHostNotebookDocument } from './extHostNotebookDocument.js';
export declare class ExtHostNotebookEditor {
    readonly id: string;
    private readonly _proxy;
    readonly notebookData: ExtHostNotebookDocument;
    private _visibleRanges;
    private _selections;
    private _viewColumn;
    private readonly viewType;
    static readonly apiEditorsToExtHost: WeakMap<vscode.NotebookEditor, ExtHostNotebookEditor>;
    private _visible;
    private _editor?;
    constructor(id: string, _proxy: MainThreadNotebookEditorsShape, notebookData: ExtHostNotebookDocument, _visibleRanges: vscode.NotebookRange[], _selections: vscode.NotebookRange[], _viewColumn: vscode.ViewColumn | undefined, viewType: string);
    get apiEditor(): vscode.NotebookEditor;
    get visible(): boolean;
    _acceptVisibility(value: boolean): void;
    _acceptVisibleRanges(value: vscode.NotebookRange[]): void;
    _acceptSelections(selections: vscode.NotebookRange[]): void;
    private _trySetSelections;
    _acceptViewColumn(value: vscode.ViewColumn | undefined): void;
}
