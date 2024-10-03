import { Position } from '../../../../editor/common/core/position.js';
import { ITextModel } from '../../../../editor/common/model.js';
export interface InsertSnippetResult {
    position: Position;
    prepend: string;
    append: string;
}
export declare class SmartSnippetInserter {
    private static hasOpenBrace;
    private static offsetToPosition;
    static insertSnippet(model: ITextModel, _position: Position): InsertSnippetResult;
}
