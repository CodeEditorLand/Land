import { URI } from '../../../base/common/uri.js';
import { MirrorTextModel } from '../../../editor/common/model/mirrorTextModel.js';
import { MainThreadDocumentsShape } from './extHost.protocol.js';
import { Range } from './extHostTypes.js';
import type * as vscode from 'vscode';
export declare function setWordDefinitionFor(languageId: string, wordDefinition: RegExp | undefined): void;
export declare class ExtHostDocumentData extends MirrorTextModel {
    private readonly _proxy;
    private _languageId;
    private _isDirty;
    private _document?;
    private _isDisposed;
    constructor(_proxy: MainThreadDocumentsShape, uri: URI, lines: string[], eol: string, versionId: number, _languageId: string, _isDirty: boolean);
    dispose(): void;
    equalLines(lines: readonly string[]): boolean;
    get document(): vscode.TextDocument;
    _acceptLanguageId(newLanguageId: string): void;
    _acceptIsDirty(isDirty: boolean): void;
    private _save;
    private _getTextInRange;
    private _lineAt;
    private _offsetAt;
    private _positionAt;
    private _validateRange;
    private _validatePosition;
    private _getWordRangeAtPosition;
}
export declare class ExtHostDocumentLine implements vscode.TextLine {
    private readonly _line;
    private readonly _text;
    private readonly _isLastLine;
    constructor(line: number, text: string, isLastLine: boolean);
    get lineNumber(): number;
    get text(): string;
    get range(): Range;
    get rangeIncludingLineBreak(): Range;
    get firstNonWhitespaceCharacterIndex(): number;
    get isEmptyOrWhitespace(): boolean;
}
