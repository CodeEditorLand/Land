import { IResolvedTextEditorConfiguration, MainThreadTextEditorsShape } from './extHost.protocol.js';
import { EndOfLine, Range, Selection } from './extHostTypes.js';
import type * as vscode from 'vscode';
import { ILogService } from '../../../platform/log/common/log.js';
import { Lazy } from '../../../base/common/lazy.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
export declare class TextEditorDecorationType {
    private static readonly _Keys;
    readonly value: vscode.TextEditorDecorationType;
    constructor(proxy: MainThreadTextEditorsShape, extension: IExtensionDescription, options: vscode.DecorationRenderOptions);
}
export interface ITextEditOperation {
    range: vscode.Range;
    text: string | null;
    forceMoveMarkers: boolean;
}
export interface IEditData {
    documentVersionId: number;
    edits: ITextEditOperation[];
    setEndOfLine: EndOfLine | undefined;
    undoStopBefore: boolean;
    undoStopAfter: boolean;
}
export declare class ExtHostTextEditorOptions {
    private _proxy;
    private _id;
    private _logService;
    private _tabSize;
    private _indentSize;
    private _originalIndentSize;
    private _insertSpaces;
    private _cursorStyle;
    private _lineNumbers;
    readonly value: vscode.TextEditorOptions;
    constructor(proxy: MainThreadTextEditorsShape, id: string, source: IResolvedTextEditorConfiguration, logService: ILogService);
    _accept(source: IResolvedTextEditorConfiguration): void;
    private _validateTabSize;
    private _setTabSize;
    private _validateIndentSize;
    private _setIndentSize;
    private _validateInsertSpaces;
    private _setInsertSpaces;
    private _setCursorStyle;
    private _setLineNumbers;
    assign(newOptions: vscode.TextEditorOptions): void;
    private _warnOnError;
}
export declare class ExtHostTextEditor {
    readonly id: string;
    private readonly _proxy;
    private readonly _logService;
    private _selections;
    private _options;
    private _visibleRanges;
    private _viewColumn;
    private _disposed;
    private _hasDecorationsForKey;
    readonly value: vscode.TextEditor;
    constructor(id: string, _proxy: MainThreadTextEditorsShape, _logService: ILogService, document: Lazy<vscode.TextDocument>, selections: Selection[], options: IResolvedTextEditorConfiguration, visibleRanges: Range[], viewColumn: vscode.ViewColumn | undefined);
    dispose(): void;
    _acceptOptions(options: IResolvedTextEditorConfiguration): void;
    _acceptVisibleRanges(value: Range[]): void;
    _acceptViewColumn(value: vscode.ViewColumn): void;
    _acceptSelections(selections: Selection[]): void;
    private _trySetSelection;
    private _applyEdit;
    private _runOnProxy;
}
