import { ISingleEditOperation } from '../../../common/core/editOperation.js';
import { Selection } from '../../../common/core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
export interface IInsertionPoint {
    ignore: boolean;
    commentStrOffset: number;
}
export interface ILinePreflightData {
    ignore: boolean;
    commentStr: string;
    commentStrOffset: number;
    commentStrLength: number;
}
export interface IPreflightDataSupported {
    supported: true;
    shouldRemoveComments: boolean;
    lines: ILinePreflightData[];
}
export interface IPreflightDataUnsupported {
    supported: false;
}
export type IPreflightData = IPreflightDataSupported | IPreflightDataUnsupported;
export interface ISimpleModel {
    getLineContent(lineNumber: number): string;
}
export declare const enum Type {
    Toggle = 0,
    ForceAdd = 1,
    ForceRemove = 2
}
export declare class LineCommentCommand implements ICommand {
    private readonly languageConfigurationService;
    private readonly _selection;
    private readonly _indentSize;
    private readonly _type;
    private readonly _insertSpace;
    private readonly _ignoreEmptyLines;
    private _selectionId;
    private _deltaColumn;
    private _moveEndPositionDown;
    private _ignoreFirstLine;
    constructor(languageConfigurationService: ILanguageConfigurationService, selection: Selection, indentSize: number, type: Type, insertSpace: boolean, ignoreEmptyLines: boolean, ignoreFirstLine?: boolean);
    private static _gatherPreflightCommentStrings;
    static _analyzeLines(type: Type, insertSpace: boolean, model: ISimpleModel, lines: ILinePreflightData[], startLineNumber: number, ignoreEmptyLines: boolean, ignoreFirstLine: boolean, languageConfigurationService: ILanguageConfigurationService): IPreflightData;
    static _gatherPreflightData(type: Type, insertSpace: boolean, model: ITextModel, startLineNumber: number, endLineNumber: number, ignoreEmptyLines: boolean, ignoreFirstLine: boolean, languageConfigurationService: ILanguageConfigurationService): IPreflightData;
    private _executeLineComments;
    private _attemptRemoveBlockComment;
    private _executeBlockComment;
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
    static _createRemoveLineCommentsOperations(lines: ILinePreflightData[], startLineNumber: number): ISingleEditOperation[];
    private _createAddLineCommentsOperations;
    private static nextVisibleColumn;
    static _normalizeInsertionPoint(model: ISimpleModel, lines: IInsertionPoint[], startLineNumber: number, indentSize: number): void;
}
